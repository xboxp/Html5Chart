/**
 * Created by David Zhang on 2014/8/7.
 */
window.iChart = window.iChart || {};

(function(global){
    var DISPLAY_RATIO = 0.618;

    var Utils = {
        calculateFontSize : function(font){
            if(font && font != ''){
                var fields = font.split(" ");
                for(var i = 0; i < fields.length; i++){
                    if(fields[i].indexOf("px") > 0){
                        return parseInt(fields[i].substr(0, fields[i].length - 2));
                    }
                }
            }

            return 0;
        },

        findMax : function(data, series, minimum){
            var fields = this.getFields(series, 'yField');
            return this.findMaxInAll(data, fields, minimum);
        },

        findMaxInAll : function(array, fields, minimum){
            var maxes = [];
            for(var i = 0; i < fields.length; i++){
                maxes.push(this.max(array, fields[i], minimum));
            }
            return this.max(maxes, undefined, minimum);
        },

        max : function(array, field, minimum) {
            var max = null;
            if(array && array.length > 0){
                max = field == undefined ? array[0] : array[0][field];
                for(var i = 1; i < array.length; i++){
                    var item = field == undefined ? array[i] : array[i][field];
                    if(minimum != undefined && minimum == true){
                        if(item < max){
                            max = item;
                        }
                    } else {
                        if(item > max){
                            max = item;
                        }
                    }
                }
            }
            return max;
        },

        getFields : function(series, fieldName){
            var fields = [];
            if(series && series.length > 0){
                for(var i = 0; i < series.length; i++){
                    fields.push(series[i][fieldName]);
                }
            }
            return fields;
        },

        getScale : function(number){
            var intValue = this.floor(number);
            if(intValue > 0){       // if it is a number above 1
                return intValue.toString().length;
            } else {
                return 0;
            }
        },

        getScales : function(max){
            var scales = [0];
            var defaultLength = 10;
            var step;
            var scale = this.getScale(max);
            if(scale <= 1){
                step = max > 5 ? 1 : 0.5;
                for(var i = 1; i <= defaultLength; i++){
                    scales.push(step*i);
                }
            }else{
                if(max > Math.pow(10, scale) * DISPLAY_RATIO){
                    step = Math.pow(10, scale-1);
                    for(var i = 1; i <= defaultLength; i++){
                        scales.push(step*i);
                    }
                }else{
                    step = Math.pow(10, scale-1)/2;
                    var count = max/step;
                    for(var i = 1; i <= (count + 2); i++){
                        scales.push(step*i);
                    }
                }
            }
            return scales;
        },

        calculateXAxisItemWidth : function(dataLength, seriesNum, totalLength){
            var result = 0;
            var maxWidth = 300;
            var eachItemWidth = totalLength/dataLength/(seriesNum+1);  // +1 to give room to gap
            if(eachItemWidth > 1){
                result = eachItemWidth < maxWidth ? this.floor(eachItemWidth) : maxWidth;
            }else{
                result = 1;
            }

            return result;
        },

        floor : function(floatNumber){
            var parts = floatNumber.toString().split('.');
            return parseInt(parts[0]);
        }
    };

    global.Utils = Utils;
})(window.iChart);
/**
 * Created by David Zhang on 2014/8/6.
 */
window.iChart = window.iChart || {};

(function(global){

    /**
     param sample:
     {
        dataProvider: source,
        animated:true,
        showTooltip: true,
        showLegend: true,
        title: {
            label: 'Temperature in Beijing: July 2014',
            color: '#000',
            font: "12px"
        },
        series: [{
            xField: 'day',
            yField: 't',
            fillColor: '#0f0',
            strokeColor: '#00f'
            fillAlpha: 1,
            strokeAlpha: 1
        }],
        yAxis: {
            labelFunction:  function() {
                return this.valueText + '&#176C';
            }
        }

        xAxis: {
            labelFunction: function() {
                return 'Jul ' + this.valueText;
            }
        }
     }

     data sample:
     [{day:'1', t:30}, {day:'2', t:31}, {day:'3', t:29}]
     */
    var PADDING     = 5;  // default padding
    var legendHeight = 10;
    var legendWidth  = 20;
    var minWidth    = 100;
    var minHeight   = 2 * PADDING + legendHeight;

    var BaseChart = function(canvas, parameters){
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width  = this.canvas.width;
        this.height = this.canvas.height;

        this.parameters = parameters;
    }

    var p = BaseChart.prototype;

    /**
     * validate input param, if param is not valid, will put error on console
     */
    p.initialize = function(){
        var mustHaveProperties = ['dataProvider', 'series'];
        var defaults = {animated:true, showTooltip:true, showLegend:true, showGrid:true,
            title:{label:'', color:'#000', font:"14px Segoe UI Light", top:PADDING}};

        if(this.parameters == undefined || this.parameters == null){
            console.error('Error: miss param ');
            return false;
        }

        for(var i = 0; i < mustHaveProperties.length; i++){
            if(!this.parameters.hasOwnProperty(mustHaveProperties[i])){
                console.error('Error: miss param ' + mustHaveProperties[i]);
                return false;
            }
        }

        for(var p in defaults){
            this[p] = this.parameters[p] == undefined ? defaults[p] : this.parameters[p];
            if(p == "title"){
                for(var tp in defaults.title){
                    this.title[tp] = this.title[tp] == undefined ? defaults.title[tp] : this.title[tp];
                }
            }
        }

        if(this.width < minWidth || this.height < minHeight){
            console.error('Canvas is too small for iChart(minWidth:' + minWidth + ", minHeight:" + minHeight);
            return false;
        }

        this.headerHeight = 0;
        this.legendHeight = 2*PADDING;

        this.origin = {x:0, y:0};

        this.paddingRight = 2 * PADDING;

        return true;
    }

    /**
     * public methods to user
     */
    p.drawChart = function(){
        if(this.initialize()){
            this._drawTitle();
            this._drawLegend();
            this._draw(PADDING);
            this._createTooltip();
        }
    }

    /**
     * protected methods
     */
    p._drawTitle = function(){
        if(this.title.label != ""){
            var top  = this.title.top;

            this.context.font = this.title.font;
            this.context.textAlign = 'center';
            this.context.fillStyle = this.title.color;
            this.context.fillText(this.title.label, this.width/2, top);

            this.headerHeight = top + global.Utils.calculateFontSize(this.context.font)/2 + PADDING;
        }
    }

    p._drawLegend = function(){
        if(this.showLegend){
            for(var i = 0; i < this.parameters.series; i++){
                var s = this.parameters.series[i];
            }
        }
    }

    /**
     * Abstract method, which need to be override by sub class
     */
    p._draw = function(){
        console.error("BaseChart should not be initialized directly. Use sub classes(BarChart, LineChart etc) instead.");
    }

    p._createTooltip = function(){

    }

    p.getData = function(){
        return this.parameters.dataProvider;
    }

    // layout related
    p.getOriginPoint = function(){
        return this.origin;
    }

    p.getXAxisLength = function(){
        return this.xAxisLength;
    }

    p.getYAxisLength = function(){
        return this.yAxisLength;
    }

    p.getFooterHeight = function(){
        return this.legendHeight;
    }

    p.getDefaultPadding = function(){
        return PADDING;
    }

    p.getPaddingRight = function(){
        return this.paddingRight;
    }

    p.getSeries = function(){
        return this.parameters.series;
    }

    p.getXFields = function(){
        return global.Utils.getFields(this.getSeries(), 'xField');
    }

    p.getYFields = function(){
        return global.Utils.getFields(this.getSeries(), 'yField');
    }

    p.getMaxScale = function(){
        var max = 1;
        if(this.yScales.length > 0){
            max = this.yScales[this.yScales.length - 1];
        }
        return max;
    }

    p.printLabel = function(x, y, text, align){
        this.context.font = '4px Arial';
        this.context.textAlign = align;
        this.context.fillStyle = "black";
        this.context.fillText(text, x, y);
    }

    p.drawRect = function(x, y, width, height, color, strokeColor){
        this.context.beginPath();
        this.context.rect(x, y, width, height);
        this.context.fillStyle = color;
        this.context.fill();
        this.context.lineWidth = 1;
        this.context.strokeStyle = strokeColor;
        this.context.stroke();
    }

    global.BaseChart = BaseChart;
})(window.iChart);
/**
 * Created by David Zhang on 2014/8/8.
 */
(function(global){
    var SCALE_LINE_WIDTH = 6;
    var LINE_COLOR = "gray";

    var AxesChart = function(ctx, param){
        global.BaseChart.call(this, ctx, param);
    }

    var p = AxesChart.prototype = Object.create(global.BaseChart.prototype);

    AxesChart.prototype.parent = global.BaseChart.prototype;

    // override
    p._draw = function(padding){
        this._drawAxes(padding);
        this._drawDataArea();
    }

    p._drawAxes = function(padding){
        var x = padding,
            y = this.headerHeight;

        var data = this.getData(),
            series = this.parameters.series,
            max  = global.Utils.findMax(data, series),
            scales = global.Utils.getScales(max);

        this.yScales = scales;

        var labelWidth = 40;
        var labelHeight = 20;

        this.origin = {x:(padding + labelWidth), y:(this.height - this.getFooterHeight() - labelHeight)};

        var yAxisStartX = x + labelWidth;
        var xAxisEndX = this.width - this.getPaddingRight();

        this.yAxisLength = this.origin.y - y;
        this.xAxisLength = xAxisEndX - this.origin.x;

        // draw x and y axes
        this.context.strokeStyle= LINE_COLOR;
        this.context.lineWidth = "1";

        this.context.beginPath();
        this.context.moveTo(yAxisStartX, y);
        this.context.lineTo(this.origin.x, this.origin.y);
        this.context.lineTo(xAxisEndX, this.origin.y);
        if(this.showGrid){
            this.context.lineTo(xAxisEndX, y);
            this.context.lineTo(yAxisStartX, y);
        }
        this.context.stroke();

        // draw scales
        var yAxisLabelFun = this.parameters.yAxis == undefined ? undefined : this.parameters.yAxis.labelFunction;
        if(scales.length > 1){
            var step = this.yAxisLength/(scales.length-1);
            for(var i = 0; i < scales.length; i++){
                var currentY = this.origin.y - step*i;
                var value = yAxisLabelFun == undefined ? scales[i] : yAxisLabelFun.call(null, scales[i]);
                this.context.beginPath();
                this.context.lineWidth = i%2 == 0 ? "2":"1";
                this.context.strokeStyle="#e5e5e5";
                this.context.moveTo(this.origin.x, currentY);
                this.context.lineTo(this.origin.x - SCALE_LINE_WIDTH, currentY);

                if(this.showGrid){
                    this.context.lineTo(xAxisEndX, currentY);
                }
                this.context.stroke();

                this. printLabel(x, currentY + 4, value, 'left');
            }
        }
    }

    p.clearDataArea = function(x, y, w, h){
        this.context.clearRect(x, y, w, h);
    }

    p._drawDataArea = function(){
        console.error("AxesChart should not be initialized directly. Use sub classes(BarChart, LineChart etc) instead.");
    }

    global.AxesChart = AxesChart;
})(window.iChart);
/**
 * Created by David Zhang on 2014/8/6.
 */
(function(global){
    var BarChart = function(ctx, param){
        global.AxesChart.call(this, ctx, param);
    }

    var p = BarChart.prototype = Object.create(global.AxesChart.prototype);

    BarChart.prototype.parent = global.AxesChart.prototype;

    // override
    p._drawDataArea = function(){
        // draw labels on x axis
        var origin      = this.getOriginPoint(),
            data        = this.getData(),
            x           = origin.x,
            y           = origin.y,
            series      = this.getSeries(),
            itemWidth   = global.Utils.calculateXAxisItemWidth(data.length, series.length, this.getXAxisLength() - this.getPaddingRight()),
            labelX      = x,
            labelY      = y + 15,
            barX        = x,
            labelGap    = (series.length * itemWidth)/ 2,
            yAxisHeight = this.getYAxisLength(),
            ratio       = yAxisHeight/this.getMaxScale(),
            xField      = this.getXFields()[0];  // get the first xField

        for(var i = 0; i < data.length; i++){
            barX += itemWidth;
            labelX = barX + labelGap - 5;
            //draw label
            this.printLabel(labelX, labelY, data[i][xField], 'middle');
            for(var s = 0; s < series.length; s++){
                var yField  = series[s].yField,
                    value   = data[i][yField],
                    height  = value*ratio,
                    color   = series[s].fillColor,
                    sColor  = series[s].strokeColor,
                    barY    = y - value * ratio;

                if(this.animated){
                    this.animateBarDrawing(barX, barY, itemWidth, height, color, sColor);
                }else{
                    this.drawRect(barX, barY, itemWidth, height, color, sColor);
                }

                barX += itemWidth;
            }

        }
    }

    p.animateBarDrawing = function(x, y, width, height, color, sColor){
        var totalTime   = 360,
            frame       = 36,
            count       = global.Utils.floor(totalTime/frame);

        function drawPartBar(ctx, x, y, width, height, color, sColor, time) {
            setTimeout(function() {
                ctx.clearDataArea(x, y, width, height);
                ctx.drawRect(x, y, width, height, color, sColor);
            }, time);
        }

        var i = 0, h;
        for(; i < count; i++){
            h = i / count*height;
            drawPartBar(this, x, (y + height) - h, width, h, color, sColor, i*frame);
        }
        drawPartBar(this, x, y, width, height, color, sColor, i*frame);
    }

    global.BarChart = BarChart;
})(window.iChart);
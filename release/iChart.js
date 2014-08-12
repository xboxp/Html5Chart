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
    var PADDING     = 5;  // default padding
    var minWidth    = 100;
    var minHeight   = 6 * PADDING;

    var BaseChart = function(canvas, parameters){
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width  = this.canvas.width;
        this.height = this.canvas.height;

        this._parameters = parameters;
    }

    var p = BaseChart.prototype;

    /**
     * validate input param, if param is not valid, will put error on console
     */
    p.initialize = function(){
        var mustHaveProperties = ['dataProvider', 'series'];
        var defaults = {animated:true, showTooltip:true, showLegend:true, showGrid:true,
            title:{label:'', color:'#000', font:"14px Segoe UI Light", top:PADDING}};

        if(this._parameters == undefined || this._parameters == null){
            console.error('Error: miss param ');
            return false;
        }

        for(var i = 0; i < mustHaveProperties.length; i++){
            if(!this._parameters.hasOwnProperty(mustHaveProperties[i])){
                console.error('Error: miss param ' + mustHaveProperties[i]);
                return false;
            }
        }

        for(var p in defaults){
            this[p] = this._parameters[p] == undefined ? defaults[p] : this._parameters[p];
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

        this._headerHeight = 0;
        this._footerHeight = 2 * PADDING;
        this._paddingRight = 2 * PADDING;

        return true;
    }

    /**
     * public methods to user
     */
    p.drawChart = function(){
        if(this.initialize()){
            this.drawTitle();
            this.drawLegend();
            this.draw();
            this.createTooltip();
        }
    }

    /**
     * protected methods
     */
    p.drawTitle = function(){
        if(this.title.label != ""){
            var top  = this.title.top;

            this.drawLabel(this.width/2, top, this.title.label, 'center');
            this._headerHeight = top + global.Utils.calculateFontSize(this.context.font)/2 + PADDING;
        }
    }

    p.drawLegend = function(){
        if(this.showLegend){
            for(var i = 0; i < this._parameters.series; i++){
                var s = this._parameters.series[i];
            }
        }
    }

    /**
     * Abstract method, which need to be override by sub class
     */
    p.draw = function(){
        console.error("BaseChart should not be initialized directly. Use sub classes(BarChart, LineChart etc) instead.");
    }

    p.createTooltip = function(){

    }

    /**
     * getter
     */
    p.getParam = function(){
        return this._parameters;
    }

    p.getData = function(){
        return this._parameters.dataProvider;
    }

    p.getSeries = function(){
        return this._parameters.series;
    }

    // layout related
    p.getDefaultPadding = function(){
        return PADDING;
    }

    p.getPaddingRight = function(){
        return this._paddingRight;
    }

    p.setHeaderHeight = function(newValue){
        this._headerHeight = newValue;
    }

    p.getHeaderHeight = function(){
        return this._headerHeight;
    }

    p.setFooterHeight = function(newValue){
        this._footerHeight = newValue;
    }

    p.getFooterHeight = function(){
        return this._footerHeight;
    }

    // drawing
    p.drawLabel = function(x, y, text, align, font){
        this.context.font = font == undefined ? '4px Arial': font;
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

    p.drawLines = function(x, y, points, lineWidth, color){
        this.context.strokeStyle= color;
        this.context.lineWidth = lineWidth;
        this.context.beginPath();
        this.context.moveTo(x, y);
        for(var i = 0; i < points.length; i++){
            this.context.lineTo(points[i].x, points[i].y);
        }
        this.context.stroke();
    }

    p.calculateLabelWidth = function(text, font){
        this.context.font = font == undefined ? '4px Arial':font;
        return this.context.measureText(text);
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

        this._labelWidth = 40;
        this._labelHeight = 20;
    }

    var p = AxesChart.prototype = Object.create(global.BaseChart.prototype);

    AxesChart.prototype.parent = global.BaseChart.prototype;

    // override
    p.draw = function(){
        this.drawAxes();
        this.drawDataArea();
    }

    p.drawAxes = function(){
        this._origin = {x:(this.getDefaultPadding() + this._labelWidth),
            y:(this.height - this.getFooterHeight() - this._labelHeight)};
        this.setXAxisLength(this.width - this.getPaddingRight() - this._origin.x);
        this.setYAxisLength(this._origin.y - this.getHeaderHeight());

        var labelX = this.getDefaultPadding();
            x = this._origin.x,
            y = this.getHeaderHeight(),
            scales = this.getScales(),
            xAxisLength = this.getXAxisLength(),
            yAxisLength = this.getYAxisLength(),
            xAxisEndX = x + xAxisLength;

        // draw x and y axes
        var xyPoints = [];
        xyPoints.push({x:x, y:this._origin.y});
        xyPoints.push({x:xAxisEndX, y:this._origin.y});

        if(this.showGrid){
            xyPoints.push({x:xAxisEndX, y:y});
            xyPoints.push({x:x, y:y});
        }
        this.drawLines(x, y, xyPoints, "1", LINE_COLOR);

        // draw scales
        var yAxisLabelFun = this.getYAxisLabelFunc();
        if(scales.length > 1){
            var step = yAxisLength/(scales.length-1);
            for(var i = 0; i < scales.length; i++){
                var currentY = this._origin.y - step*i;
                var value = yAxisLabelFun == undefined ? scales[i] : yAxisLabelFun.call(null, scales[i]);
                var lineWidth = i%2 == 0 ? "2":"1";
                var points = [];
                var lWidth = this.calculateLabelWidth(value);
                console.log('label width is ' + lWidth)
                points.push({x:this._origin.x - SCALE_LINE_WIDTH, y:currentY});
                this.drawLines(this._origin.x, currentY, points, lineWidth, "#e5e5e5");

                this.drawLabel(labelX + lWidth/2, currentY + 4, value, 'left');
            }
        }
    }

    p.clearRect = function(x, y, w, h){
        this.context.clearRect(x, y, w, h);
    }

    p.drawDataArea = function(){
        console.error("AxesChart should not be initialized directly. Use sub classes(BarChart, LineChart etc) instead.");
    }

    //layout
    p.getOriginPoint = function(){
        return this._origin;
    }

    p.setXAxisLength = function(v){
        this.xAxisLength = v;
    }

    p.getXAxisLength = function(){
        return this.xAxisLength;
    }

    p.setYAxisLength = function(v){
        this.yAxisLength = v;
    }

    p.getYAxisLength = function(){
        return this.yAxisLength;
    }

    // helper
    p.getMax = function(){
        return global.Utils.findMax(this.getData(), this.getSeries());
    }

    p.getScales = function(){
        return global.Utils.getScales(this.getMax());
    }

    p.getMaxScale = function(){
        var max = 1;
        var scales = this.getScales();
        if(scales.length > 0){
            max = scales[scales.length - 1];
        }
        return max;
    }

    p.getXFields = function(){
        return global.Utils.getFields(this.getSeries(), 'xField');
    }

    p.getYFields = function(){
        return global.Utils.getFields(this.getSeries(), 'yField');
    }

    p.getYAxisLabelFunc = function(){
        var param = this.getParam();
        return param.yAxis == undefined ? undefined : param.yAxis.labelFunction;
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
    p.drawDataArea = function(){
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
            this.drawLabel(labelX, labelY, data[i][xField], 'middle');
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
                ctx.clearRect(x, y, width, height);
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
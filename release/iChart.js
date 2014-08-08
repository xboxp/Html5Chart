/**
 * Created by David Zhang on 2014/8/7.
 */
window.iChart = window.iChart || {};

(function(global){
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
            var fields = this.getYFields(series);
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

        getYFields : function(series){
            var fields = [];
            if(series && series.length > 0){
                for(var i = 0; i < series.length; i++){
                    fields.push(series[i].yField);
                }
            }
            return fields;
        },

        getScale : function(number){
            var parts = number.toString().split('.');
            var intValue = parseInt(parts[0]);
            if(intValue > 0){       // if it is a number above 1
                return parts[0].length;
            } else {
                return 0;
            }
        },

        getScales : function(max){
            var scales = [0];
            var defaultLength = 5;
            var step;
            var scale = this.getScale(max);
            if(scale <= 1){
                step = 2;
                for(var i = 1; i <= defaultLength; i++){
                    scales.push(step*i);
                }
            }else{
                if(max > Math.pow(10, scale)*0.8){
                    step = 2 * Math.pow(10, scale-1);
                    for(var i = 1; i <= defaultLength; i++){
                        scales.push(step*i);
                    }
                }else{
                    step = Math.pow(10, scale-1);
                    var count = max/step;
                    for(var i = 1; i <= (count+1); i++){
                        scales.push(step*i);
                    }
                }
            }
            return scales;
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
            min: 5,
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
    var padding     = 5;  // default padding
    var gap         = 10;
    var legendHeight = 10;
    var legendWidth  = 20;
    var minWidth    = 100;
    var minHeight   = 2 * padding + legendHeight;

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
        var defaults = {animated:true, showTooltip:true, showLegend:true,
            title:{label:'', color:'#000', font:"14px Segoe UI Light", top:padding}};

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
        this.legendHeight = 0;

        return true;
    }

    /**
     * public methods to user
     */
    p.drawChart = function(){
        if(this.initialize()){
            this._drawTitle();
            this._drawLegend();
            this._draw(padding);
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

            this.headerHeight = top + global.Utils.calculateFontSize(this.context.font)/2;
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

    global.BaseChart = BaseChart;
})(window.iChart);
/**
 * Created by David Zhang on 2014/8/8.
 */
(function(global){
    var SCALE_LENGTH = 5;

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

        var data = this.parameters.dataProvider,
            series = this.parameters.series,
            max  = global.Utils.findMax(data, series),
            scales = global.Utils.getScales(max);

        var labelWidth = 40;
        var labelHeight = 20;

        this.origin = {x:(padding+labelWidth), y:(this.height - this.legendHeight - labelHeight)};

        var yAxisStartX = x + labelWidth;
        var xAxisEndX = this.width - padding;

        this.yAxisLength = this.origin.y - y;
        this.xAxisLength = xAxisEndX - this.origin.x;

            // draw x and y axes
        this.context.beginPath();
        this.context.moveTo(yAxisStartX, y);
        this.context.lineTo(this.origin.x, this.origin.y);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(this.origin.x, this.origin.y);
        this.context.lineTo(xAxisEndX, this.origin.y);
        this.context.stroke();

        // draw scales
        var yAxisLabelFun = this.parameters.yAxis == undefined ? undefined : this.parameters.yAxis.labelFunction;
        if(scales.length > 1){
            var step = this.yAxisLength/(scales.length-1);
            for(var i = 0; i < scales.length; i++){
                var currentY = this.origin.y - step*i;
                var value = yAxisLabelFun == undefined ? scales[i] : yAxisLabelFun.call(this, scales[i]);
                this.context.beginPath();
                this.context.moveTo(this.origin.x, currentY);
                this.context.lineTo(this.origin.x - SCALE_LENGTH, currentY);
                this.context.stroke();

                this.context.font = '4px Arial';
                this.context.textAlign = 'left';
                this.context.fillStyle = "black";
                this.context.fillText(value, x, currentY + 4);
            }
        }
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

    }

    global.BarChart = BarChart;
})(window.iChart);
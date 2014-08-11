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
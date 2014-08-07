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
     }

     data sample:
     [{day:'1', t:30}, {day:'2', t:31}, {day:'3', t:29}]
     */
    var padding     = 10;  // default padding
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
     * public method to user
     */
    p.drawChart = function(){
        if(this.initialize()){
            this._drawTitle();
            this._drawLegend();
            this._drawAxes();
            this._draw();
            this._createTooltip();
        }
    }

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

    p._drawAxes = function(){
        this.context.beginPath();
        this.context.moveTo(padding, this.headerHeight);
        this.context.lineTo(this.width-padding, this.headerHeight);
        this.context.stroke();
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
 * Created by David Zhang on 2014/8/6.
 */
(function(global){
    var BarChart = function(ctx, param){
        global.BaseChart.call(this, ctx, param);
    }

    var p = BarChart.prototype = Object.create(global.BaseChart.prototype);

    BarChart.prototype.parent = global.BaseChart.prototype;


    // override
    p._draw = function(){

    }

    global.BarChart = BarChart;
})(window.iChart);
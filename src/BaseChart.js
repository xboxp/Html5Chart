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
/**
 * Created by David Zhang on 2014/8/6.
 */
window.iChart = window.iChart || {};

(function(global){
    var PADDING     = 5,  // default padding
        TOOLTIP_H   = 13,
        minWidth    = 100,
        minHeight   = 6 * PADDING,
        DEFAULT_TITLE_FONT = "14px Segoe UI Light",
        DEFAULT_FONT = "4px Arial",
        LEGEND_ICON_WIDTH = 30,
        LEGEND_ICON_HEIGHT = 10;

    var BaseChart = function(canvas, parameters){
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width  = this.canvas.width;
        this.height = this.canvas.height;

        this._parameters = parameters;
    };

    var p = BaseChart.prototype;

    /**
     * validate input param, if param is not valid, will put error on console
     */
    p.initialize = function(){
        var mustHaveProperties = ['dataProvider', 'series'];
        var defaults = {animated:true, showTooltip:true, showLegend:true, showGrid:true,
            title:{label:'', color:'#000', font:DEFAULT_TITLE_FONT, top:PADDING}};

        if(this._parameters === undefined || this._parameters === null){
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
            this[p] = this._parameters[p] === undefined ? defaults[p] : this._parameters[p];
            if(p == "title"){
                for(var tp in defaults.title){
                    this.title[tp] = this.title[tp] === undefined ? defaults.title[tp] : this.title[tp];
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
    };

    /**
     * public methods to user
     */
    p.drawChart = function(){
        if(this.initialize()){
            this.drawTitle();
            this.drawLegend();
            this.createTooltip();
            this.draw();
        }
    };

    /**
     * protected methods
     */
    p.drawTitle = function(){
        if(this.title.label !== ""){
            var top  = this.title.top;

            this.drawLabel(this.width/2, top, this.title.label, 'center', this.title.font);
            this._headerHeight = top + global.Utils.calculateFontSize(this.context.font)/2 + PADDING;
        }
    };

    p.drawLegend = function(){
        var legendWidth = 0,
            x = PADDING,
            y = this.height - LEGEND_ICON_HEIGHT - PADDING,
            series = this.getSeries();
        if(this.showLegend){
            this.setFooterHeight(LEGEND_ICON_HEIGHT + 2*PADDING);
            for(var i = 0; i < series.length; i++){
                var s = series[i],
                    label = s.label ? s.label: s.yField;

                x = x + legendWidth;
                legendWidth = LEGEND_ICON_WIDTH + 2*PADDING + this.calculateLabelWidth(label);

                this.drawRect(x, y, LEGEND_ICON_WIDTH, LEGEND_ICON_HEIGHT, s.fillColor, s.strokeColor);
                this.drawLabel(x + LEGEND_ICON_WIDTH + PADDING, y + LEGEND_ICON_HEIGHT, label, 'left');
            }
        }
    };

    /**
     * Abstract method, which need to be override by sub class
     */
    p.draw = function(){
        console.error("BaseChart should not be initialized directly. Use sub classes(BarChart, LineChart etc) instead.");
    };

    /**
     * tooltip
     */
    p.createTooltip = function(){
        this._tipCanvas = document.createElement('canvas');
        this._tipCanvas.width = 100;
        this._tipCanvas.height = TOOLTIP_H;
        this._tipCanvas.style.position = "absolute";
        if (this.canvas.nextSibling) {
            this.canvas.parentNode.insertBefore(this._tipCanvas, this.canvas.nextSibling);
        }
        else {
            this.canvas.parentNode.appendChild(this._tipCanvas);
        }
    };

    p.getTooltip = function(){
        return this._tipCanvas;
    };

    p.hideTooltip = function(){
        this._tipCanvas.style.left = "-" + (this._tipCanvas.width + 100) + "px";
    };

    /**
     * getter
     */
    p.getParam = function(){
        return this._parameters;
    };

    p.getData = function(){
        return this._parameters.dataProvider;
    };

    p.getSeries = function(){
        return this._parameters.series;
    };

    // layout related
    p.getDefaultPadding = function(){
        return PADDING;
    };

    p.getPaddingRight = function(){
        return this._paddingRight;
    };

    p.setHeaderHeight = function(newValue){
        this._headerHeight = newValue;
    };

    p.getHeaderHeight = function(){
        return this._headerHeight;
    };

    p.setFooterHeight = function(newValue){
        this._footerHeight = newValue;
    };

    p.getFooterHeight = function(){
        return this._footerHeight;
    };

    p.getTooltipDefaultHeight = function(){
        return TOOLTIP_H;
    };

    p.calculateLabelWidth = function(text, font){
        this.context.font = font === undefined ? DEFAULT_FONT:font;
        return this.context.measureText(text).width;
    };

    // drawing
    p.drawLabel = function(x, y, text, align, font){
        this.context.font = font === undefined ? DEFAULT_FONT: font;
        this.context.textAlign = align;
        this.context.fillStyle = "black";
        this.context.fillText(text, x, y);
    };

    p.drawRect = function(x, y, width, height, color, strokeColor){
        this.context.beginPath();
        this.context.rect(x, y, width, height);
        this.context.fillStyle = color ? color : '#0099ff';
        this.context.fill();
        this.context.lineWidth = 1;
        this.context.strokeStyle = strokeColor;
        this.context.stroke();
    };

    p.drawLines = function(x, y, points, lineWidth, color){
        this.context.strokeStyle= color;
        this.context.lineWidth = lineWidth;
        this.context.beginPath();
        this.context.moveTo(x, y);
        for(var i = 0; i < points.length; i++){
            this.context.lineTo(points[i].x, points[i].y);
        }
        this.context.stroke();
    };

    global.BaseChart = BaseChart;
})(window.iChart);
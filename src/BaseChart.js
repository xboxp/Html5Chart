/**
 * Created by David Zhang on 2014/8/6.
 */
window.zChart = window.zChart || {};

(function(global){
    var PADDING     = 5,  // default padding
        TOOLTIP_H   = 23,
        TOOLTIP_LINE_H = 13,
        minWidth    = 100,
        minHeight   = 6 * PADDING,
        DEFAULT_TITLE_FONT = "14px Segoe UI Light",
        DEFAULT_FONT = "12px Segoe UI Light",
        LEGEND_ICON_WIDTH = 30,
        LEGEND_ICON_HEIGHT = 10,
        TOOLTIP_FONT = "10px Segoe UI Light",
        TOOLTIP_RADIUS = 5;

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
            console.error('Canvas is too small for zChart(minWidth:' + minWidth + ", minHeight:" + minHeight);
            return false;
        }

        this._headerHeight = 0;
        this._footerHeight = 2 * PADDING;
        this._paddingRight = 2 * PADDING;
        this._paddingBottom = 2 * PADDING;

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
            x = this.width / 2,
            y = this.height - LEGEND_ICON_HEIGHT - this._paddingBottom,
            series = this.getSeries();

        if(this.showLegend){
            this.setFooterHeight(LEGEND_ICON_HEIGHT + 2*this._paddingBottom);
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

    p.setParameter = function(newParam){
        this._parameters = newParam;
    };

    p.reload = function(){
        this.clearRect(0, 0, this.width, this.height);
        this.drawChart();
    };

    p.clearRect = function(x, y, w, h){
        this.context.clearRect(x, y, w, h);
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
        if(this._tipCanvas === undefined){
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
        }
    };

    p.getTooltip = function(){
        return this._tipCanvas;
    };

    p.hideTooltip = function(){
        this._tipCanvas.style.left = "-" + (this._tipCanvas.width + 2000) + "px";
    };

    p.customizeTooltip = function(tipCtx, data, series, width, rawHeight){
        var x = 0, y = 0, triangleHeight = 6, height = rawHeight - triangleHeight;

        tipCtx.clearRect(x, y, width, height);

        tipCtx.beginPath();
        tipCtx.moveTo(x + TOOLTIP_RADIUS, y);
        tipCtx.lineTo(x + width - TOOLTIP_RADIUS, y);
        tipCtx.quadraticCurveTo(x + width, y, x + width, y + TOOLTIP_RADIUS);
        tipCtx.lineTo(x + width, y + height - TOOLTIP_RADIUS);
        tipCtx.quadraticCurveTo(x + width, y + height, x + width - TOOLTIP_RADIUS, y + height);
        // start triangle
        tipCtx.lineTo(x + width/2 + triangleHeight/2, y + height);
        tipCtx.lineTo(x + width/2, y + rawHeight);
        tipCtx.lineTo(x + width/2 - triangleHeight/2, y + height);
        // end of triangle
        tipCtx.lineTo(x + TOOLTIP_RADIUS, y + height);
        tipCtx.quadraticCurveTo(x, y + height, x, y + height - TOOLTIP_RADIUS);
        tipCtx.lineTo(x, y + TOOLTIP_RADIUS);
        tipCtx.quadraticCurveTo(x, y, x + TOOLTIP_RADIUS, y);
        tipCtx.closePath();
        tipCtx.strokeStyle = "black";
        tipCtx.stroke();
        tipCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
        tipCtx.fill();

//        tipCtx.beginPath();
//        tipCtx.rect(0, 0, width, height);
//        tipCtx.fillStyle = "white";
//        tipCtx.fill();
//        tipCtx.lineWidth = 1;
//        tipCtx.strokeStyle = "gray";
//        tipCtx.stroke();
        tipCtx.font = TOOLTIP_FONT;
        tipCtx.fillStyle = "white";
        tipCtx.textAlign = 'left';
        for(var i = 0; i < series.length; i++){
            var yField = series[i].yField,
                yFieldLabel = series[i].label === undefined ? yField : series[i].label;
            tipCtx.fillText(this.tooltipLabelFunc(yFieldLabel, data[yField], this.getYAxisLabelFunc()), 2, this.getTooltipDefaultLineHeight()*(i+1));
        }
    };

    /**
     * calculate max label width for tooltip
     * @param max
     * @param series
     * @returns {*}
     */
    p.getMaxLabelWidth = function(max, series){
        var widthArray = [];
        for(var i = 0; i < series.length; i++){
            widthArray.push({width:this.calculateLabelWidth(this.tooltipLabelFunc(series[i].label, max, this.getYAxisLabelFunc()), TOOLTIP_FONT)});
        }
        return global.Utils.max(widthArray, 'width');
    };

    p.tooltipLabelFunc = function(label, value, labelFunc){
        if(labelFunc){
            value = labelFunc.call(null, value);
        }
        return label + ":" + value;
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

    p.getTooltipDefaultLineHeight = function(){
        return TOOLTIP_LINE_H;
    };

    p.getTooltipFont = function(){
        return TOOLTIP_FONT;
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
        if(color){
            this.context.fill();
        }
        this.context.lineWidth = 1;
        this.context.strokeStyle = strokeColor;
        this.context.stroke();
    };

    p.drawLines = function(x, y, points, lineWidth, color){
        this.context.strokeStyle = color;
        this.context.lineWidth   = lineWidth;
        this.context.beginPath();
        this.context.moveTo(x, y);
        for(var i = 0; i < points.length; i++){
            this.context.lineTo(points[i].x, points[i].y);
        }
        this.context.stroke();
    };

    p.mouseIn = function(x, y, rectX, rectY, rectWidth, rectHeight){
        return global.Utils.mouseIn(x, y, rectX, rectY, rectWidth, rectHeight);
    };

    global.BaseChart = BaseChart;
})(window.zChart);
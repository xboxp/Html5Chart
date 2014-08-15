/**
 * Created by David Zhang on 2014/8/7.
 */
window.zChart = window.zChart || {};

(function(global){
    var DISPLAY_RATIO = 0.618;

    var Utils = {
        calculateFontSize : function(font){
            if(font && font !== ''){
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

        max : function(array, field, findMinimum) {
            var max = null;
            if(array && array.length > 0){
                max = field === undefined ? array[0] : array[0][field];
                for(var i = 1; i < array.length; i++){
                    var item = field === undefined ? array[i] : array[i][field];
                    if(findMinimum !== undefined && findMinimum === true){
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
                    for(var j = 1; j <= defaultLength; j++){
                        scales.push(step*j);
                    }
                }else{
                    step = Math.pow(10, scale-1)/2;
                    var count = max/step;
                    for(var k = 1; k <= (count + 2); k++){
                        scales.push(step*k);
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
        },

        mouseIn : function(x, y, rectX, rectY, rectWidth, rectHeight){
            if(x > rectX && x < (rectX+rectWidth) && y > rectY && y < (rectY + rectHeight)){
                return true;
            }
            return false;
        }
    };

    global.Utils = Utils;
})(window.zChart);
/**
 * Created by David Zhang on 2014/8/6.
 */
window.zChart = window.zChart || {};

(function(global){
    var PADDING     = 5,  // default padding
        TOOLTIP_H   = 13,
        minWidth    = 100,
        minHeight   = 6 * PADDING,
        DEFAULT_TITLE_FONT = "14px Segoe UI Light",
        DEFAULT_FONT = "12px Segoe UI Light",
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
            x = 0.5*this.width,
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
})(window.zChart);
/**
 * Created by David Zhang on 2014/8/8.
 */
(function(global){
    var SCALE_WIDTH = 6;
    var LINE_COLOR  = "gray";

    var AxesChart = function(ctx, param){
        global.BaseChart.call(this, ctx, param);

        this._labelWidth = 40;
        this._labelHeight = 20;
    };

    var p = AxesChart.prototype = Object.create(global.BaseChart.prototype);

    // override
    p.draw = function(){
        this.drawAxes();
        this.drawDataArea();
    };

    p.drawAxes = function(){
        this._origin = {x:(this.getDefaultPadding() + this._labelWidth),
            y:(this.height - this.getFooterHeight() - this._labelHeight)};
        this.setXAxisLength(this.width - this.getPaddingRight() - this._origin.x);
        this.setYAxisLength(this._origin.y - this.getHeaderHeight());

        var labelX = this.getDefaultPadding(),
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
                var value = yAxisLabelFun === undefined ? scales[i] : yAxisLabelFun.call(null, scales[i]);
                var lineWidth = i%2 === 0 ? "2":"1";
                var points = [];
                var lWidth = this.calculateLabelWidth(value);
                points.push({x:this._origin.x - SCALE_WIDTH, y:currentY});
                if(this.showGrid){
                    points.push({x:xAxisEndX, y:currentY});
                }
                this.drawLines(this._origin.x, currentY, points, lineWidth, "#e5e5e5");

                this.drawLabel(labelX + (this._labelWidth - (lWidth + SCALE_WIDTH)), currentY + 4, value, 'left');
            }
        }
    };

    p.drawDataArea = function(){
        console.error("AxesChart should not be initialized directly. Use sub classes(BarChart, LineChart etc) instead.");
    };

    //layout
    p.getOriginPoint = function(){
        return this._origin;
    };

    p.setXAxisLength = function(v){
        this.xAxisLength = v;
    };

    p.getXAxisLength = function(){
        return this.xAxisLength;
    };

    p.setYAxisLength = function(v){
        this.yAxisLength = v;
    };

    p.getYAxisLength = function(){
        return this.yAxisLength;
    };

    // helper
    p.getMax = function(){
        return global.Utils.findMax(this.getData(), this.getSeries());
    };

    p.getScales = function(){
        return global.Utils.getScales(this.getMax());
    };

    p.getMaxScale = function(){
        var max = 1;
        var scales = this.getScales();
        if(scales.length > 0){
            max = scales[scales.length - 1];
        }
        return max;
    };

    p.getXFields = function(){
        return global.Utils.getFields(this.getSeries(), 'xField');
    };

    p.getYFields = function(){
        return global.Utils.getFields(this.getSeries(), 'yField');
    };

    p.getYAxisLabelFunc = function(){
        var param = this.getParam();
        return param.yAxis === undefined ? undefined : param.yAxis.labelFunction;
    };

    global.AxesChart = AxesChart;
})(window.zChart);
/**
 * Created by David Zhang on 2014/8/6.
 */
(function(global){
    var TOOLTIP_FONT = "10px Segoe UI Light";

    var BarChart = function(ctx, param){
        global.AxesChart.call(this, ctx, param);
    };

    var p = BarChart.prototype = Object.create(global.AxesChart.prototype);

    // override
    p.drawDataArea = function(){
        // draw labels on x axis
        var origin      = this.getOriginPoint(),
            data        = this.getData(),
            x           = origin.x,
            y           = origin.y,
            series      = this.getSeries(),
            itemWidth   = this.getBarWidth(data, series),
            labelX      = x,
            labelY      = y + 15,
            barX        = x,
            labelPadding= (series.length * itemWidth)/ 2,
            xAxisLength = this.getXAxisLength(),
            yAxisLength = this.getYAxisLength(),
            ratio       = yAxisLength/this.getMaxScale(),
            xField      = this.getXFields()[0];  // get the first xField

        this._dataArea = [];

        for(var i = 0; i < data.length; i++){
            var label = data[i][xField];
            barX += itemWidth;
            labelX = barX + labelPadding - this.calculateLabelWidth(label)/2;
            //draw label
            this.drawLabel(labelX, labelY, label, 'middle');
            this._dataArea.push(barX);
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

        if(this.showTooltip){
            var that = this,
                seriesNum = series.length,
                rect = this.canvas.getBoundingClientRect(),
                tipCanvas = this.getTooltip(),
                tipCtx = tipCanvas.getContext('2d'),
                tipHeight = series.length*(this.getTooltipDefaultHeight() + 2),
                tipWidth  = this.getMaxLabelWidth(this.getMax(), series, TOOLTIP_FONT);
            this.canvas.onmousemove = function onMouseOver(e) {
                var mx = e.clientX - rect.left;
                var my = e.clientY - rect.top;

                var showTip = false;
                if(that.mouseIn(mx, my, origin.x, origin.y - yAxisLength, xAxisLength, yAxisLength)){
                    for(var i = 0; i < that._dataArea.length; i++){
                        if(that.mouseIn(mx, my, that._dataArea[i], origin.y - yAxisLength, seriesNum*itemWidth, yAxisLength)){
                            tipCanvas.height = tipHeight;
                            tipCanvas.width  = tipWidth + that.getDefaultPadding();
                            tipCanvas.style.left = mx + "px";
                            tipCanvas.style.top  = my-tipHeight + "px";
                            that.customizeTooltip(tipCtx, data[i], series, tipCanvas.width, tipCanvas.height);
                            showTip = true;
                        }
                    }
                }
                if(!showTip){
                    that.hideTooltip();
                }
            };
        }
    };

    p.customizeTooltip = function(tipCtx, data, series, width, height){
        tipCtx.clearRect(0, 0, width, height);
        tipCtx.beginPath();
        tipCtx.rect(0, 0, width, height);
        tipCtx.fillStyle = "white";
        tipCtx.fill();
        tipCtx.lineWidth = 1;
        tipCtx.strokeStyle = "gray";
        tipCtx.stroke();
        tipCtx.font = TOOLTIP_FONT;
        tipCtx.fillStyle = "black";
        tipCtx.textAlign = 'left';
        for(var i = 0; i < series.length; i++){
            var yField = series[i].yField,
                yFieldLabel = series[i].label === undefined ? yField : series[i].label;
            tipCtx.fillText(this.tooltipLabelFunc(yFieldLabel, data[yField], this.getYAxisLabelFunc()), 2, this.getTooltipDefaultHeight()*(i+1));
        }
    };

    p.mouseIn = function(x, y, rectX, rectY, rectWidth, rectHeight){
        return global.Utils.mouseIn(x, y, rectX, rectY, rectWidth, rectHeight);
    };

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
    };

    p.getBarWidth = function(data, series){
        return global.Utils.calculateXAxisItemWidth(data.length, series.length, this.getXAxisLength() - this.getPaddingRight());
    };

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

    global.BarChart = BarChart;
})(window.zChart);
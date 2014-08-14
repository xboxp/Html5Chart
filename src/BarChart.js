/**
 * Created by David Zhang on 2014/8/6.
 */
(function(global){
    var TOOLTIP_FONT = "10px Arial";

    var BarChart = function(ctx, param){
        global.AxesChart.call(this, ctx, param);

        this._dataArea = [];

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
})(window.iChart);
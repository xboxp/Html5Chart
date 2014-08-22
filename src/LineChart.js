/**
 * Created by David Zhang on 2014/8/21.
 */
(function(global){
    var RADIUS      = 5,
        FRAME_RATE  = 20;  // animation frame rate

    var LineChart = function(ctx, param){
        global.AxesChart.call(this, ctx, param);
    };

    var p = LineChart.prototype = Object.create(global.AxesChart.prototype);

    /**
     * override
     */
    p.drawDataArea = function(){
        var origin      = this.getOriginPoint(),
            data        = this.getData(),
            x           = origin.x,
            y           = origin.y,
            series      = this.getSeries(),
            itemWidth   = this.getLineInterval(data, series),
            labelX      = x,
            labelY      = y + 15,
            yAxisLength = this.getYAxisLength(),
            ratio       = yAxisLength/this.getMaxScale(),
            xField      = this.getXFields()[0];  // get the first xField

        this._dataPoints = [];

        // draw lines and circles
        for(var s = 0; s < series.length; s++){
            var yField  = series[s].yField,
                color   = series[s].fillColor,
                sColor  = series[s].strokeColor,
                pointX  = x,
                needDrawLabel = true;

            this._dataPoints[s] = [];

            for(var i = 0; i < data.length; i++){
                var label       = data[i][xField],
                    labelWidth  = this.calculateLabelWidth(label) > itemWidth ? itemWidth : this.calculateLabelWidth(label),
                    value       = data[i][yField],
                    pointY      = y - value * ratio;

                labelX      = pointX - labelWidth / 2;

                if(needDrawLabel){
                    //draw label
                    this.drawLabel(labelX, labelY, label, 'middle');
                }

                if(i > 0){
                    var lastPoint = this._dataPoints[s][i - 1];

                    if(this.animated){
                        this.drawLinesAfterTime(lastPoint, {x:pointX, y:pointY}, 2, sColor, i*1000/FRAME_RATE);
                    }else{
                        this.drawLines(lastPoint.x, lastPoint.y, [{x:pointX, y:pointY}], 2, sColor);
                    }
                }

                if(this.animated){
                    this.drawCircleAfterTime(pointX, pointY, RADIUS, color, sColor, i*1000/FRAME_RATE);
                }else{
                    this.drawCircle(pointX, pointY, RADIUS, color, sColor);
                }

                this._dataPoints[s].push({x:pointX, y:pointY});

                pointX += itemWidth;
            }
            needDrawLabel = false;
        }

        if(this.showTooltip){
            var that = this,
                rect = this.canvas.getBoundingClientRect(),
                tipCanvas = this.getTooltip(),
                tipCtx = tipCanvas.getContext('2d'),
                tipHeight = this.getTooltipDefaultHeight() + 2,
                tipWidth  = this.getMaxLabelWidth(this.getMax(), series, this.getTooltipFont());

            this.canvas.onmousemove = function onMouseOver(e) {
                var mx = e.clientX - rect.left;
                var my = e.clientY - rect.top;

                var showTip = false;

                for(var i = 0; i < that._dataPoints.length; i++){
                    for(var j = 0; j < that._dataPoints[i].length; j++){
                        var currentPoint = that._dataPoints[i][j];
                        if(that.mouseInCircle(mx, my, currentPoint.x, currentPoint.y, RADIUS)){
                            tipCanvas.height = tipHeight;
                            tipCanvas.width  = tipWidth + that.getDefaultPadding();
                            tipCanvas.style.left = mx - tipCanvas.width/2 + "px" ;
                            tipCanvas.style.top  = my - tipHeight + "px";
                            that.customizeTooltip(tipCtx, data[j], [series[i]], tipCanvas.width, tipCanvas.height);
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

    p.mouseInCircle = function(x, y, circleX, circleY, circleRadius){
        return global.Utils.mouseInCircle(x, y, circleX, circleY, circleRadius);
    };

    p.drawLinesAfterTime = function(point, newPoint, lineWidth, color, time){
        var that = this;
        setTimeout(function(){
            that.drawLines(point.x, point.y, [newPoint], 2, color);
        }, time);
    };

    p.drawCircleAfterTime = function(pointX, pointY, RADIUS, color, sColor, time){
        var that = this;
        setTimeout(function(){
            that.drawCircle(pointX, pointY, RADIUS, color, sColor);
        }, time);
    };

    p.clearCircle = function(x, y, radius)
    {
        var c = this.context;

        c.beginPath();
        c.arc(x, y, radius, 0, 2 * Math.PI, false);
        c.clip();
        c.clearRect(x - radius - 1, y - radius - 1,
                radius * 2 + 2, radius * 2 + 2);
    };

    p.drawCircle = function(x, y, radius, fillColor, strokeColor){
        var c = this.context;

//        this.clearCircle(x, y, radius);

        c.beginPath();
        c.arc(x, y, radius, 0, 2 * Math.PI, false);
        c.fillStyle = fillColor;
        if(fillColor){
            c.fill();
        }
        c.lineWidth = 1;
        c.strokeStyle = strokeColor;
        c.stroke();
    };

    p.getLineInterval = function(data){
        return global.Utils.calculateXAxisItemWidth(data.length - 1, 0, this.getXAxisLength() - this.getPaddingRight());
    };

    global.LineChart = LineChart;
})(window.zChart);
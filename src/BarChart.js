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
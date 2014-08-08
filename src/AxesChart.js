/**
 * Created by David Zhang on 2014/8/8.
 */
(function(global){
    var SCALE_LENGTH = 6;

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
        var xAxisEndX = this.width - this.paddingRight;

        this.yAxisLength = this.origin.y - y;
        this.xAxisLength = xAxisEndX - this.origin.x;

            // draw x and y axes
        this.context.strokeStyle="#e5e5e5";
        this.context.lineWidth = "1";

        this.context.beginPath();
        this.context.moveTo(yAxisStartX, y);
        this.context.lineTo(this.origin.x, this.origin.y);
        this.context.lineTo(xAxisEndX, this.origin.y);
        this.context.lineTo(xAxisEndX, y);
        this.context.lineTo(yAxisStartX, y);
        this.context.stroke();

        // draw scales
        var yAxisLabelFun = this.parameters.yAxis == undefined ? undefined : this.parameters.yAxis.labelFunction;
        if(scales.length > 1){
            var step = this.yAxisLength/(scales.length-1);
            for(var i = 0; i < scales.length; i++){
                var currentY = this.origin.y - step*i;
                var value = yAxisLabelFun == undefined ? scales[i] : yAxisLabelFun.call(null, scales[i]);
                this.context.beginPath();
                this.context.lineWidth = i%2 == 0 ? "2":"1";
                this.context.strokeStyle="#e5e5e5";
                this.context.moveTo(this.origin.x, currentY);
                this.context.lineTo(this.origin.x - SCALE_LENGTH, currentY);

                if(this.showGrid){
                    this.context.lineTo(xAxisEndX, currentY);
                }
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
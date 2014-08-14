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
                this.drawLines(this._origin.x, currentY, points, lineWidth, "#e5e5e5");

                this.drawLabel(labelX + (this._labelWidth - (lWidth + SCALE_WIDTH)), currentY + 4, value, 'left');
            }
        }
    };

    p.clearRect = function(x, y, w, h){
        this.context.clearRect(x, y, w, h);
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
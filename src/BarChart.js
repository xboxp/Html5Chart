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
    p._drawDataArea = function(){

    }

    global.BarChart = BarChart;
})(window.iChart);
/**
 * Created by David Zhang on 2014/8/6.
 */
(function(global){
    var BarChart = function(ctx, param){
        global.BaseChart.call(this, ctx, param);
    }

    var p = BarChart.prototype = Object.create(global.BaseChart.prototype);

    BarChart.prototype.parent = global.BaseChart.prototype;


    // override
    p._draw = function(){

    }

    global.BarChart = BarChart;
})(window.iChart);
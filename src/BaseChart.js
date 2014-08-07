/**
 * Created by David Zhang on 2014/8/6.
 */
window.iChart = window.iChart || {};

(function(global){

    var BaseChart = function(canvas, chartData){
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.width  = this.canvas.scrollWidth;
        this.height = this.canvas.scrollHeight;
    }

    var p = BaseChart.prototype;

    /**
     * validate input param, if param is not valid, will put error on console
     */
    p.validateChartData = function(){

    }

    /**
     * public method to user
     */
    p.drawChart = function(){
        if(this.validateChartData()){
            this._draw();
        }
    }

    /**
     * Abstract method, which need to be override by sub class
     */
    p._draw = function(){
        console.error("BaseChart should not be initialized directly. Use sub classes(BarChart, LineChart etc) instead.");
    }

    global.BaseChart = BaseChart;
})(window.iChart);
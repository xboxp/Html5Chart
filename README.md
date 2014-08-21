## zChart

zChart is a HTML5 chart library which use canvas element to draw 2D chart. Simple bar chart and line chart are included. 
It is highly customizable and supports tooltip and animation. Please visit [Demo Page](http://xboxp.com).

![zChart](https://raw.githubusercontent.com/xboxp/Html5Chart/master/barchart.png)
![zChart](https://raw.githubusercontent.com/xboxp/Html5Chart/master/linechart.png)

## Tutorial

All you need to do is to new an instance and pass parameter to it.

    var canvas = document.getElementById("zChartCanvas");
    var chart = new zChart.LineChart(canvas, param);
    chart.drawChart();

Bar Chart example is [here](https://github.com/xboxp/Html5Chart/blob/master/samples/bar_chart.html).
Line Chart example is [here](https://github.com/xboxp/Html5Chart/blob/master/samples/line_chart.html).

## License

zChart is available under the [MIT license](http://opensource.org/licenses/MIT).
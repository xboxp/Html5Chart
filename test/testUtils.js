/**
 * Created by David Zhang on 2014/8/8.
 */
/**
 * Created by David Zhang on 2014/8/8.
 */
module('Utils')
QUnit.test("Utils getScale", function( assert ) {
    assert.equal(iChart.Utils.getScale(1), 1);
    assert.equal(iChart.Utils.getScale(0), 0);
    assert.equal(iChart.Utils.getScale(0.1), 0);
    assert.equal(iChart.Utils.getScale(10), 2);
    assert.equal(iChart.Utils.getScale(100), 3);
});

QUnit.test("Utils getScales", function( assert ) {
    assert.deepEqual(iChart.Utils.getScales(0.4),  [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
    assert.deepEqual(iChart.Utils.getScales(5),  [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
    assert.deepEqual(iChart.Utils.getScales(5.1), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.deepEqual(iChart.Utils.getScales(9.9), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.deepEqual(iChart.Utils.getScales(10), [0, 5, 10, 15, 20]);
    assert.deepEqual(iChart.Utils.getScales(62), [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    assert.deepEqual(iChart.Utils.getScales(81), [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    assert.deepEqual(iChart.Utils.getScales(100), [0, 50, 100, 150, 200]);
});

QUnit.test("Utils floor", function( assert ) {
    assert.equal(iChart.Utils.floor(1), 1);
    assert.equal(iChart.Utils.floor(0), 0);
    assert.equal(iChart.Utils.floor(0.1), 0);
    assert.equal(iChart.Utils.floor(10), 10);
    assert.equal(iChart.Utils.floor(-1.5), -1);
    assert.equal(iChart.Utils.floor(3.15481894), 3);
});

QUnit.test("Utils calculateXAxisItemWidth", function( assert ) {
    assert.equal(iChart.Utils.calculateXAxisItemWidth(1, 1, 100), 50);
    assert.equal(iChart.Utils.calculateXAxisItemWidth(1, 1, 150), 75);
    assert.equal(iChart.Utils.calculateXAxisItemWidth(1, 1, 1000), 300);
    assert.equal(iChart.Utils.calculateXAxisItemWidth(5, 3, 300), 15);
    assert.equal(iChart.Utils.calculateXAxisItemWidth(300, 3, 300), 1);
});

QUnit.test("Utils getFields", function( assert ) {
    assert.deepEqual(iChart.Utils.getFields([{xField:'day', yField:'t'}], 'yField'), ['t']);
    assert.deepEqual(iChart.Utils.getFields([{xField:'day', yField:'t'}], 'xField'), ['day']);
    assert.deepEqual(iChart.Utils.getFields([{xField:'day', yField:'t1'}, {xField:'day', yField:'t2'}], 'xField'), ['day', 'day']);
    assert.deepEqual(iChart.Utils.getFields([{xField:'day', yField:'t1'}, {xField:'day', yField:'t2'}], 'yField'), ['t1', 't2']);
});

QUnit.test("Utils mouseIn", function( assert ) {
    assert.equal(iChart.Utils.mouseIn( 1, 1, 0, 0, 2, 2 ), true);
    assert.equal(iChart.Utils.mouseIn( 20, 20, 10, 10, 20, 20 ), true);
    assert.equal(iChart.Utils.mouseIn( 1, 1, 0, 0, 2, 2 ), true);
    assert.equal(iChart.Utils.mouseIn( 1, 1, 0, 0, 2, 2 ), true);
});
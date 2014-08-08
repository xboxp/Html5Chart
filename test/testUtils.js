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
    assert.deepEqual(iChart.Utils.getScales(0.4),  [2, 4, 6, 8, 10]);
    assert.deepEqual(iChart.Utils.getScales(0.2),  [2, 4, 6, 8, 10]);
    assert.deepEqual(iChart.Utils.getScales(1), [2, 4, 6, 8, 10]);
    assert.deepEqual(iChart.Utils.getScales(9.9), [2, 4, 6, 8, 10]);
    assert.deepEqual(iChart.Utils.getScales(10), [10, 20]);
    assert.deepEqual(iChart.Utils.getScales(80), [10, 20, 30, 40, 50, 60, 70, 80, 90]);
    assert.deepEqual(iChart.Utils.getScales(81), [20, 40, 60, 80, 100]);
    assert.deepEqual(iChart.Utils.getScales(100), [100, 200]);
});
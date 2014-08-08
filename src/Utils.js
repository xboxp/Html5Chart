/**
 * Created by David Zhang on 2014/8/7.
 */
window.iChart = window.iChart || {};

(function(global){
    var DISPLAY_RATIO = 0.5;

    var Utils = {
        calculateFontSize : function(font){
            if(font && font != ''){
                var fields = font.split(" ");
                for(var i = 0; i < fields.length; i++){
                    if(fields[i].indexOf("px") > 0){
                        return parseInt(fields[i].substr(0, fields[i].length - 2));
                    }
                }
            }

            return 0;
        },

        findMax : function(data, series, minimum){
            var fields = this.getYFields(series);
            return this.findMaxInAll(data, fields, minimum);
        },

        findMaxInAll : function(array, fields, minimum){
            var maxes = [];
            for(var i = 0; i < fields.length; i++){
                maxes.push(this.max(array, fields[i], minimum));
            }
            return this.max(maxes, undefined, minimum);
        },

        max : function(array, field, minimum) {
            var max = null;
            if(array && array.length > 0){
                max = field == undefined ? array[0] : array[0][field];
                for(var i = 1; i < array.length; i++){
                    var item = field == undefined ? array[i] : array[i][field];
                    if(minimum != undefined && minimum == true){
                        if(item < max){
                            max = item;
                        }
                    } else {
                        if(item > max){
                            max = item;
                        }
                    }
                }
            }
            return max;
        },

        getYFields : function(series){
            var fields = [];
            if(series && series.length > 0){
                for(var i = 0; i < series.length; i++){
                    fields.push(series[i].yField);
                }
            }
            return fields;
        },

        getScale : function(number){
            var parts = number.toString().split('.');
            var intValue = parseInt(parts[0]);
            if(intValue > 0){       // if it is a number above 1
                return parts[0].length;
            } else {
                return 0;
            }
        },

        getScales : function(max){
            var scales = [0];
            var defaultLength = 5;
            var step;
            var scale = this.getScale(max);
            if(scale <= 1){
                step = 2;
                for(var i = 1; i <= defaultLength; i++){
                    scales.push(step*i);
                }
            }else{
                if(max > Math.pow(10, scale) * DISPLAY_RATIO){
                    step = 2 * Math.pow(10, scale-1);
                    for(var i = 1; i <= defaultLength; i++){
                        scales.push(step*i);
                    }
                }else{
                    step = Math.pow(10, scale-1);
                    var count = max/step;
                    for(var i = 1; i <= (count+1); i++){
                        scales.push(step*i);
                    }
                }
            }
            return scales;
        }
    };

    global.Utils = Utils;
})(window.iChart);
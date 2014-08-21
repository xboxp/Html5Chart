/**
 * Created by David Zhang on 2014/8/7.
 */
window.zChart = window.zChart || {};

(function(global){
    var DISPLAY_RATIO = 0.618;

    var Utils = {
        calculateFontSize : function(font){
            if(font && font !== ''){
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
            var fields = this.getFields(series, 'yField');
            return this.findMaxInAll(data, fields, minimum);
        },

        findMaxInAll : function(array, fields, minimum){
            var maxes = [];
            for(var i = 0; i < fields.length; i++){
                maxes.push(this.max(array, fields[i], minimum));
            }
            return this.max(maxes, undefined, minimum);
        },

        max : function(array, field, findMinimum) {
            var max = null;
            if(array && array.length > 0){
                max = field === undefined ? array[0] : array[0][field];
                for(var i = 1; i < array.length; i++){
                    var item = field === undefined ? array[i] : array[i][field];
                    if(findMinimum !== undefined && findMinimum === true){
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

        getFields : function(series, fieldName){
            var fields = [];
            if(series && series.length > 0){
                for(var i = 0; i < series.length; i++){
                    fields.push(series[i][fieldName]);
                }
            }
            return fields;
        },

        getScale : function(number){
            var intValue = this.floor(number);
            if(intValue > 0){       // if it is a number above 1
                return intValue.toString().length;
            } else {
                return 0;
            }
        },

        getScales : function(max){
            var scales = [0];
            var defaultLength = 10;
            var step;
            var scale = this.getScale(max);
            if(scale <= 1){
                step = max > 5 ? 1 : 0.5;
                for(var i = 1; i <= defaultLength; i++){
                    scales.push(step*i);
                }
            }else{
                if(max > Math.pow(10, scale) * DISPLAY_RATIO){
                    step = Math.pow(10, scale-1);
                    for(var j = 1; j <= defaultLength; j++){
                        scales.push(step*j);
                    }
                }else{
                    step = Math.pow(10, scale-1)/2;
                    var count = max/step;
                    for(var k = 1; k <= (count + 2); k++){
                        scales.push(step*k);
                    }
                }
            }
            return scales;
        },

        calculateXAxisItemWidth : function(dataLength, seriesNum, totalLength){
            var result = 0,
                maxWidth = 300,
                eachItemWidth = maxWidth;

            if(dataLength > 0){
                eachItemWidth =  totalLength/dataLength/(seriesNum+1);  // +1 to give room to gap
            }

            if(eachItemWidth > 1){
                result = eachItemWidth <= maxWidth ? this.floor(eachItemWidth) : maxWidth;
            }else{
                result = 1;
            }

            return result;
        },

        floor : function(floatNumber){
            var parts = floatNumber.toString().split('.');
            return parseInt(parts[0]);
        },

        mouseIn : function(x, y, rectX, rectY, rectWidth, rectHeight){
            if(x > rectX && x < (rectX+rectWidth) && y > rectY && y < (rectY + rectHeight)){
                return true;
            }
            return false;
        },

        mouseInCircle : function(x, y, cX, cY, cR){
            var distX = Math.abs(x - cX),
                distY = Math.abs(y - cY),
                dist  = Math.sqrt(distX * distX + distY * distY);

            return dist < cR;
        }
    };

    global.Utils = Utils;
})(window.zChart);
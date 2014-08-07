/**
 * Created by David Zhang on 2014/8/7.
 */
window.iChart = window.iChart || {};

(function(global){
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
        }
    };

    global.Utils = Utils;
})(window.iChart);
/**
 * @file SQ.util
 * 常用函数
 * @version 1.0.0
 */

SQ.util = {
    /**
     * 随机数输出
     * @method
     * @name SQ.util.generate
     * @example
     * Sq.util.generate.uniqueId();
     * Sq.util.generate.randomInt(0, 9);
     * Sq.util.generate.randomArr([1,2,3]);
     */
    generate : {
        // 生成唯一标识符
        uniqueId: function () {

        },
        randomInt: function (min, max) {
            if (typeof min === "number" && typeof max === "number" && min < max) {
                return parseInt(Math.random() * (max - min + 1) + min, 10);
            }
            return false;
        },
        randomArr: function (arr) {
            return arr.sort(function () {
                return Math.random() - 0.5;
            });
        }
    },
    /**
     * 字符串操作
     * @method
     * @name SQ.util.string
     * @example
     * SQ.util.string.trim("   test string    ");
     * //return test string
     */
    string : {
        // 过滤字符串首尾的空格
        trim : function(srt) {
            return srt.replace(/^\s+|\s+$/g, "");
        }
    },
    /**
     * 格式化时间
     * @method
     * @name SQ.util.dateToString
     * @example
     * SQ.util.dateToString(new Date())
     * //return 2013-10-17 17:31:58
     */
    dateToString: function(time) {
        var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var date = time.getDate();
        var hours = time.getHours();
        var min = time.getMinutes();
        var sec = time.getSeconds();
        10 > month && (month = "0" + month), 10 > date && (date = "0" + date), 10 > hours && (hours = "0" + hours), 10 > min && (min = "0" + min), 10 > sec && (sec = "0" + sec);
        var dateString = year + "-" + month + "-" + date + " " + hours + ":" + min + ":" + sec;
        return dateString;
    },
    goTop : function (e) {
        e.preventDefault();
        window.scrollTo(0, 0);
    },
    goBack : function (e) {
        e.preventDefault();
        history.back();
    }
};
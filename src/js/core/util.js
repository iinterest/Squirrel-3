/**
 * @file SQ.util
 * 常用函数
 * @version 1.0.0
 */
/*global
 $: false,
 SQ: true,
 Zepto: true
 */
SQ.util = {
    /**
     * 随机数输出
     * @method
     * @name SQ.generate
     * @example
     * Sq.generate.uniqueId();
     * Sq.generate.randomInt(0, 9);
     * Sq.generate.randomArr([1,2,3]);
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
    goTop : function (e) {
        e.preventDefault();
        window.scrollTo(0, 0);
    },
    goBack : function (e) {
        e.preventDefault();
        history.back();
    }
};
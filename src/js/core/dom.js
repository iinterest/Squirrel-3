/**
 * @file SQ.dom
 * @version 1.0.0
 */
/*global
 $: false,
 SQ: true,
 Zepto: true
 */
SQ.dom = {
    /**
     * 存储常用的 jQuery Dom 元素
     * 在具体的业务中也可以将页面 jQuery Dom 存入 $el 对象，例如：SQ.dom.$el.demo = $(".demo");。
     */
    $el : (function () {
        var me = this;
        var i;
        me.$el = {};
        var element = {
            $win : window,
            $doc : document,
            $body : "body"
        };
        for (i in element) {
            if (element.hasOwnProperty(i)) {
                me.$el[i] = $(element[i]);
            }
        }
        return me.$el;
    }())
};
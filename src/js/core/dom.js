/**
 * @file SQ.dom
 * @version 1.0.1
 */

/**
 * @changelog
 * 1.0.1  * 简化 SQ.dom 层级
 */

SQ.dom = {
    /**
     * 存储常用的 jQuery Dom 元素
     * 在具体的业务中也可以将页面 jQuery Dom 存入 SQ.dom 对象，例如：SQ.dom.$demo = $(".demo");。
     */
    $win : $(window),
    $doc : $(document),
    $body : $("body")
};
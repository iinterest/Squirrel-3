/**
 * @file Squirrel LazyLoad
 * @version 0.6.5
 */

/**
 * @changelog
 * 0.6.5  * 修复 jshint 问题
 * 0.6.4  * 修复图片加载失败时会导致 error 时间一直被触发的 bug，
 *          修复与 loadmore 插件配合使用时，无法替换加载错误的图片
 * 0.6.3  + 新增首屏图片自动加载功能
 *        + 新增占位图、占位背景设置
 * 0.6.0  + 首屏图片自动加载
 * 0.5.1  * 完成图片模式的延迟加载功能
 * 0.0.1  + 新建
 */

(function ($, window) {
    "use strict";
    /**
     * @name LazyLoad
     * @classdesc 内容延迟加载
     * @constructor
     * @param {object} config 组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.DOM_LAZY_ITEMS        需要添加延迟加载的元素。
     * @param {string} config.DOM_LAZY_PARENT       图片模式下，设置延迟加载元素的父元素的背景样式，
     *                                              必须与 DOM_LAZY_PARENT 同时配置。
     * @param {string} config.CSS_PLACEHOLDER       图片模式下，设置占位样式，必须与 DOM_LAZY_PARENT 同时配置。
     * @param {string} config.MODE                  延迟加载模式：image（图片模式）。
     * @param {string} config.NUM_THRESHOLD         灵敏度，数值越大越灵敏，延迟性越小，默认为 200。
     * @param {function} config.refresh             刷新延迟加载元素列表。
     * @example var imglazyload = new SQ.LazyLoad({
                DOM_LAZY_ITEMS : ".J_lazyload",
                DOM_LAZY_PARENT : ".sq-list .icon",
                CSS_PLACEHOLDER : ".default-icon",
                IMG_PLACEHOLDER : "../../../static/images/sq-icon.png",
                NUM_THRESHOLD : 270
            });
     */
    function LazyLoad(config) {
        var me = this;
        var i;

        me.config = {
            "MODE": "image",
            "NUM_THRESHOLD": 200
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }
        me.refresh = function () {
            me.$lazyItems = $(me.config.DOM_LAZY_ITEMS);
            me._loadImg();
        };
        if (me._verify()) {
            me.init();
        }
    }
    LazyLoad.prototype = {
        construtor: LazyLoad,
        version: "0.6.5",
        scrollTimer: 0,     // 滑动计时器
        scrollDelay: 200,   // 滑动阀值

        /** 验证参数是否合法 */
        _verify : function () {
            return true;
        },
        init : function () {
            var me = this;
            me.$lazyItems = $(me.config.DOM_LAZY_ITEMS); // 触发元素
            me.lazyItemClassName = me.config.DOM_LAZY_ITEMS.slice(1);
            // 加载首屏内容
            if (me.config.MODE === "image") {
                // 初始化占位图
                if (me.config.IMG_PLACEHOLDER) {
                    me.$lazyItems.each(function () {
                        var $img = $(this);
                        $img.attr("src", me.config.IMG_PLACEHOLDER);
                        $img.on("error", function () {
                            $(this).attr("src", me.config.IMG_PLACEHOLDER).off("error");
                        });
                    });
                }
                // 添加占位背景图
                if (me.config.CSS_PLACEHOLDER && me.config.DOM_LAZY_PARENT) {
                    $(me.config.DOM_LAZY_PARENT).addClass(me.config.CSS_PLACEHOLDER.slice(1));
                }
                me._loadImg();
            }
            me._trigger();
        },
        _trigger : function () {
            var me = this;
            var $win = $(window);
            $win.on("scroll", function () {
                // 添加 scroll 事件相应伐值，优化其性能
                if (!me.scrollTimer) {
                    me.scrollTimer = setTimeout(function () {
                        if (me.config.MODE === "image") {
                            me._loadImg();
                        }
                        me.scrollTimer = 0;
                    }, me.scrollDelay);
                }
            });
        },
        /** 判断是否在显示区域 */
        _isInDisplayArea : function (item) {
            var me = this;
            var $item = $(item);
            //var win = window;
            var winH = window.innerHeight;
            var winOffsetTop = window.pageYOffset; // window Y 轴偏移量
            var itemOffsetTop = $item.offset().top;
            // itemOffsetTop >= winOffsetTop 只加载可视区域下方的内容
            // winOffsetTop + winH + me.config.NUM_THRESHOLD 加载可视区域下方一屏内的内容
            return itemOffsetTop >= winOffsetTop && itemOffsetTop <= winOffsetTop + winH + me.config.NUM_THRESHOLD;
        },
        _loadImg : function () {
            var me = this;
            function replaceSrc($item, src) {
                $item.attr("src", src).removeAttr("data-img").removeClass(me.lazyItemClassName);
                $item.on("error", function () {
                    $(this).attr("src", me.config.IMG_PLACEHOLDER).off("error");
                });
                //me.refresh();
            }
            me.$lazyItems.each(function (index, item) {
                var $item = $(item);
                var src = $item.attr("data-img");
                var hasLazyTag = $item.hasClass(me.lazyItemClassName);
                if (!item || !src || !hasLazyTag) {
                    return;
                }
                if (me._isInDisplayArea(item)) {
                    replaceSrc($item, src);
                }
            });
        }
    };
    SQ.LazyLoad = LazyLoad;
}($, window));
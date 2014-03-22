/**
 * @file SQ.Panel 滑动面板插件
 * @version 1.0.0
 */

/**
 * @changelog
 * 1.0.0  * 重写插件，调用方式改为 $. 链式调用。
 * 0.5.0  * 完成左侧滑动面板功能
 * 0.0.1  * 新建。
 */

/*global
 $: false,
 SQ: false,
 console: false,
 jQuery: false
 */
;(function ($) {
    "use strict";
    /**
     * @name Panel
     * @classdesc 内容延迟加载
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.EVE_EVENT_TYPE        触发方式，默认为：click
     * @param {string} config.DISPLAY               显示模式，默认为：overlay，可选 push
     * @param {string} config.DOM_WRAPPER           页面包装节点，当 DISPLAY 设置为 push 时，该节点会应用动画
     * @param {string} config.DIRECTION             出现方向，默认为：left
     * @param {number} config.CSS_WIDTH             面板宽度
     * @param {string} config.CLOSE_BTN             是否显示关闭按钮
     * @param {string} config.TXT_CLOSE_VAL         关闭按钮显示文字，默认为："×"
     * @param {function} config.beforeShow          打开面板前回调函数，该函数必须返回为 true 才能继续执行 show 函数
     * @param {function} config.show                打开面板时回调函数
     * @param {function} config.close               关闭面板时回调函数
     * @param {function} config.resize              resize 回调函数
     * @example $(".J_panelMenu").panel({
    CSS_CLASS: ".panel-menu",
    CSS_WIDTH: 240,
    beforeShow: function () {
        console.log("beforeShow");
        return true;
    },
    show: function () {
        console.log("show");
    }
});
     */

    var scope = "sq-panel";
    var defaults = {
        EVE_EVENT_TYPE: "click",
        DISPLAY: "overlay",
        DIRECTION: "left",
        CSS_WIDTH: 300,
        CLOSE_BTN: true,
        TXT_CLOSE_VAL: "×"
    };

    function Panel ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Panel.prototype = {
        construtor: "Panel",
        resizeTimer : false,
        closed : true,
        init: function () {
            var me = this;
            var css = "@-webkit-keyframes showPanel {0% {-webkit-transform: translateX(-"+ me.settings.CSS_WIDTH +"px);} 100% {-webkit-transform: translateX(0);}}" +
                "@-webkit-keyframes hidePanel{0% {-webkit-transform: translateX(0);}100% {-webkit-transform: translateX(-"+ me.settings.CSS_WIDTH +"px);}}";
            if (me.settings.DISPLAY === "push") {
                css += "@-webkit-keyframes hideWrap {0% {-webkit-transform: translateX(0);}100% {-webkit-transform: translateX("+ me.settings.CSS_WIDTH +"px);}}" +
                    "@-webkit-keyframes showWrap {0% {-webkit-transform: translateX("+ me.settings.CSS_WIDTH +"px);}100% {-webkit-transform: translateX(0);}}";
            }

            me.$win = $(window);
            me.$doc = $(document);
            me.$body = $("body");
            me.$element = $(me.element);                // 触发元素
            me.$wrapper = $(me.settings.DOM_WRAPPER);

            me.beforeShowFun = me.settings.beforeShow;
            me.showFun = me.settings.show;
            me.closeFun = me.settings.close;
            me.resizeFun = me.settings.resize;

            if (me._verify()) {
                me._bind();
                me.$body.append("<style>" + css + "</style>");
            }
        },
        /**
         * 验证
         * @returns {boolean}
         * @private
         */
        _verify: function () {
            var me = this;
            // Dom 验证，触发元素、数据展示元素、状态展示元素必须都存在
            if (me.$element.length === 0 || me.$wrapper.length === 0) {
                console.warn("SQ.panel: 缺少 Dom 元素");
                return false;
            }
            return true;
        },
        /**
         * 事件绑定方法
         * @param {string} EVE_EVENT_TYPE 事件类型，"scroll" 或 "click"。
         * @private
         */
        _bind: function () {
            var me = this;
            // 绑定在 document 上是为了解决 Ajax 内容绑定问题
            me.$doc.on(me.settings.EVE_EVENT_TYPE + ".sq.panel", me.settings.selector, function (e) {
                e.preventDefault();
                me.show(e);
            });
        },
        /**
         * 新建滑动面板对象
         * @returns {*} $panel
         * @private
         */
        _createPanel: function () {
            var me = this;

            // 初始化
            var $panel = $("<div class='sq-panel'></div>");
            var $panelContent = $("<div class='content'></div>");
            var $close = $("<div class='close-btn'>" + me.settings.TXT_CLOSE_VAL + "</div>");

            // 设置样式
            if (me.settings.DIRECTION === "left" || me.settings.DIRECTION === "right") {
                $panel.css({
                    "position": "absolute",
                    "display": "none",
                    "top": 0,
                    "bottom": 0,
                    "width": me.settings.CSS_WIDTH,
                    "z-index": 1000
                });
            }

            if (me.settings.CSS_CLASS) {
                $panel.addClass(me.settings.CSS_CLASS.indexOf(".") === 0 ? me.settings.CSS_CLASS.slice(1) : me.settings.CSS_CLASS);
            }
            // 装载内容
            $panel.append($panelContent);
            // 设置显示按钮
            if (me.settings.CLOSE_BTN) {
                $panel.append($close);
            }

            $panel.appendTo(me.$body);
            // 保存 Dom
            me.$panel = $panel;
            me.$panelContent = $panelContent;
            me.$close = $close;

            return $panel;
        },
        /**
         * 设置滑动面板事件
         * @private
         */
        _setPanelEvent : function () {
            var me = this;
            // 锁定操作 
            // 优化 Android 下 UCweb 浏览器触摸操作，减少滑动误操作
            if (SQ.ua.os.name === "android" && SQ.ua.browser.shell === "ucweb" && SQ.ua.browser.version >= 9) {
                me.$panel.on("touchstart", function (e) {
                    e.preventDefault();
                });
            } else {
                me.$panel.on("touchmove", function (e) {
                    e.preventDefault();
                });
            }
            me.$panel.on("mousewheel", function (e) {
                e.preventDefault();
            });
            me.$close.on("click", function () {
                me.close();
            });

            me.$win.resize(function () {
                me.resize();
            });
        },
        /**
         *
         * @param e
         * @returns {*}
         * @private
         */
        _beforeShow: function (e) {
            var me = this;
            // 如果没有找到面板就创建新的面板，并执行 _beforeShow 回调函数
            // _beforeShow 函数只在首次执行时运行一次
            if (!me.$panel) {
                me.$panel = me._createPanel();
                me._setPanelEvent();
                if (me.beforeShowFun) {
                    return me.beforeShowFun(e);
                }
                return true;
            }
            return true;
        },
        /**
         * 显示对话框
         * @param e
         */
        show: function (e) {
            var me = this;
            if (!me.closed) {
                return;
            }
            if (!me._beforeShow(e)) {
                console.warn("SQ.Panel: _beforeShow 回调函数返回 false");
                return;
            }
            me.mask();
            me.$panel.removeClass("sq-hidePanel").addClass("animated sq-showPanel fast");
            me.$wrapper.removeClass("sq-showWrap").addClass("animated sq-hideWrap fast");
            me.closed = false;
            // 执行回调函数。
            if (me.showFun) {
                me.showFun(e);
            }

            me.$panel.show();
        },
        /** 显示遮罩 */
        mask: function () {
            var me = this;
            var bodyH = me.$body.height();
            var winH = me.$win.height();
            var h = bodyH > winH ? bodyH : winH;

            if (me.$mask) {
                me.$mask.css({
                    "width" : "100%",
                    "height" : h
                });
                me.$mask.show();
            } else {
                var $mask = $("<div class='mask'></div>");
                $mask.css({
                    "position": "absolute",
                    "top": 0,
                    "left": 0,
                    "right": 0,
                    "width": "100%",
                    "height": h,
                    //"background": "rgba(255,255,255,.5)",
                    "z-index": 999
                }).appendTo(me.$body);

                $mask.on("touchstart", function (e) {
                    e.preventDefault();
                    // 当屏蔽 touchstart 事件后其它浏览器不能响应 click 事件，所以注册一个关闭方法。
                    if (SQ.ua.browser.shell !== "ucweb") {
                        me.close();
                    }
                });
                $mask.on("click", function (e) {
                    e.preventDefault();
                    me.close();
                });
                $mask.on("mousewheel", function (e) {
                    e.preventDefault();
                });

                me.$mask = $mask;
            }
        },
        /**
         * 关闭对话框
         * @param e
         */
        close: function (type) {
            var me = this;
            me.$panel.removeClass("sq-showPanel").addClass("sq-hidePanel");
            me.$wrapper.removeClass("sq-hideWrap").addClass("sq-showWrap");
            me.$mask.hide();
            me.closed = true;
            if (me.closeFun && !type) {
                me.closeFun();
            }
        },
        resize: function () {

        },
        destroy: function () {
            var me =this;
            me.$panel.remove();
            me.$panelContent.empty();
            me.$panel = null;
        }
    };

    $.fn.panel = function ( options ) {
        var isZepto = typeof Zepto !== "undefined" ? true : false;
        var isJQuery = typeof jQuery !== "undefined" ? true : false;
        var plugin;

        options = options || {};
        options.selector = this.selector;

        this.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Panel( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope)) {
                    plugin = new Panel( this, options );
                    $(this).data(scope, "initialized");
                }
            }
        });
        // chain jQuery functions
        return this;
    };

})($);
/**
 * @file SQ.Panel 滑动面板组件
 * @version 0.5.0
 */

/**
 * @changelog
 * 0.5.0  * 完成左侧滑动面板功能
 * 0.0.1  * 新建。
 */

/*global
 $: false,
 SQ: false,
 console: false
 */

(function ($, window) {
    "use strict";
    /**
     * @name Panel
     * @classdesc 侧滑面板。
     * @constructor
     * @param {object} config 组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.EVE_EVENT_TYPE        绑定事件设置，默认值为：click。
     * @param {string} config.DOM_TRIGGER_TARGET    被绑定事件的 Dom 元素。
     * @param {string} config.DIRECTION             面板出现方向。
     * @param {string} config.DISPLAY               面板展现方式，有 overlay、push 两种方式，默认为 overlay。
     * @param {string} config.CSS_WIDTH             面板宽度，DIRECTION 设置为 left、right 时使用。
     * @param {string} config.CSS_HEIGHT            面板高度，DIRECTION 设置为 top、bottom 时使用。
     */
    function Panel(config) {
        var me = this;
        var i;

        me.config = {
            EVE_EVENT_TYPE: "click",
            DISPLAY: "overlay",
            DIRECTION: "left",
            CSS_WIDTH: 300,
            CLOSE_BTN: true,
            TXT_CLOSE_VAL: "×"
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }
        
        me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET);    // 触发元素
        me.$wrapper = $(me.config.DOM_WRAPPER);

        me.beforeShowFun = me.config.beforeShow;
        me.showFun = me.config.show;
        me.closeFun = me.config.close;
        me.resizeFun = me.config.resize;

        if (me._verify()) {
            me._init();
        }
    }
    Panel.prototype =  {
        construtor: Panel,
        version: "0.5.1",
        resizeTimer : false,    // resize 
        closed : true,

        /**
         * 验证
         * @returns {boolean}
         * @private
         */
        _verify: function () {
            var me = this;
            // Dom 验证，触发元素、数据展示元素、状态展示元素必须都存在
            if (me.$triggerTarget.length === 0 || me.$wrapper.length === 0) {
                console.warn("SQ.panel: 缺少 Dom 元素");
                return false;
            }
            return true;
        },
        /**
         * 初始化
         * @private
         */
        _init: function () {
            var me = this;
            var css = "@-webkit-keyframes showPanel {0% {-webkit-transform: translateX(-"+ me.config.CSS_WIDTH +"px);} 100% {-webkit-transform: translateX(0);}}" +
                "@-webkit-keyframes hidePanel{0% {-webkit-transform: translateX(0);}100% {-webkit-transform: translateX(-"+ me.config.CSS_WIDTH +"px);}}";
            me.$win = $(window);
            me.$doc = $(document);
            me.$body = $("body");
            me._bind();

            if (me.config.DISPLAY === "push") {
                css += "@-webkit-keyframes hideWrap {0% {-webkit-transform: translateX(0);}100% {-webkit-transform: translateX("+ me.config.CSS_WIDTH +"px);}}" +
                    "@-webkit-keyframes showWrap {0% {-webkit-transform: translateX("+ me.config.CSS_WIDTH +"px);}100% {-webkit-transform: translateX(0);}}";
            }

            me.$body.append("<style>" + css + "</style>");
        },
        /**
         * 事件绑定方法
         * @param {string} EVE_EVENT_TYPE 事件类型，"scroll" 或 "click"。
         * @private
         */
        _bind: function () {
            var me = this;
            function bindEvent(e) {
                e.preventDefault();
                me.show(e);
            }
            // 绑定在 document 上是为了解决 Ajax 内容绑定问题
            me.$doc.on(me.config.EVE_EVENT_TYPE, me.config.DOM_TRIGGER_TARGET, bindEvent);
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
            var $close = $("<div class='close-btn'>" + me.config.TXT_CLOSE_VAL + "</div>");

            // 设置样式
            if (me.config.DIRECTION === "left" || me.config.DIRECTION === "right") {
                $panel.css({
                    "position": "absolute",
                    "display": "none",
                    "top": 0,
                    "bottom": 0,
                    "width": me.config.CSS_WIDTH,
                    "z-index": 1000
                });
            }

            if (me.config.CSS_CLASS) {
                $panel.addClass(me.config.CSS_CLASS.indexOf(".") === 0 ? me.config.CSS_CLASS.slice(1) : me.config.CSS_CLASS);
            }
            // 装载内容
            $panel.append($panelContent);
            // 设置显示按钮
            if (me.config.CLOSE_BTN) {
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
    SQ.Panel = Panel;
}($, window));
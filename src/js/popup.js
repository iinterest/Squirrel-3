/**
 * @file SQ.Popup 弹窗组件
 * @version 1.0.1
 */

/**
 * @changelog
 * 1.0.1  * 在设置了 ANIMATE 时，_setPopupPos 函数不使用 translate(-50%, -50%) 方法定位，因为会与动画产生冲突。
 *        * 修复 ANIMATE 设置问题。
 * 1.0.0  * 原 Dialog 组件重构为 Popup 组件。
 */

/*global
 $: false,
 SQ: false,
 console: false
 */

(function ($, window) {
    "use strict";
    /**
     * @name Popup
     * @classdesc 对话框组件，依赖 jQuery 或 Zepto 库。
     * @constructor
     * @param {object} config 组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.EVE_EVENT_TYPE        绑定事件设置，默认值为："click"
     * @param {string} config.DOM_TRIGGER_TARGET    被绑定事件的 Dom 元素
     * @param {string} config.DOM_PARENT            被绑定事件的 Dom 元素的父元素，用于确定定位原
     * @param {string} config.CSS_CLASS             弹窗样式类
     * @param {string} config.CSS_POSITION          弹窗定位方式，默认值："fixed"， 可以设置为："absolute"
     * @param {number} config.CSS_TOP               弹窗 top 属性值
     * @param {number} config.CSS_RIGHT             弹窗 right 属性值
     * @param {number} config.CSS_BOTTOM            弹窗 bottom 属性值
     * @param {number} config.CSS_LEFT              弹窗 left 属性值
     * @param {number} config.CSS_WIDTH             弹窗 width 属性值
     * @param {number} config.CSS_HEIGHT            弹窗 height 属性值
     * @param {boolen} config.VERTICAL_CENTER       弹窗是否垂直居中设定，默认值：true
     * @param {boolen} config.HORIZONTAL_CENTER     弹窗是否水平居中设定，默认值：true
     * @param {boolen} config.CLOSE_BTN             关闭按钮显示设定，默认值：true
     * @param {boolen} config.OK_BTN                去掉按钮显示设定，默认值：false
     * @param {boolen} config.CANCEL_BTN            取消按钮显示设定，默认值：false
     * @param {string} config.TXT_CLOSE_VAL         关闭按钮显示文字，默认值："×"
     * @param {string} config.TXT_OK_VAL            确定按钮显示文字，默认值："确定"
     * @param {string} config.TXT_CANCEL_VAL        取消按钮显示文字，默认值："取消"
     * @param {string} config.ANIMATE               动画类
     * @param {boolen} config.MASK                  遮罩设定，默认为 false，设为 true 将显示遮罩效果
     * @param {string} config.CSS_MASK_BACKGROUND   遮罩背景色，默认值："#000000"
     * @param {string} config.CSS_MASK_OPACITY      遮罩透明度，默认值：0.5
     * @param {number} config.NUM_CLOSE_TIME        对话框自动关闭时间，单位：毫秒
     * @param {boolen} config.LOCK                  锁定操作，默认为 false，设为 true 将屏蔽触摸操作，默认值：false
     * @param {boolen} config.PREVENT_DEFAULT       默认动作响应设置，默认为 true，不响应默认操作
     * @param {boolen} config.DISPOSABLE            设置弹窗是否是只显示一次，默认为 false
     * @param {number} config.DELAY                 延时显示对话框设置，单位：毫秒
     * @param {function} config.beforeShow          打开弹窗前回调函数，该函数必须返回为 true 才能继续执行 show 函数
     * @param {function} config.show                打开弹窗回调函数
     * @param {function} config.ok                  点击确定按钮回调函数
     * @param {function} config.cancel              点击取消按钮回调函数
     * @param {function} config.close               关闭对话框回调函数
     * @param {function} config.reszie              resize 回调函数
     */
    function Popup(config) {
        var me = this;
        var i;

        me.config = {
            EVE_EVENT_TYPE: "click",
            CSS_POSITION: "fixed",
            TXT_CLOSE_VAL: "×",
            TXT_OK_VAL: "确定",
            TXT_CANCEL_VAL: "取消",
            PREVENT_DEFAULT: true,
            LOCK: false,
            MASK: false,
            CSS_MASK_BACKGROUND: "#000000",
            CSS_MASK_OPACITY: 0.5,
            CLOSE_BTN: true
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }

        me.beforeShowFun = me.config.beforeShow;
        me.showFun = me.config.show;
        me.closeFun = me.config.close;
        me.okFun = me.config.ok;
        me.cancelFun = me.config.cancel;
        me.resizeFun = me.config.resize;

        if (me._verify()) {
            me._init();
        }
    }
    Popup.prototype =  {
        construtor: Popup,
        version: "1.0.1",
        timer : undefined,
        resizeTimer : false,    // resize 
        closed : true,

        /** 验证参数是否合法 */
        _verify: function () {
            return true;
        },
        /**
         * 初始化
         * @private
         */
        _init: function () {
            var me = this;
            // 如果页面中没有指定的 Dom 则生成一个插入到文档中
            if ($(me.config.DOM_TRIGGER_TARGET).length === 0) {
                $("body").append("<div class='" + me.config.DOM_TRIGGER_TARGET + "' style='display:none'></div>");
            }
            me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET);    // 触发元素
            me.$parent = $(me.config.DOM_PARENT);                   // 触发元素的父元素

            me._bind();
        },
        /**
         * 事件绑定方法
         * @param {string} EVE_EVENT_TYPE 事件类型，"scroll" 或 "click"。
         * @private
         */
        _bind: function () {
            var me = this;
            function bindEvent(e) {
                if (me.config.PREVENT_DEFAULT) {
                    e.preventDefault();
                }
                if (me.config.DISPOSABLE) {
                    SQ.dom.$doc.off(me.config.EVE_EVENT_TYPE, me.config.DOM_TRIGGER_TARGET, bindEvent);
                }
                me._trigger(e);
            }
            // 绑定在 document 上是为了解决 Ajax 内容绑定问题
            SQ.dom.$doc.on(me.config.EVE_EVENT_TYPE, me.config.DOM_TRIGGER_TARGET, bindEvent);
        },
        /**
         * 事件触发
         * @param e
         * @private
         */
        _trigger: function (e) {
            var me = this;
            if (me.config.DELAY) {
                setTimeout(function () {
                    me.show(e);
                }, me.config.DELAY);
                return;
            }
            me.show(e);
        },
        /**
         * 新建弹窗对象
         * @returns {*} $popupPanel
         * @private
         */
        _createPopup: function () {
            var me = this;

            if (me.$popupPanel) {
                return me.$popupPanel;
            }
            // 初始化
            var $popupPanel = $("<div class='sq-popup'></div>");
            var $popupContent = $("<div class='content'></div>");
            var $close = $("<div class='close-btn'>" + me.config.TXT_CLOSE_VAL + "</div>");
            var $okBtn = $("<div class='ok'>" + me.config.TXT_OK_VAL + "</div>");
            var $cancelBtn = $("<div class='cancel'>" + me.config.TXT_CANCEL_VAL + "</div>");
            
            // 设置样式
            $popupPanel.css({
                "position" : me.config.CSS_POSITION,
                "width" : me.config.CSS_WIDTH,
                "height" : me.config.CSS_HEIGHT,
                "z-index" : 1000
            });

            if (me.config.CSS_CLASS) {
                $popupPanel.addClass(me.config.CSS_CLASS.indexOf(".") === 0 ? me.config.CSS_CLASS.slice(1) : me.config.CSS_CLASS);
            }
            // 装载内容
            $popupPanel.append($popupContent);
            // 设置显示按钮
            if (me.config.CLOSE_BTN) {
                $popupPanel.append($close);
            }
            if (me.config.OK_BTN) {
                $popupPanel.append($okBtn);
            }
            if (me.config.CANCEL_BTN) {
                $popupPanel.append($cancelBtn);
            }

            $popupPanel.appendTo(SQ.dom.$body);
            // 保存 Dom
            me.$popupPanel = $popupPanel;
            me.$popupContent = $popupContent;
            me.$okBtn = $okBtn;
            me.$cancelBtn = $cancelBtn;
            me.$close = $close;

            return $popupPanel;
        },
        /**
         * 设置弹窗位置
         * @private
         */
        _setPopupPos: function () {
            var me = this;
            var top;
            var supportBroswer = "chrome";
            var isAnimate = me.config.ANIMATE;
            var isMiddle = me.config.VERTICAL === "middle" ? true : false;
            var isCenter = me.config.HORIZONTAL === "center" ? true : false;
            var isSupportTransform = SQ.ua.browser.shell === "ucweb" && SQ.ua.browser.version >= 9 || supportBroswer.indexOf(SQ.ua.browser.shell) !== -1;

            if (me.config.CSS_POSITION === "fixed") {
                top = "50%";
            } else if (me.config.CSS_POSITION === "absolute") {
                var winHeight = window.innerHeight || SQ.dom.$win.height();
                top = SQ.dom.$body.scrollTop() + winHeight / 2;
            }
            
            if (!me.config.CSS_TOP && !me.config.CSS_LEFT && !me.config.CSS_BOTTOM && !me.config.CSS_RIGHT) {
                // 当坐标全部未设置时给一个默认值，避免弹窗定位到页面最底部
                me.config.CSS_TOP = 0;
                me.config.CSS_LEFT = 0;
            }

            if (isSupportTransform && !isAnimate) {
                if (isMiddle && isCenter) {
                    me.$popupPanel.css({
                        "top": top,
                        "left": "50%",
                        "-webkit-transform": "translate(-50%, -50%)"
                    });
                } else if (isMiddle) {
                    me.$popupPanel.css({
                        "top": top,
                        "left": me.config.CSS_LEFT || 0,
                        "-webkit-transform": "translateY(-50%)"
                    });
                } else if (isCenter) {
                    me.$popupPanel.css({
                        "top": me.config.CSS_TOP || 0,
                        "left": "50%",
                        "-webkit-transform": "translateX(-50%)"
                    });
                } else {
                    me.$popupPanel.css({
                        "top": me.config.CSS_TOP,
                        "left": me.config.CSS_LEFT,
                        "bottom": me.config.CSS_BOTTOM,
                        "right": me.config.CSS_RIGHT
                    });
                }
            } else {
                var mt = me.config.CSS_HEIGHT ? me.config.CSS_HEIGHT / 2 * -1 : me.$popupPanel.height() / 2 * -1;
                var ml = me.config.CSS_WIDTH ? me.config.CSS_WIDTH / 2 * -1 : me.$popupPanel.width() / 2 * -1;
                if (isMiddle && isCenter) {
                    me.$popupPanel.css({
                        "top": top,
                        "left": "50%",
                        "margin-top": mt,
                        "margin-left": ml
                    });
                } else if (isMiddle) {
                    me.$popupPanel.css({
                        "top": top,
                        "left": me.config.CSS_LEFT || 0,
                        "margin-top": mt
                    });
                } else if (isCenter) {
                    me.$popupPanel.css({
                        "top": me.config.CSS_TOP || 0,
                        "left": "50%",
                        "margin-left": ml
                    });
                } else {
                    me.$popupPanel.css({
                        "top": me.config.CSS_TOP,
                        "left": me.config.CSS_LEFT,
                        "bottom": me.config.CSS_BOTTOM,
                        "right": me.config.CSS_RIGHT
                    });
                }
            }
        },
        /**
         * 设置弹窗事件
         * @private
         */
        _setPopupEvent : function () {
            var me = this;
            // 锁定操作
            if (me.config.LOCK) {
                // 优化 Android 下 UCweb 浏览器触摸操作，减少滑动误操作
                if (SQ.ua.os.name === "android" && SQ.ua.browser.shell === "ucweb" && SQ.ua.browser.version >= 9) {
                    me.$popupPanel.on("touchstart", function (e) {
                        e.preventDefault();
                    });
                } else {
                    me.$popupPanel.on("touchmove", function (e) {
                        e.preventDefault();
                    });
                }
                me.$popupPanel.on("mousewheel", function (e) {
                    e.preventDefault();
                });
            }
            me.$okBtn.on("click", function () {
                me.ok();
            });
            me.$cancelBtn.on("click", function () {
                me.cancel();
            });
            me.$close.on("click", function () {
                me.close();
            });

            SQ.dom.$win.resize(function () {
                me.resize();
            });
        },
        _beforeShow: function (e) {
            var me = this;
            // 创建弹窗
            me.$popupPanel = me._createPopup();
            // 绑定弹窗事件
            me._setPopupEvent();
            // 添加动画
            if (me.config.ANIMATE) {
                var animateClassName = me.config.ANIMATE.indexOf(".") === 0 ? me.config.ANIMATE.slice(1) : me.config.ANIMATE;
                me.$popupPanel.addClass("animated " + animateClassName);
            }
            if (me.beforeShowFun) {
                return me.beforeShowFun(e);
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
                console.warn("SQ.Popup: _beforeShow function return false");
                return;
            }
            me.closed = false;
            if (me.config.MASK) {
                me.mask();
            }
            // 执行回调函数，优先执行 show 回调函数可以确定弹窗中的内容，从而方便计算弹窗尺寸。
            if (me.showFun) {
                me.showFun(e);
            }
            // 设置弹窗位置
            me._setPopupPos();
            me.$popupPanel.show();
            // 设置自动关闭
            if (me.config.NUM_CLOSE_TIME) {
                me.time(me.config.NUM_CLOSE_TIME);
            }
        },
        /**
         * 关闭对话框
         * @param e
         */
        close: function (type) {
            var me = this;
            // 清除定时关闭
            if (me.timer) {
                clearTimeout(me.timer);
            }
            me.$popupPanel.remove();
            me.$popupContent.empty();
            me.$popupPanel = null;
            if (me.config.MASK) {
                me.$mask.hide();
            }
            me.closed = true;

            if (me.closeFun && !type) {
                me.closeFun();
            }
        },
        /**
         * 定时关闭
         * @param {Number} 单位为秒, 无参数则停止计时器
         */
        time: function (second) {
            var me = this;
            if (!me.closed) {
                me.timer = setTimeout(function () {
                    me.close();
                }, second);
            }
        },
        /** 显示遮罩 */
        mask: function () {
            var me = this;
            var bodyH = SQ.dom.$body.height();
            var winH = SQ.dom.$win.height();
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
                    "position" : "absolute",
                    "top" : 0,
                    "left" : 0,
                    "right" : 0,
                    "width" : "100%",
                    "height" : h,
                    "background" : me.config.CSS_MASK_BACKGROUND,
                    "opacity" : me.config.CSS_MASK_OPACITY,
                    "z-index" : 999
                }).appendTo(SQ.dom.$body);

                if (me.config.LOCK) {
                    $mask.on("touchstart", function (e) {
                        e.preventDefault();
                    });
                    $mask.on("mousewheel", function (e) {
                        e.preventDefault();
                    });
                }
                me.$mask = $mask;
            }
        },
        ok: function (e) {
            var me = this;
            me.close("ok");
            if (me.okFun) {
                me.okFun(e);
            }
        },
        cancel: function (e) {
            var me = this;
            me.close("cancel");
            if (me.cancelFun) {
                me.cancelFun(e);
            }
        },
        resize: function () {
            var me = this;
            me._setPopupPos();
        }
    };
    SQ.Popup = Popup;
}($, window));
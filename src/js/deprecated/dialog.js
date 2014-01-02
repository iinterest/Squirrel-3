/**
 * @file SQ.Dialog 对话框组件
 * @version 0.9.8
 */

/**
 * @changelog
 * 0.9.8  * 新增 PREVENT_DEFAULT、DELAY 设置，增强 ANIMATE 参数的兼容性，可以支持 ".style-name" 或 "style-name" 写法。
 * 0.9.7  * 修复 jshint 问题。
 * 0.9.6  * 改写 _bin、_unbind 方法，新增 DESTROY 参数，设置 DESTROY 后会清除目标 DOM 的绑定事件。
 * 0.9.5  * 修复 IE 兼容性问题。
 * 0.9.4  * 调整 SQ.dom 的调用。
 *          修复当文档内容高度小于窗口高度时，遮罩不完全的问题。
 * 0.9.3  * 更改 _bind 中的绑定方式，修正异步加载的 DOM 无法绑定 dialog 事件问题。
 * 0.9.2  * 将 _bind 中的 .live 改为 .on 绑定，添加 TXT_CLOSE_VAL 默认值为 x。
 * 0.9.1  * 核心删除了 SQ.dom.getHeight 方法，所以改用 .height() 方法。
 * 0.9.0  + 新增 resize 回调函数，
 *        * 拆分 show 方法，新增 _initDialogStyle、_initDialogEvent 方法，
 *        * 新增 _reset 方法，当窗口发生变化时将会重新计算对话框样式，
 *        * 修复遮罩在窗口发生变化时无法铺满全屏的问题。
 * 0.8.3  * 修复 LOCK 状态下大多浏览器无法响应点击事件问题（针对 UCweb 9 有优化）。 
 * 0.8.2  + 新增 CSS_STYLE 对话框样式名称设置。
 * 0.8.1  + lock 方法新增屏蔽鼠标滚轮操作，
 *        + 新增定时关闭方法，设置 NUM_CLOSE_TIME 参数即可触发，
 *        + 新增 ok、cancel 回调函数，
 *        * 修改了 close 函数的实现逻辑，去除 DESTROY 参数，现在 close 方法都是销毁操作。
 * 0.6.1  + FULLSCREEN_OFFSET 新增设置 auto 参数，当设置 auto 时 dialog 会在响应居中，但需要设置高宽才能生效。
 * 0.6.0  + 新增 FULLSCREEN_OFFSET 设置，新增 _getDialog 内部函数，优化对话框坐标、高度、宽度计算。
 * 0.5.1  * 修复获取窗口高度时，UC浏览器返回值会出现多种情况，导致高度计算出现偏差。
 * 0.5.0  + 新增对话框组件。
 */

(function ($, window) {
    "use strict";
    /**
     * @name Dialog
     * @classdesc 对话框组件，依赖 jQuery 或 Zepto 库。
     * @constructor
     * @param {object} config 组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.EVE_EVENT_TYPE 绑定事件设置
     * @param {string} config.DOM_TRIGGER_TARGET 被绑定事件的 Dom 元素
     * @param {string} config.TXT_CLOSE_VAL 关闭按钮显示文字
     * @param {string} config.TXT_OK_VAL 确定按钮显示文字，默认值："确定"
     * @param {string} config.TXT_CANCEL_VAL 取消按钮显示文字，默认值："取消"
     * @param {string} config.CSS_STYLE 对话框样式名称
     * @param {string} config.CSS_MASK_BACKGROUND 遮罩背景色，默认值："#000000"
     * @param {string} config.CSS_MASK_OPACITY 遮罩透明度，默认值：0.5
     * @param {string} config.CSS_POSITION 对话框定位方式，默认值："absolute"
     * @param {number} config.CSS_TOP 对话框 top 属性值，默认值："auto"
     * @param {number} config.CSS_LEFT 对话框 left 属性值，默认值："auto"
     * @param {number} config.CSS_WIDTH 对话框 width 属性值，默认值："auto"
     * @param {number} config.CSS_HEIGHT 对话框 height 属性值，默认值："auto"
     * @param {number} config.CSS_MIN_WIDTH 对话框 min-width 属性值
     * @param {number} config.CSS_MIN_HEIGHT 对话框 min-height 属性值
     * @param {array} config.FULLSCREEN_OFFSET 全屏偏移距离设置，即弹出层距上下左右的距离
     *                                         例如：[20,10]表示上下距离 20 像素，左右距离 10 像素
     * @param {number} config.NUM_CLOSE_TIME 对话框自动关闭时间，单位：毫秒
     * @param {string} config.VERTICAL 对话框垂直位置，可选值："middle"，
     *                                 必须设置 CSS_HEIGHT 或 CSS_MIN_HEIGHT 才能生效
     * @param {string} config.HORIZONTAL 对话框水平位置，可选值："center"，
     *                                 必须设置 CSS_WIDTH 或 CSS_MIN_WIDTH 才能生效
     * @param {string} config.ANIMATE 动画类，默认值：undefined
     * @param {boole} config.MASK 遮罩设定，默认为 false，设为 true 将显示遮罩效果
     * @param {boole} config.LOCK 锁定操作，默认为 false，设为 true 将屏蔽触摸操作，默认值：false
     * @param {number} config.NUM_CLOSE_TIME 自动关闭对话框时间，单位：毫秒
     * @param {boole} config.PREVENT_DEFAULT 默认动作响应设置，默认为 true，不响应默认操作
     * @param {number} config.DELAY 延时显示对话框设置，单位：毫秒
     * @param {function} config.show 打开对话框回调函数
     * @param {function} config.ok 点击确定按钮回调函数
     * @param {function} config.cancel 点击取消按钮回调函数
     * @param {function} config.close 关闭对话框回调函数
     * @param {function} config.reszie resize 回调函数
     */
    function Dialog(config) {
        var me = this;
        var i;

        me.config = {
            CSS_MASK_BACKGROUND : "#000000",
            CSS_MASK_OPACITY : 0.5,
            CSS_POSITION : "absolute",
            CSS_TOP : 0,
            CSS_LEFT : 0,
            CSS_WIDTH : "auto",             // 内容宽度
            CSS_HEIGHT : "auto",            // 内容高度
            CSS_MIN_WIDTH : "auto",          // 最小宽度限制
            CSS_MIN_HEIGHT : "auto",         // 最小高度限制
            TXT_OK_VAL : "确定",
            TXT_CANCEL_VAL : "取消",
            TXT_CLOSE_VAL : "×",
            ANIMATE : undefined,
            LOCK : false,
            MASK : false,
            PREVENT_DEFAULT : true
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }

        me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET); // 触发元素
        me.cssStyle = me.config.CSS_STYLE.indexOf(".") === 0 ? me.config.CSS_STYLE.slice(1) : me.config.CSS_STYLE;
        if (me.config.ANIMATE) {
            me.animate = me.config.ANIMATE.indexOf(".") === 0 ? me.config.ANIMATE.slice(1) : me.config.ANIMATE;
        }

        me.showFun = me.config.show;
        me.closeFun = me.config.close;
        me.okFun = me.config.ok;
        me.cancelFun = me.config.cancel;
        me.resizeFun = me.config.resize;

        if (me._verify()) {
            me._init();
        }
    }
    Dialog.prototype =  {
        construtor: Dialog,
        version: "0.9.8",
        timer : undefined,
        resizeTimer : false,    // resize 
        closed : true,

        /** 验证参数是否合法 */
        _verify : function () {
            return true;
        },

        /** 初始化 */
        _init : function () {
            var me = this;
            // 获取宽度设置
            if (typeof me.config.CSS_WIDTH === "number") {
                me.dialogWidth = me.config.CSS_WIDTH;
            } else if (typeof me.config.CSS_MIN_WIDTH === "number") {
                me.dialogWidth = me.config.CSS_MIN_WIDTH;
            } else {
                me.dialogWidth = undefined;
            }
            // 获取高度设置
            if (typeof me.config.CSS_HEIGHT === "number") {
                me.dialogHeight = me.config.CSS_HEIGHT;
            } else if (typeof me.config.CSS_MIN_HEIGHT === "number") {
                me.dialogHeight = me.config.CSS_MIN_HEIGHT;
            } else {
                me.dialogHeight = undefined;
            }

            me._bind(me.config.EVE_EVENT_TYPE);
        },

        /**
         * 事件绑定方法。
         * @param {object} $el jQuert 或 Zepto 元素包装集。
         * @param {string} EVE_EVENT_TYPE 事件类型，"scroll" 或 "click"。
         */
        _bind : function (EVE_EVENT_TYPE) {
            var me = this;
            // 绑定在 document 上是为了解决 Ajax 内容绑定问题
            SQ.dom.$doc.on(EVE_EVENT_TYPE, me.config.DOM_TRIGGER_TARGET, function (e) {
                if (me.config.PREVENT_DEFAULT) {
                    e.preventDefault();
                }
                me._trigger(e);
            });
        },
        /**
         * 解除事件绑定方法。
         * @param {object} $el jQuert 或 Zepto 元素包装集。
         * @param {string} EVE_EVENT_TYPE 事件类型，"scroll" 或 "click"。
         */
        _unbind : function (EVE_EVENT_TYPE) {
            var me = this;
            SQ.dom.$doc.off(EVE_EVENT_TYPE, me.config.DOM_TRIGGER_TARGET);
            //$el.off(EVE_EVENT_TYPE);
        },
        /**
         * 触发事件方法，在满足绑定事件条件时或满足指定触发条件的情况下调用触发方法，
         * 该方法用于集中处理触发事件，判定是否需要加载数据或者更新 UI 显示。
         * @param {string} EVE_EVENT_TYPE 事件类型，"scroll" 或 "click"。
         */
        _trigger : function (e) {
            var me = this;
            if (me.config.DELAY) {
                setTimeout(function () {
                    me.show(e);
                }, me.config.DELAY);
                return;
            }
            me.show(e);
        },

        // 重置位置与尺寸
        _reset : function () {
            var me = this;

            SQ.dom.$win.resize(function () {
                if (!me.closed && !me.resizeTimer) {
                    me.resizeTimer = true;
                    setTimeout(function () {
                        if (!me.$dialogWindow) {
                            // 自动关闭窗口时会丢失 me.$dialogWindow
                            return;
                        }
                        me._initDialogStyle();
                        me.$dialogWindow.css({
                            "top" : me.top,
                            "left" : me.left,
                            "width" : me.width,
                            "height" : me.height
                        });
                        me.resizeTimer = false;
                        if (me.resizeFun) {
                            me.resizeFun();
                        }
                        //me.resizeFun && me.resizeFun();
                    }, 200);
                }
            });
        },

        // 获取 dialog Dom
        _getDialog : function () {
            var me = this;

            if (me.$dialogWindow) {
                return me.$dialogWindow;
            }
            // 初始化 dialogWindow
            var $dialogWindow = $("<div class='sq-dialog'></div>");
            var $dialogContent = $("<div class='content'></div>");
            var $okBtn = $("<div class='ok'>" + me.config.TXT_OK_VAL + "</div>");
            var $cancelBtn = $("<div class='cancel'>" + me.config.TXT_CANCEL_VAL + "</div>");
            var $close = $("<div class='close-btn'>" + me.config.TXT_CLOSE_VAL + "</div>");
            $dialogWindow.append($close).append($dialogContent).append($okBtn).append($cancelBtn);
            $dialogWindow.addClass(me.cssStyle);
            // 保存关键 Dom
            //me.$dialogWindow = $dialogWindow;
            me.$dialogContent = $dialogContent;
            me.$okBtn = $okBtn;
            me.$cancelBtn = $cancelBtn;
            me.$close = $close;

            return $dialogWindow;
        },

        _initDialogStyle : function () {
            var me = this;
            var scroll = SQ.dom.$body.scrollTop();
            var winWidth = window.innerWidth || SQ.dom.$win.width();
            var winHeight = window.innerHeight || SQ.dom.$win.height();

            // 设置 top
            if (me.dialogHeight) {
                if (me.config.VERTICAL === "middle") {
                    me.top = (winHeight - me.dialogHeight) / 2 + scroll;
                }
            } else {
                me.top = me.config.CSS_TOP || 0;
            }
            // 设置 left
            if (me.dialogWidth) {
                if (me.config.HORIZONTAL === "center") {
                    me.left = (winWidth - me.dialogWidth) / 2;
                }
            } else {
                me.left = me.config.CSS_LEFT || 0;
            }
            // 高宽设置
            me.width = me.config.CSS_WIDTH;
            me.height = me.config.CSS_HEIGHT;
            // 设置 offset
            if (me.config.FULLSCREEN_OFFSET) {
                var offset = me.config.FULLSCREEN_OFFSET;
                var tb = offset[0]; // 上下偏移距离
                var lr = offset[1]; // 左右偏移距离
                if (typeof tb === "number") {
                    me.height = winHeight - tb * 2;
                    me.top = (winHeight - me.height) / 2 + scroll;
                } else if (tb === "auto") {
                    me.top = (winHeight - me.dialogHeight) / 2 + scroll;
                }
                if (typeof lr === "number") {
                    me.width = winWidth - lr * 2;
                    me.left = lr;
                } else if (tb === "auto") {
                    me.left = (winWidth - me.dialogWidth) / 2;
                }
            }
        },

        _initDialogEvent : function () {
            var me = this;
            // 锁定操作
            if (me.config.LOCK) {
                // 优化 Android 下 UCweb 浏览器触摸操作，减少滑动误操作
                if (SQ.ua.os.name === "android" && SQ.ua.browser.shell === "ucweb" && SQ.ua.browser.version >= 9) {
                    me.$dialogWindow.on("touchstart", function (e) {
                        e.preventDefault();
                    });
                } else {
                    me.$dialogWindow.on("touchmove", function (e) {
                        e.preventDefault();
                    });
                }
                me.$dialogWindow.on("mousewheel", function (e) {
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

            if (me.config.NUM_CLOSE_TIME) {
                me.time(me.config.NUM_CLOSE_TIME);
            }

            me._reset();
        },

        /** 显示对话框 */
        show : function (e) {
            var me = this;
            if (!me.closed) {
                return;
            }
            me.closed = false;
            if (me.config.MASK) {
                me.mask();
            }
            me.$dialogWindow = me._getDialog();
            me._initDialogStyle();
            // 添加动画
            if (me.config.ANIMATE) {
                me.$dialogWindow.addClass("animated " + me.animate);
            }
            // 设置对话框样式
            me.$dialogWindow.css({
                "position" : me.config.CSS_POSITION,
                "top" : me.top,
                "left" : me.left,
                "min-width" : me.config.CSS_MIN_WIDTH,
                "min-height" : me.config.CSS_MIN_HEIGHT,
                "width" : me.width,
                "height" : me.height,
                "z-index" : 102
            }).appendTo(SQ.dom.$body);
            // 绑定对话框事件
            me._initDialogEvent();
            // 执行回调函数
            if (me.showFun) {
                me.showFun(e);
            }
            //me.showFun && me.showFun(e);
            if (me.config.DESTROY) {
                me._unbind(me.config.EVE_EVENT_TYPE);
            }
        },

        /** 关闭对话框 */
        close : function (e) {
            var me = this;
            me.$dialogWindow.remove();
            me.$dialogContent.empty();
            me.$dialogWindow = null;
            if (me.config.MASK) {
                me.$mask.hide();
            }
            me.closed = true;
            if (me.closeFun) {
                me.closeFun(e);
            }
            //me.closeFun && me.closeFun(e);
        },

        /**
         * 定时关闭
         * @param {Number} 单位为秒, 无参数则停止计时器
         */
        time : function (second) {
            var me = this;
            if (!me.closed) {
                me.timer = setTimeout(function () {
                    me.close();
                }, second);
            }
        },

        /** 显示遮罩 */
        mask : function () {
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
                    //"bottom" : 0,
                    "right" : 0,
                    "width" : "100%",
                    "height" : h,
                    "background" : me.config.CSS_MASK_BACKGROUND,
                    "opacity" : me.config.CSS_MASK_OPACITY,
                    "z-index" : 101
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

        unlock : function () {
            //var me = this;
        },

        ok : function (e) {
            var me = this;
            me.close();
            if (me.okFun) {
                me.okFun(e);
            }
            //me.okFun && me.okFun(e);
        },

        cancel : function (e) {
            var me = this;
            me.close();
            if (me.cancelFun) {
                me.cancelFun(e);
            }
            //me.cancelFun && me.cancelFun(e);
        }
    };
    SQ.Dialog = Dialog;
}($, window));
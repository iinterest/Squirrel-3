/**
 * @file Squirrel Fixed
 * @version 0.9.0
 */

/**
 * @changelog
 * 0.9.0  * 完成主要功能
 * 0.0.1  + 新建。
 */

(function ($, window) {
    "use strict";
    /**
     * @name Fixed
     * @classdesc 元素固定定位
     * @constructor
     * @param {object} config 组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.DOM_FIXED_ITEM        需要添加固定定位的元素。
     * @param {array} config.ARRY_FIXED_POSITION    固定位置设置，遵循 [上,右,下,左] 规则，默认为 [0, 0, 0, 0]。
     * @param {number} config.NUM_TRIGGER_POSITION  设置 fixed 激活位置，当有该值时以该值为准，没有则以元素当前位置为准。
     * @param {number} config.NUM_ZINDEX            z-index 值设置，默认为 99。
     * @param {boolen} config.PLACEHOLD             是否设置占位 DOM，默认为 false。
     * @param {string} config.ANIMATE               动画类，默认值：undefined
     * @param {function} config.fixedIn             设置固定布局时回调函数。
     * @param {function} config.fixedOut            取消固定布局时回调函数。
     * @example var fixedButton = new SQ.Fixed({
                DOM_FIXED_ITEM: ".J_fixed",
                DOM_TRIGGER_TARGET: window,
                EVE_EVENT_TYPE: "scroll",
                ARRY_FIXED_POSITION: ["auto", "auto", 20, 10],
                PLACEHOLD: true
            });
     */
    function Fixed(config) {
        var me = this;
        var i;

        me.config = {
            ARRY_FIXED_POSITION: [0, 0, 0, 0],
            NUM_ZINDEX: 99,
            PLACEHOLD: false
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }

        me.fixedIn = me.config.fixedIn;
        me.fixedOut = me.config.fixedOut;

        if (me._verify()) {
            me._init();
        }
    }

    Fixed.prototype = {
        construtor: Fixed,
        version: "0.9.0",
        scrollTimer: 0,     // 滑动计时器
        scrollDelay: 150,   // 滑动阀值
        /**
         * 验证参数是否合法
         * @returns {boolean}
         * @private
         */
        _verify: function () {
            return true;
        },
        /**
         * 初始化
         * @private
         */
        _init: function () {
            var me = this;

            me.$fixedItems = $(me.config.DOM_FIXED_ITEM);
            if (me.$fixedItems.length === 0) {
                return;
            }

            me.$fixedItems.each(function (index) {
                var fixedItem = {
                    id: "fixId" + index,
                    self: this,
                    $self: $(this)
                };

                // 确定 fixed 激活位置，当有 NUM_TRIGGER_POSITION 值时以该值为准，没有则以元素当前位置为准
                if (me.config.NUM_TRIGGER_POSITION && SQ.core.isNumber(me.config.NUM_TRIGGER_POSITION)) {
                    fixedItem.triggerPosTop = me.config.NUM_TRIGGER_POSITION;
                } else {
                    // 设置占位 DOM
                    if (me.config.PLACEHOLD) {
                        me._setPlaceholder(fixedItem);
                    }
                    // 获取元素位置 top 值
                    if (fixedItem.self.getBoundingClientRect()) {
                        fixedItem.triggerPosTop = fixedItem.self.getBoundingClientRect().top;
                    } else {
                        console.log("Not Support getBoundingClientRect");
                    }
                    // 当元素处于页面顶端则立即设置为 fixed 布局
                    // UC 浏览器在实际渲染时会有问题，不建议用 fixed.js 来实现顶部导航的固定布局（直接使用 CSS）
                    if (fixedItem.self.triggerPosTop === 0) {
                        me._setFixed(fixedItem);
                    }
                }
                // 触发绑定
                me._trigger(fixedItem);
            });
        },
        /**
         * 设置 fixed 元素占位 DOM
         * @param fixedItem
         * @private
         */
        _setPlaceholder: function (fixedItem) {
            var $placeholderDom = $("<div class='sq-fixed-placeholder' id='"+ fixedItem.id +"'></div>").css({
                display: "none",
                width: fixedItem.$self.width(),
                height: fixedItem.$self.height(),
                background: fixedItem.$self.css("background")
            });
            $placeholderDom.insertAfter(fixedItem.$self);
        },
        _trigger: function (fixedItem) {
            var me = this;
            window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
            // 高级浏览器使用 requestAnimationFrame
            function advancedWatchEvent() {
                var scrollTop = $(window).scrollTop();
                if (scrollTop >= fixedItem.triggerPosTop && !fixedItem.$self.hasClass("sq-fixed")) {
                    me._setFixed(fixedItem);
                } else if (scrollTop < fixedItem.triggerPosTop && fixedItem.$self.hasClass("sq-fixed")) {
                    me._removeFixed(fixedItem);
                }
                window.requestAnimationFrame(advancedWatchEvent);
            }
            // 不支持 requestAnimationFrame 的浏览器使用常用事件
            function normalWatchEvent() {
                var mobile = "android-ios";
                // 触发函数
                function fire() {
                    var scrollTop = $(window).scrollTop();
                    if (scrollTop >= fixedItem.triggerPosTop && !fixedItem.$self.hasClass("sq-fixed")) {
                        me._setFixed(fixedItem);
                    } else if (scrollTop < fixedItem.triggerPosTop && fixedItem.$self.hasClass("sq-fixed")) {
                        me._removeFixed(fixedItem);
                    }
                }
                // 触摸设备使用 touchstart 事件
                if (mobile.indexOf(SQ.ua.os.name) !== -1) {
                    $(window).on("touchstart", function () {
                        // 在触摸滑动时浏览器会锁死进程，滑动停止后才会触发 touchstart 事件，而此时 scrollTop 值
                        // 为触摸时的数值，所以添加 setTimeout 来计算获取滑动停止后的数值。
                        setTimeout(function () {
                            fire();
                        }, 150);
                    });
                } else {
                    $(window).on("scroll", function () {
                        // 添加 scroll 事件相应伐值，优化其性能
                        if (!me.scrollTimer) {
                            me.scrollTimer = setTimeout(function () {
                                fire();
                                me.scrollTimer = 0;
                            }, me.scrollDelay);
                        }
                    });
                }
            }
            
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(advancedWatchEvent);
            } else {
                normalWatchEvent();
            }
        },
        _setFixed: function (fixedItem) {
            var me = this;
            
            var posCss = me.config.ARRY_FIXED_POSITION;
            var $placeholderDom = $("#" + fixedItem.id);

            fixedItem.$self.css({
                "position": "fixed",
                "top": posCss[0],
                "right": posCss[1],
                "bottom": posCss[2],
                "left": posCss[3],
                "z-index": me.config.NUM_ZINDEX
            }).addClass("sq-fixed");

            if (me.config.PLACEHOLD && $placeholderDom.length) {
                $placeholderDom.show();
            }
            
            if (me.fixedIn) {
                me.fixedIn();
            }
        },
        _removeFixed: function (fixedItem) {
            var me = this;
            var $placeholderDom = $("#" + fixedItem.id);
            
            fixedItem.$self.attr("style", "").removeClass("sq-fixed");

            if (me.config.PLACEHOLD && $placeholderDom.length) {
                $placeholderDom.hide();
            }

            if (me.fixedOut) {
                me.fixedOut();
            }
        }
    };
    SQ.Fixed = Fixed;
}($, window));
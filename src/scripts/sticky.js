/**
 * @file SQ.Sticky 悬停插件
 * @version 1.6.0
 */

/**
 * @changelog
 * 1.6.0  * 插件更名为 SQ.Sticky
 * 1.5.1  * 修复 $placeholderDom 高度计算问题
 * 1.5.0  * 重写插件，调用方式改为 $. 链式调用。
 * 1.0.0  + 新增 refresh 方法，可以刷新 Fixed 列表；
 *        * 更改 ARRY_FIXED_POSITION 默认值，修正 fixed 元素高度时会占据全屏的 bug；
 *        * 修正 triggerPosTop 没有将 scrollY 的值计算在内的 bug。
 * 0.9.0  * 完成主要功能
 * 0.0.1  + 新建。
 */
/*global $, SQ, console, jQuery */
(function ($) {
    'use strict';
    /**
     * @name Sticky
     * @classdesc 元素固定定位
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.ANIMATE               动画类，默认值：undefined
     * @param {array} config.ARRY_FIXED_POSITION    固定位置设置，遵循 [上,右,下,左] 规则，默认为：[0, 0, 'auto', 0]
     * @param {number} config.NUM_TRIGGER_POSITION  设置 sticky 激活位置，当有该值时以该值为准，没有则以元素当前位置为准
     * @param {number} config.NUM_ZINDEX            z-index 值设置，默认为 101
     * @param {boolen} config.PLACEHOLD             是否设置占位 DOM，默认为 false
     * @param {function} config.fixedIn             设置固定布局时回调函数
     * @param {function} config.fixedOut            取消固定布局时回调函数
     * @example $('.J_fixedHeader').sticky({
    PLACEHOLD: true
});
     */

    var scope = 'sq-sticky';     // data-* 后缀
    var defaults = {
        ARRY_FIXED_POSITION: [0, 0, 'auto', 0],
        NUM_ZINDEX: 101,                            // .sq-header 的 z-index 值为 100
        PLACEHOLD: false
    };

    function Sticky ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Sticky.prototype = {
        construtor: 'Sticky',
        scrollTimer: 0,     // 滑动计时器
        scrollDelay: 150,   // 滑动阀值
        init: function () {
            var me = this;
            var initializedIndex = $('[data-' + scope + ']').length;
            me.$element = $(me.element);
            me.fixedInFun = me.settings.fixedIn;
            me.fixedOutFun = me.settings.fixedOut;

            me.$element.each(function (index) {
                var fixedItem = {
                    id: scope + (index + initializedIndex),     // 用于定位 sticky 元素
                    self: this,
                    $self: $(this),
                    sticky: false                                // 标记是否处在 sticky 状态，用于之后的判断
                };

                // 确定 sticky 激活位置，当有 NUM_TRIGGER_POSITION 值时以该值为准，没有则以元素当前位置为准
                if (me.settings.NUM_TRIGGER_POSITION && SQ.isNumber(me.settings.NUM_TRIGGER_POSITION)) {
                    fixedItem.triggerPosTop = me.settings.NUM_TRIGGER_POSITION;
                } else {
                    // 设置占位 DOM
                    if (me.settings.PLACEHOLD) {
                        me._setPlaceholder(fixedItem);
                    }
                    // 获取元素位置 top 值
                    if (fixedItem.self.getBoundingClientRect()) {
                        fixedItem.triggerPosTop = fixedItem.self.getBoundingClientRect().top + window.scrollY;
                    } else {
                        console.warn('Not Support getBoundingClientRect');
                    }
                    // 当元素处于页面顶端则立即设置为 sticky 布局
                    // UC 浏览器在实际渲染时会有问题，不建议用 sticky.js 来实现顶部导航的固定布局（直接使用 CSS）
                    if (fixedItem.self.triggerPosTop === 0) {
                        me._setFixed(fixedItem);
                    }
                }
                // 触发绑定
                me._trigger(fixedItem);
            });
        },
        /**
         * 设置 sticky 元素占位 DOM
         * @param fixedItem
         * @private
         */
        _setPlaceholder: function (fixedItem) {
            var $dom = fixedItem.$self;
            var height = $dom.height() + parseInt($dom.css('padding-top'), 10) + parseInt($dom.css('padding-bottom'), 10) + parseInt($dom.css('margin-top'), 10) + parseInt($dom.css('margin-bottom'), 10);
            var $placeholderDom = $('<div class="sq-sticky-placeholder" id="'+ fixedItem.id +'"></div>').css({
                display: 'none',
                width: $dom.width(),
                height: height,
                background: $dom.css('background')
            });
            $placeholderDom.insertAfter(fixedItem.$self);
        },
        /**
         * 设置触发事件及触发条件
         * @param fixedItem
         * @private
         */
        _trigger: function (fixedItem) {
            var me = this;
            window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
            // 高级浏览器使用 requestAnimationFrame
            function advancedWatchEvent() {
                var scrollTop = window.scrollY;
                if (scrollTop >= fixedItem.triggerPosTop && !fixedItem.sticky) {
                    me._setFixed(fixedItem);
                } else if (scrollTop < fixedItem.triggerPosTop && fixedItem.sticky) {
                    me._removeFixed(fixedItem);
                }
                window.requestAnimationFrame(advancedWatchEvent);
            }
            // 不支持 requestAnimationFrame 的浏览器使用常用事件
            function normalWatchEvent() {
                var mobile = 'android-ios';
                // 触发函数
                function fire() {
                    var scrollTop = window.scrollY;
                    if (scrollTop >= fixedItem.triggerPosTop && !fixedItem.$self.hasClass('sq-sticky')) {
                        me._setFixed(fixedItem);
                    } else if (scrollTop < fixedItem.triggerPosTop && fixedItem.$self.hasClass('sq-sticky')) {
                        me._removeFixed(fixedItem);
                    }
                }
                // 触摸设备使用 touchstart 事件
                if (mobile.indexOf(SQ.ua.os.name) !== -1) {
                    $(window).on('touchstart', function () {
                        // 在触摸滑动时浏览器会锁死进程，滑动停止后才会触发 touchstart 事件，而此时 scrollTop 值
                        // 为触摸时的数值，所以添加 setTimeout 来计算获取滑动停止后的数值。
                        setTimeout(function () {
                            fire();
                        }, 150);
                    });
                } else {
                    $(window).on('scroll', function () {
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
            var posCss = me.settings.ARRY_FIXED_POSITION;
            var $placeholderDom = $('#' + fixedItem.id);

            fixedItem.$self.css({
                'position': 'fixed',
                'top': posCss[0],
                'right': posCss[1],
                'bottom': posCss[2],
                'left': posCss[3],
                'z-index': me.settings.NUM_ZINDEX
            });
            fixedItem.sticky = true;

            if (me.settings.PLACEHOLD && $placeholderDom.length) {
                $placeholderDom.show();
            }

            if (me.settings.ANIMATE) {
                var animateClassName = me.settings.ANIMATE.indexOf('.') === 0 ? me.settings.ANIMATE.slice(1) : me.settings.ANIMATE;
                fixedItem.$self.addClass('animated ' + animateClassName);
            }

            if (me.fixedInFun) {
                me.fixedInFun();
            }
        },
        _removeFixed: function (fixedItem) {
            var me = this;
            var $placeholderDom = $('#' + fixedItem.id);

            fixedItem.$self.attr('style', '');
            fixedItem.sticky = false;

            if (me.settings.PLACEHOLD && $placeholderDom.length) {
                $placeholderDom.hide();
            }

            if (me.fixedOutFun) {
                me.fixedOutFun();
            }
        }
    };

    $.fn.sticky = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;

        options = options || {};
        options.selector = this.selector;

        this.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Sticky( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope)) {
                    plugin = new Sticky( this, options );
                    $(this).data(scope, 'initialized');
                }
            }
        });
        // chain jQuery functions
        return this;
    };

})($);
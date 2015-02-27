/**
 * @file SQ.LazyLoad 延迟加载插件 
 * @version 1.0.3
 */

/**
 * @changelog
 * 1.0.3  * data-img 修改为 data-original
 * 1.0.2  * 修改 scroll 绑定事件，使用新增的节流函数，精简函数。
 * 1.0.1  * 增加验证提示，调整了 init 函数。
 * 1.0.0  * 重写插件，调用方式改为 $. 链式调用。
 * 0.8.1  * 新增 ANIMATE 设置。
 * 0.8.0  * 重写 lazylaod 插件，提高整体性能。
 * 0.7.0  * 调整滑动阀值 scrollDelay，由 200 调整至 150；
 *        * 调整可视区的计算方式，由 offset 改为 getBoundingClientRect；
 *        * 针对 UC 浏览器极速版进行优化，可以在滑动过程中进行加载。
 * 0.6.5  * 修复 jshint 问题。
 * 0.6.4  * 修复图片加载失败时会导致 error 时间一直被触发的 bug；
 *          修复与 loadmore 插件配合使用时，无法替换加载错误的图片。
 * 0.6.3  + 新增首屏图片自动加载功能；
 *        + 新增占位图、占位背景设置。
 * 0.6.0  + 首屏图片自动加载。
 * 0.5.1  * 完成图片模式的延迟加载功能。
 * 0.0.1  + 新建。
 */
/*global $, SQ, console, jQuery */
(function ($) {
    'use strict';
    /**
     * @name LazyLoad
     * @classdesc 内容延迟加载
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.ANIMATE               动画类，例如 .fadeIn
     * @param {string} config.IMG_PLACEHOLDER       占位图片
     * @param {string} config.MODE                  延迟加载模式，默认为：image（图片模式）
     * @param {number} config.NUM_THRESHOLD         灵敏度，数值越大越灵敏，延迟性越小，默认为 200
     * 
     * @example $('.J_lazyload').lazyload({
    ANIMATE: '.fadeIn'
});
     */

    var scope = 'sq-lazyload';      // data-* 后缀
    var defaults = {
        MODE: 'image',
        NUM_THRESHOLD: 350,
        IMG_PLACEHOLDER: ''
    };

    function Lazyload ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Lazyload.prototype = {
        construtor: 'Lazyload',
        scrollTimer: 0,     // 滑动计时器
        scrollDelay: 150,   // 滑动阀值
        init: function () {
            var me = this;
            me.$element = $(me.element);
            me.elementClassName = me.settings.selector.slice(1);   // '.style-name' => 'style-name'
            me.$element.attr('src', me.settings.IMG_PLACEHOLDER);
            if (me._verify()) {
                me._bindLazyEvent();
                me._trigger();
                me._loadImg();
            }
        },
        /**
         * 验证参数是否合法
         * @returns {boolean}
         * @private
         */
        _verify: function () {
            /*if (!this.$element.length) {
                console.warn('SQ.lazyload: '+ this.settings.selector +'下未找到');
                return false;
            }*/
            return true;
        },
        _bindLazyEvent: function () {
            var me = this;
            // 为延迟加载元素绑定一次性执行事件
            me.$element.one('appear', function () {
                var img = this;
                var $img = $(img);
                var src = $img.attr('data-original');
                // 替换 src 操作
                if (src) {
                    $img.addClass('unvisible').attr('src', src).removeAttr('data-original').removeClass(me.elementClassName);
                    $img.on('load', function () {
                        // 添加动画
                        if (me.settings.ANIMATE) {
                            var animateClassName = me.settings.ANIMATE.indexOf('.') === 0 ? me.settings.ANIMATE.slice(1) : me.settings.ANIMATE;
                            $img.addClass('animated ' + animateClassName);
                        }
                        $img.removeClass('unvisible');
                    });
                    $img.on('error', function () {
                        if (me.settings.IMG_PLACEHOLDER) {
                            $(this).attr('src', me.settings.IMG_PLACEHOLDER).off('error');
                        }
                    });
                }
            });
        },
        _trigger: function () {
            var me = this;
            $(window).on('scroll.bs.lazyload', SQ.throttle(function () {
                if (me.settings.MODE === 'image') {
                    me._loadImg();
                }
            }, me.scrollDelay));
        },
        /**
         * 判断是否在显示区域
         */
        _isInDisplayArea: function (item) {
            var me = this;
            if (item.getBoundingClientRect()) {
                var pos = item.getBoundingClientRect();
                return pos.top > 0 - me.settings.NUM_THRESHOLD && pos.top - me.settings.NUM_THRESHOLD < window.innerHeight;
            } else {
                var $item = $(item);
                var winH = window.innerHeight;
                var winOffsetTop = window.pageYOffset; // window Y 轴偏移量
                var itemOffsetTop = $item.offset().top;
                // itemOffsetTop >= winOffsetTop 只加载可视区域下方的内容
                // winOffsetTop + winH + me.settings.NUM_THRESHOLD 加载可视区域下方一屏内的内容
                return itemOffsetTop >= winOffsetTop && itemOffsetTop <= winOffsetTop + winH + me.settings.NUM_THRESHOLD;
            }
        },
        _loadImg: function () {
            var me = this;
            if (me.settings.IMG_PLACEHOLDER && me.$element.hasClass(me.elementClassName)) {
                //me.$element.attr('src', me.settings.IMG_PLACEHOLDER);
                me.$element.on('error', function () {
                    $(this).attr('src', me.settings.IMG_PLACEHOLDER).off('error');
                });
            }
            if (me._isInDisplayArea(me.$element.get(0))) {
                me.$element.trigger('appear');
            }
        }
    };

    $.fn.lazyload = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;

        options = options || {};
        options.selector = this.selector;

        /*if (!this.length) {
            console.warn('SQ.lazyload: 未找到'+ this.selector +'元素');
        }*/

        this.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Lazyload( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope)) {
                    plugin = new Lazyload( this, options );
                    $(this).data(scope, 'initialized');
                }
            }
        });
        // chain jQuery functions
        return this;
    };

})($);
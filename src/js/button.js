/**
 * @file SQ.Button 按钮插件
 * @version 0.5.0
 */

/**
 * @changelog
 * 0.5.0  * 重写插件，调用方式改为 $. 链式调用。
 * 0.2.0  * 重写 menu 模式代码，独立 button.js 为插件
 * 0.1.2  * 修复 jshint 问题
 * 0.1.1  + 新增 menu 交互模式
 * 0.0.1  + 新建
 */
/*global $, SQ, console, jQuery*/
(function ($) {
    'use strict';
    /**
     * @name Button
     * @classdesc 按钮交互插件
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.ANIMATE               动画类，例如 .fadeIn
     * @param {string} config.EVE_EVENT_TYPE        交互触发方式，默认为 'click'
     * @param {string} config.MODE                  按钮交互模式，默认为 'menu'
     * @example $('.J_buttonMenu').button({
    ANIMATE: '.fadeIn quick'
});
     */

    var scope = 'sq-button';    // data-* 后缀
    var defaults = {
        MODE: 'menu',
        EVE_EVENT_TYPE: 'click'
    };

    function Button ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Button.prototype = {
        construtor: 'Button',
        init: function () {
            var me = this;
            me.$element = $(me.element);
            me.elementClassName = me.settings.selector.slice(1);   // '.style-name' => 'style-name'
            if (me.settings.MODE === 'menu') {
                me.menu();
            }
        },
        setState: function (state) {
            var me = this;
            if (state === 'active') {
                me.$element.addClass('active');
            }
            if (state === 'init') {
                me.$element.removeClass('active');
            }
        },
        menu: function () {
            var me = this;
            var $doc = $(document);
            var $allButtons = $(me.settings.selector);
            var $allMenus = $allButtons.find('.dropdown-menu');
            var $menu = me.$element.find('.dropdown-menu');

            me.$element.on(me.settings.EVE_EVENT_TYPE + '.sq.button.menu', function () {
                if (!me.$element.hasClass('active')) {
                    _showMenu();
                } else {
                    _hideMenu();
                }
            });

            function _showMenu() {
                //** reset all menus
                $allMenus.hide();
                $allButtons.removeClass('active');
                //** add animate
                if (me.settings.ANIMATE) {
                    var animateClassName = me.settings.ANIMATE.indexOf('.') === 0 ? me.settings.ANIMATE.slice(1) : me.settings.ANIMATE;
                    $menu.addClass('animated ' + animateClassName);
                }
                $menu.show();
                me.setState('active');
                $doc.on('click.sq.button.menu', _documentEvent);
            }

            function _hideMenu() {
                $menu.hide();
                me.setState('init');
                $doc.off('click.sq.button.menu', _documentEvent);
            }

            function _documentEvent(e) {
                if (!$(e.target).hasClass(me.elementClassName)) {
                    _hideMenu();
                }
            }
        }
    };

    $.fn.button = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;

        options = options || {};
        options.selector = this.selector;

        this.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Button( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope)) {
                    plugin = new Button( this, options );
                    $(this).data(scope, 'initialized');
                }
            }
        });
        // chain jQuery functions
        return this;
    };

})($);
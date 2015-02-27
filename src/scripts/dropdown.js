/**
 * @file SQ.Dropdown 按钮插件
 * @version 0.6.0
 */

/**
 * @changelog
 * 0.6.6  * 更名为 Dropdown
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
     * @name Dropdown
     * @classdesc 按钮交互插件
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.ANIMATE               动画类，例如 .fadeIn
     * @param {string} config.EVE_EVENT_TYPE        交互触发方式，默认为 'click'
     * @param {string} config.MODE                  按钮交互模式，默认为 'menu'
     * @example $('.J_dropdown').dropdown({
    ANIMATE: '.fadeIn quick'
});
     */

    var scope = 'sq-dropdown';    // data-* 后缀
    var defaults = {
        MODE: 'menu',
        EVE_EVENT_TYPE: 'click'
    };

    function Dropdown ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Dropdown.prototype = {
        construtor: 'Dropdown',
        init: function () {
            var me = this;
            var date = new Date().getTime().toString().slice(-4);
            me.$element = $(me.element);
            me.elementClassName = me.settings.selector.slice(1);   // '.style-name' => 'style-name'
            
            // _documentEvent 判断时会碰到相同 className 的情况，会导致无法隐藏菜单
            me.classId = scope + '-id-' + date;
            me.$element.addClass(me.classId);
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
            var $allMenus = $allButtons.find('.dropdown-content');
            var $menu = me.$element.find('.dropdown-content');

            me.$element.on(me.settings.EVE_EVENT_TYPE + '.sq.dropdown', function () {
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
                $doc.on('click.sq.dropdown', _documentEvent);
            }

            function _hideMenu() {
                $menu.hide();
                me.setState('init');
                $doc.off('click.sq.dropdown', _documentEvent);
            }

            function _documentEvent(e) {
                if (!$(e.target).parents('.' + scope).hasClass(me.classId)) {
                    _hideMenu();
                }
            }
        }
    };

    $.fn.dropdown = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;

        if (SQ.isObject(options)) {
            options = options || {};
            // 当使用 $(this).modal({...}) 调用时，无法获取 this.selector 值，
            // 所以去手动获取该 DOM 的类名
            options.selector = this.selector || '.' + this[0].className.split(' ').join('.');
        }
        
        this.each(function() {
            if (isJQuery) {
                if (!$.data(this, scope + 'init')) {
                    $.data( this, scope + 'init', new Dropdown( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope + 'init')) {
                    plugin = new Dropdown( this, options );
                    $(this).data(scope + 'init', 'initialized');
                }
            }
        });
        // chain jQuery functions
        return this;
    };

    // DATA-API
    // ===============
    /*$(document).on('click.button.data.api', '[data-'+ scope +']', function () {
        var $me = $(this);
        var pluginSetting = $me.data(scope);
        //console.log(pluginSetting)
        $me.button(pluginSetting);
    });*/
    /*$(document).ready(function () {
        $('[data-'+ scope +']').each(function () {
            var $me = $(this);
            var pluginSetting = $me.data(scope);
            if (SQ.isObject(pluginSetting)) {
                $me.button(pluginSetting);
            }
        });
    });*/
})($);
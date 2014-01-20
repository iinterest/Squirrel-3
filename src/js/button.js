/**
 * @file Squirrel Button
 * @version 0.2.0
 */

/**
 * @changelog
 * 0.2.0  * 重写 menu 模式代码，独立 button.js 为插件
 * 0.1.2  * 修复 jshint 问题
 * 0.1.1  + 新增 menu 交互模式
 * 0.0.1  + 新建
 */
/*global
 $: false,
 SQ: false,
 console: false
 */
(function ($, window) {
    "use strict";
    /**
     * @name Button
     * @classdesc 选项卡交互组件
     * @constructor
     * @param {object} config 组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.EVE_EVENT_TYPE        触发事件，click 或 mouseover
     * @param {string} config.DOM_TRIGGER_TARGET    被绑定事件的 Dom 元素
     * @param {string} config.MODE                  交互模式，目前只有 menu
     * @param {string} config.ANIMATE               动画类，例如 .fadeIn
     */
    function Button(config) {
        var me = this;
        var i;

        me.config = {

        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }

        me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET);        // 目标元素

        if (me._verify()) {
            me._init();
        }
    }
    Button.prototype =  {
        construtor: Button,
        version: "0.2.0",

        // 验证参数是否合法
        _verify: function () {
            return true;
        },
        _init: function () {
            var me = this;
            // menu 模式
            if (me.config.MODE === "menu") {
                me.menu();
            }
        },
        /**
         * 
         * @param state
         */
        setState: function (state) {
            var me = this;
            if (state === "active") {
                me.$triggerTarget.addClass("active");
            }
            if (state === "init") {
                me.$triggerTarget.removeClass("active");
            }
        },
        /**
         * 
         */
        menu: function () {
            var me = this;
            var $menuBtns = $(".J_buttonMenu");
            var $menu = me.$triggerTarget.find(".dropdown-menu");
            var $menus = $menuBtns.find(".dropdown-menu");
            var $doc = $(document);

            me.$triggerTarget.on(me.config.EVE_EVENT_TYPE, function (e) {
                _toggle(e);
            });

            function _toggle() {
                if (!me.$triggerTarget.hasClass("active")) {
                    _showMenu();
                } else {
                    _hideMenu();
                }
            }
            
            function _resetAll() {
                $menus.hide();
                $menuBtns.removeClass("active");
            }
            function _showMenu() {
                _resetAll();
                if (me.config.ANIMATE) {
                    var animateClassName = me.config.ANIMATE.indexOf(".") === 0 ? me.config.ANIMATE.slice(1) : me.config.ANIMATE;
                    $menu.addClass("animated " + animateClassName);
                }
                $menu.show();
                me.setState("active");
                $doc.on("click", _documentEvent);
            }
            function _hideMenu() {
                $menu.hide();
                me.setState("init");
                $doc.off("click", _documentEvent);
            }
            function _documentEvent(e) {
                var $target = $(e.target);
                if (!$target.hasClass("sq-btn") && $target.parents(".sq-btn").length === 0) {
                    _hideMenu();
                }
            }
        },
        // 按钮开关效果
        toggle: function () {
            //var me = this;

        }
    };
    SQ.Button = Button;
}($, window));
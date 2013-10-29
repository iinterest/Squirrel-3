/**
 * @file Squirrel Button
 * @version 0.1.2
 */

/**
 * @changelog
 * 0.1.2  * 修复 jshint 问题
 * 0.1.1  + 新增 menu 交互模式
 * 0.0.1  + 新建
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
     * @param {string} config.MODE                  交互模式
     */
    function Button(config) {
        var me = this;
        var i;

        me.config = {
            TXT_LOADING_TIP : "正在加载请稍后..."     // 正在加载提示
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
        version: "0.1.2",
        //state: "init",

        // 验证参数是否合法
        _verify : function () {
            return true;
        },
        _init : function () {
            var me = this;
            // menu 模式
            if (me.config.MODE === "menu") {
                me.$triggerTarget.on(me.config.EVE_EVENT_TYPE, function () {
                    me.menu();
                });
            }
        },
        // 改变按钮状态
        setState : function (state) {
            var me = this;
            //me.state = state;
            if (state === "active") {
                me.$triggerTarget.addClass("active");
            }
            if (state === "init") {
                me.$triggerTarget.removeClass("active");
            }
           
        },
        // 按钮菜单效果
        menu : function () {
            var me = this;
            var $menuBtns = $(".J_buttonMenu");
            var $menu = me.$triggerTarget.find(".menu");
            var $menus = $menuBtns.find(".menu");
            var $doc = $(document);
            
            function _resetAll() {
                $menus.hide();
                $menuBtns.removeClass("active");
            }
            function _showMenu() {
                _resetAll();
                $menu.show();
                me.setState("active");
                $doc.on("click", function (e) {
                    var $target = $(e.target);
                    if (!$target.hasClass("sq-btn") && $target.parents(".sq-btn").length === 0) {
                        _hideMenu();
                    }
                });
            }
            function _hideMenu() {
                $menu.hide();
                me.setState("init");
                $doc.off("click");
            }

            if (!me.$triggerTarget.hasClass("active")) {
                _showMenu();
            } else {
                _hideMenu();
            }
        },
        // 按钮开关效果
        toggle : function () {
            //var me = this;

        }
    };
    SQ.Button = Button;
    
    // 初始化菜单类型按钮
    $(".J_buttonMenu").each(function () {
        var $me = $(this);
        var button = new SQ.Button({
            EVE_EVENT_TYPE : "click",
            DOM_TRIGGER_TARGET : $me,
            MODE : "menu",
            CSS_STYLE : ""
        });
    });
}($, window));
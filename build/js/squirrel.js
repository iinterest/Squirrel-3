/**
 * @file SQ.core
 * @version 1.0.0
 */
var SQ = {
    /**
     * 命名空间方法
     * @method
     * @name SQ.core.namespace
     * @param {string} nameSpaceString 命名空间字符串
     * @example
     * SQ.core.namespace("SQ.modules.module2");
     */
    namespace: function (nameSpaceString) {
        var parts = nameSpaceString.split(".");
        var parent = SQ;
        var i;
        if (parts[0] === "SQ") {
            parts = parts.slice(1);
        } else {
            return false;
        }
        for (i = 0; i < parts.length; i += 1) {
            if (typeof parent[parts[i]]) {
                parent[parts[i]] = {};
            }
            parent = parent[parts[i]];
        }
        return parent;
    },
    /**
     * 判断对象类型
     * @example
     * SQ.core.isString(str);
     */
    isString: function (str) {
        return Object.prototype.toString.call(str) === "[object String]";
    },
    isArray: function (arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    },
    isNumber: function (num) {
        return Object.prototype.toString.call(num) === "[object Number]";
    },
    isBoolean: function (bool) {
        return Object.prototype.toString.call(bool) === "[object Boolean]";
    },
    isNull: function (nullObj) {
        return Object.prototype.toString.call(nullObj) === "[object Null]";
    },
    isUndefined: function (undefinedObj) {
        return Object.prototype.toString.call(undefinedObj) === "[object Undefined]";
    },
    isFunction: function (fun) {
        return Object.prototype.toString.call(fun) === "[object Function]";
    },
    isObject: function (obj) {
        return Object.prototype.toString.call(obj) === "[object Object]";
    },
    /**
     * isJSON
     * 判断是否为 JSON 对象
     * @param string
     * @returns {boolean}
     * @see qatrix.js
     */
    // 暂时无法使用
    /*isJSON : function (string) {
     var rvalidchars = /^[\],:{}\s]*$/;
     var rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g;
     var rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g;
     var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
     return typeof string === 'string' && $.trim(string) !== '' ?
     rvalidchars.test(string
     .replace(rvalidescape, '@')
     .replace(rvalidtokens, ']')
     .replace(rvalidbraces, '')) :
     false;
     }*/
    extend: function (Child, Parent) {
        var F = function () {
        };
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.uber = Parent.prototype;
    }
};
/**
 * @file SQ.store
 * @version 1.1.0
 */
/*global
 SQ: false
 */
SQ.store = {
    /**
     * Cookie
     * @example
     * Sq.cookie.set("name", "value");  // 设置
     * Sq.cookie.get("name");           // 读取
     * Sq.cookie.del("name");           // 删除
     */
    cookie: {
        _getValue: function (offset) {
            var ck = document.cookie;
            var endstr = ck.indexOf(";", offset) === -1 ? ck.length : ck.indexOf(";", offset);
            return decodeURIComponent(ck.substring(offset, endstr));
        },
        get: function (key) {
            var me = this;
            var ck = document.cookie;
            var arg = key + "=";
            var argLen = arg.length;
            var cookieLen = ck.length;
            var i = 0;
            while (i < cookieLen) {
                var j = i + argLen;
                if (ck.substring(i, j) === arg) {
                    return me._getValue(j);
                }
                i = ck.indexOf(" ", i) + 1;
                if (i === 0) {
                    break;
                }
            }
            return null;
        },
        set: function (key, value) {
            var expdate = new Date();
            var year = expdate.getFullYear();
            var month = expdate.getMonth();
            var date = expdate.getDate() + 1;
            var argv = arguments;
            var argc = arguments.length;
            //获取更多实参，依次为：有效期、路径、域、加密安全设置
            var expires = (argc > 2) ? argv[2] : null;
            var path = (argc > 3) ? argv[3] : null;
            var domain = (argc > 4) ? argv[4] : null;
            var secure = (argc > 5) ? argv[5] : false;

            if (!!expires) {
                switch (expires) {
                case "day":
                    expdate.setYear(year);
                    expdate.setMonth(month);
                    expdate.setDate(date);
                    expdate.setHours(8);    // 补 8 小时时差
                    expdate.setMinutes(0);
                    expdate.setSeconds(0);
                    break;
                case "week":
                    var week = 7 * 24 * 3600 * 1000;
                    expdate.setTime(expdate.getTime() + week);
                    break;
                default:
                    expdate.setTime(expdate.getTime() + (expires * 1000 + 8 * 3600 * 1000));
                    break;
                }
            }

            document.cookie = key + "=" + encodeURIComponent(value) + ((expires === null) ? "" : ("; expires=" + expdate.toGMTString())) +
             ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) +
             ((secure === true) ? "; secure" : "");
        },
        del: function (key) {
            var me = this;
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = me.get(key);
            document.cookie = key + "=" + cval + "; expires=" + exp.toGMTString();
        }
    },
    /**
     * localStorage
     */
    localStorage: {
        hasLoaclStorage: (function () {
            if( ("localStorage" in window) && window.localStorage !== null ) {
                return true;
            }
        }()),
        // expires 过期时间，单位 min 
        get: function (key, expires) {
            var me = this;
            var now = new Date().getTime();
            var localData;
            var time;
            var dataStore;
            
            if (!key || !me.hasLoaclStorage) {
                return;
            }

            localData = JSON.parse(localStorage.getItem(key));

            if (localData) {
                time = localData.time;
                dataStore = localData.dataStore;

                // 填写了 expires 过期时间
                if (expires) {
                    dataStore = parseInt(expires, 10) * 1000 * 60 > (now - parseInt(time, 10)) ? dataStore : false;
                }
                return dataStore;
            }
        },
        set: function (key, value) {
            var me = this;
            var ds = {};
            var now = new Date().getTime();
            if (!key || !value || !me.hasLoaclStorage) {
                return;
            }

            ds.dataStore = value;
            ds.time = now;
            ds = JSON.stringify(ds);

            localStorage.setItem(key, ds);
        },
        del: function (key) {
            var me = this;
            if (!key || !me.hasLoaclStorage) {
                return;
            }
            localStorage.removeItem(key);
        },
        clearAll: function () {
            var me = this;
            if (!me.hasLoaclStorage) {
                return;
            }
            localStorage.clear();
        }
    }
};
/**
 * @file SQ.ua
 * 获取设备 ua 信息，判断系统版本、浏览器名称及版本
 * @version 1.0.0
 */
/*global
 SQ: false
 */
SQ.ua = (function () {
    var info = {};
    var ua = navigator.userAgent;
    var m;

    info.os = {};
    info.browser = {};

    /**
     * operating system. android, ios, linux, windows
     * @type string
     */
    if ((/Android/i).test(ua)) {
        info.os.name = "android";
        info.os.version = ua.match(/(Android)\s([\d.]+)/)[2];
    } else if ((/Adr/i).test(ua)) {
        // UC 浏览器极速模式下，Android 系统的 UA 为 "Adr"
        info.os.name = "android";
        info.os.version = ua.match(/(Adr)\s([\d.]+)/)[2];
    } else if ((/iPod/i).test(ua)) {
        info.os.name = "ios";
        info.os.version = ua.match(/OS\s([\d_]+)/)[1].replace(/_/g, ".");
        info.device = "ipod";
    } else if ((/iPhone/i).test(ua)) {
        info.os.name = "ios";
        info.os.version = ua.match(/(iPhone\sOS)\s([\d_]+)/)[2].replace(/_/g, ".");
        info.device = "iphone";
    } else if ((/iPad/i).test(ua)) {
        info.os.name = "ios";
        info.os.version = ua.match(/OS\s([\d_]+)/)[1].replace(/_/g, ".");
        info.device = "ipad";
    }

    // 浏览器判断
    m = ua.match(/AppleWebKit\/([\d.]*)/);
    if (m && m[1]) {
        info.browser.core = "webkit";
        info.browser.version = m[1];

        if ((/Chrome/i).test(ua)) {
            info.browser.shell = "chrome";
        } else if ((/Safari/i).test(ua)) {
            info.browser.shell = "safari";
        } else if ((/Opera/i).test(ua)) {
            info.browser.shell = "opera";
        }
    }

    if ((/UCBrowser/i).test(ua)) {
        // UCWeb 9.0 UA 信息中包含 UCBrowser 字段
        m = ua.match(/(UCBrowser)\/([\d.]+)/);
        info.browser.shell = "ucweb";
        info.browser.version = m[2];
    } else if ((/UCWEB/i).test(ua)) {
        // UCWeb 7.9 UA 信息中包含 UCWEB 字段
        m = ua.match(/(UCWEB)([\d.]+)/);
        info.browser.shell = "ucweb";
        info.browser.version = m[2];
    } else if ((/UC/i).test(ua)) {
        // UCWeb 8.x UA 信息中包含 UC 字段
        // 确认 8.6、8.7 
        info.browser.shell = "ucweb";
        info.browser.version = "8.x";
    }

    if (info.browser.shell === "ucweb") {
        // UC 浏览器急速模式
        // 目前只有 Android 平台国内版 UCWeb 9.0 可以判断是否为急速模式，UA 中包含 UCWEB/2.0 字段即为急速模式。
        if ((/UCWEB\/2\.0/i).test(ua)) {
            info.browser.module = "swift";
        }
    }

    if (info.browser.version) {
        info.browser.version = parseFloat(info.browser.version, 10);
    }

    return info;
}());
/**
 * @file SQ.util
 * 常用函数
 * @version 1.0.0
 */
/*global
 SQ: false
 */
SQ.util = {
    /**
     * 随机数输出
     * @method
     * @name SQ.util.generate
     * @example
     * Sq.util.generate.uniqueId();
     * Sq.util.generate.randomInt(0, 9);
     * Sq.util.generate.randomArr([1,2,3]);
     */
    generate: {
        // 生成唯一标识符
        uniqueId: function () {

        },
        randomInt: function (min, max) {
            if (typeof min === "number" && typeof max === "number" && min < max) {
                return parseInt(Math.random() * (max - min + 1) + min, 10);
            }
            return false;
        },
        randomArr: function (arr) {
            return arr.sort(function () {
                return Math.random() - 0.5;
            });
        }
    },
    /**
     * 字符串操作
     * @method
     * @name SQ.util.string
     * @example
     * SQ.util.string.trim("   test string    ");
     * //return test string
     */
    string: {
        // 过滤字符串首尾的空格
        trim: function(srt) {
            return srt.replace(/^\s+|\s+$/g, "");
        }
    },
    /**
     * 格式化时间
     * @method
     * @name SQ.util.dateToString
     * @example
     * SQ.util.dateToString(new Date())
     * //return 2013-10-17 17:31:58
     */
    dateToString: function(time) {
        var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var date = time.getDate();
        var hours = time.getHours();
        var min = time.getMinutes();
        var sec = time.getSeconds();
        10 > month && (month = "0" + month), 10 > date && (date = "0" + date), 10 > hours && (hours = "0" + hours), 10 > min && (min = "0" + min), 10 > sec && (sec = "0" + sec);
        var dateString = year + "-" + month + "-" + date + " " + hours + ":" + min + ":" + sec;
        return dateString;
    },
    goTop: function (e) {
        e.preventDefault();
        window.scrollTo(0, 0);
    },
    goBack: function (e) {
        e.preventDefault();
        history.back();
    }
};
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
/**
 * @file Squirrel Fixed
 * @version 1.0.0
 */

/**
 * @changelog
 * 1.0.0  + 新增 refresh 方法，可以刷新 Fixed 列表；
 *        * 更改 ARRY_FIXED_POSITION 默认值，修正 fixed 元素高度时会占据全屏的 bug；
 *        * 修正 triggerPosTop 没有将 scrollY 的值计算在内的 bug。
 * 0.9.0  * 完成主要功能
 * 0.0.1  + 新建。
 */
/*global
 $: false,
 SQ: false,
 console: false
 */
(function ($, window) {
    "use strict";
    /**
     * @name Fixed
     * @classdesc 元素固定定位
     * @constructor
     * @param {object} config 组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.DOM_FIXED_ITEM        需要添加固定定位的元素。
     * @param {array} config.ARRY_FIXED_POSITION    固定位置设置，遵循 [上,右,下,左] 规则，默认为：[0, 0, "auto", 0]。
     * @param {number} config.NUM_TRIGGER_POSITION  设置 fixed 激活位置，当有该值时以该值为准，没有则以元素当前位置为准。
     * @param {number} config.NUM_ZINDEX            z-index 值设置，默认为 99。
     * @param {boolen} config.PLACEHOLD             是否设置占位 DOM，默认为 false。
     * @param {string} config.ANIMATE               动画类，默认值：undefined
     * @param {function} config.fixedIn             设置固定布局时回调函数。
     * @param {function} config.fixedOut            取消固定布局时回调函数。
     * @param {function} config.refresh             可以刷新 Fixed 列表（供即时生成的 DOM 使用）。
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
            ARRY_FIXED_POSITION: [0, 0, "auto", 0],
            NUM_ZINDEX: 101,                            // .sq-header 的 z-index 值为 100
            PLACEHOLD: false
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }

        me.fixedIn = me.config.fixedIn;
        me.fixedOut = me.config.fixedOut;
        me.$fixedItems = $(me.config.DOM_FIXED_ITEM);
        me.fixedItemAry = [];

        if (me._verify()) {
            me._init();
        }
    }

    Fixed.prototype = {
        construtor: Fixed,
        version: "1.0.0",
        scrollTimer: 0,     // 滑动计时器
        scrollDelay: 150,   // 滑动阀值
        refresh: function () {
            var me = this;
            var $allItems = $(me.config.DOM_FIXED_ITEM);
            me.$fixedItems = $allItems.not(".init");
            me._init();

            $(me.fixedItemAry).each(function (index) {
                var $self = $(this);
                if ($self.hasClass("init")) {
                    me._trigger(me.fixedItemAry[index]);
                }
            });

            /*if (!me.fixedItemAry.length) {
                me.$fixedItems = $(me.config.DOM_FIXED_ITEM);
                me._init();
                console.log("init", me.fixedItemAry);
            } else {
                console.log("refresh", me.fixedItemAry);
                $(me.fixedItemAry).each(function (index) {
                    var self = this;
                    console.log(self.init)
                    if (self.init) {
                        me._trigger(me.fixedItemAry[index]);
                    }
                });
            }*/
        },
        /**
         * 验证参数是否合法
         * @returns {boolean}
         * @private
         */
        _verify: function () {
            var me = this;
            if (me.$fixedItems.length === 0) {
                //console.warn("SQ.fixed: 缺少 fixed DOM 元素");
                return;
            }
            return true;
        },
        /**
         * 初始化
         * @private
         */
        _init: function () {
            var me = this;
            var oldIndex = $(".init").length;
            me.$fixedItems.each(function (index) {
                var fixedItem = {
                    id: "fixId" + (index + oldIndex),   // 
                    self: this,
                    $self: $(this),
                    fixed: false                        // 标记是否处在 fixed 状态，用于之后的判断
                };
                fixedItem.$self.addClass("init");
                // 确定 fixed 激活位置，当有 NUM_TRIGGER_POSITION 值时以该值为准，没有则以元素当前位置为准
                if (me.config.NUM_TRIGGER_POSITION && SQ.isNumber(me.config.NUM_TRIGGER_POSITION)) {
                    fixedItem.triggerPosTop = me.config.NUM_TRIGGER_POSITION;
                } else {
                    // 设置占位 DOM
                    if (me.config.PLACEHOLD) {
                        me._setPlaceholder(fixedItem);
                    }
                    // 获取元素位置 top 值
                    if (fixedItem.self.getBoundingClientRect()) {
                        fixedItem.triggerPosTop = fixedItem.self.getBoundingClientRect().top + window.scrollY;
                    } else {
                        console.warn("Not Support getBoundingClientRect");
                    }
                    // 当元素处于页面顶端则立即设置为 fixed 布局
                    // UC 浏览器在实际渲染时会有问题，不建议用 fixed.js 来实现顶部导航的固定布局（直接使用 CSS）
                    if (fixedItem.self.triggerPosTop === 0) {
                        me._setFixed(fixedItem);
                    }
                }
                // 触发绑定
                me._trigger(fixedItem);
                me.fixedItemAry.push(fixedItem);
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
                if (scrollTop >= fixedItem.triggerPosTop && !fixedItem.fixed) {
                    me._setFixed(fixedItem);
                } else if (scrollTop < fixedItem.triggerPosTop && fixedItem.fixed) {
                    me._removeFixed(fixedItem);
                }
                window.requestAnimationFrame(advancedWatchEvent);
            }
            // 不支持 requestAnimationFrame 的浏览器使用常用事件
            function normalWatchEvent() {
                var mobile = "android-ios";
                // 触发函数
                function fire() {
                    var scrollTop = window.scrollY;
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
            });
            fixedItem.fixed = true;

            if (me.config.PLACEHOLD && $placeholderDom.length) {
                $placeholderDom.show();
            }

            if (me.config.ANIMATE) {
                var animateClassName = me.config.ANIMATE.indexOf(".") === 0 ? me.config.ANIMATE.slice(1) : me.config.ANIMATE;
                fixedItem.$self.addClass("animated " + animateClassName);
            }
            
            if (me.fixedIn) {
                me.fixedIn();
            }
        },
        _removeFixed: function (fixedItem) {
            var me = this;
            var $placeholderDom = $("#" + fixedItem.id);
            
            fixedItem.$self.attr("style", "");
            fixedItem.fixed = false;

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
/**
 * @file Squirrel LazyLoad
 * @version 0.8.1
 */

/**
 * @changelog
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

/*global
 $: false,
 SQ: false,
 console: false
 */

(function ($, window) {
    "use strict";
    /**
     * @name LazyLoad
     * @classdesc 内容延迟加载
     * @constructor
     * @param {object} config 组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.DOM_LAZY_ITEMS        需要添加延迟加载的元素。
     * @param {string} config.DOM_LAZY_PARENT       图片模式下，设置延迟加载元素的父元素的背景样式，
     *                                              必须与 DOM_LAZY_PARENT 同时配置。
     * @param {string} config.CSS_PLACEHOLDER       图片模式下，设置占位样式，必须与 DOM_LAZY_PARENT 同时配置。
     * @param {string} config.MODE                  延迟加载模式：image（图片模式）。
     * @param {string} config.NUM_THRESHOLD         灵敏度，数值越大越灵敏，延迟性越小，默认为 200。
     * @param {string} config.ANIMATE               动画类，例如 .fadeIn
     * @param {function} config.refresh             刷新延迟加载元素列表。
     * @example var imglazyload = new SQ.LazyLoad({
                DOM_LAZY_ITEMS : ".J_lazyload",
                DOM_LAZY_PARENT : ".sq-list .icon",
                CSS_PLACEHOLDER : ".default-icon",
                IMG_PLACEHOLDER : "../../../static/images/sq-icon.png",
                NUM_THRESHOLD : 270
            });
     */
    function LazyLoad(config) {
        var me = this;
        var i;

        me.config = {
            "MODE": "image",
            "NUM_THRESHOLD": 200
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }
        if (me._verify()) {
            me._init();
        }
    }
    LazyLoad.prototype = {
        construtor: LazyLoad,
        version: "0.8.1",
        scrollTimer: 0,     // 滑动计时器
        scrollDelay: 150,   // 滑动阀值
        /**
         * 刷新延迟加载元素，可以在外部调用。
         */
        refresh: function () {
            var me = this;
            me.$lazyItems = $(me.config.DOM_LAZY_ITEMS);
            me._bindLazyEvent();
            me._loadImg();
        },
        /**
         * 验证参数是否合法
         * @returns {boolean}
         * @private
         */
        _verify: function () {
            return true;
        },
        _init: function () {
            var me = this;
            me.$lazyItems = $(me.config.DOM_LAZY_ITEMS);
            me.lazyItemClassName = me.config.DOM_LAZY_ITEMS.slice(1);   // ".style-name" => "style-name"
            me._bindLazyEvent();
            me._trigger();
            me._loadImg();
        },
        _bindLazyEvent: function () {
            var me = this;
            // 为延迟加载元素绑定一次性执行事件
            me.$lazyItems.one("appear", function () {
                var img = this;
                var $img = $(img);
                var src = $img.attr("data-img");
                // 添加动画
                if (me.config.ANIMATE) {
                    var animateClassName = me.config.ANIMATE.indexOf(".") === 0 ? me.config.ANIMATE.slice(1) : me.config.ANIMATE;
                    $img.addClass("animated " + animateClassName);
                }
                // 替换 src 操作
                if (src) {
                    $img.attr("src", src).removeAttr("data-img").removeClass(me.lazyItemClassName);
                    $img.on("error", function () {
                        $(this).attr("src", me.config.IMG_PLACEHOLDER).off("error");
                    });
                }
            });
        },
        _trigger: function () {
            var me = this;
            $(window).on("scroll", function () {
                // 添加 scroll 事件相应伐值，优化其性能
                if (!me.scrollTimer) {
                    me.scrollTimer = setTimeout(function () {
                        if (me.config.MODE === "image") {
                            me._loadImg();
                        }
                        me.scrollTimer = 0;
                    }, me.scrollDelay);
                }
            });
            /*if (SQ.ua.browser.shell === "ucweb") {
                $win.on("touchmove", function () {
                    // 针对 UC 浏览器极速版进行优化，可以在滑动过程中进行加载。
                    if (me.config.MODE === "image") {
                        me._loadImg();
                    }
                });
            }*/
        },
        /** 
         * 判断是否在显示区域 
         */
        _isInDisplayArea: function (item) {
            var me = this;
            
            if (item.getBoundingClientRect()) {
                var pos = item.getBoundingClientRect();
                return pos.top > 0 - me.config.NUM_THRESHOLD && pos.top - me.config.NUM_THRESHOLD < window.innerHeight;
            } else {
                var $item = $(item);
                var winH = window.innerHeight;
                var winOffsetTop = window.pageYOffset; // window Y 轴偏移量
                var itemOffsetTop = $item.offset().top;
                // itemOffsetTop >= winOffsetTop 只加载可视区域下方的内容
                // winOffsetTop + winH + me.config.NUM_THRESHOLD 加载可视区域下方一屏内的内容
                return itemOffsetTop >= winOffsetTop && itemOffsetTop <= winOffsetTop + winH + me.config.NUM_THRESHOLD;
            }
        },
        _loadImg: function () {
            var me = this;
            me.$lazyItems.each(function (index, item) {
                var $img = $(item);
                if (me.config.IMG_PLACEHOLDER && $img.hasClass(me.lazyItemClassName)) {
                    $img.attr("src", me.config.IMG_PLACEHOLDER);
                    $img.on("error", function () {
                        $(this).attr("src", me.config.IMG_PLACEHOLDER).off("error");
                    });
                }
                if (me._isInDisplayArea(item)) {
                    $img.trigger("appear");
                }
            });
        }
    };
    SQ.LazyLoad = LazyLoad;
}($, window));
/**
 * @file SQ.LoadMore 加载更多组件
 * @version 1.4.2
 */

/**
 * @changelog
 * 1.4.2  * 修复 _spliceApi 函数对 api 的拼装错误。
 * 1.4.1  * 为 loaded、scrollEnd 回调函数增加 index 参数。
 * 1.4.0  * 重写 loadMore 插件，支持在一个页面里生成多个实例。
 * 1.3.0  * 删除 render 回调函数。
 * 1.2.4  + 新增 RESTFUL 配置，支持 RESTful 接口风格，
 *        + 新增 XHR_TIMEOUT 配置，
 *        * 精简的验证方法。
 * 1.2.3  * 增强 CSS_STATE_BAR 参数的兼容性，可以支持 ".style-name" 或 "style-name" 写法。
 * 1.2.2  * 修复 jshint 问题，修复 #15 问题。
 * 1.2.1  * 修复启用 localstorage 时 _loadedResult 函数得到的数据为字符串的问题。
 * 1.2.0  + 添加对 localStorage 支持，通过将 LOCAL_DATA 设置为 true 开启，通过 NUM_EXPIRES 来设置过期时间（单位：分钟）。
 * 1.1.10 * 修复点击加载是，加载出错会导致无法展示状态栏。
 * 1.1.9  + 可自定义 XHR_METHOD 为 GET 或 POST 方法，默认为 POST。
 * 1.1.8  + 添加对 IE6 的支持。
 * 1.1.7  * 为 noMore 状态添加 loaded 回调函数。
 * 1.1.6  * 去除 unbind，解决与 lazyload 插件冲突。
 * 1.1.5  + 新增 _changeEvent 函数，用来改变交绑定互事件；
 *        * 精简 _bind、_unbind 函数，对整体逻辑做小的优化。
 * 1.1.3  + 新增 loadError 回调函数。
 * 1.1.2  + 新增 NUM_SUCCESS_CODE、NUM_NO_MORE_CODE 配置项。
 *        * 修复当最大滑动加载页数正好为最后一页时，noMore 事件没有解除滑动事件绑定，导致 scrollEnd 继续执行。
 * 1.1.1  * 修改 config 常量的书写方式。
 * 1.1.0  + 新增 DATATYPE 属性，用于定义 json 数据中 data 字段的数据类型；
 *          新增回调函数 render、loading、loaded、scrollEnd；
 *        - 删除了 scrollEnd 事件中 addClass("click-state") 操作，改为在 scrollEnd 回调函数中执行。
 * 1.0.6  - 精简注释；修改 _refresh 名称为 _reset。
 * 1.0.5  * 修复 _verify 方法因为找不到 DOM 元素而保存导致 js 无法继续执行的问题。
 * 1.0.4  + 添加 _refresh 方法，用于计算并存储文档高度和触发高度，该方法会在完成 XHR 加载后刷新，
 *          减少 _getHeight 取值，优化性能。
 * 1.0.3  + 添加 scroll 事件相应伐值，优化其性能。
 * 1.0.2  + 添加 _verify 方法，用于验证参数是否合法。
 * 1.0.1  + 配置内置的 config 设置。
 */

/*global
 $: false,
 SQ: false,
 console: false
 */

(function ($, window) {
    "use strict";
    /**
     * @name LoadMore
     * @classdesc 应用列表加载更多组件，支持点击加载和滑动加载两种方式，支持由滑动加载自动转为点击加载，依赖 jQuery 或 Zepto 库。
     * @constructor
     * @param {object} config                       组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.EVE_EVENT_TYPE        绑定事件设置
     * @param {string | array} config.API API       接口地址，可以是字符串，或者是数组 [url, url, url]
     * @param {string} config.DOM_TRIGGER_TARGET    被绑定事件的 Dom 元素，默认为 window
     * @param {string} config.DOM_AJAX_WRAP         数据展示 Dom 元素
     * @param {string} config.CSS_STATE_BAR         初始状态展示样式，例如 .state-bar
     * @param {string} config.NUM_LOAD_POSITION     滑动加载位置，默认值：0.5
     * @param {number} config.NUM_START_PAGE_INDEX  起始页面序号，默认值：0
     * @param {number} config.NUM_SCROLL_MAX_PAGE   最大滑动加载页数，默认值：3
     * @param {number} config.NUM_SUCCESS_CODE      XHR 成功返回码，默认值：200
     * @param {number} config.NUM_NO_MORE_CODE      无下页数据返回码，默认值：900
     * @param {string} config.TXT_LOADING_TIP       正在加载提示，默认值："正在加载请稍后..."
     * @param {string} config.TXT_INIT_TIP          初始提示文字，默认值："滑动加载更多内容"
     * @param {string} config.TXT_CLICK_TIP         触发点击交互提示文字，默认值："点击加载更多"
     * @param {string} config.TXT_LOADED_ERROR      XHR 加载错误或超时提示，默认值："加载错误，请重试"
     * @param {string} config.TXT_UNKNOWN_ERROR     通过 XHR 接收到的数据无法识别，默认值："未知错误，请重试"
     * @param {string} config.MODE                  插件模式，默认为 simple，当模式为 simple 时插件会自动判断并更新运行状态，
     *                                              在 simple 模式下 XHR 的返回值必须遵循以下 json 格式：{ code:int, data:object} 
     * @param {boolen} config.LOCAL_DATA            数据 loaclstorage 开关，默认为 false
     * @param {number} config.NUM_EXPIRES           数据 loaclstorage 过期时间（单位：分钟），默认为 15 分钟
     * @param {object | boolen} config.RESTFUL      当设为 true 时，程序会自动将 API 中的 ":page" 段替换为页码 (self.page)，
     *                                              也可以设置为 hash 列表，程序会遍历替换所有值。
     * @param {number} config.XHR_TIMEOUT           设置 XHR 超时时间，默认为 5000 ms
     * @param {function} config.loading             加载阶段回调函数，返回参数：index(序号)
     * @param {function} config.loaded              加载完成回调函数，返回参数：data(XHR 数据), $ajaxWrap(当前 DOM 容器), index
     * @param {function} config.loadError           加载失败回调函数，返回参数：index
     * @param {function} config.scrollEnd           滑动加载事件完成回调函数，返回参数：index
     * @example var appList = new SQ.LoadMore({
            EVE_EVENT_TYPE: "scroll",
            DOM_AJAX_WRAP: ".J_ajaxWrap",
            DOM_STATE_BOX: ".J_scrollLoadMore",
            CSS_STATE_BAR: ".loadMore-btn",
            NUM_SCROLL_MAX_PAGE: 3,
            DATA_TYPE: "json",
            loaded: function (data, $ajaxWrap, index) {
                // data 为 XHR 返回数据，通常为 JSON 格式
            }
        });
     */
    function LoadMore(config) {
        var me = this;
        var i;

        me.config = {
            API: "",                                 // API 接口
            NUM_START_PAGE_INDEX: 0,                 // 起始页面序号
            NUM_LOAD_POSITION: 0.5,                  // 滑动加载位置（0.5 表示页面滑动到 50% 的位置开始加载，该值会递增）
            NUM_SCROLL_MAX_PAGE: 3,                  // 最大滑动加载次数
            TXT_LOADING_TIP: "正在加载请稍后...",     // 正在加载提示
            TXT_INIT_TIP: "滑动加载更多内容",         // 初始提示文字
            TXT_CLICK_TIP: "点击加载更多",            // 触发点击交互提示文字
            TXT_LOADED_ERROR: "加载失败，请点击重试", // Ajax 加载错误或超时提示
            NUM_SUCCESS_CODE: 200,
            NUM_NO_MORE_CODE: 900,
            MODE: "simple",
            XHR_METHOD: "POST",
            XHR_TIMEOUT: 5000,
            LOCAL_DATA: false,
            NUM_EXPIRES: 15
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }
        
        me.$win = $(window);
        me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET) || me.$win;     // 触发元素
        me.$ajaxWrap = $(me.config.DOM_AJAX_WRAP);                          // 数据展示元素
        me.maxPage = me.config.NUM_SCROLL_MAX_PAGE + me.config.NUM_START_PAGE_INDEX;
        me.initStyle = me.config.CSS_STATE_BAR.indexOf(".") === 0 ? me.config.CSS_STATE_BAR.slice(1) : me.config.CSS_STATE_BAR;
        me.scrollTimer = 0;                                                 // 滑动事件计时器
        me.scrollDelay = 200;                                               // 滑动事件触发伐值
        me.loadMores = [];                                                  // 存储多个 self 对象

        me.beforeLoadFun = me.config.beforeLoad;
        me.loadingFun = me.config.loading;
        me.loadFun = me.config.loaded;
        me.loadErrorFun = me.config.loadError;
        me.scrollEndFun = me.config.scrollEnd;

        me.$ajaxWrap.each(function (index) {
            var self = {};
            self.$ajaxWrap = $(this);
            self.$stateBar = $('<div class="sq-loadMore-state"><i class="state-icon"></i><span class="state-txt"></span></div>');
            self.$stateTxt = self.$stateBar.find(".state-txt");
            self.index = index;
            self.page = me.config.NUM_START_PAGE_INDEX;
            self.api = SQ.isArray(me.config.API) ? me.config.API[index] : me.config.API;
            self.firstClickInit = true;

            if (me._verify(self)) {
                me._init(self);
            }
            me.loadMores.push(self);
        });
    }
    LoadMore.prototype = {
        construtor: LoadMore,
        version: "1.4.2",
        /**
         * 验证
         * @returns {boolean}
         * @private
         */
        _verify: function (self) {
            var me = this;
            // Dom 验证，触发元素、数据展示元素、状态展示元素必须都存在
            if (me.$triggerTarget.length === 0 || self.$ajaxWrap.length === 0) {
                console.warn("SQ.loadmore: Self[" + self.index + "]缺少 Dom 元素");
                return false;
            }
            // API 验证
            if (!self.api) {
                console.warn("SQ.loadmore: Self[" + self.index + "]缺少 API 参数");
                return false;
            }
            return true;
        },
        /**
         * 初始化
         * @private
         */
        _init: function (self) {
            var me = this;
            var contentHeight = me._getHeight(document.querySelector("body")) || $("body").height();
            var winHeight = window.innerHeight || $(window).height();
            
            if (self.currentEventType && self.currentEventType !== me.config.EVE_EVENT_TYPE) {
                // 当 currentEventType 有值且不为初始值时，一般是滑动事件转为点击事件，滑动事件会被解绑，而点击时间不会解绑，
                // 所以这里直接返回，不执行初始化操作。
                return;
            }
            
            self.currentState = "none";                         // 设置当前状态
            self.currentEventType = me.config.EVE_EVENT_TYPE;   // 临时存储事件类型，以供 _changeState 判断使用。
            self.$stateBar.addClass(me.initStyle);
            self.$stateTxt.text(me.config.TXT_INIT_TIP);
            self.$ajaxWrap.css({"min-height":winHeight - 40}).after(self.$stateBar);
            
            if (self.index === 0) {
                self.active = true;
            }
            
            /*if (contentHeight < winHeight) {
                me._changeEvent("click", self);
                self.$stateTxt.text(me.config.TXT_CLICK_TIP);
            }*/

            if (self.active) {
                me._reset(self);
                me._bind(me.config.EVE_EVENT_TYPE, self);
            }
        },
        /**
         * 事件绑定
         * @param {string} eventType
         * @private
         */
        _bind: function (eventType, self) {
            var me = this;
            // 为了能够解除事件绑定，不能使用匿名函数，但传入函数字面量又不能直接传参，
            // 所以使用了一个特殊的返回函数 _trigger 赋值给 _bindHandle，这样就可以解绑。
            me._bindHandle = me._trigger(self);
            me.$triggerTarget.on(eventType, me._bindHandle);
        },
        /**
         * 触发事件
         * @description 触发事件方法，在满足绑定事件条件时或满足指定触发条件的情况下调用触发方法，
         *              该方法用于集中处理触发事件，判定是否需要加载数据或者更新 UI 显示。
         * @param {string} eventType EVE_EVENT_TYPE 事件类型，"scroll" 或 "click"。
         * @private
         */
        _trigger: function (self) {
            var me = this;
            return function () {
                var isLoading = self.$stateBar.hasClass("loading");
                var isNoMore = self.$stateBar.hasClass("no-more");

                if (isLoading || isNoMore) {
                    return;
                }
                if (self.currentEventType === "scroll") {
                    if (self.page < me.maxPage && !me.scrollTimer) {
                        // 添加 scroll 事件相应伐值，优化其性能
                        me.scrollTimer = setTimeout(function () {
                            if (me.$triggerTarget.scrollTop() >= me.triggerHeight && !isLoading && !isNoMore) {
                                me._load(me._spliceApi(self), self);
                            }
                            me.scrollTimer = 0;
                        }, me.scrollDelay);
                    }
                    if (self.page === me.maxPage) {
                        me._changeState("scrollEnd", self);
                    }
                } else if (self.currentEventType === "click") {
                    // 在有滑动转变为点击事件时，会执行 _bind 方法，在该方法中 _trigger 会预先赋值给 _bindHandle，
                    // 此时 _trigger 会被执行一次，所以设定了一个 firstClickInit 属性，用于判断是初始化还是用户点击。
                    if (self.firstClickInit) {
                        self.firstClickInit = false;
                        return;
                    }
                    me._load(me._spliceApi(self), self);
                }
            };
        },
        /**
         * 重置计算参数
         * @private
         */
        _reset: function (self) {
            if (self.currentEventType === "click") {
                // 当为点击事件时，不用计算页面高度等数值。
                return;
            }
            var me = this;
            var contentHeight = me._getHeight(document.querySelector("body")) || $("body").height();
            var winHeight = window.innerHeight || $(window).height();
            me.triggerHeight = (contentHeight - winHeight) * (me.config.NUM_LOAD_POSITION);
            if (me.config.NUM_LOAD_POSITION < 0.8) {
                me.config.NUM_LOAD_POSITION += 0.15555;
            }
        },
        /**
         * 转换绑定事件
         * @param {string} eventType
         * @private
         */
        _changeEvent: function (eventType, self) {
            var me = this;
            me.$triggerTarget.off("scroll", me._bindHandle);
            self.currentEventType = eventType;
            if (eventType === "click") {
                me.$triggerTarget = self.$stateBar;                 // 变更触发目标，并将加载触发方式更改为 click
                self.firstClickInit = false;
                me._bind(eventType, self);                          // 重新绑定
                self.$stateBar.addClass("click").show();
            } else if (eventType === "scroll") {
                me.$triggerTarget = me.$win;
                me._bind(eventType, self);
            }
        },
        /**
         * 运行状态反馈
         * @description 该方法用于记录程序运行状态，并针对不同状态做出 UI 更新及事件重新绑定等操作。
         * @param {string} state 运行状态，值包括：loading、success、scrollEnd、noMore、loadError、unknowError。
         * @private
         */
        _changeState: function (state, self) {
            var me = this;
            // 当预执行状态与程序当前运行状态相同时，退出状态变更方法，以避免多次重复操作。
            if (self.currentState === state) {
                return;
            }
            self.currentState = state;
            // 状态判断
            switch (state) {
            case "loading":         //正在加载阶段，添加 loading 标识，更新提示文字
                self.$stateTxt.text(me.config.TXT_LOADING_TIP);
                self.$stateBar.removeClass("loading").addClass("loading").show();     // 使用 CSS 特殊值技巧
                if (me.loadingFun) {
                    me.loadingFun(self.index);
                }
                break;
            case "success":          //加载完成
                self.$stateBar.removeClass("loading");
                if (self.currentState === "loadError") {
                    self.currentState = undefined;
                }
                if (self.currentEventType === "scroll") {
                    self.$stateTxt.text(me.config.TXT_INIT_TIP);
                }
                if (self.currentEventType === "click") {
                    self.$stateTxt.text(me.config.TXT_CLICK_TIP);
                }
                self.page += 1;
                break;
            case "scrollEnd":       //滑动加载次数已达到上限
                me._changeEvent("click", self);
                self.$stateTxt.text(me.config.TXT_CLICK_TIP);
                if (me.scrollEndFun) {
                    me.scrollEndFun(self.index);
                }
                break;
            case "noMore":          // 无下页数据
                self.$stateBar.addClass("no-more").hide();
                break;
            case "loadError":     // 加载错误提示
                self.currentState = "loadError";
                me._changeEvent("click", self);
                self.$stateTxt.text(me.config.TXT_LOADED_ERROR);
                self.$stateBar.removeClass("loading");
                if (me.loadErrorFun) {
                    me.loadErrorFun(self.index);
                }
                break;
            }
        },
        /**
         * 数据加载
         * @param {string} api 请求数据的 API 接口。
         * @private
         */
        _load: function (api, self) {
            var me = this;
            me._changeState("loading", self);
            // 如果设置了 beforeLoadFun 回调函数，则 beforeLoadFun 必须返回 true 才能继续向下执行，
            // 用于人为中断 _load 事件。
            if (me.beforeLoadFun) {
                if (!me.beforeLoadFun()) {
                    return;
                }
            }
            // 是否启用本地缓存
            if (me.config.LOCAL_DATA) {
                var localData = SQ.store.localStorage.get(api, me.config.NUM_EXPIRES);
                localData = SQ.isString(localData) ? $.parseJSON(localData) : localData;
                if (localData) {
                    me._loadedResult(localData, self);
                    return;
                }
            }
            if (!api || api.length === 0) {
                return;
            }
            if (me.xhr) {
                me.xhr.abort();
            }
            me.xhr = $.ajax({
                type: me.config.XHR_METHOD,
                url: api,
                timeout: me.config.XHR_TIMEOUT,
                success: function (data) {
                    me._loadedResult(data, self);
                    if (me.config.LOCAL_DATA) {
                        SQ.store.localStorage.set(api, data);
                    }
                },
                error: function () {
                    me._changeState("loadError", self);
                }
            });
        },
        /**
         * 数据渲染
         * @param {object} data 服务器返回的数据
         * @private
         */
        _loadedResult: function (data, self) {
            var me = this;
            var jsonData;
            var code;
            if (!data) {
                me._changeState("loadError", self);
                return;
            }
            jsonData = SQ.isString(data) ? $.parseJSON(data) : data;
            // 简单模式
            // 会自动判断并更新运行状态，前提是数据格式必须要符合要求
            if (me.config.MODE === "simple") {
                code = parseInt(jsonData.code, 10);
                switch (code) {
                case me.config.NUM_SUCCESS_CODE:   //成功加载
                    me._changeState("success", self);
                    break;
                case me.config.NUM_NO_MORE_CODE:   //无下页数据
                    me._changeState("noMore", self);
                    break;
                default:
                    me._changeState("loadError", self);
                    return;
                }
            }
            if (me.loadFun) {
                me.loadFun(jsonData, self.$ajaxWrap, self.index);
            }
            me._reset(self);
        },
        active: function (index) {
            var me = this;
            var len = me.loadMores.length;
            var i;
            for (i = 0; i < len; i++) {
                me.loadMores[i].active = false;
            }
            me.loadMores[index].active = true;
            me.$triggerTarget.off("scroll", me._bindHandle);
            me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET) || me.$win;
            me._init(me.loadMores[index]);
        },
        /**
         * 计算页面高度
         * @param el   element 元素。
         * @returns {*}
         * @private
         */
        _getHeight: function (el) {
            if (!el) {
                console.warn("SQ.loadmore: 无法计算页面高度");
                return 0;
            }
            if (el.getBoundingClientRect) {
                return el.getBoundingClientRect().height;
            }
            return Math.max(el.clientHeight, el.offsetHeight, el.scrollHeight);
        },
        /**
         * 接口拼接
         * @returns {*|string|LoadMore.api}
         * @private
         */
        _spliceApi: function (self) {
            var me = this;
            var connector = self.api.indexOf("?") === -1 ? "?" : "&";
            var api;
            var j;
            if (me.config.RESTFUL) {
                api = self.api.replace(":page", self.page);
                for (j in me.config.RESTFUL) {
                    if (me.config.RESTFUL.hasOwnProperty(j)) {
                        api = api.replace(j, me.config.RESTFUL[j]);
                    }
                }
            } else {
                api = self.api + connector + "page=" + self.page;
            }
            return api;
        }
    };
    SQ.LoadMore = LoadMore;
}($, window));
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
/**
 * @file SQ.Popup 弹窗组件
 * @version 1.0.3
 */

/**
 * @changelog
 * 1.0.3  * 修复 resize 导致报错的 BUG。
 * 1.0.2  * _setPopupPos 函数优化
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
        version: "1.0.3",
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
            me.$win = $(window);
            me.$doc = $(document);
            me.$body = $("body");
            // 如果页面中没有指定的 Dom 则生成一个插入到文档中，避免因 trigger() 触发 Popup 时找不到该 Dom 而报错。
            if ($(me.config.DOM_TRIGGER_TARGET).length === 0) {
                me.$body.append("<div class='" + me.config.DOM_TRIGGER_TARGET + "' style='display:none'></div>");
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
                    me.$doc.off(me.config.EVE_EVENT_TYPE, me.config.DOM_TRIGGER_TARGET, bindEvent);
                }
                me._trigger(e);
            }
            // 绑定在 document 上是为了解决 Ajax 内容绑定问题
            me.$doc.on(me.config.EVE_EVENT_TYPE, me.config.DOM_TRIGGER_TARGET, bindEvent);
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

            $popupPanel.appendTo(me.$body);
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
                var winHeight = window.innerHeight || me.$win.height();
                top = me.$body.scrollTop() + winHeight / 2;
            }
            
            if (!me.config.CSS_TOP && !me.config.CSS_LEFT && !me.config.CSS_BOTTOM && !me.config.CSS_RIGHT) {
                // 当坐标全部未设置时给一个默认值，避免弹窗定位到页面最底部
                me.config.CSS_TOP = 0;
                me.config.CSS_LEFT = 0;
            }

            if (me.config.CSS_TOP && me.config.CSS_LEFT && me.config.CSS_BOTTOM && me.config.CSS_RIGHT) {
                // 当坐标全部设置时，直接定位弹窗不做计算
                me.$popupPanel.css({
                    "top": me.config.CSS_TOP,
                    "left": me.config.CSS_LEFT,
                    "bottom": me.config.CSS_BOTTOM,
                    "right": me.config.CSS_RIGHT
                });
                return;
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

            me.$win.resize(function () {
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
                    "background": me.config.CSS_MASK_BACKGROUND,
                    "opacity": me.config.CSS_MASK_OPACITY,
                    "z-index": 999
                }).appendTo(me.$body);

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
            if (me.$popupPanel) {
                me._setPopupPos();
            }
        }
    };
    SQ.Popup = Popup;
}($, window));
/**
 * @file Squirrel Suggest
 * @version 0.5.10
 */

/**
 * @changelog
 * 0.5.10 * 修复 jshint 问题
 * 0.5.9  * 修复在输入搜索后删除搜索词，再次输入相同字符，首字符无请求问题。issues#11
 * 0.5.8  * 修复 IE 下对 XHR 对象处理问题。
 * 0.5.7  * 修复多次发送请求时，老请求因为响应慢覆盖新请求问题。
 * 0.5.6  * 修改组件名称为 Suggest。
 * 0.5.5  * 完成搜索联想词基本功能。
 * 0.0.1  + 新建。
 */
/*global
 $: false,
 SQ: false,
 console: false
 */
(function ($, window) {
    "use strict";
    /**
     * @name Suggest
     * @classdesc 搜索联想词交互组件
     * @constructor
     * @param {object} config 组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.DOM_INPUT             需要绑定联想词交互的输入框
     * @param {string} config.DOM_CLEAR_BTN         清空按钮
     * @param {string} config.DOM_SUGGEST_PANEL     联想词展示面板
     * @param {string} config.API_URL               联想词接口
     * @param {function} config.beforeStart         检测输入框前的回调函数
     * @param {function} config.start               开始检测输入框时回调函数
     * @param {function} config.show                显示联想词面板时回调函数
     * @param {function} config.clear               清除时回调函数
     * @example var appList = new SQ.Suggest({
            DOM_INPUT : ".J_searchInput",
            DOM_CLEAR_BTN : ".J_clearInput",
            DOM_SUGGEST_PANEL : ".suggest-panel",
            API_URL : config.search_API,
            beforeStart : function () {

            },
            start : function () {
            
            },
            show : function (ds) {
                // ds 为 XHR 返回数据
            },
            clear : function () {

            }
        });
     */
    function Suggest(config) {
        var me = this;
        var i;

        me.config = {
            "NUM_TIMER_DELAY" : 300,
            "NUM_XHR_TIMEER" : 5000,
            "NUM_SUCCESS_CODE" : 200,
            "suggestion" : true
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }

        //me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET); // 触发元素
        me.$clearBtn = $(me.config.DOM_CLEAR_BTN);
        me.$input = $(me.config.DOM_INPUT);
        me.$suggestPanel = $(me.config.DOM_SUGGEST_PANEL);
        me.beforeStartFun = me.config.beforeStart;
        me.startFun = me.config.start;
        me.clearFun = me.config.clear;
        me.showFun = me.config.show;

        if (me._verify()) {
            me._init();
        }
    }
    Suggest.prototype =  {
        construtor: Suggest,
        version: "0.5.10",
        lastKeyword: "",        // 为 300ms（检测时长） 前的关键词
        lastSendKeyword : "",   // 上一次符合搜索条件的关键词
        canSendRequest : true,  // 是否可以进行下次联想请求
        /** 验证参数是否合法 */
        _verify : function () {
            return true;
        },
        _init : function (e) {
            var me = this;
            me.$input.on("focus", function () {
                me.start();
            });
            me.$input.on("blur", function () {
                me.stop();
            });
            me.$clearBtn.on("click", function () {
                me.clear();
            });
            if (me.beforeStartFun) {
                me.beforeStartFun(e);
            }
            //me.beforeStartFun && me.beforeStartFun(e);
        },
        /** 过滤输入内容 */
        _filter : function (originalKeyword) {
            return originalKeyword.replace(/\s+/g, "").replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "");
        },
        /** 初始化提示层容器 */
        _initSuggest : function () {
            var me = this;
            me.$suggestPanel.empty();
        },
        /** 请求数据 */
        _requestData : function (keyword) {
            var me = this;
            var api = me.config.API_URL;
            var XHR;
            //console.log("request -> " + "keyword: " + keyword, "lastSendKeyword: " + me.lastSendKeyword);
            if (XHR && SQ.isObject(XHR)) {
                XHR.abort();
            }
            XHR = $.ajax({
                type : "POST",
                url : api,
                dataType : "json",
                data : {"keyword": keyword},
                timeout : me.config.NUM_XHR_TIMEER,
                success : function (data) {
                    me.showSuggest(data);
                    me.lastSendKeyword = keyword;
                },
                error : function () {
                    me.canSendRequest = false;
                    setTimeout(function () {
                        me.canSendRequest = true;
                    }, 500);
                }
            });
        },
        _compare : function (keyword) {
            var me = this;
            var cLen = keyword.length;
            var lsLen = me.lastSendKeyword.length;
            //console.log("keyword: " + keyword, "lastSendKeyword: " + me.lastSendKeyword);

            if (me.lastKeyword === keyword) {
                //console.log("same " + "me.lastKeyword = " + me.lastKeyword + " | " + "keyword = " + keyword + " | " + "me.lastSendKeyword =" + me.lastSendKeyword);
                return false;
            }

            if (lsLen > 0 && cLen < lsLen) {
                me.canSendRequest = true;
            }

            if (!me.canSendRequest) {
                // canSendRequest 为能否发送请求的判断条件
                // 有几种情况会改变 canSendRequest 的值：
                // true 情况
                // 1、当前输入关键词少于上次发送请求关键词时，canSendRequest 为 true
                // 2、请求服务器成功返回并有联想结果时，canSendRequest 为 true
                // 3、调用 clear() 函数时，canSendRequest 为 true
                // 4、请求服务器失败，500ms 后 canSendRequest 为 true
                // false 情况
                // 1、请求服务器成功，但返回的 code 与 NUM_SUCCESS_CODE 不一致，canSendRequest 为 false
                // 2、请求服务器失败，canSendRequest 为 false
                //console.log("!canSendRequest");
                return false;
            }
            if (me.lastSendKeyword === keyword) {
                //console.log("关键词相同")
                return false;
            }
            return true;
        },
        /** 启动计时器，开始监听用户输入 */
        start : function () {
            var me = this;
            me.inputListener = setInterval(function () {
                var originalKeyword = me.$input.val();
                var keyword = me._filter(originalKeyword);

                if (keyword.length > 0) {
                    if (me.$clearBtn.css("display") === "none") {
                        me.$clearBtn.show();
                    }
                    if (me._compare(keyword)) {
                        me._requestData(keyword);
                        if (me.startFun) {
                            me.startFun();
                        }
                        //me.startFun && me.startFun();
                    }
                    me.lastKeyword = keyword;
                } else {
                    me.lastKeyword = undefined;
                    me.clear();
                }
            }, me.config.NUM_TIMER_DELAY);
        },
        /** 停止计时器 */
        stop : function () {
            var me = this;
            clearInterval(me.inputListener);
        },
        /** 显示提示层 */
        showSuggest : function (data) {
            var me = this;
            var ds = typeof data === "object" ? data : JSON.parse(data);
            if (ds.code !== me.config.NUM_SUCCESS_CODE) {
                me.canSendRequest = false;
                return;
            }
            me.canSendRequest = true;
            me._initSuggest();
            if (me.showFun) {
                me.showFun(ds);
            }
            //me.showFun && me.showFun(ds);
        },
        /** 隐藏提示层 */
        hideSuggest : function () {
            var me = this;
            me.$suggestPanel.hide();
        },
        /** 清除输入内容 */
        clear : function () {
            var me = this;
            me.$input.val("");
            me.hideSuggest();
            me.$clearBtn.hide();
            me.canSendRequest = true;
            me.lastSendKeyword = "";
            if (me.clearFun) {
                me.clearFun();
            }
            //me.clearFun && me.clearFun();
        }
    };
    SQ.Suggest = Suggest;
}($, window));
/**
 * @file Squirrel Tabs
 * @version 0.7.5
 */

/**
 * @changelog
 * 0.7.5  * 修改类名，新增 beforeLoad 、loaded 回调函数的传参。
 * 0.7.4  * 解决 localStorage 问题，API_URL 兼容 ["","test.json",""] 这种写法；
 *        * CSS_LOADING_TIP 兼容 ".demo" 和 "demo" 写法。
 * 0.7.3  * 修复 reload 按钮多次绑定问题。
 * 0.7.2  * 修复初始化时，me.$loadingTip 无法找到的问题。
 * 0.7.1  * 修复 jshint 问题。
 * 0.7.0  + 添加对 localStorage 支持，通过将 LOCAL_DATA 设置为 true 开启，通过 NUM_EXPIRES 来设置过期时间（单位：分钟）。
 * 0.6.1  * 屏蔽 click 默认动作，新增自定义 CSS_HIGHLIGHT 属性。
 * 0.6.0  * 重写 Tabs 插件，使 Tabs 插件能够在同一页面多次实例化。
 * 0.5.6  * 修改组件名称为 Tabs。
 * 0.5.1  * 完成选项卡基本功能。
 * 0.0.1  + 新建。
 */
/*global
 $: false,
 SQ: false,
 console: false
 */
(function ($, window) {
    "use strict";
    /**
     * @name Tabs
     * @classdesc 选项卡交互组件
     * @constructor
     * @param {object} config                                           组件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.EVE_EVENT_TYPE                            触发事件，click 或 mouseover
     * @param {string} config.DOM_TRIGGER_TARGET                        被绑定事件的 Dom 元素
     * @param {string} config.DOM_TABS                                  标签 Dom 元素
     * @param {string} config.DOM_PANELS                                面板 Dom 元素
     * @param {string} config.API_URL                                   API 接口① 字符串形式
     * @param {array}  config.API_URL                                   API 接口② 数组形式，数组中各项对应各个选项卡
     * @param {string} config.CSS_HIGHLIGHT                             自定义高亮样式名称，默认为 .active
     * @param {string} config.CSS_LOADING_TIP                           loading 提示样式
     * @param {string} config.TXT_LOADING_TIP                           loading 提示文字
     * @param {number} config.NUM_ACTIVE                                初始高亮选项卡序号，0 - n
     * @param {number} config.NUM_XHR_TIMEER                            XHR 超时时间
     * @param {boolean} config.CLEAR_PANEL                              切换选项卡时是否自动清理面板数据
     * @param {string} config.LOCAL_DATA                                XHR 数据 loaclstorage 开关，默认为 false
     * @param {number} config.NUM_EXPIRES                               XHR 数据 loaclstorage 过期时间（单位：分钟），默认为 15 分钟
     * @param {function} config.trigger($tabs, $panels, tabIndex)       触发选项卡切换回调函数
     * @param {function} config.show($tabs, $panels, tabIndex)          显示选项卡时回调函数
     * @param {function} config.beforeLoad($activePanels, tabIndex)     异步加载前回调函数，当设定了该回调函数时，必须返回
     *                                                                  true 才能继续执行，异步加载事件，可中断异步加载事件。
     *                                                                  参数：$activePanels 是当前激活的面板
     * @param {function} config.loaded(data, $activePanels, tabIndex)   异步加载成功回调函数，参数：data 是异步加载返回数据
     *                                                                  参数：$activePanels 是当前激活的面板
     * @example var tabs = new SQ.Tabs({
            EVE_EVENT_TYPE: "mouseover",
            DOM_TRIGGER_TARGET: ".J_tabs",
            DOM_TABS: ".tabs>li",
            DOM_PANELS: ".panels",
            API_URL: ["../data/content1.json", "../data/content2.json", "../data/content3.json"],
            CSS_LOADING_TIP: ".tab-loading-tip",
            NUM_ACTIVE: 0,
            trigger: function () {
            
            },
            show: function () {

            },
            beforeLoad: function () {

            },
            loaded: function (data) {

            }
        });
     */
    function Tabs(config) {
        var me = this;
        var i;

        me.config = {
            CSS_HIGHLIGHT: ".active",
            NUM_ACTIVE : 0,
            NUM_XHR_TIMEER : 5000,
            TXT_LOADING_TIP : "正在加载请稍后...",     // 正在加载提示
            CLEAR_PANEL : false,
            LOCAL_DATA : false,
            NUM_EXPIRES : 15
        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }
        
        me.CSS_HIGHLIGHT = me.config.CSS_HIGHLIGHT.indexOf(".") === 0 ? me.config.CSS_HIGHLIGHT.slice(1) : me.config.CSS_HIGHLIGHT;
        if (me.config.CSS_LOADING_TIP) {
            me.CSS_LOADING_TIP = me.config.CSS_LOADING_TIP.indexOf(".") === 0 ? me.config.CSS_LOADING_TIP.slice(1) : me.config.CSS_LOADING_TIP;
        }

        me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET);        // 目标元素
        me.tabsLen = me.$triggerTarget.length;
        me.triggerFun = me.config.trigger;
        me.showFun = me.config.show;
        me.beforeLoadFun = me.config.beforeLoad;
        me.loadFun = me.config.loaded;

        me.$triggerTarget.each(function () {
            var $tabMould = $(this);
            var $tabs = $tabMould.find(me.config.DOM_TABS);
            var $panels = $tabMould.find(me.config.DOM_PANELS);
            if (me._verify()) {
                me._init($tabMould, $tabs, $panels);
            }
        });
    }
    Tabs.prototype = {
        construtor: Tabs,
        version: "0.7.5",
        needLoadContent : false,    // 选项卡内容是否需要异步加载
        /**
         * 验证参数是否合法
         * @returns {boolean}
         * @private
         */
        _verify: function () {
            return true;
        },
        _init: function ($tabMould, $tabs, $panels) {
            var me = this;
            var i = 0;
            // 为选项卡添加序号
            $tabs.each(function () {
                $(this).attr("data-tabIndex", i);
                i++;
            });
            // 判断是否需要生成异步加载提示语
            if (me.config.API_URL && (SQ.isString(me.config.API_URL) || SQ.isArray(me.config.API_URL))) {
                me.$loadingTip = $("<div class='sq-tabs-loading-tip'></div>");
                if (me.CSS_LOADING_TIP) {
                    me.$loadingTip.addClass(me.CSS_LOADING_TIP);
                } else {
                    me.$loadingTip.css({
                        "height" : 60,
                        "text-align" : "center",
                        "line-height" : "60px"
                    });
                }
                me.$loadingTip.text(me.config.TXT_LOADING_TIP);
                me.needLoadContent = true;
            }
            // 初始化高亮
            if (me.config.NUM_ACTIVE !== undefined) {
                me.show($tabs, $panels, me.config.NUM_ACTIVE);
            }
            // 绑定事件
            $tabs.on(me.config.EVE_EVENT_TYPE, function (e) {
                var $tab = $(this);
                e.preventDefault();
                me._trigger($tabMould, $tabs, $panels, $tab);
            });
        },
        /**
         * 触发事件方法，在满足绑定事件条件时或满足指定触发条件的情况下调用触发方法，
         * 该方法用于集中处理触发事件，判定是否需要加载数据或者更新 UI 显示。
         * @param $tabMould
         * @param $tabs
         * @param $panels
         * @param $tab
         * @private
         */
        _trigger: function ($tabMould, $tabs, $panels, $tab) {
            var me = this;
            var tabIndex = $tab.attr("data-tabIndex");
            var isCurrentActive = $tab.hasClass(me.CSS_HIGHLIGHT);

            if (isCurrentActive) {
                return;
            }

            me.show($tabs, $panels, tabIndex);
            if (me.triggerFun) {
                me.triggerFun($tabs, $panels, tabIndex);
            }
        },
        _cleanPanel: function ($activePanels) {
            $activePanels.empty();
        },
        /**
         * 显示目标选项卡，可以在外部调用该方法
         * @param $tabs
         * @param $panels
         * @param tabIndex
         */
        show: function ($tabs, $panels, tabIndex) {
            var me = this;
            var $activeTab = $tabs.eq(tabIndex);
            var $activePanels = $panels.eq(tabIndex);

            $tabs.removeClass(me.CSS_HIGHLIGHT);
            $panels.removeClass(me.CSS_HIGHLIGHT);
            $activeTab.addClass(me.CSS_HIGHLIGHT);
            $activePanels.addClass(me.CSS_HIGHLIGHT);

            if (me.showFun) {
                me.showFun($tabs, $panels, tabIndex);
            }
            if (me.config.API_URL) {
                me._load($activePanels, tabIndex);
            }
        },
        _load: function ($activePanels, tabIndex) {
            var me = this;
            var api = me.config.API_URL;
            var $currentLoadTip = $activePanels.find(".sq-tabs-loading-tip");
            var hasLoadingTip = $currentLoadTip.length > 0 ? true : false;
            var hasLoaded = $activePanels.hasClass("hasLoaded");

            if (hasLoaded) {
                return;
            }
            // 如果设置了 beforeLoadFun 回调函数，则 beforeLoadFun 必须返回 true 才能继续向下执行，
            // 用于人为中断 _load 事件。
            if (me.beforeLoadFun) {
                if (!me.beforeLoadFun($activePanels, tabIndex)) {
                    return;
                }
            }
            // 是否清空面板
            if (me.config.CLEAR_PANEL) {
                me._cleanPanel($activePanels);
            }
            // 是否启用本地缓存
            if (me.config.LOCAL_DATA) {
                var localData = SQ.store.localStorage.get(api, me.config.NUM_EXPIRES);
                localData = SQ.isString(localData) ? $.parseJSON(localData) : localData;
                if (localData) {
                    $activePanels.addClass("hasLoaded");
                    if (me.loadFun) {
                        me.loadFun(JSON.parse(localData), $activePanels, tabIndex);
                    }
                    return;
                }
            }
            // 开始 XHR 流程
            if (SQ.isArray(me.config.API_URL)) {
                api = me.config.API_URL[tabIndex];
            }
            if (!api || api.length === 0) {
                return;
            }
            if (me.xhr) {
                me.xhr.abort();
            }
            // 显示加载提示语
            if (hasLoadingTip) {
                $currentLoadTip.show();
            } else {
                $activePanels.append(me.$loadingTip);
                $currentLoadTip = $activePanels.find(".sq-tabs-loading-tip");
                $currentLoadTip.show();
            }
            me.xhr = $.ajax({
                type : "POST",
                url : api,
                dataType : "json",
                timeout : me.config.NUM_XHR_TIMEER,
                success : function (data) {
                    $currentLoadTip.hide();
                    $activePanels.addClass("hasLoaded");    // 为已经加载过的面板添加 .hasLoaded 标记
                    if (me.config.LOCAL_DATA) {
                        SQ.store.localStorage.set(api, data);
                    }
                    if (me.loadFun) {
                        me.loadFun(data, $activePanels, tabIndex);
                    }
                },
                error : function () {
                    me._showReloadTips($activePanels, tabIndex);
                }
            });
        },
        _showReloadTips: function ($activePanels, tabIndex) {
            var me = this;
            var $tip = $activePanels.find(".sq-tabs-loading-tip");
            $tip.show().empty();
            var reloadHTML = "<div class='reload'>" +
                "<p>抱歉，加载失败，请重试</p>" +
                "<div class='sq-btn f-grey J_reload'>重新加载</div>" +
                "</div>";
            $tip.append(reloadHTML);
            $activePanels.find(".J_reload").off("click").on("click", function () {
                me._load($activePanels, tabIndex);
            });
        }
    };
    SQ.Tabs = Tabs;
}($, window));
/**
 * @file SQ.TouchSlip 触摸滑动组件
 * @data 2013.7.10
 * @version 1.0.0
 */

/*global
 $: false,
 SQ: true,
 Zepto: true
 */

(function (window, document) {
    _fun = {
        ios: function () { // 作用：判断是否为苹果的IOS设备
            var regularResult = navigator.userAgent.match(/.*OS\s([\d_]+)/),
                isiOS = !!regularResult;
            if (!this._versionValue && isiOS) {
                this._versionValue = regularResult[1].replace(/_/g, '.');
            }
            this.ios = function () {
                return isiOS;
            };
            return isiOS;
        },
        version: function () { // 作用：返回IOS的版本号
            return this._versionValue;
        },
        clone: function (object) { // 作用：用于原型继承
            function f() {}
            f.prototype = object;
            return new f();
        }
    };

    var slipjs = {
        _refreshCommon: function (wide_high, parent_wide_high) { // 作用：当尺寸改变时，需要重新取得相关的值
            var me = this;
            me.wide_high = wide_high || me.core[me.offset] - me.up_range;
            me.parent_wide_high      = parent_wide_high      || me.core.parentNode[me.offset];
            me._getCoreWidthSubtractShellWidth();
        },
        _initCommon: function (core, param) { // 作用：初始化
            var me = this;
            me.core = core;
            me.startFun    = param.startFun;
            me.moveFun     = param.moveFun;
            me.touchEndFun = param.touchEndFun;
            me.endFun      = param.endFun;
            me.DIRECTION   = param.DIRECTION;
            me.up_range    = param.up_range   || 0;
            me.down_range  = param.down_range  || 0;
            if (me.DIRECTION === 'x') {
                me.offset = 'offsetWidth';
                me._pos   = me.__posX;
            } else {
                me.offset = 'offsetHeight';
                me._pos   = me.__posY;
            }
            me.wide_high       = param.wide_high || me.core[me.offset] - me.up_range;
            me.parent_wide_high   = param.parent_wide_high || me.core.parentNode[me.offset];
            me._getCoreWidthSubtractShellWidth();

            me._bind("touchstart");
            me._bind("touchmove");
            me._bind("touchend");
            me._bind("webkitTransitionEnd");

            me.xy = 0;
            me.y = 0;
            me._pos(-me.up_range);
        },
        _getCoreWidthSubtractShellWidth: function () { // 作用：取得滑动对象和它父级元素的宽度或者高度的差
            var me = this;
            me.width_cut_coreWidth = me.parent_wide_high - me.wide_high;
            me.coreWidth_cut_width = me.wide_high - me.parent_wide_high;
        },
        handleEvent: function (e) { // 作用：简化addEventListener的事件绑定
            switch (e.type) {
            case "touchstart":
                this._start(e);
                break;
            case "touchmove":
                this._move(e);
                break;
            case "touchend":
            case "touchcancel":
                this._end(e);
                break;
            case "webkitTransitionEnd":
                this._transitionEnd(e);
                break;
            }
        },
        _bind: function (type, boole) { // 作用：事件绑定
            this.core.addEventListener(type, this, !!boole);
        },
        _unBind: function (type, boole) { // 作用：事件移除
            this.core.removeEventListener(type, this, !!boole);
        },
        __posX: function (x) { // 作用：当设置滑动的方向为“X”时用于设置滑动元素的坐标
            this.xy = x;
            this.core.style['webkitTransform'] = 'translate3d(' + x + 'px, 0px, 0px)';
            //this.core.style['webkitTransform'] = 'translate('+x+'px, 0px) scale(1) translateZ(0px)';
        },
        __posY: function (x) { // 作用：当设置滑动的方向为“Y”时用于设置滑动元素的坐标
            this.xy = x;
            this.core.style['webkitTransform'] = 'translate3d(0px, ' + x + 'px, 0px)';
            //this.core.style['webkitTransform'] = 'translate(0px, '+x+'px) scale(1) translateZ(0px)';
        },
        _posTime: function (x, time) { // 作用：缓慢移动
            this.core.style.webkitTransitionDuration = time + 'ms';
            this._pos(x);
        }
    };

    var SlipPage = _fun.clone(slipjs);
    //function SlipPage() {}
    //SQ.util.extend(SlipPage, slipjs);

    SlipPage._init = function (core, param) { // 作用：初始化
        var me           = this;
        me._initCommon(core, param);
        me.NUM_PAGES           = param.NUM_PAGES;
        me.page          = 0;
        me.AUTO_TIMER   = param.AUTO_TIMER;
        me.lastPageFun   = param.lastPageFun;
        me.firstPageFun  = param.firstPageFun;
        param.AUTO_TIMER && me._autoChange();
        param.no_follow ? (me._move = me._moveNoMove, me.next_time = 500) : me.next_time = 300;
    };
    SlipPage._start = function(e) { // 触摸开始
        var me = this,
            e = e.touches[0];
        me._abrupt_x     = 0;
        me._abrupt_x_abs = 0;
        me._start_x = me._start_x_clone = e.pageX;
        me._start_y = e.pageY;
        me._movestart = undefined;
        me.AUTO_TIMER && me._stop();
        me.startFun && me.startFun(e);
    };
    SlipPage._move = function(evt) { // 触摸中,跟随移动
        var me = this;
        me._moveShare(evt);
        if(!me._movestart){
            var e = evt.touches[0];
            evt.preventDefault();
            me.offset_x = (me.xy > 0 || me.xy < me.width_cut_coreWidth) ? me._dis_x/2 + me.xy : me._dis_x + me.xy;
            me._start_x  = e.pageX;
            if (me._abrupt_x_abs < 6) {
                me._abrupt_x += me._dis_x;
                me._abrupt_x_abs = Math.abs(me._abrupt_x);
                return;
            }
            me._pos(me.offset_x);
            me.moveFun && me.moveFun(e);
        }
    };
    SlipPage._moveNoMove = function(evt) { // 触摸中,不跟随移动，只记录必要的值
        var me = this;
        me._moveShare(evt);
        if(!me._movestart){
            evt.preventDefault();
            me.moveFun && me.moveFun(e);
        }
    };
    SlipPage._moveShare = function(evt) { // 不跟随移动和跟随移动的公共操作
        var me = this,
        e = evt.touches[0];
        me._dis_x = e.pageX - me._start_x;
        me._dis_y = e.pageY - me._start_y;	
        typeof me._movestart == "undefined" && (me._movestart = !!(me._movestart || Math.abs(me._dis_x) < Math.abs(me._dis_y)));
    };
    SlipPage._end = function(e) { // 触摸结束
        if (!this._movestart) {
            var me = this;
            me._end_x = e.changedTouches[0].pageX;
            me._range = me._end_x - me._start_x_clone;
            if(me._range > 35){
                me.page != 0 ? me.page -= 1 : (me.firstPageFun && me.firstPageFun(e));
            }else if(Math.abs(me._range) > 35){
                me.page != me.NUM_PAGES - 1 ? me.page += 1 : (me.lastPageFun && me.lastPageFun(e));
            }
            me.toPage(me.page, me.next_time);
            me.touchEndFun && me.touchEndFun(e);
        }
    };
    SlipPage._transitionEnd = function(e) { // 动画结束
        var me = this;
        e.stopPropagation();
        me.core.style.webkitTransitionDuration = '0';
        me._stop_ing && me._autoChange(), me._stop_ing = false;
        me.endFun && me.endFun();
    };
    SlipPage.toPage = function(num, time) { // 可在外部调用的函数，指定轮换到第几张，只要传入：“轮换到第几张”和“时间”两个参数。
        this._posTime(-this.parent_wide_high * num, time || 0);
        this.page = num;
    };
    SlipPage._stop = function() { // 作用：停止自动轮换
        clearInterval(this._autoChangeSet);
        this._stop_ing = true;
    };
    SlipPage._autoChange = function() { // 作用：自动轮换
        var me = this;
        me._autoChangeSet = setInterval(function() {
            me.page != me.NUM_PAGES - 1 ? me.page += 1 : me.page = 0;
            me.toPage(me.page, me.next_time);
        },me.AUTO_TIMER);
    };
    SlipPage.refresh = function(wide_high, parent_wide_high) { // 可在外部调用，作用：当尺寸改变时（如手机横竖屏时），需要重新取得相关的值。这时候就可以调用该函数
        this._refreshCommon(wide_high, parent_wide_high);
    };
            
    var SlipPx = _fun.clone(slipjs);
    //function SlipPx() {}
    //SQ.util.extend(SlipPx, slipjs);

    SlipPx._init = function(core,param) { // 作用：初始化
        var me  = this;
        me._initCommon(core,param);
        me.perfect     = param.perfect;
        me.SHOW_SCROLL_BAR = param.SHOW_SCROLL_BAR;
        if(me.DIRECTION == 'x'){
            me.page_x          = "pageX";
            me.page_y          = "pageY";
            me.width_or_height = "width";
            me._real           = me._realX;
            me._posBar         = me.__posBarX;
        }else{
            me.page_x          = "pageY";
            me.page_y          = "pageX";
            me.width_or_height = "height";
            me._real           = me._realY;
            me._posBar         = me.__posBarY;
        }
        if(me.perfect){
            me._transitionEnd = function(){};
            me._stop          = me._stopPerfect;
            me._slipBar       = me._slipBarPerfect;
            me._posTime       = me._posTimePerfect;
            me._bar_upRange   = me.up_range;
            me.no_bar         = false;
            me._slipBarTime   = function(){};
        }else{
            me.no_bar   = param.no_bar;
            me.core.style.webkitTransitionTimingFunction = "cubic-bezier(0.33, 0.66, 0.66, 1)";
        }
        if(me.SHOW_SCROLL_BAR){
            me._hideBar = function(){};
            me._showBar = function(){};
        }
        if(_fun.ios()){
            me.radius = 11;
        }else{
            me.radius = 0;
        }
        if(!me.no_bar){
            me._insertSlipBar(param);
            if(me.coreWidth_cut_width <= 0){
                me._bar_shell_opacity = 0;
                me._showBarStorage    = me._showBar;
                me._showBar           = function(){};	
            }
        }else{
            me._hideBar = function(){};
            me._showBar = function(){};
        }
    };
    SlipPx._start = function(e) { // 触摸开始
        var me = this,
            e = e.touches[0];
            me._animating = false;
        me._steps = [];
        me._abrupt_x     = 0;
        me._abrupt_x_abs = 0;
        me._start_x = me._start_x_clone = e[me.page_x];
        me._start_y = e[me.page_y];
        me._start_time = e.timeStamp || Date.now();
        me._movestart = undefined;
        !me.perfect && me._need_stop && me._stop();
        me.core.style.webkitTransitionDuration = '0';
        me.startFun && me.startFun(e);
    };
    SlipPx._move = function(evt) { // 触摸中
        var me = this,                   
            e = evt.touches[0],
            _e_page = e[me.page_x],
            _e_page_other = e[me.page_y],
            that_x = me.xy;
        me._dis_x = _e_page - me._start_x;
        me._dis_y = _e_page_other - me._start_y;
        (me.DIRECTION == 'x' && typeof me._movestart == "undefined") && (me._movestart = !!(me._movestart || (Math.abs(me._dis_x) < Math.abs(me._dis_y))));
        
        if(!me._movestart){
            evt.preventDefault();
            me._move_time = e.timeStamp || Date.now();
            me.offset_x = (that_x > 0 || that_x < me.width_cut_coreWidth - me.up_range) ? me._dis_x/2 + that_x : me._dis_x + that_x;    
            me._start_x = _e_page;
            me._start_y = _e_page_other;
            me._showBar();
            if (me._abrupt_x_abs < 6 ) {
                me._abrupt_x += me._dis_x;
                me._abrupt_x_abs = Math.abs(me._abrupt_x);
                return;
            }
            me._pos(me.offset_x);
            me.no_bar || me._slipBar();
            if (me._move_time - me._start_time > 300) {
                me._start_time    = me._move_time;
                me._start_x_clone = _e_page;
            }
            me.moveFun && me.moveFun(e);
        }
    };
    SlipPx._end = function(e) { // 触摸结束
        if (!this._movestart) {
            var me = this,
                e = e.changedTouches[0],
                duration = (e.timeStamp || Date.now()) - me._start_time,
                fast_dist_x = e[me.page_x] - me._start_x_clone;
            me._need_stop = true;
            if(duration < 300 && Math.abs(fast_dist_x) > 10) {
                if (me.xy > -me.up_range || me.xy < me.width_cut_coreWidth) {
                    me._rebound();
                }else{
                    var _momentum = me._momentum(fast_dist_x, duration, -me.xy - me.up_range, me.coreWidth_cut_width + (me.xy), me.parent_wide_high);
                    me._posTime(me.xy + _momentum.dist, _momentum.time);
                    me.no_bar || me._slipBarTime(_momentum.time);
                }
            }else{
                me._rebound();
            }
            me.touchEndFun && me.touchEndFun(e);
        }
    };
    SlipPx._transitionEnd = function(e) { // 滑动结束
        var me = this;
        if (e.target != me.core) return;
        me._rebound();
        me._need_stop = false;
    };
    SlipPx._rebound = function(time) { // 作用：滑动对象超出时复位
        var me = this,
            _reset = (me.coreWidth_cut_width <= 0) ? 0 : (me.xy >= -me.up_range ? -me.up_range : me.xy <= me.width_cut_coreWidth - me.up_range ? me.width_cut_coreWidth - me.up_range : me.xy);
        if (_reset == me.xy) {
            me.endFun && me.endFun();
            me._hideBar();
            return;
        }
        me._posTime(_reset, time || 400);
        me.no_bar || me._slipBarTime(time);
    };
    SlipPx._insertSlipBar = function(param) { // 插入滚动条
        var me = this;
        me._bar       = document.createElement('div');
        me._bar_shell = document.createElement('div');
        if(me.DIRECTION == 'x'){
            var _bar_css = 'height: 5px; position: absolute;z-index: 10; pointer-events: none;';
            var _bar_shell_css      = 'opacity: '+me._bar_shell_opacity+'; left:2px; bottom: 2px; right: 2px; height: 5px; position: absolute; z-index: 10; pointer-events: none;';
        }else{
            var _bar_css = 'width: 5px; position: absolute;z-index: 10; pointer-events: none;';
            var _bar_shell_css      = 'opacity: '+me._bar_shell_opacity+'; top:2px; bottom: 2px; right: 2px; width: 5px; position: absolute; z-index: 10; pointer-events: none; ';
        }
        var _default_bar_css = ' background-color: rgba(0, 0, 0, 0.5); border-radius: '+me.radius+'px; -webkit-transition: cubic-bezier(0.33, 0.66, 0.66, 1);' ;
        var _bar_css = _bar_css + _default_bar_css + param.bar_css;
        
        me._bar.style.cssText       = _bar_css;
        me._bar_shell.style.cssText = _bar_shell_css
        me._countAboutBar();
        me._countBarSize();
        me._setBarSize();
        me._countWidthCutBarSize();
        me._bar_shell.appendChild(me._bar);
        me.core.parentNode.appendChild(me._bar_shell);
        setTimeout(function(){me._hideBar();}, 500);
    };
    SlipPx._posBar = function(pos) {};
    SlipPx.__posBarX = function(pos) { // 作用：当设置滑动的方向为“X”时用于设置滚动条的坐标 
        var me = this;
        me._bar.style['webkitTransform'] = 'translate3d('+pos+'px, 0px, 0px)';
        //me._bar.style['webkitTransform'] = 'translate('+pos+'px, 0px)  translateZ(0px)';
    };
    SlipPx.__posBarY = function(pos) { // 作用：当设置滑动的方向为“Y”时用于设置滚动条的坐标 
        var me = this;
        //me._bar.style['webkitTransform'] = 'translate(0px, '+pos+'px)  translateZ(0px)';
        me._bar.style['webkitTransform'] = 'translate3d(0px, '+pos+'px, 0px)';
    };
    SlipPx._slipBar = function() { // 流畅模式下滚动条的滑动
        var me = this;
        var pos = me._about_bar * (me.xy + me.up_range);
        if (pos <= 0) {
            pos = 0;
        }else if(pos >= me._width_cut_barSize){
            pos = Math.round(me._width_cut_barSize);
        } 
        me._posBar(pos);
        me._showBar();
    };
    SlipPx._slipBarPerfect = function() { // 完美模式下滚动条的滑动
        var me = this;
        var pos = me._about_bar * (me.xy + me._bar_upRange);
        me._bar.style[me.width_or_height] = me._bar_size + 'px';
        if (pos < 0) {
            var size = me._bar_size + pos * 3;
            me._bar.style[me.width_or_height] = Math.round(Math.max(size, 5)) + 'px';
            pos = 0;
        }else if(pos >= me._width_cut_barSize){
            var size = me._bar_size - (pos - me._width_cut_barSize) * 3;
            if(size < 5) {size = 5;}
            me._bar.style[me.width_or_height] = Math.round(size) + 'px';
            pos = Math.round(me._width_cut_barSize + me._bar_size - size);
        }
        me._posBar(pos);
    };
    SlipPx._slipBarTime = function(time) { // 作用：指定时间滑动滚动条
        this._bar.style.webkitTransitionDuration = ''+time+'ms';
        this._slipBar();
    };
    SlipPx._stop = function() { // 流畅模式下的动画停止
        var me = this,
            _real_x = me._real();
        me._pos(_real_x);
        if(!me.no_bar){
            me._bar.style.webkitTransitionDuration = '0';
            me._posBar(me._about_bar * _real_x);
        }	
    };
    SlipPx._stopPerfect = function() { // 完美模式下的动画停止
        clearTimeout(this._aniTime);
        this._animating = false;
    };
    SlipPx._realX = function() { // 作用：取得滑动X坐标
        var _real_xy = getComputedStyle(this.core, null)['webkitTransform'].replace(/[^0-9-.,]/g, '').split(',');
        return _real_xy[4] * 1;
    };
    SlipPx._realY = function() { // 作用：取得滑动Y坐标
        var _real_xy = getComputedStyle(this.core, null)['webkitTransform'].replace(/[^0-9-.,]/g, '').split(',');
        return _real_xy[5] * 1;
    };
    SlipPx._countBarSize = function() { // 作用：根据比例计算滚动条的高度
        this._bar_size = Math.round(Math.max(this.parent_wide_high * this.parent_wide_high / this.wide_high, 5));
    };
    SlipPx._setBarSize = function() { // 作用：设置滚动条的高度
        this._bar.style[this.width_or_height] = this._bar_size + 'px';
    };
    SlipPx._countAboutBar = function() { // 作用：计算一个关于滚动条的的数值
        this._about_bar = ((this.parent_wide_high-4) - (this.parent_wide_high-4) * this.parent_wide_high / this.wide_high)/this.width_cut_coreWidth;
    };
    SlipPx._countWidthCutBarSize = function() { // 作用：计算一个关于滚动条的的数值
        this._width_cut_barSize = (this.parent_wide_high-4) - this._bar_size;
    };
    SlipPx.refresh = function(wide_high, parent_wide_high) {// 可在外部调用，作用：当尺寸改变时（如手机横竖屏时），需要重新取得相关的值。这时候就可以调用该函数
        var me = this;
        me._refreshCommon(wide_high, parent_wide_high);
        if(!me.no_bar){
            if(me.coreWidth_cut_width <= 0) {
                me._bar_shell_opacity   = 0;
                me._showBar       = function(){};	
            }else{
                me._showBar = me._showBarStorage || me._showBar;
                me._countAboutBar();
                me._countBarSize();
                me._setBarSize();
                me._countWidthCutBarSize();
            }
        }
        me._rebound(0);
    };
    SlipPx._posTimePerfect = function (x, time) { // 作用：完美模式下的改变坐标函数
        var me = this,
            step = x,
            i, l;
        me._steps.push({ x: x, time: time || 0 });
        me._startAni();
    };
    SlipPx._startAni = function () {// 作用：完美模式下的改变坐标函数
        var me = this,
            startX = me.xy,
            startTime = Date.now(),
            step, easeOut,
            animate;
        if (me._animating) return;
        if (!me._steps.length) {
            me._rebound();	
            return;
        }
        step = me._steps.shift();
        if (step.x == startX) step.time = 0;
        me._animating = true;
        animate = function () {
            var now = Date.now(),
                newX;
            if (now >= startTime + step.time) {
                me._pos(step.x);
                me._animating = false;
                me._startAni();
                return;
            }
            now = (now - startTime) / step.time - 1;
            easeOut = Math.sqrt(1 - now * now);
            newX = (step.x - startX) * easeOut + startX;
            me._pos(newX);
            if (me._animating) {
                me._slipBar();
                me._aniTime = setTimeout(animate, 1);
            }
        };
        animate();
    };
    SlipPx._momentum = function (dist, time, maxDistUpper, maxDistLower, size) { // 作用：计算惯性
        var deceleration = 0.001,
            speed = Math.abs(dist) / time,
            newDist = (speed * speed) / (2 * deceleration),
            newTime = 0, outsideDist = 0;
        if (dist > 0 && newDist > maxDistUpper) {
            outsideDist = size / (6 / (newDist / speed * deceleration));
            maxDistUpper = maxDistUpper + outsideDist;
            speed = speed * maxDistUpper / newDist;
            newDist = maxDistUpper;
        } else if (dist < 0 && newDist > maxDistLower) {
            outsideDist = size / (6 / (newDist / speed * deceleration));
            maxDistLower = maxDistLower + outsideDist;
            speed = speed * maxDistLower / newDist;
            newDist = maxDistLower;
        }
        newDist = newDist * (dist < 0 ? -1 : 1);
        newTime = speed / deceleration;
        return { dist: newDist, time: newTime };
    };
    SlipPx._showBar = function() {// 作用：显示滚动条
        var me = this;
        me._bar_shell.style.webkitTransitionDelay = "0ms";
        me._bar_shell.style.webkitTransitionDuration = '0ms';
        me._bar_shell.style.opacity = "1";
    };
    SlipPx._hideBar = function() {// 作用：隐藏滚动条
        var me = this;
        me._bar_shell.style.opacity = "0";
        me._bar_shell.style.webkitTransitionDelay  = "300ms";
        me._bar_shell.style.webkitTransitionDuration = '300ms';
    };

    function TouchSlip(config) {
        var me = this;
        var i;

        me.config = {

        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }

        me.triggerTarget = $(me.config.DOM_TRIGGER_TARGET)[0];

        if (_fun.ios() && (parseInt(_fun.version()) >= 5 && config.DIRECTION === 'x') && config.wit) {
            me.triggerTarget.parentNode.style.cssText += "overflow:scroll; -webkit-overflow-scrolling:touch;";
            return;
        }
        
        switch (me.config.MODE) {
        case "page":
            config.DIRECTION = "x";
            if (!this.SlipPage) {
                this.SlipPage = true;
                SlipPage._init(me.triggerTarget, config);
                return SlipPage;
            } else {
                var page = _fun.clone(SlipPage);
                page._init(me.triggerTarget, config);
                return page;
            }
            break;
        case "px":
            if (!this.SlipPx) {
                this.SlipPx = true;
                SlipPx._init(me.triggerTarget, config);
                return SlipPx;
            } else {
                var Px = _fun.clone(SlipPx);
                Px._init(me.triggerTarget, config);
                return Px;
            }
            break;
        }
        
    }
    SQ.TouchSlip = TouchSlip;	
})(window, document);
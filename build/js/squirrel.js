/**
 * @file SQ.core
 * @version 1.0.0
 */
/*global SQ*/
window.SQ = {
    /**
     * 命名空间方法
     * @method
     * @name SQ.core.namespace
     * @param {string} nameSpaceString 命名空间字符串
     * @example
     * SQ.core.namespace('SQ.modules.module2');
     */
    namespace: function (nameSpaceString) {
        'use strict';
        var parts = nameSpaceString.split('.');
        var parent = SQ;
        var i;
        if (parts[0] === 'SQ') {
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
        'use strict';
        return Object.prototype.toString.call(str) === '[object String]';
    },
    isArray: function (arr) {
        'use strict';
        return Object.prototype.toString.call(arr) === '[object Array]';
    },
    isNumber: function (num) {
        'use strict';
        return Object.prototype.toString.call(num) === '[object Number]';
    },
    isBoolean: function (bool) {
        'use strict';
        return Object.prototype.toString.call(bool) === '[object Boolean]';
    },
    isNull: function (nullObj) {
        'use strict';
        return Object.prototype.toString.call(nullObj) === '[object Null]';
    },
    isUndefined: function (undefinedObj) {
        'use strict';
        return Object.prototype.toString.call(undefinedObj) === '[object Undefined]';
    },
    isFunction: function (fun) {
        'use strict';
        return Object.prototype.toString.call(fun) === '[object Function]';
    },
    isObject: function (obj) {
        'use strict';
        return Object.prototype.toString.call(obj) === '[object Object]';
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
     var rvalidescape = /\\(?:['\\\/bfnrt]|u[\da-fA-F]{4})/g;
     var rvalidtokens = /'[^'\\\r\n]*'|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g;
     var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
     return typeof string === 'string' && $.trim(string) !== '' ?
     rvalidchars.test(string
     .replace(rvalidescape, '@')
     .replace(rvalidtokens, ']')
     .replace(rvalidbraces, '')) :
     false;
     }*/
    /**
     * 继承
     * @param Child
     * @param Parent
     */
    extend: function (Child, Parent) {
        'use strict';
        var F = function () {
        };
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.uber = Parent.prototype;
    },
    /**
     * 频率控制 返回函数连续调用时，fn 执行频率限定为每多少时间执行一次
     * @param fn {function}     需要调用的函数
     * @param delay {number}    延迟时间，单位毫秒
     * @param immediate {bool}  给 immediate 参数传递 false 绑定的函数先执行，而不是 delay 后后执行。
     * @return {function}       实际调用函数
     */
    throttle: function (fn, delay, immediate, debounce) {
        'use strict';
        var curr;
        var lastCall = 0;
        var lastExec = 0;
        var timer = null;
        var diff;               // 时间差
        var context;            // 上下文
        var args;
        var exec = function () {
            lastExec = curr;
            fn.apply(context, args);
        };
        return function () {
            curr = + new Date();
            context = this;
            args = arguments;
            diff = curr - (debounce ? lastCall : lastExec) - delay;
            clearTimeout(timer);
            if (debounce) {
                if (immediate) {
                    timer = setTimeout(exec, delay);
                } else if (diff >= 0) {
                    exec();
                }
            } else {
                if (diff >= 0) {
                    exec();
                } else if (immediate) {
                    timer = setTimeout(exec, -diff);
                }
            }
            lastCall = curr;
        };
    },
    /**
     * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 delay，fn 才会执行
     * @param fn {function}     要调用的函数
     * @param delay {number}    空闲时间
     * @param immediate {bool}  给 immediate 参数传递 false 绑定的函数先执行，而不是 delay 后后执行。
     * @return {function}       实际调用函数
     */
    debounce: function (fn, delay, immediate) {
        'use strict';
        return SQ.throttle(fn, delay, immediate, true);
    }
};
/**
 * @file SQ.gestures
 * 手势函数
 * @version 0.5.0
 */
/*global SQ*/
SQ.gestures = {
    isSupportTouch: function () {
        'use strict';
        if (typeof window.ontouchstart === 'undefined') {
            return false;
        } else {
            return true;
        }
    },
    /**
     * 轻点
     * @param config
     */
    tap: function (config) {
        'use strict';
        var boundary = 20;
        var el = config.el;
        var event = config.event || '';
        var fun = config.callbackFun;

        function startHandle (e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            $(e.target).addClass('press');
            setTimeout(function () {
                $(e.target).removeClass('press');
            }, 200);
        }
        
        function endHandle (e) {
            var endX = e.changedTouches[0].clientX;
            var endY = e.changedTouches[0].clientY;
            if (Math.abs(endX - startX) < boundary && Math.abs(endY - startY) < boundary) {
                fun.call(el, e, $(e.target));
            }
            $(e.target).removeClass('press');
        }
        
        if (SQ.gestures.isSupportTouch()) {
            var startX = 0;
            var startY = 0;
            if (SQ.isString(el)) {
                $(document).on('touchstart' + event, el, startHandle).on('touchend' + event, el, endHandle);
            } else if (SQ.isArray(el)) {
                el.on('touchstart' + event, startHandle).on('touchend' + event, endHandle);
            }
        } else {
            $(el).on('click' + event, function (e) {
                fun.call(el, e, $(this));
            });
        }
    }
};
/**
 * @file SQ.store
 * @version 1.1.0
 */
/*global SQ*/
SQ.store = {
    /**
     * Cookie
     * @example
     * Sq.cookie.set('name', 'value');  // 设置
     * Sq.cookie.get('name');           // 读取
     * Sq.cookie.del('name');           // 删除
     */
    cookie: {
        _getValue: function (offset) {
            'use strict';
            var ck = document.cookie;
            var endstr = ck.indexOf(';', offset) === -1 ? ck.length : ck.indexOf(';', offset);
            return decodeURIComponent(ck.substring(offset, endstr));
        },
        get: function (key) {
            'use strict';
            var me = this;
            var ck = document.cookie;
            var arg = key + '=';
            var argLen = arg.length;
            var cookieLen = ck.length;
            var i = 0;
            while (i < cookieLen) {
                var j = i + argLen;
                if (ck.substring(i, j) === arg) {
                    return me._getValue(j);
                }
                i = ck.indexOf(' ', i) + 1;
                if (i === 0) {
                    break;
                }
            }
            return null;
        },
        set: function (key, value) {
            'use strict';
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
                case 'day':
                    expdate.setYear(year);
                    expdate.setMonth(month);
                    expdate.setDate(date);
                    expdate.setHours(8);    // 补 8 小时时差
                    expdate.setMinutes(0);
                    expdate.setSeconds(0);
                    break;
                case 'week':
                    var week = 7 * 24 * 3600 * 1000;
                    expdate.setTime(expdate.getTime() + week);
                    break;
                default:
                    expdate.setTime(expdate.getTime() + (expires * 1000 + 8 * 3600 * 1000));
                    break;
                }
            }

            document.cookie = key + '=' + encodeURIComponent(value) + ((expires === null) ? '' : ('; expires=' + expdate.toGMTString())) +
             ((path === null) ? '' : ('; path=' + path)) + ((domain === null) ? '' : ('; domain=' + domain)) +
             ((secure === true) ? '; secure' : '');
        },
        del: function (key) {
            'use strict';
            var me = this;
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = me.get(key);
            document.cookie = key + '=' + cval + '; expires=' + exp.toGMTString();
        }
    },
    /**
     * localStorage
     */
    localStorage: {
        hasLoaclStorage: (function () {
            'use strict';
            if(('localStorage' in window) && window.localStorage !== null) {
                return true;
            }
        }()),
        // expires 过期时间，单位 min 
        get: function (key, expires) {
            'use strict';
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
            'use strict';
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
            'use strict';
            var me = this;
            if (!key || !me.hasLoaclStorage) {
                return;
            }
            localStorage.removeItem(key);
        },
        clearAll: function () {
            'use strict';
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
/*global SQ*/
SQ.ua = (function () {
    'use strict';
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
        info.os.name = 'android';
        info.os.version = ua.match(/(Android)\s([\d.]+)/)[2];
    } else if ((/Adr/i).test(ua)) {
        // UC 浏览器极速模式下，Android 系统的 UA 为 'Adr'
        info.os.name = 'android';
        info.os.version = ua.match(/(Adr)\s([\d.]+)/)[2];
    } else if ((/iPod/i).test(ua)) {
        info.os.name = 'ios';
        info.os.version = ua.match(/OS\s([\d_]+)/)[1].replace(/_/g, '.');
        info.device = 'ipod';
    } else if ((/iPhone/i).test(ua)) {
        info.os.name = 'ios';
        info.os.version = ua.match(/(iPhone\sOS)\s([\d_]+)/)[2].replace(/_/g, '.');
        info.device = 'iphone';
    } else if ((/iPad/i).test(ua)) {
        info.os.name = 'ios';
        info.os.version = ua.match(/OS\s([\d_]+)/)[1].replace(/_/g, '.');
        info.device = 'ipad';
    }

    // 浏览器判断
    m = ua.match(/AppleWebKit\/([\d.]*)/);
    if (m && m[1]) {
        info.browser.core = 'webkit';
        info.browser.version = m[1];

        if ((/Chrome/i).test(ua)) {
            info.browser.shell = 'chrome';
        } else if ((/Safari/i).test(ua)) {
            info.browser.shell = 'safari';
        } else if ((/Opera/i).test(ua)) {
            info.browser.shell = 'opera';
        }
    }

    if ((/UCBrowser/i).test(ua)) {
        // UCWeb 9.0 UA 信息中包含 UCBrowser 字段
        m = ua.match(/(UCBrowser)\/([\d.]+)/);
        info.browser.shell = 'ucweb';
        info.browser.version = m[2];
    } else if ((/UCWEB/i).test(ua)) {
        // UCWeb 7.9 UA 信息中包含 UCWEB 字段
        m = ua.match(/(UCWEB)([\d.]+)/);
        info.browser.shell = 'ucweb';
        info.browser.version = m[2];
    } else if ((/UC/i).test(ua)) {
        // UCWeb 8.x UA 信息中包含 UC 字段
        // 确认 8.6、8.7 
        info.browser.shell = 'ucweb';
        info.browser.version = '8.x';
    }

    if (info.browser.shell === 'ucweb') {
        // UC 浏览器急速模式
        // 目前只有 Android 平台国内版 UCWeb 9.0 可以判断是否为急速模式，UA 中包含 UCWEB/2.0 字段即为急速模式。
        if ((/UCWEB\/2\.0/i).test(ua)) {
            info.browser.module = 'swift';
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
/*global SQ*/
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
            'use strict';
            if (typeof min === 'number' && typeof max === 'number' && min < max) {
                return parseInt(Math.random() * (max - min + 1) + min, 10);
            }
            return false;
        },
        randomArr: function (arr) {
            'use strict';
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
     * SQ.util.string.trim('   test string    ');
     * //return test string
     */
    string: {
        // 过滤字符串首尾的空格
        trim: function(srt) {
            'use strict';
            return srt.replace(/^\s+|\s+$/g, '');
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
        'use strict';
        var year = time.getFullYear();
        var month = time.getMonth() + 1;
        var date = time.getDate();
        var hours = time.getHours();
        var min = time.getMinutes();
        var sec = time.getSeconds();
        
        month = month < 10 ? ('0' + month) : month;
        date = date < 10 ? ('0' + date) : date;
        hours = hours < 10 ? ('0' + hours) : hours;
        min = min < 10 ? ('0' + min) : min;
        sec = sec < 10 ? ('0' + sec) : sec;
        
        var dateString = year + '-' + month + '-' + date + ' ' + hours + ':' + min + ':' + sec;
        return dateString;
    },
    goTop: function (e) {
        'use strict';
        e.preventDefault();
        window.scrollTo(0, 0);
    },
    goBack: function (e) {
        'use strict';
        e.preventDefault();
        history.back();
    }
};
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
/*global $, SQ, console*/
(function ($) {
    'use strict';

    SQ.gestures.tap({
        el: 'a.sq-btn',
        event: '.sq.tap',
        callbackFun: function (e, $el) {
            e.preventDefault();
            var url = $el.attr('href');
            if (url && url !== '#') {
                window.location = url;
            }
        }
    });
})($);

/**
 * @file SQ.Fixed 悬停插件
 * @version 1.5.0
 */

/**
 * @changelog
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
     * @name Fixed
     * @classdesc 元素固定定位
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.ANIMATE               动画类，默认值：undefined
     * @param {array} config.ARRY_FIXED_POSITION    固定位置设置，遵循 [上,右,下,左] 规则，默认为：[0, 0, 'auto', 0]
     * @param {number} config.NUM_TRIGGER_POSITION  设置 fixed 激活位置，当有该值时以该值为准，没有则以元素当前位置为准
     * @param {number} config.NUM_ZINDEX            z-index 值设置，默认为 101
     * @param {boolen} config.PLACEHOLD             是否设置占位 DOM，默认为 false
     * @param {function} config.fixedIn             设置固定布局时回调函数
     * @param {function} config.fixedOut            取消固定布局时回调函数
     * @example $('.J_fixedHeader').fixed({
    PLACEHOLD: true
});
     */

    var scope = 'sq-fixed';     // data-* 后缀
    var defaults = {
        ARRY_FIXED_POSITION: [0, 0, 'auto', 0],
        NUM_ZINDEX: 101,                            // .sq-header 的 z-index 值为 100
        PLACEHOLD: false
    };

    function Fixed ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Fixed.prototype = {
        construtor: 'Fixed',
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
                    id: scope + (index + initializedIndex),     // 用于定位 fixed 元素
                    self: this,
                    $self: $(this),
                    fixed: false                                // 标记是否处在 fixed 状态，用于之后的判断
                };

                // 确定 fixed 激活位置，当有 NUM_TRIGGER_POSITION 值时以该值为准，没有则以元素当前位置为准
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
            var $placeholderDom = $('<div class="sq-fixed-placeholder" id="'+ fixedItem.id +'"></div>').css({
                display: 'none',
                width: fixedItem.$self.width(),
                height: fixedItem.$self.height(),
                background: fixedItem.$self.css('background')
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
                var mobile = 'android-ios';
                // 触发函数
                function fire() {
                    var scrollTop = window.scrollY;
                    if (scrollTop >= fixedItem.triggerPosTop && !fixedItem.$self.hasClass('sq-fixed')) {
                        me._setFixed(fixedItem);
                    } else if (scrollTop < fixedItem.triggerPosTop && fixedItem.$self.hasClass('sq-fixed')) {
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
            fixedItem.fixed = true;

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
            fixedItem.fixed = false;

            if (me.settings.PLACEHOLD && $placeholderDom.length) {
                $placeholderDom.hide();
            }

            if (me.fixedOutFun) {
                me.fixedOutFun();
            }
        }
    };

    $.fn.fixed = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;

        options = options || {};
        options.selector = this.selector;

        this.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Fixed( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope)) {
                    plugin = new Fixed( this, options );
                    $(this).data(scope, 'initialized');
                }
            }
        });
        // chain jQuery functions
        return this;
    };

})($);
/**
 * @file SQ.LazyLoad 延迟加载插件 
 * @version 1.0.2
 */

/**
 * @changelog
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
                var src = $img.attr('data-img');
                // 替换 src 操作
                if (src) {
                    $img.addClass('unvisible').attr('src', src).removeAttr('data-img').removeClass(me.elementClassName);
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

        if (!this.length) {
            console.warn('SQ.lazyload: 未找到'+ this.selector +'元素');
        }

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
/**
 * @file SQ.LoadMore 加载更多插件
 * @version 1.6.0
 */

/**
 * @changelog
 * 1.6.1  * 使用新增的节流函数，调整执行逻辑。
 * 1.6.0  * 现在可以记录一个页面中多个实例的运行状态，方便配合 Tab.js 使用。
 * 1.5.0  * 重写插件，调用方式改为 $. 链式调用。
 * 1.4.2  * 修复 _spliceApi 函数对 api 的拼装错误。
 * 1.4.1  * 为 loaded、scrollEnd 回调函数增加 index 参数。
 * 1.4.0  * 重写 loadMore 插件，支持在一个页面里生成多个实例。
 * 1.3.0  * 删除 render 回调函数。
 * 1.2.4  + 新增 RESTFUL 配置，支持 RESTful 接口风格，
 *        + 新增 XHR_TIMEOUT 配置，
 *        * 精简的验证方法。
 * 1.2.3  * 增强 CSS_STATE_BAR 参数的兼容性，可以支持 '.style-name' 或 'style-name' 写法。
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
 *        - 删除了 scrollEnd 事件中 addClass('click-state') 操作，改为在 scrollEnd 回调函数中执行。
 * 1.0.6  - 精简注释；修改 _refresh 名称为 _setNewTriggerPoint。
 * 1.0.5  * 修复 _verify 方法因为找不到 DOM 元素而保存导致 js 无法继续执行的问题。
 * 1.0.4  + 添加 _refresh 方法，用于计算并存储文档高度和触发高度，该方法会在完成 XHR 加载后刷新，
 *          减少 _getHeight 取值，优化性能。
 * 1.0.3  + 添加 scroll 事件相应伐值，优化其性能。
 * 1.0.2  + 添加 _verify 方法，用于验证参数是否合法。
 * 1.0.1  + 配置内置的 config 设置。
 */
/*global $, SQ, console, jQuery */
(function ($) {
    'use strict';
    /**
     * @name LoadMore
     * @classdesc 应用列表加载更多插件，支持点击加载和滑动加载两种方式，支持由滑动加载自动转为点击加载，依赖 jQuery 或 Zepto 库。
     * @constructor
     * @param {object} config                       插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.API API               接口地址
     * @param {string} config.CSS_STATE_BAR         初始状态展示样式，默认为 .sq-loadmore-state
     * @param {string} config.EVE_EVENT_TYPE        绑定事件设置，默认为 'scroll'
     * @param {boolen} config.LOCAL_DATA            数据 loaclstorage 开关，默认为 false
     * @param {string} config.MODE                  插件模式，默认为 simple，当模式为 simple 时插件会自动判断并更新运行状态，在 simple 模式下 XHR 的返回值必须遵循以下 json 格式：{ code:int, data:object}
     * @param {number} config.NUM_EXPIRES           数据 loaclstorage 过期时间（单位：分钟），默认为 15 分钟
     * @param {string} config.NUM_LOAD_POSITION     滑动加载位置，默认值：0.5
     * @param {number} config.NUM_START_PAGE_INDEX  起始页面序号，默认值：0
     * @param {number} config.NUM_SCROLL_MAX_PAGE   最大滑动加载页数，默认值：3
     * @param {number} config.NUM_SUCCESS_CODE      XHR 成功返回码，默认值：200
     * @param {number} config.NUM_NO_MORE_CODE      无下页数据返回码，默认值：900
     * @param {object | boolen} config.RESTFUL      当设为 true 时，程序会自动将 API 中的 ':page' 段替换为页码 (self.page)也可以设置为 hash 列表，程序会遍历替换所有值。
     * @param {string} config.TXT_CLICK_TIP         触发点击交互提示文字，默认值：'点击加载更多'
     * @param {string} config.TXT_LOADING_TIP       正在加载提示，默认值：'正在加载请稍后...'
     * @param {string} config.TXT_LOADED_ERROR      XHR 加载错误或超时提示，默认值：'加载错误，请重试'
     * @param {string} config.TXT_INIT_TIP          初始提示文字，默认值：'滑动加载更多内容'
     * @param {string} config.TXT_UNKNOWN_ERROR     通过 XHR 接收到的数据无法识别，默认值：'未知错误，请重试'
     * @param {number} config.XHR_TIMEOUT           设置 XHR 超时时间，默认为 5000 ms
     * @param {number} config.XHR_METHOD            XHR 请求方法，默认为 POST
     * @param {function} config.loading(index)                  加载阶段回调函数，返回参数：index(序号)
     * @param {function} config.loaded(data,$element,index)     加载完成回调函数，返回参数：data(XHR 数据), $element(当前 DOM 容器), index(序号)
     * @param {function} config.loadError(index)                加载失败回调函数，返回参数：index(序号)
     * @param {function} config.scrollEnd(index)                滑动加载事件完成回调函数，返回参数：index(序号)
     * @example $('.J_ajaxWrap').loadmore({
    API: 'data/:id/:page/list.json',
    RESTFUL: {
        ':id': appid
    },
    EVE_EVENT_TYPE: 'scroll',
    NUM_SCROLL_MAX_PAGE: 3,
    XHR_TIMEOUT: 10000,
    LOCAL_DATA: true,
    loaded: function (data, $element, index) {
        $element.append(data.data);
    }
});
     */
    var scope = 'sq-loadmore';
    var initIndex = 0;
    var defaults = {
        API: '',                                 // API 接口
        CSS_STATE_BAR: '.sq-loadmore-state',
        EVE_EVENT_TYPE: 'scroll',
        NUM_START_PAGE_INDEX: 0,                 // 起始页面序号
        NUM_LOAD_POSITION: 0.5,                  // 滑动加载位置（0.5 表示页面滑动到 50% 的位置开始加载，该值会递增）
        NUM_SCROLL_MAX_PAGE: 3,                  // 最大滑动加载次数
        NUM_SUCCESS_CODE: 200,
        NUM_NO_MORE_CODE: 900,
        NUM_EXPIRES: 15,
        TXT_LOADING_TIP: '正在加载请稍后...',     // 正在加载提示
        TXT_INIT_TIP: '滑动加载更多内容',         // 初始提示文字
        TXT_CLICK_TIP: '点击加载更多',            // 触发点击交互提示文字
        TXT_LOADED_ERROR: '加载失败，请点击重试',  // Ajax 加载错误或超时提示
        MODE: 'simple',
        XHR_METHOD: 'POST',
        XHR_TIMEOUT: 5000,
        LOCAL_DATA: false
    };

    function LoadMore ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    LoadMore.prototype = {
        construtor: 'LoadMore',
        scrollTimer: 0,     // 滑动计时器
        scrollDelay: 200,   // 滑动阀值
        init: function () {
            var me = this;
            var self = {};
            var index = initIndex;
            var winHeight = window.innerHeight || $(window).height();
            var oldState = me._reload();

            me.$win = $(window);
            me.$triggerTarget = me.$win;                                        // 触发元素
            me.$element = $(me.element);                                        // 数据展示元素
            me.maxPage = me.settings.NUM_SCROLL_MAX_PAGE + me.settings.NUM_START_PAGE_INDEX;
            me.initStyle = me.settings.CSS_STATE_BAR.indexOf('.') === 0 ? me.settings.CSS_STATE_BAR.slice(1) : me.settings.CSS_STATE_BAR;

            me.beforeLoadFun = me.settings.beforeLoad;
            me.loadingFun = me.settings.loading;
            me.loadFun = me.settings.loaded;
            me.loadErrorFun = me.settings.loadError;
            me.scrollEndFun = me.settings.scrollEnd;

            self.$element = me.$element;

            if (oldState.isReload) {
                // 重载状态，获取已有的状态栏
                self.$stateBar = oldState.$stateBar;
                self.$stateTxt = self.$stateBar.find('.state-txt');
            } else {
                // 初次实例化，创建新的状态栏
                self.$stateBar = $('<div class="sq-loadMore-state"><i class="state-icon"></i><span class="state-txt"></span></div>');
                self.$stateTxt = self.$stateBar.find('.state-txt');
                self.$stateBar.addClass(me.initStyle);
                self.$stateTxt.text(me.settings.TXT_INIT_TIP);
                self.$element.css({'min-height': winHeight - 40}).after(self.$stateBar);
            }

            self.api = me.settings.API;
            self.index = index;
            self.page = oldState.page || me.settings.NUM_START_PAGE_INDEX;
            self.currentState = oldState.page || 'none';                                     // 设置当前状态
            self.currentEventType = oldState.event || me.settings.EVE_EVENT_TYPE;     // 临时存储事件类型，以供 _changeState 判断使用。

            if (self.currentEventType === 'click') {
                me._changeEvent('click', self);
            }
            if (oldState.top > 0) {
                $('body').scrollTop(oldState.top);
            }

            if (me._verify(self)) {
                me._setNewTriggerPoint(self);
                me._bind(self.currentEventType, self);
            }
        },
        /**
         * 重新加载
         * @returns {obj} state 状态对象
         * @private
         */
        _reload: function () {
            var me = this;
            var $loadmoreDom = $(me.settings.selector);
            var state = {};
            // 清除事件绑定
            $(window).off('scroll.sq.loadmore');
            // 如果目标对象已经实例化过，就提取运行状态
            if ($loadmoreDom.data(scope)) {
                var $stateBar = $loadmoreDom.next('.sq-loadMore-state');
                state.isReload = true;
                state.page = $stateBar.data('page');
                state.event = $stateBar.data('event');
                state.top = parseInt($stateBar.data('top'), 10);
                state.currentState = $stateBar.data('currentState');
                state.$stateBar = $stateBar;
            }
            return state;
        },
        /**
         * 验证
         * @returns {boolean}
         * @private
         */
        _verify: function (self) {
            var me = this;
            // Dom 验证，触发元素、数据展示元素、状态展示元素必须都存在
            if (me.$triggerTarget.length === 0 || self.$element.length === 0) {
                console.warn('SQ.loadmore: Self[' + self.index + ']缺少 Dom 元素');
                return false;
            }
            // API 验证
            if (!self.api) {
                console.warn('SQ.loadmore: Self[' + self.index + ']缺少 API 参数');
                return false;
            }
            return true;
        },
        /**
         * 事件绑定
         * @param {string} eventType
         * @private
         */
        _bind: function (eventType, self) {
            var me = this;
            me.$triggerTarget.on(eventType + '.sq.loadmore' + self.id, function () {
                me._trigger(self);
            });
            me.$win.on('scroll.sq.loadmore.setTop', function () {
                me._setTopPosition(self);
            });
        },
        /**
         * 触发事件
         * @description 触发事件方法，在满足绑定事件条件时或满足指定触发条件的情况下调用触发方法，
         *              该方法用于集中处理触发事件，判定是否需要加载数据或者更新 UI 显示。
         * @param {string} eventType EVE_EVENT_TYPE 事件类型，'scroll' 或 'click'。
         * @private
         */
        _trigger: function (self) {
            var me = this;
            if (self.currentEventType === 'scroll') {
                if (self.page < me.maxPage) {
                    (SQ.throttle(function () {
                        var isLoading = self.$stateBar.hasClass('loading');
                        var isNoMore = self.$stateBar.hasClass('no-more');
                        if (me.$triggerTarget.scrollTop() >= me.triggerHeight && !isLoading && !isNoMore) {
                            me._load(me._spliceApi(self), self);
                        }
                    }, me.scrollDelay)());
                }
                if (self.page === me.maxPage) {
                    me._changeState('scrollEnd', self);
                }
            } else if (self.currentEventType === 'click') {
                me._load(me._spliceApi(self), self);
            }
        },
        /**
         * 重置计算参数
         * @private
         */
        _setNewTriggerPoint: function (self) {
            if (self.currentEventType === 'click') {
                // 当为点击事件时，不用计算页面高度等数值。
                return;
            }
            var me = this;
            var contentHeight = me._getHeight(document.querySelector('body')) || $('body').height();
            var winHeight = window.innerHeight || $(window).height();
            me.triggerHeight = (contentHeight - winHeight) * (me.settings.NUM_LOAD_POSITION);
            if (me.settings.NUM_LOAD_POSITION < 0.8) {
                me.settings.NUM_LOAD_POSITION += 0.15555;
            }
        },
        /**
         * 转换绑定事件
         * @param {string} eventType
         * @private
         */
        _changeEvent: function (eventType, self) {
            var me = this;
            me.$triggerTarget.off('scroll.sq.loadmore' + self.id);
            self.currentEventType = eventType;
            self.$stateBar.data('event', eventType);                // 记录事件状态
            if (eventType === 'click') {
                me.$triggerTarget = self.$stateBar;                 // 变更触发目标，并将加载触发方式更改为 click
                me._bind(eventType, self);                          // 重新绑定
                self.$stateBar.addClass('click').show();
            } else if (eventType === 'scroll') {
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
            self.$stateBar.data('currentState', state);
            // 状态判断
            switch (state) {
            case 'loading':         //正在加载阶段，添加 loading 标识，更新提示文字
                self.$stateTxt.text(me.settings.TXT_LOADING_TIP);
                self.$stateBar.removeClass('loading').addClass('loading').show();     // 使用 CSS 特殊值技巧
                if (me.loadingFun) {
                    me.loadingFun(self.index);
                }
                break;
            case 'success':          //加载完成
                self.$stateBar.removeClass('loading');
                if (self.currentState === 'loadError') {
                    self.currentState = undefined;
                }
                if (self.currentEventType === 'scroll') {
                    self.$stateTxt.text(me.settings.TXT_INIT_TIP);
                }
                if (self.currentEventType === 'click') {
                    self.$stateTxt.text(me.settings.TXT_CLICK_TIP);
                }
                self.page += 1;
                self.$stateBar.data('page', self.page);
                break;
            case 'scrollEnd':       //滑动加载次数已达到上限
                me._changeEvent('click', self);
                self.$stateTxt.text(me.settings.TXT_CLICK_TIP);
                if (me.scrollEndFun) {
                    me.scrollEndFun(self.index);
                }
                break;
            case 'noMore':          // 无下页数据
                self.$stateBar.addClass('no-more').hide();
                break;
            case 'loadError':     // 加载错误提示
                self.currentState = 'loadError';
                me._changeEvent('click', self);
                self.$stateTxt.text(me.settings.TXT_LOADED_ERROR);
                self.$stateBar.removeClass('loading');
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
            me._changeState('loading', self);
            // 如果设置了 beforeLoadFun 回调函数，则 beforeLoadFun 必须返回 true 才能继续向下执行，
            // 用于人为中断 _load 事件。
            if (me.beforeLoadFun) {
                if (!me.beforeLoadFun()) {
                    return;
                }
            }
            // 是否启用本地缓存
            if (me.settings.LOCAL_DATA) {
                var localData = SQ.store.localStorage.get(api, me.settings.NUM_EXPIRES);
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
                type: me.settings.XHR_METHOD,
                url: api,
                timeout: me.settings.XHR_TIMEOUT,
                success: function (data) {
                    me._loadedResult(data, self);
                    if (me.settings.LOCAL_DATA) {
                        SQ.store.localStorage.set(api, data);
                    }
                },
                error: function () {
                    me._changeState('loadError', self);
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
                me._changeState('loadError', self);
                return;
            }
            jsonData = SQ.isString(data) ? $.parseJSON(data) : data;
            // 简单模式
            // 会自动判断并更新运行状态，前提是数据格式必须要符合要求
            if (me.settings.MODE === 'simple') {
                code = parseInt(jsonData.code, 10);
                switch (code) {
                case me.settings.NUM_SUCCESS_CODE:   //成功加载
                    me._changeState('success', self);
                    break;
                case me.settings.NUM_NO_MORE_CODE:   //无下页数据
                    me._changeState('noMore', self);
                    break;
                default:
                    me._changeState('loadError', self);
                    return;
                }
            }
            if (me.loadFun) {
                me.loadFun(jsonData, self.$element, self.index);
            }
            me._setNewTriggerPoint(self);
        },
        /**
         * 计算页面高度
         * @param el   element 元素。
         * @returns {*}
         * @private
         */
        _getHeight: function (el) {
            if (!el) {
                console.warn('SQ.loadmore: 无法计算页面高度');
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
            var connector = self.api.indexOf('?') === -1 ? '?' : '&';
            var api;
            var j;
            if (me.settings.RESTFUL) {
                api = self.api.replace(':page', self.page);
                for (j in me.settings.RESTFUL) {
                    if (me.settings.RESTFUL.hasOwnProperty(j)) {
                        api = api.replace(j, me.settings.RESTFUL[j]);
                    }
                }
            } else {
                api = self.api + connector + 'page=' + self.page;
            }
            return api;
        },
        _setTopPosition: function (self) {
            self.$stateBar.data('top', $('body').scrollTop());
        }
    };

    $.fn.loadmore = function ( options ) {
        //var isZepto = typeof Zepto !== 'undefined' ? true : false;
        //var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;

        options = options || {};
        options.selector = this.selector;
        
        if (!this.length) {
            console.warn('SQ.loadmore: 未找到'+ this.selector +'元素');
        }

        this.each(function() {
            /*if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new LoadMore( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope)) {
                    plugin = new LoadMore( this, options );
                    $(this).data(scope, 'initialized');
                }
            }*/
            plugin = new LoadMore( this, options );
            $(this).data(scope, 'initialized');
        });
        // chain jQuery functions
        return this;
    };

})($);
/**
 * @file SQ.Modal 弹窗插件
 * @version 1.6.0
 */

/**
 * @changelog
 * 1.6.0  * 重命名为 SQ.Modal。
 * 1.5.1  * 为 ucweb 9.7 事件优化做兼容。
 * 1.5.0  * 重写插件，调用方式改为 $. 链式调用。
 * 1.0.3  * 修复 resize 导致报错的 BUG。
 * 1.0.2  * _setPopupPos 函数优化
 * 1.0.1  * 在设置了 ANIMATE 时，_setPopupPos 函数不使用 translate(-50%, -50%) 方法定位，因为会与动画产生冲突。
 *        * 修复 ANIMATE 设置问题。
 * 1.0.0  * 原 Dialog 插件重构为 Popup 插件。
 */

/*global $, SQ, console, jQuery*/
(function ($) {
    'use strict';
    /**
     * @name Modal
     * @classdesc 对话框插件。
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.ANIMATE               动画类
     * @param {boolen} config.CANCEL_BTN            取消按钮显示设定，默认值：false
     * @param {string} config.CSS_CLASS             弹窗样式类，支持添加多个类：'.style1 .style2'
     * @param {string} config.CSS_POSITION          弹窗定位方式，默认值：'fixed'， 可以设置为：'absolute'
     * @param {number} config.CSS_TOP               弹窗 top 属性值
     * @param {number} config.CSS_RIGHT             弹窗 right 属性值
     * @param {number} config.CSS_BOTTOM            弹窗 bottom 属性值
     * @param {number} config.CSS_LEFT              弹窗 left 属性值
     * @param {number} config.CSS_WIDTH             弹窗 width 属性值
     * @param {number} config.CSS_HEIGHT            弹窗 height 属性值
     * @param {string} config.CSS_MASK_BACKGROUND   遮罩背景色，默认值：'#000000'
     * @param {string} config.CSS_MASK_OPACITY      遮罩透明度，默认值：0.5
     * @param {boolen} config.CLOSE_BTN             关闭按钮显示设定，默认值：true
     * @param {number} config.DELAY                 延时显示对话框设置，单位：毫秒
     * @param {boolen} config.DISPOSABLE            设置弹窗是否是只显示一次，默认为 false
     * @param {string} config.EVE_EVENT_TYPE        绑定事件设置，默认值为：'click'
     * @param {boolen} config.HORIZONTAL            弹窗是否水平居中设定，值：'center'
     * @param {boolen} config.LOCK                  锁定操作，设为 true 将屏蔽触摸操作，默认为 false
     * @param {boolen} config.MASK                  遮罩设定，默认为 true
     * @param {number} config.NUM_CLOSE_TIME        对话框自动关闭时间，单位：毫秒
     * @param {boolen} config.OK_BTN                去掉按钮显示设定，默认值：false
     * @param {boolen} config.PREVENT_DEFAULT       默认动作响应设置，默认为 true，不响应默认操作
     * @param {boolen} config.VERTICAL              弹窗是否垂直居中设定，值：'middle'
     * @param {string} config.TXT_CLOSE_VAL         关闭按钮显示文字，默认值：'×'
     * @param {string} config.TXT_OK_VAL            确定按钮显示文字，默认值：'确定'
     * @param {string} config.TXT_CANCEL_VAL        取消按钮显示文字，默认值：'取消'
     * @param {function} config.beforeShow          打开弹窗前回调函数，该函数必须返回为 true 才能继续执行 show 函数
     * @param {function} config.show                打开弹窗回调函数
     * @param {function} config.ok                  点击确定按钮回调函数
     * @param {function} config.cancel              点击取消按钮回调函数
     * @param {function} config.close               关闭对话框回调函数
     * @param {function} config.reszie              resize 回调函数
     * @example $('.J_showFullModal').modal({
    CSS_CLASS: '.modal-demo',
    CSS_TOP: 10,
    CSS_RIGHT: 10,
    CSS_BOTTOM: 10,
    CSS_LEFT: 10,
    DISPOSABLE: true,
    beforeShow: function () {
        var me = this;
        me.$modalContent.append('全屏窗口');
        return true;
    },
    close: function () {
        tipModal('全屏窗口是一次性点击响应');
    }
});
     */

    var scope = 'sq-modal';
    var defaults = {
        EVE_EVENT_TYPE: 'click',
        CSS_POSITION: 'fixed',
        TXT_CLOSE_VAL: '×',
        TXT_OK_VAL: '确定',
        TXT_CANCEL_VAL: '取消',
        PREVENT_DEFAULT: true,
        LOCK: false,
        MASK: true,
        CSS_MASK_BACKGROUND: '#000000',
        CSS_MASK_OPACITY: 0.5,
        CLOSE_BTN: true
    };

    function Modal ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Modal.prototype = {
        construtor: 'Modal',
        timer : undefined,
        resizeTimer : false,    // resize 
        closed : true,
        init: function () {
            var me = this;

            me.$win = $(window);
            me.$doc = $(document);
            me.$body = $('body');

            me.beforeShowFun = me.settings.beforeShow;
            me.showFun = me.settings.show;
            me.closeFun = me.settings.close;
            me.okFun = me.settings.ok;
            me.cancelFun = me.settings.cancel;
            me.resizeFun = me.settings.resize;

            me._bind();
        },
        /**
         * 事件绑定方法
         * @param {string} EVE_EVENT_TYPE 事件类型，'scroll' 或 'click'。
         * @private
         */
        _bind: function () {
            var me = this;
            var event = me.settings.DISPOSABLE ? '.sq.modal.once' : '.sq.modal';

            me.$doc.on(me.settings.EVE_EVENT_TYPE + event, me.settings.selector, function (e) {
                if (me.settings.PREVENT_DEFAULT) {
                    e.preventDefault();
                }
                if (me.settings.DISPOSABLE) {
                    me.$doc.off(me.settings.EVE_EVENT_TYPE + event);
                }
                me._trigger(e);
            });
        },
        /**
         * 事件触发
         * @param e
         * @private
         */
        _trigger: function (e) {
            var me = this;
            if (me.settings.DELAY) {
                setTimeout(function () {
                    me.show(e);
                }, me.settings.DELAY);
                return;
            }
            me.show(e);
        },
        /**
         * 新建弹窗对象
         * @returns {*} $modalPanel
         * @private
         */
        _createModal: function () {
            var me = this;

            if (me.$modalPanel) {
                return me.$modalPanel;
            }
            // 初始化
            var $modalPanel = $('<div class="sq-modal"></div>');
            var $modalContent = $('<div class="content"></div>');
            var $close = $('<div class="close-btn">' + me.settings.TXT_CLOSE_VAL + '</div>');
            var $okBtn = $('<div class="ok">' + me.settings.TXT_OK_VAL + '</div>');
            var $cancelBtn = $('<div class="cancel">' + me.settings.TXT_CANCEL_VAL + '</div>');

            // 设置样式
            $modalPanel.css({
                'position' : me.settings.CSS_POSITION,
                'width' : me.settings.CSS_WIDTH,
                'height' : me.settings.CSS_HEIGHT,
                'z-index' : 1000
            });

            if (me.settings.CSS_CLASS) {
                var cssClasses = me.settings.CSS_CLASS.split(' ');
                var i;
                var len = cssClasses.length;
                for (i = 0; i < len; i++) {
                    var cssClass = cssClasses[i];
                    $modalPanel.addClass(cssClass.indexOf('.') === 0 ? cssClass.slice(1) : cssClass);
                }
                
            }
            // 装载内容
            $modalPanel.append($modalContent);
            // 设置显示按钮
            if (me.settings.CLOSE_BTN) {
                $modalPanel.append($close);
            }
            if (me.settings.OK_BTN) {
                $modalPanel.append($okBtn);
            }
            if (me.settings.CANCEL_BTN) {
                $modalPanel.append($cancelBtn);
            }

            $modalPanel.appendTo(me.$body);
            // 保存 Dom
            me.$modalPanel = $modalPanel;
            me.$modalContent = $modalContent;
            me.$okBtn = $okBtn;
            me.$cancelBtn = $cancelBtn;
            me.$close = $close;

            return $modalPanel;
        },
        /**
         * 设置弹窗位置
         * @private
         */
        _setModalPos: function () {
            var me = this;
            var top;
            var supportBroswer = 'chrome';
            var isAnimate = me.settings.ANIMATE;
            var isMiddle = me.settings.VERTICAL === 'middle' ? true : false;
            var isCenter = me.settings.HORIZONTAL === 'center' ? true : false;
            var isSupportTransform = SQ.ua.browser.shell === 'ucweb' && SQ.ua.browser.version >= 9 || supportBroswer.indexOf(SQ.ua.browser.shell) !== -1;

            if (me.settings.CSS_POSITION === 'fixed') {
                top = '50%';
            } else if (me.settings.CSS_POSITION === 'absolute') {
                var winHeight = window.innerHeight || me.$win.height();
                top = me.$body.scrollTop() + winHeight / 2;
            }

            if (!me.settings.CSS_TOP && !me.settings.CSS_LEFT && !me.settings.CSS_BOTTOM && !me.settings.CSS_RIGHT) {
                // 当坐标全部未设置时给一个默认值，避免弹窗定位到页面最底部
                me.settings.CSS_TOP = 0;
                me.settings.CSS_LEFT = 0;
            }

            if (me.settings.CSS_TOP && me.settings.CSS_LEFT && me.settings.CSS_BOTTOM && me.settings.CSS_RIGHT) {
                // 当坐标全部设置时，直接定位弹窗不做计算
                me.$modalPanel.css({
                    'top': me.settings.CSS_TOP,
                    'left': me.settings.CSS_LEFT,
                    'bottom': me.settings.CSS_BOTTOM,
                    'right': me.settings.CSS_RIGHT
                });
                return;
            }

            if (isSupportTransform && !isAnimate) {
                if (isMiddle && isCenter) {
                    me.$modalPanel.css({
                        'top': top,
                        'left': '50%',
                        '-webkit-transform': 'translate(-50%, -50%)'
                    });
                } else if (isMiddle) {
                    me.$modalPanel.css({
                        'top': top,
                        'left': me.settings.CSS_LEFT || 0,
                        '-webkit-transform': 'translateY(-50%)'
                    });
                } else if (isCenter) {
                    me.$modalPanel.css({
                        'top': me.settings.CSS_TOP || 0,
                        'left': '50%',
                        '-webkit-transform': 'translateX(-50%)'
                    });
                } else {
                    me.$modalPanel.css({
                        'top': me.settings.CSS_TOP,
                        'left': me.settings.CSS_LEFT,
                        'bottom': me.settings.CSS_BOTTOM,
                        'right': me.settings.CSS_RIGHT
                    });
                }
            } else {
                var mt = me.settings.CSS_HEIGHT ? me.settings.CSS_HEIGHT / 2 * -1 : me.$modalPanel.height() / 2 * -1;
                var ml = me.settings.CSS_WIDTH ? me.settings.CSS_WIDTH / 2 * -1 : me.$modalPanel.width() / 2 * -1;
                if (isMiddle && isCenter) {
                    me.$modalPanel.css({
                        'top': top,
                        'left': '50%',
                        'margin-top': mt,
                        'margin-left': ml
                    });
                } else if (isMiddle) {
                    me.$modalPanel.css({
                        'top': top,
                        'left': me.settings.CSS_LEFT || 0,
                        'margin-top': mt
                    });
                } else if (isCenter) {
                    me.$modalPanel.css({
                        'top': me.settings.CSS_TOP || 0,
                        'left': '50%',
                        'margin-left': ml
                    });
                } else {
                    me.$modalPanel.css({
                        'top': me.settings.CSS_TOP,
                        'left': me.settings.CSS_LEFT,
                        'bottom': me.settings.CSS_BOTTOM,
                        'right': me.settings.CSS_RIGHT
                    });
                }
            }
        },
        /**
         * 设置弹窗事件
         * @private
         */
        _setModalEvent : function () {
            var me = this;
            // 锁定操作
            if (me.settings.LOCK) {
                // 优化 Android 下 UCweb 浏览器触摸操作，减少滑动误操作
                // Ucweb 9.7 以后对 click 事件做了优化，取消 touchstart 默认操作会导致点击事件失效
                if (SQ.ua.os.name === 'android' && SQ.ua.browser.shell === 'ucweb' && SQ.ua.browser.version >= 9 && SQ.ua.browser.version < 9.7) {
                    me.$modalPanel.on('touchstart', function (e) {
                        e.preventDefault();
                    });
                } else {
                    me.$modalPanel.on('touchmove', function (e) {
                        e.preventDefault();
                    });
                }
                me.$modalPanel.on('mousewheel', function (e) {
                    e.preventDefault();
                });
            }
            me.$okBtn.on('click', function () {
                me.ok();
            });
            me.$cancelBtn.on('click', function () {
                me.cancel();
            });
            me.$close.on('click', function () {
                me.close();
            });

            me.$win.resize(function () {
                me.resize();
            });
        },
        _beforeShow: function (e) {
            var me = this;
            // 创建弹窗
            me.$modalPanel = me._createModal();
            // 绑定弹窗事件
            me._setModalEvent();
            // 添加动画
            if (me.settings.ANIMATE) {
                var animateClassName = me.settings.ANIMATE.indexOf('.') === 0 ? me.settings.ANIMATE.slice(1) : me.settings.ANIMATE;
                me.$modalPanel.addClass('animated ' + animateClassName);
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
                console.warn('SQ.Modal: _beforeShow function return false');
                return;
            }
            me.closed = false;
            if (me.settings.MASK) {
                me.mask();
            }
            // 执行回调函数，优先执行 show 回调函数可以确定弹窗中的内容，从而方便计算弹窗尺寸。
            if (me.showFun) {
                me.showFun(e);
            }
            // 设置弹窗位置
            me._setModalPos();
            me.$modalPanel.show();
            // 设置自动关闭
            if (me.settings.NUM_CLOSE_TIME) {
                me.time(me.settings.NUM_CLOSE_TIME);
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
            me.$modalPanel.remove();
            me.$modalContent.empty();
            me.$modalPanel = null;
            if (me.settings.MASK) {
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
            var $mask = me.$mask || $('.sq-mask').length > 0 ? $('.sq-mask') : undefined;

            if ($mask) {
                $mask.css({
                    'width' : '100%',
                    'height' : h
                });
                $mask.show();
            } else {
                $mask = $('<div class="sq-mask"></div>');
                $mask.css({
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'right': 0,
                    'width': '100%',
                    'height': h,
                    'background': me.settings.CSS_MASK_BACKGROUND,
                    'opacity': me.settings.CSS_MASK_OPACITY,
                    'z-index': 999
                }).appendTo(me.$body);

                if (me.settings.LOCK) {
                    $mask.on('touchstart', function (e) {
                        e.preventDefault();
                    });
                    $mask.on('mousewheel', function (e) {
                        e.preventDefault();
                    });
                }
            }
            me.$mask = $mask;
        },
        ok: function (e) {
            var me = this;
            me.close('ok');
            if (me.okFun) {
                me.okFun(e);
            }
        },
        cancel: function (e) {
            var me = this;
            me.close('cancel');
            if (me.cancelFun) {
                me.cancelFun(e);
            }
        },
        resize: function () {
            var me = this;
            if (me.$modalPanel) {
                me._setModalPos();
            }
        }
    };

    $.fn.modal = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;
        var me = this;

        options = options || {};
        options.selector = this.selector;

        // 如果页面中没有指定的 Dom 则生成一个插入到文档中，避免因 trigger() 触发 Modal 时找不到该 Dom 而报错。
        if ($(this.selector).length === 0) {
            me = $('<div class="' + this.selector.slice(1) + '" style="display:none"></div>');
            me.selector = this.selector;
            $('body').append(me);
        }
        
        
        me.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Modal( me, options ) );
                }
            } else if (isZepto) {
                if (!me.data(scope)) {
                    plugin = new Modal( me, options );
                    me.data(scope, 'initialized');
                }
            }
        });
        // chain jQuery functions
        return me;
    };
})($);
/**
 * @file SQ.Panel 滑动面板插件
 * @version 1.0.2
 */

/**
 * @changelog
 * 1.0.2  * 使用了新增的手势事件，适应调整后的 jsHint 规则。
 * 1.0.1  * 为 ucweb 9.7 事件优化做兼容，增加 selector Dom 验证。
 * 1.0.0  * 重写插件，调用方式改为 $. 链式调用。
 * 0.5.0  * 完成左侧滑动面板功能
 * 0.0.1  * 新建。
 */

/*global $, SQ, console, jQuery */
(function ($) {
    'use strict';
    /**
     * @name Panel
     * @classdesc 内容延迟加载
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.CLOSE_BTN             是否显示关闭按钮，默认为：false
     * @param {number} config.CSS_WIDTH             面板宽度，默认为：300px
     * @param {string} config.DOM_WRAPPER           页面包装节点，当 DISPLAY 设置为 push 时，该节点会应用动画
     * @param {string} config.DIRECTION             出现方向，默认为：left
     * @param {string} config.DISPLAY               显示模式，默认为：overlay，可选 push
     * @param {string} config.EVE_EVENT_TYPE        触发方式，默认为：click
     * @param {string} config.TXT_CLOSE_VAL         关闭按钮显示文字，默认为：'×'
     * @param {function} config.beforeShow          打开面板前回调函数，该函数必须返回为 true 才能继续执行 show 函数
     * @param {function} config.show($activePanel)  打开面板时回调函数
     * @param {function} config.close               关闭面板时回调函数
     * @param {function} config.resize              resize 回调函数
     * @example $('.J_panelMenu').panel({
    CSS_CLASS: '.panel-menu',
    CSS_WIDTH: 240,
    beforeShow: function () {
        console.log('beforeShow');
        return true;
    },
    show: function () {
        console.log('show');
    }
});
     */

    var scope = 'sq-panel';
    var defaults = {
        EVE_EVENT_TYPE: 'click',
        DISPLAY: 'overlay',
        DIRECTION: 'left',
        CSS_WIDTH: 300,
        CLOSE_BTN: false,
        TXT_CLOSE_VAL: '×'
    };

    function Panel ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Panel.prototype = {
        construtor: 'Panel',
        resizeTimer: false,
        closed: true,
        init: function () {
            var me = this;
            var css = '@-webkit-keyframes showPanel {0% {-webkit-transform: translateX(-'+ me.settings.CSS_WIDTH +'px);} 100% {-webkit-transform: translateX(0);}}' +
                '@-webkit-keyframes hidePanel{0% {-webkit-transform: translateX(0);}100% {-webkit-transform: translateX(-'+ me.settings.CSS_WIDTH +'px);}}';
            if (me.settings.DISPLAY === 'push') {
                css += '@-webkit-keyframes hideWrap {0% {-webkit-transform: translateX(0);}100% {-webkit-transform: translateX('+ me.settings.CSS_WIDTH +'px);}}' +
                    '@-webkit-keyframes showWrap {0% {-webkit-transform: translateX('+ me.settings.CSS_WIDTH +'px);}100% {-webkit-transform: translateX(0);}}';
            }

            me.$win = $(window);
            me.$doc = $(document);
            me.$body = $('body');
            me.$element = $(me.element);                // 触发元素
            me.$wrapper = $(me.settings.DOM_WRAPPER);

            me.beforeShowFun = me.settings.beforeShow;
            me.showFun = me.settings.show;
            me.closeFun = me.settings.close;
            me.resizeFun = me.settings.resize;

            if (me._verify()) {
                me._bind();
                me.$body.append('<style>' + css + '</style>');
            }
        },
        /**
         * 验证
         * @returns {boolean}
         * @private
         */
        _verify: function () {
            var me = this;
            // Dom 验证，触发元素、数据展示元素、状态展示元素必须都存在
            if (me.$element.length === 0 || me.$wrapper.length === 0) {
                console.warn('SQ.panel: 缺少 Dom 元素');
                return false;
            }
            return true;
        },
        /**
         * 事件绑定方法
         * @param {string} EVE_EVENT_TYPE 事件类型，'scroll' 或 'click'。
         * @private
         */
        _bind: function () {
            var me = this;
            // 绑定在 document 上是为了解决 Ajax 内容绑定问题
            SQ.gestures.tap({
                el: me.settings.selector,
                event: '.sq.panel',
                callbackFun: function (e) {
                    e.preventDefault();
                    me.show(e);
                }
            });
        },
        /**
         * 新建滑动面板对象
         * @returns {*} $panel
         * @private
         */
        _createPanel: function () {
            var me = this;

            // 初始化
            var $panel = $('<div class="sq-panel"></div>');
            var $panelContent = $('<div class="content"></div>');
            var $close = $('<div class="close-btn">' + me.settings.TXT_CLOSE_VAL + '</div>');

            // 设置样式
            if (me.settings.DIRECTION === 'left' || me.settings.DIRECTION === 'right') {
                $panel.css({
                    'position': 'absolute',
                    'display': 'none',
                    'top': 0,
                    'bottom': 0,
                    'width': me.settings.CSS_WIDTH,
                    'z-index': 1000
                });
            }

            if (me.settings.CSS_CLASS) {
                $panel.addClass(me.settings.CSS_CLASS.indexOf('.') === 0 ? me.settings.CSS_CLASS.slice(1) : me.settings.CSS_CLASS);
            }
            // 装载内容
            $panel.append($panelContent);
            // 设置显示按钮
            if (me.settings.CLOSE_BTN) {
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
        _setPanelEvent: function () {
            var me = this;
            // 锁定操作 
            // 优化 Android 下 UCweb 浏览器触摸操作，减少滑动误操作
            if (SQ.ua.os.name === 'android' && SQ.ua.browser.shell === 'ucweb' && SQ.ua.browser.version >= 9 && SQ.ua.browser.version < 9.7) {
                me.$panel.on('touchstart', function (e) {
                    e.preventDefault();
                });
            } else {
                me.$panel.on('touchmove', function (e) {
                    e.preventDefault();
                });
            }
            me.$panel.on('mousewheel', function (e) {
                e.preventDefault();
            });
            me.$close.on('click', function () {
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
                console.warn('SQ.Panel: _beforeShow 回调函数返回 false');
                return;
            }
            me.mask();
            me.$panel.removeClass('sq-hidePanel').addClass('animated sq-showPanel fast');
            me.$wrapper.removeClass('sq-showWrap').addClass('animated sq-hideWrap fast');
            me.closed = false;
            // 执行回调函数。
            if (me.showFun) {
                me.showFun(me.$panel);
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
                    'width': '100%',
                    'height': h
                });
                me.$mask.show();
            } else {
                var $mask = $('<div class="mask"></div>');
                $mask.css({
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'right': 0,
                    'width': '100%',
                    'height': h,
                    //'background': 'rgba(255,255,255,.5)',
                    'z-index': 999
                }).appendTo(me.$body);

                $mask.on('touchstart', function (e) {
                    e.preventDefault();
                    // 当屏蔽 touchstart 事件后其它浏览器不能响应 click 事件，所以注册一个关闭方法。
                    // ucweb 9.7 也不能响应 click 事件。
                    if (SQ.ua.browser.shell !== 'ucweb' || SQ.ua.browser.version >= 9.7) {
                        me.close();
                    }
                });
                SQ.gestures.tap({
                    el: $mask,
                    callbackFun: function (e) {
                        e.preventDefault();
                        me.close();
                    }
                });
                $mask.on('mousewheel', function (e) {
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
            me.$panel.removeClass('sq-showPanel').addClass('sq-hidePanel');
            me.$wrapper.removeClass('sq-hideWrap').addClass('sq-showWrap');
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

    $.fn.panel = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;

        options = options || {};
        options.selector = this.selector;

        if (!this.length) {
            console.warn('SQ.panel: 未找到'+ this.selector +'元素');
        }

        this.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Panel( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope)) {
                    plugin = new Panel( this, options );
                    $(this).data(scope, 'initialized');
                }
            }
        });
        // chain jQuery functions
        return this;
    };

})($);
/**
 * @file SQ.Suggest 联想词插件
 * @version 1.0.0
 */

/**
 * @changelog
 * 1.0.0  * 重写插件，调用方式改为 $. 链式调用。
 * 0.5.10 * 修复 jshint 问题
 * 0.5.9  * 修复在输入搜索后删除搜索词，再次输入相同字符，首字符无请求问题。issues#11
 * 0.5.8  * 修复 IE 下对 XHR 对象处理问题。
 * 0.5.7  * 修复多次发送请求时，老请求因为响应慢覆盖新请求问题。
 * 0.5.6  * 修改插件名称为 Suggest。
 * 0.5.5  * 完成搜索联想词基本功能。
 * 0.0.1  + 新建。
 */

/*global $, SQ, console, jQuery */
(function ($) {
    'use strict';
    /**
     * @name Suggest
     * @classdesc 搜索联想词插件
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.API                   联想词接口
     * @param {string} config.CSS_CLEAR_BTN         设置清空按钮样式名称，默认为 .sq-suggest-clear-btn
     * @param {string} config.CSS_SUGGEST_PANEL     设置联想词展示面板样式名称，默认为 .sq-suggest-result
     * @param {number} config.NUM_TIMER_DELAY       监测输入框间隔时长，默认为 300ms
     * @param {number} config.NUM_XHR_TIMEER        XHR 超时时长，默认为 5000ms
     * @param {number} config.NUM_SUCCESS_CODE      XHR 成功状态码，默认为 200
     * @param {function} config.beforeStart         检测输入框前的回调函数
     * @param {function} config.start               开始检测输入框时回调函数
     * @param {function} config.show(data)          显示联想词面板时回调函数，data 为 XHR 返回数据
     * @param {function} config.clear               清除时回调函数
     * @example $('.J_suggest').suggest({
    API: 'data/suggest.json',
    CSS_CLEAR_BTN: '.clear',
    CSS_SUGGEST_RESULT: '.suggest-panel',
    show: function (data) {
        var me = this;
       console.log('suggestList: ' + data);
    }
});
     */
    var scope = 'sq-suggest';
    var defaults = {
        NUM_TIMER_DELAY : 300,
        NUM_XHR_TIMEER : 5000,
        NUM_SUCCESS_CODE : 200,
        suggestion : true
    };

    function Suggest ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Suggest.prototype = {
        construtor: 'Suggest',
        lastKeyword: '',        // 为 300ms（检测时长） 前的关键词
        lastSendKeyword : '',   // 上一次符合搜索条件的关键词
        canSendRequest : true,  // 是否可以进行下次联想请求
        init: function () {
            var me = this;
            var clearBtnClassName = '';
            var suggestResultClassName = '';

            if (me.settings.CSS_CLEAR_BTN) {
                clearBtnClassName = me.settings.CSS_CLEAR_BTN.indexOf('.') !== -1 ? me.settings.CSS_CLEAR_BTN.slice(1) : me.settings.CSS_CLEAR_BTN;
            }
            if (me.settings.CSS_SUGGEST_RESULT) {
                suggestResultClassName = me.settings.CSS_SUGGEST_RESULT.indexOf('.') !== -1 ? me.settings.CSS_SUGGEST_RESULT.slice(1) : me.settings.CSS_SUGGEST_RESULT;
            }

            me.$element = $(me.element);
            me.$input = me.$element.find('input[type=text]');
            me.$clearBtn = $('<div class="sq-suggest-clear-btn"></div>').addClass(clearBtnClassName);
            me.$suggestPanel = $('<div class="sq-suggest-result"></div>').addClass(suggestResultClassName);

            me.$input.after(me.$clearBtn);
            me.$element.append(me.$suggestPanel);

            me.beforeStartFun = me.settings.beforeStart;
            me.startFun = me.settings.start;
            me.clearFun = me.settings.clear;
            me.showFun = me.settings.show;

            if (me._verify()) {
                me._bind();
            }
        },
        _verify : function () {
            return true;
        },
        _bind : function (e) {
            var me = this;
            me.$input.on('focus', function () {
                me.start();
            });
            me.$input.on('blur', function () {
                me.stop();
            });
            me.$clearBtn.on('click', function () {
                me.clear();
            });
            if (me.beforeStartFun) {
                me.beforeStartFun();
            }
        },
        /** 过滤输入内容 */
        _filter : function (originalKeyword) {
            return originalKeyword.replace(/\s+/g, '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
        },
        /** 初始化提示层容器 */
        _initSuggest : function () {
            var me = this;
            me.$suggestPanel.empty();
        },
        /** 请求数据 */
        _requestData : function (keyword) {
            var me = this;
            var api = me.settings.API;

            //console.log('request -> ' + 'keyword: ' + keyword, 'lastSendKeyword: ' + me.lastSendKeyword);
            if (me.xhr) {
                me.xhr.abort();
            }
            me.xhr = $.ajax({
                type : 'POST',
                url : api,
                dataType : 'json',
                data : {'keyword': keyword},
                timeout : me.settings.NUM_XHR_TIMEER,
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
            //console.log('keyword: ' + keyword, 'lastSendKeyword: ' + me.lastSendKeyword);

            if (me.lastKeyword === keyword) {
                //console.log('same ' + 'me.lastKeyword = ' + me.lastKeyword + ' | ' + 'keyword = ' + keyword + ' | ' + 'me.lastSendKeyword =' + me.lastSendKeyword);
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
                //console.log('!canSendRequest');
                return false;
            }
            if (me.lastSendKeyword === keyword) {
                //console.log('关键词相同')
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
                    if (me.$clearBtn.css('display') === 'none') {
                        me.$clearBtn.show();
                    }
                    if (me._compare(keyword)) {
                        me._requestData(keyword);
                        if (me.startFun) {
                            me.startFun();
                        }
                    }
                    me.lastKeyword = keyword;
                } else {
                    me.lastKeyword = undefined;
                    me.clear();
                }
            }, me.settings.NUM_TIMER_DELAY);
        },
        /** 停止计时器 */
        stop : function () {
            var me = this;
            clearInterval(me.inputListener);
        },
        /** 显示提示层 */
        showSuggest : function (data) {
            var me = this;
            var ds = typeof data === 'object' ? data : JSON.parse(data);
            if (ds.code !== me.settings.NUM_SUCCESS_CODE) {
                me.canSendRequest = false;
                return;
            }
            me.canSendRequest = true;
            me._initSuggest();
            if (me.showFun) {
                me.showFun(ds);
            }
        },
        /** 隐藏提示层 */
        hideSuggest : function () {
            var me = this;
            me.$suggestPanel.hide();
        },
        /** 清除输入内容 */
        clear : function () {
            var me = this;
            me.$input.val('');
            me.hideSuggest();
            me.$clearBtn.hide();
            me.canSendRequest = true;
            me.lastSendKeyword = '';
            if (me.clearFun) {
                me.clearFun();
            }
        }
    };

    $.fn.suggest = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;

        options = options || {};
        options.selector = this.selector;

        this.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Suggest( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope)) {
                    plugin = new Suggest( this, options );
                    $(this).data(scope, 'initialized');
                }
            }
        });
        // chain jQuery functions
        return this;
    };

})($);
/**
 * @file SQ.Tab 选项卡插件
 * @version 1.0.2
 */

/**
 * @changelog
 * 1.0.2  * 使用了新增的手势事件，适应调整后的 jsHint 规则。
 * 1.0.1  * 添加 _verify 验证 DOM 的提示。
 * 1.0.0  * 重写插件，调用方式改为 $. 链式调用。
 * 0.7.5  * 修改类名，新增 beforeLoad 、loaded 回调函数的传参。
 * 0.7.4  * 解决 localStorage 问题，API 兼容 ['','test.json',''] 这种写法；
 *        * CSS_LOADING_TIP 兼容 '.demo' 和 'demo' 写法。
 * 0.7.3  * 修复 reload 按钮多次绑定问题。
 * 0.7.2  * 修复初始化时，me.$loadingTip 无法找到的问题。
 * 0.7.1  * 修复 jshint 问题。
 * 0.7.0  + 添加对 localStorage 支持，通过将 LOCAL_DATA 设置为 true 开启，通过 NUM_EXPIRES 来设置过期时间（单位：分钟）。
 * 0.6.1  * 屏蔽 click 默认动作，新增自定义 CSS_HIGHLIGHT 属性。
 * 0.6.0  * 重写 Tabs 插件，使 Tabs 插件能够在同一页面多次实例化。
 * 0.5.6  * 修改插件名称为 Tabs。
 * 0.5.1  * 完成选项卡基本功能。
 * 0.0.1  + 新建。
 */
/*global $, SQ, console, jQuery */
(function ($) {
    'use strict';
    /**
     * @name Tab
     * @classdesc 选项卡插件
     * @constructor
     * @param {object} config                                           插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.API                                       API 接口① 字符串形式
     * @param {array}  config.API                                       API 接口② 数组形式，数组中各项对应各个选项卡
     * @param {boolean} config.CLEAR_PANEL                              切换选项卡时是否自动清理面板数据
     * @param {string} config.CSS_HIGHLIGHT                             自定义高亮样式名称，默认为 .active
     * @param {string} config.CSS_LOADING_TIP                           loading 提示样式
     * @param {string} config.DOM_PANELS                                面板 Dom 元素
     * @param {string} config.DOM_TABS                                  标签 Dom 元素
     * @param {string} config.EVE_EVENT_TYPE                            触发事件，click 或 mouseover
     * @param {string} config.LOCAL_DATA                                XHR 数据 loaclstorage 开关，默认为 false
     * @param {number} config.NUM_ACTIVE                                初始高亮选项卡序号，0 - n
     * @param {number} config.NUM_EXPIRES                               XHR 数据 loaclstorage 过期时间（单位：分钟），默认为 15 分钟
     * @param {number} config.XHR_TIMEOUT                               XHR 超时时间
     * @param {number} config.XHR_METHOD                                XHR 请求方法，默认为 POST
     * @param {string} config.TXT_LOADING_TIP                           loading 提示文字
     * @param {function} config.trigger($tabs,$panels,tabIndex)         触发选项卡切换回调函数
     * @param {function} config.show($tabs,$panels,tabIndex)            显示选项卡时回调函数
     * @param {function} config.beforeLoad($activePanel,tabIndex)      异步加载前回调函数，当设定了该回调函数时，必须返回
     *                                                                  true 才能继续执行，异步加载事件，可中断异步加载事件。
     *                                                                  参数：$activePanel 是当前激活的面板
     * @param {function} config.loaded(data,$activePanel,tabIndex)     异步加载成功回调函数，参数：data 是异步加载返回数据
     *                                                                  参数：$activePanel 是当前激活的面板
     * @example $('.J_tabs').tab({
    API: ['data/content1.json', 'data/content2.json', ''],
    DOM_TABS: '.sq-nav-tabs>li',
    DOM_PANELS: '.sq-tab-content',
    CSS_LOADING_TIP: '.tab-loading-tip',
    show: function ($tabs, $panels, tabIndex) {

    },
    loaded: function (data, $activePanel) {

    }
});
     */
    var scope = 'sq-tab';
    var defaults = {
        EVE_EVENT_TYPE: 'click',
        CSS_HIGHLIGHT: '.active',
        CLEAR_PANEL : false,
        LOCAL_DATA: false,
        NUM_ACTIVE : 0,
        XHR_TIMEOUT : 5000,
        NUM_EXPIRES: 15,
        TXT_LOADING_TIP : '正在加载请稍后...',     // 正在加载提示
        XHR_METHOD: 'POST'
    };

    function Tab ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Tab.prototype = {
        construtor: 'Tab',
        needLoadContent : false,    // 选项卡内容是否需要异步加载
        init: function () {
            var me = this;
            
            if (me.settings.CSS_LOADING_TIP) {
                me.CSS_LOADING_TIP = me.settings.CSS_LOADING_TIP.indexOf('.') === 0 ? me.settings.CSS_LOADING_TIP.slice(1) : me.settings.CSS_LOADING_TIP;
            }
            me.CSS_HIGHLIGHT = me.settings.CSS_HIGHLIGHT.indexOf('.') === 0 ? me.settings.CSS_HIGHLIGHT.slice(1) : me.settings.CSS_HIGHLIGHT;

            me.$element = $(me.element);        // 目标元素
            me.tabsLen = me.$element.length;

            me.triggerFun = me.settings.trigger;
            me.showFun = me.settings.show;
            me.beforeLoadFun = me.settings.beforeLoad;
            me.loadFun = me.settings.loaded;

            me.$element.each(function () {
                var $tabMould = $(this);
                var $tabs = $tabMould.find(me.settings.DOM_TABS);
                var $panels = $tabMould.find(me.settings.DOM_PANELS);
                if (me._verify($tabs, $panels)) {
                    me._init($tabMould, $tabs, $panels);
                }
            });
        },
        _verify: function ($tabs, $panels) {
            if (!$tabs.length) {
                console.warn('SQ.tab: 参数 DOM_TABS 错误，'+ this.settings.selector +'下未找到'+ this.settings.DOM_TABS +'元素');
                return false;
            }
            if (!$panels.length) {
                console.warn('SQ.tab: 参数 DOM_PANELS 错误，'+ this.settings.selector +'下未找到'+ this.settings.DOM_PANELS +'元素');
                return false;
            }
            return true;
        },
        _init: function ($tabMould, $tabs, $panels) {
            var me = this;
            var i = 0;
            // 为选项卡添加序号
            $tabs.each(function () {
                $(this).attr('data-tabIndex', i);
                i++;
            });
            // 判断是否需要生成异步加载提示语
            if (me.settings.API && (SQ.isString(me.settings.API) || SQ.isArray(me.settings.API))) {
                me.$loadingTip = $('<div class="sq-tabs-loading-tip"></div>');
                if (me.CSS_LOADING_TIP) {
                    me.$loadingTip.addClass(me.CSS_LOADING_TIP);
                } else {
                    me.$loadingTip.css({
                        'height' : 60,
                        'text-align' : 'center',
                        'line-height' : '60px'
                    });
                }
                me.$loadingTip.text(me.settings.TXT_LOADING_TIP);
                me.needLoadContent = true;
            }
            // 初始化高亮
            if (me.settings.NUM_ACTIVE !== undefined) {
                me.show($tabs, $panels, me.settings.NUM_ACTIVE);
            }
            // 绑定事件
            SQ.gestures.tap({
                el: $tabs,
                event: '.sq.tab',
                callbackFun: function (e, $el) {
                    e.preventDefault();
                    me._trigger($tabMould, $tabs, $panels, $el);
                }
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
            var tabIndex = parseInt($tab.attr('data-tabIndex'), 10);
            var isCurrentActive = $tab.hasClass(me.CSS_HIGHLIGHT);

            if (isCurrentActive) {
                return;
            }

            me.show($tabs, $panels, tabIndex);
            if (me.triggerFun) {
                me.triggerFun($tabs, $panels, tabIndex);
            }
        },
        _cleanPanel: function ($activePanel) {
            $activePanel.empty();
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
            var $activePanel = $panels.eq(tabIndex);

            $tabs.removeClass(me.CSS_HIGHLIGHT);
            $panels.removeClass(me.CSS_HIGHLIGHT);
            $activeTab.addClass(me.CSS_HIGHLIGHT);
            $activePanel.addClass(me.CSS_HIGHLIGHT);

            if (me.showFun) {
                me.showFun($tabs, $panels, tabIndex);
            }
            if (me.settings.API) {
                me._load($activePanel, tabIndex);
            }
        },
        _load: function ($activePanel, tabIndex) {
            var me = this;
            var api = me.settings.API;
            var $currentLoadTip = $activePanel.find('.sq-tabs-loading-tip');
            var hasLoadingTip = $currentLoadTip.length > 0 ? true : false;
            var hasLoaded = $activePanel.hasClass('hasLoaded');

            if (hasLoaded) {
                return;
            }
            // 如果设置了 beforeLoadFun 回调函数，则 beforeLoadFun 必须返回 true 才能继续向下执行，
            // 用于人为中断 _load 事件。
            if (me.beforeLoadFun) {
                if (!me.beforeLoadFun($activePanel, tabIndex)) {
                    return;
                }
            }
            // 是否清空面板
            if (me.settings.CLEAR_PANEL) {
                me._cleanPanel($activePanel);
            }
            // 是否启用本地缓存
            if (me.settings.LOCAL_DATA) {
                var localData = SQ.store.localStorage.get(api, me.settings.NUM_EXPIRES);
                localData = SQ.isString(localData) ? $.parseJSON(localData) : localData;
                if (localData) {
                    $activePanel.addClass('hasLoaded');
                    if (me.loadFun) {
                        me.loadFun(JSON.parse(localData), $activePanel, tabIndex);
                    }
                    return;
                }
            }
            // 开始 XHR 流程
            if (SQ.isArray(me.settings.API)) {
                api = me.settings.API[tabIndex];
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
                $activePanel.append(me.$loadingTip);
                $currentLoadTip = $activePanel.find('.sq-tabs-loading-tip');
                $currentLoadTip.show();
            }
            me.xhr = $.ajax({
                type: me.settings.XHR_METHOD,
                url : api,
                dataType : 'json',
                timeout : me.settings.XHR_TIMEOUT,
                success : function (data) {
                    $currentLoadTip.hide();
                    $activePanel.addClass('hasLoaded');    // 为已经加载过的面板添加 .hasLoaded 标记
                    if (me.settings.LOCAL_DATA) {
                        SQ.store.localStorage.set(api, data);
                    }
                    if (me.loadFun) {
                        me.loadFun(data, $activePanel, tabIndex);
                    }
                },
                error : function () {
                    me._showReloadTips($activePanel, tabIndex);
                }
            });
        },
        _showReloadTips: function ($activePanel, tabIndex) {
            var me = this;
            var $tip = $activePanel.find('.sq-tabs-loading-tip');
            $tip.show().empty();
            var reloadHTML = '<div class="reload">' +
                '<p>抱歉，加载失败，请重试</p>' +
                '<div class="sq-btn f-grey J_reload">重新加载</div>' +
                '</div>';
            $tip.append(reloadHTML);
            $activePanel.find('.J_reload').off('click').on('click', function () {
                me._load($activePanel, tabIndex);
            });
        }
    };

    $.fn.tab = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;

        options = options || {};
        options.selector = this.selector;

        if (!this.length) {
            console.warn('SQ.tab: 未找到'+ this.selector +'元素');
        }

        this.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Tab( this, options ) );
                }
            } else if (isZepto) {
                if (!$(this).data(scope)) {
                    plugin = new Tab( this, options );
                    $(this).data(scope, 'initialized');
                }
            }
        });
        // chain jQuery functions
        return this;
    };
})($);
/**
 * @file SQ.TouchSlip 触摸滑动组件
 * @data 2013.7.10
 * @version 1.0.0
 */

/*global $, SQ, console, jQuery */

(function (window, document) {
    'use strict';
    var _fun = {
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
            function F() {}
            F.prototype = object;
            return new F();
        }
    };

    var slipjs = {
        _refreshCommon: function (wideHigh, parentWideHigh) { // 作用：当尺寸改变时，需要重新取得相关的值
            var me = this;
            me.wideHigh = wideHigh || me.core[me.offset] - me.upRange;
            me.parentWideHigh      = parentWideHigh      || me.core.parentNode[me.offset];
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
            me.upRange    = param.upRange   || 0;
            me.downRange  = param.downRange  || 0;
            if (me.DIRECTION === 'x') {
                me.offset = 'offsetWidth';
                me._pos   = me.__posX;
            } else {
                me.offset = 'offsetHeight';
                me._pos   = me.__posY;
            }
            me.wideHigh       = param.wideHigh || me.core[me.offset] - me.upRange;
            me.parentWideHigh   = param.parentWideHigh || me.core.parentNode[me.offset];
            me._getCoreWidthSubtractShellWidth();

            me._bind('touchstart');
            me._bind('touchmove');
            me._bind('touchend');
            me._bind('webkitTransitionEnd');

            me.xy = 0;
            me.y = 0;
            me._pos(-me.upRange);
        },
        _getCoreWidthSubtractShellWidth: function () { // 作用：取得滑动对象和它父级元素的宽度或者高度的差
            var me = this;
            me.widthCutCoreWidth = me.parentWideHigh - me.wideHigh;
            me.coreWidthCutWidth = me.wideHigh - me.parentWideHigh;
        },
        handleEvent: function (e) { // 作用：简化addEventListener的事件绑定
            switch (e.type) {
            case 'touchstart':
                this._start(e);
                break;
            case 'touchmove':
                this._move(e);
                break;
            case 'touchend':
            case 'touchcancel':
                this._end(e);
                break;
            case 'webkitTransitionEnd':
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
            this.core.style.webkitTransform = 'translate3d(' + x + 'px, 0px, 0px)';
            //this.core.style['webkitTransform'] = 'translate('+x+'px, 0px) scale(1) translateZ(0px)';
        },
        __posY: function (x) { // 作用：当设置滑动的方向为“Y”时用于设置滑动元素的坐标
            this.xy = x;
            this.core.style.webkitTransform = 'translate3d(0px, ' + x + 'px, 0px)';
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
        var me = this;
        me._initCommon(core, param);
        me.NUM_PAGES = param.NUM_PAGES;
        me.page = 0;
        me.AUTO_TIMER = param.AUTO_TIMER;
        me.lastPageFun = param.lastPageFun;
        me.firstPageFun = param.firstPageFun;
        if (param.AUTO_TIMER) {
            me._autoChange();
        }
        param.noFollow ? (me._move = me._moveNoMove, me.nextTime = 500) : me.nextTime = 300;
    };
    SlipPage._start = function(evt) { // 触摸开始
        var me = this;
        var e = evt.touches[0];
        me._abruptX = 0;
        me._abruptXAbs = 0;
        me._startX = me._startXClone = e.pageX;
        me._startY = e.pageY;
        me._movestart = undefined;
        if (me.AUTO_TIMER) {
            me._stop();
        }
        if (me.startFun) {
            me.startFun(e);
        }
    };
    SlipPage._move = function(evt) { // 触摸中,跟随移动
        var me = this;
        me._moveShare(evt);
        if(!me._movestart){
            var e = evt.touches[0];
            evt.preventDefault();
            me.offsetX = (me.xy > 0 || me.xy < me.widthCutCoreWidth) ? me._disX/2 + me.xy : me._disX + me.xy;
            me._startX  = e.pageX;
            if (me._abruptXAbs < 6) {
                me._abruptX += me._disX;
                me._abruptXAbs = Math.abs(me._abruptX);
                return;
            }
            me._pos(me.offsetX);
            if (me.moveFun) {
                me.moveFun(e);
            }
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
        me._disX = e.pageX - me._startX;
        me._disY = e.pageY - me._startY;
        typeof me._movestart === 'undefined' && (me._movestart = !!(me._movestart || Math.abs(me._disX) < Math.abs(me._disY)));
    };
    SlipPage._end = function(e) { // 触摸结束
        if (!this._movestart) {
            var me = this;
            me._endX = e.changedTouches[0].pageX;
            me._range = me._endX - me._startXClone;
            if(me._range > 35){
                me.page !== 0 ? me.page -= 1 : (me.firstPageFun && me.firstPageFun(e));
            }else if(Math.abs(me._range) > 35){
                me.page !== me.NUM_PAGES - 1 ? me.page += 1 : (me.lastPageFun && me.lastPageFun(e));
            }
            me.toPage(me.page, me.nextTime);
            me.touchEndFun && me.touchEndFun(e);
        }
    };
    SlipPage._transitionEnd = function(e) { // 动画结束
        var me = this;
        e.stopPropagation();
        me.core.style.webkitTransitionDuration = '0';
        me._stopIng && me._autoChange(), me._stopIng = false;
        me.endFun && me.endFun();
    };
    SlipPage.toPage = function(num, time) { // 可在外部调用的函数，指定轮换到第几张，只要传入：“轮换到第几张”和“时间”两个参数。
        this._posTime(-this.parentWideHigh * num, time || 0);
        this.page = num;
    };
    SlipPage._stop = function() { // 作用：停止自动轮换
        clearInterval(this._autoChangeSet);
        this._stopIng = true;
    };
    SlipPage._autoChange = function() { // 作用：自动轮换
        var me = this;
        me._autoChangeSet = setInterval(function() {
            me.page !== me.NUM_PAGES - 1 ? me.page += 1 : me.page = 0;
            me.toPage(me.page, me.nextTime);
        },me.AUTO_TIMER);
    };
    SlipPage.refresh = function(wideHigh, parentWideHigh) { // 可在外部调用，作用：当尺寸改变时（如手机横竖屏时），需要重新取得相关的值。这时候就可以调用该函数
        this._refreshCommon(wideHigh, parentWideHigh);
    };
            
    var SlipPx = _fun.clone(slipjs);
    //function SlipPx() {}
    //SQ.util.extend(SlipPx, slipjs);

    SlipPx._init = function(core,param) { // 作用：初始化
        var me  = this;
        me._initCommon(core,param);
        me.perfect     = param.perfect;
        me.SHOW_SCROLL_BAR = param.SHOW_SCROLL_BAR;
        if(me.DIRECTION === 'x'){
            me.pageX          = 'pageX';
            me.pageY          = 'pageY';
            me.widthOrHeight = 'width';
            me._real           = me._realX;
            me._posBar         = me.__posBarX;
        }else{
            me.pageX          = 'pageY';
            me.pageY          = 'pageX';
            me.widthOrHeight = 'height';
            me._real           = me._realY;
            me._posBar         = me.__posBarY;
        }
        if(me.perfect){
            me._transitionEnd = function(){};
            me._stop          = me._stopPerfect;
            me._slipBar       = me._slipBarPerfect;
            me._posTime       = me._posTimePerfect;
            me._barUpRange   = me.upRange;
            me.noBar         = false;
            me._slipBarTime   = function(){};
        }else{
            me.noBar   = param.noBar;
            me.core.style.webkitTransitionTimingFunction = 'cubic-bezier(0.33, 0.66, 0.66, 1)';
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
        if(!me.noBar){
            me._insertSlipBar(param);
            if(me.coreWidthCutWidth <= 0){
                me._barShellOpacity = 0;
                me._showBarStorage    = me._showBar;
                me._showBar           = function(){};
            }
        }else{
            me._hideBar = function(){};
            me._showBar = function(){};
        }
    };
    SlipPx._start = function(evt) { // 触摸开始
        var me = this;
        var e = evt.touches[0];
        me._animating = false;
        me._steps = [];
        me._abruptX     = 0;
        me._abruptXAbs = 0;
        me._startX = me._startXClone = e[me.pageX];
        me._startY = e[me.pageY];
        me._startTime = e.timeStamp || Date.now();
        me._movestart = undefined;
        !me.perfect && me._needStop && me._stop();
        me.core.style.webkitTransitionDuration = '0';
        me.startFun && me.startFun(e);
    };
    SlipPx._move = function(evt) { // 触摸中
        var me = this;
        var e = evt.touches[0];
        var _ePage = e[me.pageX];
        var _ePageOther = e[me.pageY];
        var thatX = me.xy;
        me._disX = _ePage - me._startX;
        me._disY = _ePageOther - me._startY;
        (me.DIRECTION === 'x' && typeof me._movestart === 'undefined') && (me._movestart = !!(me._movestart || (Math.abs(me._disX) < Math.abs(me._disY))));
        
        if(!me._movestart){
            evt.preventDefault();
            me._moveTime = e.timeStamp || Date.now();
            me.offsetX = (thatX > 0 || thatX < me.widthCutCoreWidth - me.upRange) ? me._disX/2 + thatX : me._disX + thatX;
            me._startX = _ePage;
            me._startY = _ePageOther;
            me._showBar();
            if (me._abruptXAbs < 6 ) {
                me._abruptX += me._disX;
                me._abruptXAbs = Math.abs(me._abruptX);
                return;
            }
            me._pos(me.offsetX);
            me.noBar || me._slipBar();
            if (me._moveTime - me._startTime > 300) {
                me._startTime    = me._moveTime;
                me._startXClone = _ePage;
            }
            me.moveFun && me.moveFun(e);
        }
    };
    SlipPx._end = function(evt) { // 触摸结束
        if (!this._movestart) {
            var me = this,
                e = evt.changedTouches[0],
                duration = (e.timeStamp || Date.now()) - me._startTime,
                fastDistX = e[me.pageX] - me._startXClone;
            me._needStop = true;
            if(duration < 300 && Math.abs(fastDistX) > 10) {
                if (me.xy > -me.upRange || me.xy < me.widthCutCoreWidth) {
                    me._rebound();
                }else{
                    var _momentum = me._momentum(fastDistX, duration, -me.xy - me.upRange, me.coreWidthCutWidth + (me.xy), me.parentWideHigh);
                    me._posTime(me.xy + _momentum.dist, _momentum.time);
                    me.noBar || me._slipBarTime(_momentum.time);
                }
            }else{
                me._rebound();
            }
            me.touchEndFun && me.touchEndFun(e);
        }
    };
    SlipPx._transitionEnd = function(e) { // 滑动结束
        var me = this;
        if (e.target !== me.core) {
            return;
        }
        me._rebound();
        me._needStop = false;
    };
    SlipPx._rebound = function(time) { // 作用：滑动对象超出时复位
        var me = this,
            _reset = (me.coreWidthCutWidth <= 0) ? 0 : (me.xy >= -me.upRange ? -me.upRange : me.xy <= me.widthCutCoreWidth - me.upRange ? me.widthCutCoreWidth - me.upRange : me.xy);
        if (_reset === me.xy) {
            me.endFun && me.endFun();
            me._hideBar();
            return;
        }
        me._posTime(_reset, time || 400);
        me.noBar || me._slipBarTime(time);
    };
    SlipPx._insertSlipBar = function(param) { // 插入滚动条
        var me = this;
        me._bar       = document.createElement('div');
        me._barShell = document.createElement('div');
        var _barCss;
        var _barShellCss;
        if(me.DIRECTION === 'x'){
            _barCss = 'height: 5px; position: absolute;z-index: 10; pointer-events: none;';
            _barShellCss = 'opacity: '+me._barShellOpacity+'; left:2px; bottom: 2px; right: 2px; height: 5px; position: absolute; z-index: 10; pointer-events: none;';
        }else{
            _barCss = 'width: 5px; position: absolute;z-index: 10; pointer-events: none;';
            _barShellCss = 'opacity: '+me._barShellOpacity+'; top:2px; bottom: 2px; right: 2px; width: 5px; position: absolute; z-index: 10; pointer-events: none;';
        }
        var _defaultBarCss = ' background-color: rgba(0, 0, 0, 0.5); border-radius: '+me.radius+'px; -webkit-transition: cubic-bezier(0.33, 0.66, 0.66, 1);' ;
        _barCss = _barCss + _defaultBarCss + param.barCss;
        
        me._bar.style.cssText       = _barCss;
        me._barShell.style.cssText = _barShellCss;
        me._countAboutBar();
        me._countBarSize();
        me._setBarSize();
        me._countWidthCutBarSize();
        me._barShell.appendChild(me._bar);
        me.core.parentNode.appendChild(me._barShell);
        setTimeout(function(){me._hideBar();}, 500);
    };
    SlipPx._posBar = function(pos) {};
    SlipPx.__posBarX = function(pos) { // 作用：当设置滑动的方向为“X”时用于设置滚动条的坐标 
        var me = this;
        me._bar.style.webkitTransform = 'translate3d('+pos+'px, 0px, 0px)';
        //me._bar.style['webkitTransform'] = 'translate('+pos+'px, 0px)  translateZ(0px)';
    };
    SlipPx.__posBarY = function(pos) { // 作用：当设置滑动的方向为“Y”时用于设置滚动条的坐标 
        var me = this;
        //me._bar.style['webkitTransform'] = 'translate(0px, '+pos+'px)  translateZ(0px)';
        me._bar.style.webkitTransform = 'translate3d(0px, '+pos+'px, 0px)';
    };
    SlipPx._slipBar = function() { // 流畅模式下滚动条的滑动
        var me = this;
        var pos = me._aboutBar * (me.xy + me.upRange);
        if (pos <= 0) {
            pos = 0;
        }else if(pos >= me._widthCutBarSize){
            pos = Math.round(me._widthCutBarSize);
        }
        me._posBar(pos);
        me._showBar();
    };
    SlipPx._slipBarPerfect = function() { // 完美模式下滚动条的滑动
        var me = this;
        var pos = me._aboutBar * (me.xy + me._barUpRange);
        me._bar.style[me.widthOrHeight] = me._barSize + 'px';
        if (pos < 0) {
            var size = me._barSize + pos * 3;
            me._bar.style[me.widthOrHeight] = Math.round(Math.max(size, 5)) + 'px';
            pos = 0;
        }else if (pos >= me._widthCutBarSize) {
            var size = me._barSize - (pos - me._widthCutBarSize) * 3;
            if(size < 5) {size = 5;}
            me._bar.style[me.widthOrHeight] = Math.round(size) + 'px';
            pos = Math.round(me._widthCutBarSize + me._barSize - size);
        }
        me._posBar(pos);
    };
    SlipPx._slipBarTime = function(time) { // 作用：指定时间滑动滚动条
        this._bar.style.webkitTransitionDuration = ''+time+'ms';
        this._slipBar();
    };
    SlipPx._stop = function() { // 流畅模式下的动画停止
        var me = this;
        var _realX = me._real();
        me._pos(_realX);
        if(!me.noBar){
            me._bar.style.webkitTransitionDuration = '0';
            me._posBar(me._aboutBar * _realX);
        }
    };
    SlipPx._stopPerfect = function() { // 完美模式下的动画停止
        clearTimeout(this._aniTime);
        this._animating = false;
    };
    SlipPx._realX = function() { // 作用：取得滑动X坐标
        var _realXy = getComputedStyle(this.core, null).webkitTransform.replace(/[^0-9-.,]/g, '').split(',');
        return _realXy[4] * 1;
    };
    SlipPx._realY = function() { // 作用：取得滑动Y坐标
        var _realXy = getComputedStyle(this.core, null).webkitTransform.replace(/[^0-9-.,]/g, '').split(',');
        return _realXy[5] * 1;
    };
    SlipPx._countBarSize = function() { // 作用：根据比例计算滚动条的高度
        this._barSize = Math.round(Math.max(this.parentWideHigh * this.parentWideHigh / this.wideHigh, 5));
    };
    SlipPx._setBarSize = function() { // 作用：设置滚动条的高度
        this._bar.style[this.widthOrHeight] = this._barSize + 'px';
    };
    SlipPx._countAboutBar = function() { // 作用：计算一个关于滚动条的的数值
        this._aboutBar = ((this.parentWideHigh-4) - (this.parentWideHigh-4) * this.parentWideHigh / this.wideHigh)/this.widthCutCoreWidth;
    };
    SlipPx._countWidthCutBarSize = function() { // 作用：计算一个关于滚动条的的数值
        this._widthCutBarSize = (this.parentWideHigh-4) - this._barSize;
    };
    SlipPx.refresh = function(wideHigh, parentWideHigh) {// 可在外部调用，作用：当尺寸改变时（如手机横竖屏时），需要重新取得相关的值。这时候就可以调用该函数
        var me = this;
        me._refreshCommon(wideHigh, parentWideHigh);
        if(!me.noBar){
            if(me.coreWidthCutWidth <= 0) {
                me._barShellOpacity   = 0;
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
        if (me._animating) {
            return;
        }
        if (!me._steps.length) {
            me._rebound();
            return;
        }
        step = me._steps.shift();
        if (step.x === startX) {
            step.time = 0;
        }
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
        me._barShell.style.webkitTransitionDelay = '0ms';
        me._barShell.style.webkitTransitionDuration = '0ms';
        me._barShell.style.opacity = '1';
    };
    SlipPx._hideBar = function() {// 作用：隐藏滚动条
        var me = this;
        me._barShell.style.opacity = '0';
        me._barShell.style.webkitTransitionDelay  = '300ms';
        me._barShell.style.webkitTransitionDuration = '300ms';
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
            me.triggerTarget.parentNode.style.cssText += 'overflow:scroll; -webkit-overflow-scrolling:touch;';
            return;
        }
        
        switch (me.config.MODE) {
        case 'page':
            config.DIRECTION = 'x';
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
        case 'px':
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
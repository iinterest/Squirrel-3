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
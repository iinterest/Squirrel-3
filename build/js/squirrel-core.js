/**
 * @file SQ.core
 * @version 1.0.0
 */

var SQ = SQ || {};
SQ.core = {
    /**
     * 命名空间方法
     * @method
     * @name SQ.core.namespace
     * @param {string} nameSpaceString 命名空间字符串
     * @example
     * SQ.core.namespace("SQ.modules.module2");
     */
    namespace : function (nameSpaceString) {
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
    isString : function (str) {
        return Object.prototype.toString.call(str) === "[object String]";
    },
    isArray : function (arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    },
    isNumber : function (num) {
        return Object.prototype.toString.call(num) === "[object Number]";
    },
    isBoolean : function (bool) {
        return Object.prototype.toString.call(bool) === "[object Boolean]";
    },
    isNull : function (nullObj) {
        return Object.prototype.toString.call(nullObj) === "[object Null]";
    },
    isUndefined : function (undefinedObj) {
        return Object.prototype.toString.call(undefinedObj) === "[object Undefined]";
    },
    isFunction : function (fun) {
        return Object.prototype.toString.call(fun) === "[object Function]";
    },
    isObject : function (obj) {
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
    extend : function (Child, Parent) {
        var F = function () {};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.uber = Parent.prototype;
    }
};
/**
 * @file SQ.dom
 * @version 1.0.1
 */

/**
 * @changelog
 * 1.0.1  * 简化 SQ.dom 层级
 */

SQ.dom = {
    /**
     * 存储常用的 jQuery Dom 元素
     * 在具体的业务中也可以将页面 jQuery Dom 存入 SQ.dom 对象，例如：SQ.dom.$demo = $(".demo");。
     */
    $win : $(window),
    $doc : $(document),
    $body : $("body")
};
/**
 * @file SQ.store
 * @version 1.1.0
 */

SQ.store = {
    /**
     * Cookie 操作
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
            if (!key || !me.hasLoaclStorage) {
                return;
            }
            var localDatas = localStorage.getItem(key);
            if (!localDatas) {
                return;
            }
            localDatas = localDatas.split("@");
            if (expires === undefined) {
                return localDatas[1];
            }
            // 填写了 expires 过期时间
            var inEffect = parseInt(expires, 10) * 1000 * 60 > (now - parseInt(localDatas[0], 10));
            if (inEffect) {
                //console.log("在有效期内，读取数据");
                return localDatas[1];
            } else {
                //console.log("数据已过期，请重新读取");
                return false;
            }
        },
        set: function (key, value) {
            var me = this;
            var now = new Date().getTime();
            if (!key || !value || !me.hasLoaclStorage) {
                return;
            }
            var strValue = now + "@" + JSON.stringify(value);   // 为数据添加时间戳
            localStorage.setItem(key, strValue);
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
    generate : {
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
    string : {
        // 过滤字符串首尾的空格
        trim : function(srt) {
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
    goTop : function (e) {
        e.preventDefault();
        window.scrollTo(0, 0);
    },
    goBack : function (e) {
        e.preventDefault();
        history.back();
    }
};
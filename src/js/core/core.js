/**
 * @file SQ.core
 * @version 1.0.0
 */
/*global SQ*/
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
    /**
     * 继承
     * @param Child
     * @param Parent
     */
    extend: function (Child, Parent) {
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
        var curr;
        var last_call = 0;
        var last_exec = 0;
        var timer = null;
        var diff;               // 时间差
        var context;            // 上下文
        var args;
        var exec = function () {
            last_exec = curr;
            fn.apply(context, args);
        };
        return function () {
            curr = + new Date();
            context = this;
            args = arguments;
            diff = curr - (debounce ? last_call : last_exec) - delay;
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
            last_call = curr;
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
        return SQ.throttle(fn, delay, immediate, true);
    }
};
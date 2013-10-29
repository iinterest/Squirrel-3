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
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

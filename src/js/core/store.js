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
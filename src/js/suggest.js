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
            if (XHR && SQ.core.isObject(XHR)) {
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
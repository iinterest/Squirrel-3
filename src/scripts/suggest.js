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
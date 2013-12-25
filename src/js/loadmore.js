/**
 * @file SQ.LoadMore 加载更多组件
 * @version 1.2.4
 */

/**
 * @changelog
 * 1.2.4  + 新增 RESTFUL 配置，支持 RESTful 接口风格，
 *        + 新增 XHR_TIMEOUT 配置，
 *        * 精简的验证方法。
 * 1.2.3  * 增强 CSS_INIT_STYLE 参数的兼容性，可以支持 ".style-name" 或 "style-name" 写法。
 * 1.2.2  * 修复 jshint 问题，修复 #15 问题。
 * 1.2.1  * 修复启用 localstorage 时 _render 函数得到的数据为字符串的问题。
 * 1.2.0  + 添加对 localStorage 支持，通过将 LOCAL_DATA 设置为 true 开启，通过 NUM_EXPIRES 来设置过期时间（单位：分钟）。
 * 1.1.10 * 修复点击加载是，加载出错会导致无法展示状态栏。
 * 1.1.9  + 可自定义 XHR_METHOD 为 GET 或 POST 方法，默认为 POST。
 * 1.1.8  + 添加对 IE6 的支持。
 * 1.1.7  * 为 noMore 状态添加 loaded 回调函数。
 * 1.1.6  * 去除 unbind，解决与 lazyload 插件冲突。
 * 1.1.5  + 新增 _changeBind 函数，用来改变交绑定互事件；
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
     * @param {string} config.API API               接口
     * @param {string} config.DOM_TRIGGER_TARGET    被绑定事件的 Dom 元素
     * @param {string} config.DOM_AJAX_BOX          数据展示 Dom 元素
     * @param {string} config.DOM_STATE_BOX         状态展示 Dom 元素
     * @param {string} config.CSS_INIT_STYLE        初始状态展示样式
     * @param {string} config.NUM_LOAD_POSITION     滑动加载位置，默认值：0.5
     * @param {number} config.NUM_START_PAGE_INDEX  起始页面序号，默认值：0
     * @param {number} config.NUM_SCROLL_MAX_PAGE   最大滑动加载页数，默认值：3
     * @param {number} config.NUM_SUCCESS_CODE      AJAX 成功返回码，默认值：200
     * @param {number} config.NUM_NO_MORE_CODE      无下页数据返回码，默认值：900
     * @param {string} config.TXT_LOADING_TIP       正在加载提示，默认值："正在加载请稍后..."
     * @param {string} config.TXT_INIT_TIP          初始提示文字，默认值："滑动加载更多内容"
     * @param {string} config.TXT_CLICK_TIP         触发点击交互提示文字，默认值："点击加载更多"
     * @param {string} config.TXT_LOADED_ERROR      AJAX 加载错误或超时提示，默认值："加载错误，请重试"
     * @param {string} config.TXT_UNKNOWN_ERROR     通过 AJAX 接收到的数据无法识别，默认值："未知错误，请重试"
     * @param {string} config.DATA_TYPE             设置 data 字段中的数据类型，值为 html 或 json
     *                                              当 DATA_TYPE 设为 html 时，会进行简单处理，具体见 _render 方法
     * @param {boolen} config.LOCAL_DATA Ajax       数据 loaclstorage 开关，默认为 false
     * @param {number} config.NUM_EXPIRES Ajax      数据 loaclstorage 过期时间（单位：分钟），默认为 15 分钟
     * @param {object | boolen} config.RESTFUL      当设为 true 时，程序会自动将 API 中的 ":page" 段替换为页码 (me.page)，
     *                                              也可以设置为 hash 列表，程序会遍历替换所有值。
     * @param {number} config.XHR_TIMEOUT           设置 AJAX 超时时间，默认为 5000 ms
     * @param {function} config.loading             加载阶段回调函数
     * @param {function} config.loaded              加载完成回调函数
     * @param {function} config.loadError           加载失败回调函数
     * @param {function} config.scrollEnd           滑动加载事件完成回调函数
     * @param {function} config.render              渲染阶段回调函数
     * @example var appList = new SQ.LoadMore({
            EVE_EVENT_TYPE: "scroll",
            DOM_TRIGGER_TARGET: window,
            DOM_AJAX_BOX: ".J_ajaxWrap",
            DOM_STATE_BOX: ".J_scrollLoadMore",
            CSS_INIT_STYLE: ".loadMore-btn",
            NUM_SCROLL_MAX_PAGE: 3,
            DATA_TYPE: "json",
            render: function (data) {
                // data 为 AJAX 返回数据，通常为 JSON 格式
            },
            scrollEnd: function () {
                // 添加点击模式样式
                var me = this;
                me.$stateBox.addClass("loadMore-clickState");
            }
        });
     * @requires jQuery or Zepto
     */
    function LoadMore(config) {
        var me = this;
        var i;

        me.config = {
            API: "",                                 // API 接口
            NUM_START_PAGE_INDEX: 0,                 // 起始页面序号
            NUM_LOAD_POSITION: 0.5,                  // 滑动加载位置（0.5 表示页面滑动到 50% 的位置开始加载，该值会递增）
            NUM_SCROLL_MAX_PAGE: 3,                  // 
            TXT_LOADING_TIP: "正在加载请稍后...",     // 正在加载提示
            TXT_INIT_TIP: "滑动加载更多内容",         // 初始提示文字
            TXT_CLICK_TIP: "点击加载更多",            // 触发点击交互提示文字
            TXT_LOADED_ERROR: "加载失败，请点击重试",     // Ajax 加载错误或超时提示
            TXT_UNKNOWN_ERROR: "未知错误，请重试",    // 通过 Ajax 接收到的数据无法识别
            NUM_SUCCESS_CODE: 200,
            NUM_NO_MORE_CODE: 900,
            DATA_TYPE: "json",
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

        me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET); // 触发元素
        me.$ajaxBox = $(me.config.DOM_AJAX_BOX);             // 数据展示元素
        me.$stateBox = $(me.config.DOM_STATE_BOX);           // 状态展示元素
        me.api = me.$stateBox.attr("data-api") || me.config.API;
        me.page = me.config.NUM_START_PAGE_INDEX;
        me.maxPage = me.config.NUM_SCROLL_MAX_PAGE + me.page;
        me.initStyle = me.config.CSS_INIT_STYLE.indexOf(".") === 0 ? me.config.CSS_INIT_STYLE.slice(1) : me.config.CSS_INIT_STYLE;
        me.scrollTimer = 0;                                 // 滑动事件计时器
        me.scrollDelay = 200;                               // 滑动事件触发伐值

        me.render = me.config.render;
        me.loading = me.config.loading;
        me.loaded = me.config.loaded;
        me.loadError = me.config.loadError;
        me.scrollEnd = me.config.scrollEnd;

        if (me._verify()) {
            me._init();
        }
    }
    LoadMore.prototype =  {
        construtor: LoadMore,
        version: "1.2.4",
        /**
         * 验证
         * @returns {boolean}
         * @private
         */
        _verify: function () {
            var me = this;
            // Dom 验证，触发元素、数据展示元素、状态展示元素必须都存在
            if (me.$triggerTarget.length === 0 || me.$ajaxBox.length === 0 || me.$stateBox.length === 0) {
                console.warn("SQ.loadmore: 缺少 Dom 元素");
                return false;
            }
            // API 验证
            if (!me.api) {
                console.warn("SQ.loadmore: 缺少 API 参数");
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
            me._currentState = "none";  // 设置当前状态
            me.$stateBox.addClass(me.initStyle).text(me.config.TXT_INIT_TIP);
            me._reset();
            me._bind(me.config.EVE_EVENT_TYPE);
            me.currentEventType = me.config.EVE_EVENT_TYPE; // 临时存储事件类型，以供 _changeState 判断使用。
        },
        /**
         * 重置计算参数
         * @private
         */
        _reset: function () {
            var me = this;
            var contentHeight = me._getHeight($("body")) || $("body").height();
            var winHeight = window.innerHeight || $(window).height();
            me.triggerHeight = (contentHeight - winHeight) * (me.config.NUM_LOAD_POSITION);
            if (me.config.NUM_LOAD_POSITION < 0.8) {
                me.config.NUM_LOAD_POSITION += 0.15555;
            }
        },
        /**
         * 计算页面高度
         * @param $el   jQuert 或 Zepto 元素包装集。
         * @returns {*}
         * @private
         */
        _getHeight: function ($el) {
            if ($el.get) {
                $el = $el.get(0);
            }
            if (!$el) {
                return 0;
            }
            if ($el.getBoundingClientRect) {
                return $el.getBoundingClientRect().height;
            }
            return Math.max($el.clientHeight, $el.offsetHeight, $el.scrollHeight);
        },
        /**
         * 事件绑定
         * @param {string} eventType
         * @private
         */
        _bind: function (eventType) {
            var me = this;
            me.$triggerTarget.bind(eventType, function () {
                me._trigger(eventType);
            });
        },
        /**
         * 解除事件绑定
         * @private
         */
        _unbind: function () {
            var me = this;
            me.$triggerTarget.unbind();
            //me.unbind(me.$triggerTarget, me.config.EVE_EVENT_TYPE);
        },
        /**
         * 转换绑定事件
         * @param {string} eventType
         * @private
         */
        _changeBind: function (eventType) {
            var me = this;
            //me._unbind(); //解除绑定  // 与 lazyload 插件冲突
            me.currentEventType = eventType;
            if (eventType === "click") {
                me.$triggerTarget = me.$stateBox;   //变更触发目标，并将加载触发方式更改为 click
                me._bind(eventType);   //重新绑定
            }
            if (eventType === "scroll") {
                me.$triggerTarget = $(me.config.DOM_TRIGGER_TARGET);
                me._bind(eventType);
            }
        },
        /**
         * 触发事件
         * @description 触发事件方法，在满足绑定事件条件时或满足指定触发条件的情况下调用触发方法，
         *              该方法用于集中处理触发事件，判定是否需要加载数据或者更新 UI 显示。
         * @param {string} eventType EVE_EVENT_TYPE 事件类型，"scroll" 或 "click"。
         * @private
         */
        _trigger: function (eventType) {
            var me = this;
            var isLoading = me.$stateBox.hasClass("J_loading");
            var isNoMore = me.$stateBox.hasClass("J_noMore");

            if (isLoading || isNoMore) {
                return;
            }

            if (eventType === "scroll") {
                if (me.page < me.maxPage && !me.scrollTimer) {
                    // 添加 scroll 事件相应伐值，优化其性能
                    me.scrollTimer = setTimeout(function () {
                        if (me.$triggerTarget.scrollTop() >= me.triggerHeight && !isLoading && !isNoMore) {
                            me._loadData(me._spliceApi());
                        }
                        me.scrollTimer = 0;
                    }, me.scrollDelay);
                }
                if (me.page === me.maxPage) {
                    me._changeState("scrollEnd");
                }
            }

            if (eventType === "click") {
                me._loadData(me._spliceApi());
            }
        },
        /**
         * 接口拼接
         * @returns {*|string|LoadMore.api}
         * @private
         */
        _spliceApi: function () {
            var me = this;
            var api = me.api;
            var connector = me.api.indexOf("?") === -1 ? "?" : "&";
            var j;

            if (me.config.RESTFUL) {
                api = api.replace(":page", me.page);
                for (j in me.config.RESTFUL) {
                    if (me.config.RESTFUL.hasOwnProperty(j)) {
                        api = api.replace(j, me.config.RESTFUL[j]);
                    }
                }
            } else {
                api = me.api + connector + "page=" + me.page;
            }
            return api;
        },
        /**
         * 运行状态反馈
         * @description 该方法用于记录程序运行状态，并针对不同状态做出 UI 更新及事件重新绑定等操作。
         * @param {string} state 运行状态，值包括：loading、loaded、scrollEnd、noMore、TXT_LOADED_ERROR、TXT_UNKNOWN_ERROR。
         * @private
         */
        _changeState: function (state) {
            var me = this;
            // 当预执行状态与程序当前运行状态相同时，退出状态变更方法，以避免多次重复操作。
            if (me._currentState === state) {
                return;
            }
            me._currentState = state;

            // 状态判断
            switch (state) {
            case "loading":         //正在加载阶段，添加 J_loading 标识，更新提示文字
                me.$stateBox.addClass("J_loading").show().text(me.config.TXT_LOADING_TIP);
                if (me.loading) {
                    me.loading();
                }
                break;
            case "loaded":          //加载完成
                me.$stateBox.removeClass("J_loading");

                if (me.currentState === "loadError") {
                    //me._changeBind("scroll"); // 点击加载出错会导致无法展示状态栏
                    me.currentState = undefined;
                }

                if (me.currentEventType === "scroll") {
                    me.$stateBox.hide().text("");
                }

                if (me.currentEventType === "click") {
                    me.$stateBox.text(me.config.TXT_CLICK_TIP);
                }

                me.page += 1;
                if (me.loaded) {
                    me.loaded();
                }
                break;
            case "scrollEnd":       //滑动加载次数已达到上限
                me._changeBind("click");
                me.$stateBox.show().text(me.config.TXT_CLICK_TIP);
                if (me.scrollEnd) {
                    me.scrollEnd();
                }
                break;
            case "noMore":          // 无下页数据
                //me._unbind();     // 与 lazyload 插件冲突
                me.$stateBox.addClass("J_noMore").hide();
                if (me.loaded) {
                    me.loaded();
                }
                break;
            case "loadError":     // 加载错误提示
                me.currentState = "loadError";
                me._changeBind("click");
                me.$stateBox.removeClass("J_loading").text(me.config.TXT_LOADED_ERROR);
                if (me.loadError) {
                    me.loadError();
                }
                break;
            case "unknowError":    // 服务器返回数据无法识别
                me.$stateBox.removeClass("J_loading").text(me.config.TXT_UNKNOWN_ERROR);
                break;
            }
        },
        /**
         * 数据加载
         * @param {string} api 请求数据的 API 接口。
         * @private
         */
        _loadData: function (api) {
            var me = this;
            me._changeState("loading");

            if (me.config.LOCAL_DATA) {
                var localData = SQ.store.localStorage.get(api, me.config.NUM_EXPIRES);
                localData = SQ.core.isString(localData) ? $.parseJSON(localData) : localData;
                if (localData) {
                    me._render(localData);
                    return;
                }
            }

            $.ajax({
                type: me.config.XHR_METHOD,
                url: api,
                timeout: me.config.XHR_TIMEOUT,
                success: function (data) {
                    me._render(data);
                    if (me.config.LOCAL_DATA) {
                        SQ.store.localStorage.set(api, data);
                    }
                },
                error: function () {
                    me._changeState("loadError");
                }
            });
        },
        /**
         * 数据渲染
         * @param {object} data data 服务器返回的数据
         * @private
         */
        _render: function (data) {
            var me = this;
            if (!data) {
                me._changeState("loadError");
                return;
            }
            var jsonData = SQ.core.isString(data) ? $.parseJSON(data) : data;
            if (me.config.DATA_TYPE === "html") {
                var code = parseInt(jsonData.code, 10);

                switch (code) {
                case me.config.NUM_SUCCESS_CODE:   //成功加载
                    me.$ajaxBox.append(jsonData.data);
                    me._changeState("loaded");
                    break;
                case me.config.NUM_NO_MORE_CODE:   //无下页数据
                    me.$ajaxBox.append(jsonData.data);
                    me._changeState("noMore");
                    break;
                default:
                    me._changeState("unknowError");
                }
                me._reset();
            }
            if (me.render) {
                me.render(jsonData);
            }
        }
    };
    SQ.LoadMore = LoadMore;
}($, window));
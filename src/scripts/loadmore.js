/**
 * @file SQ.LoadMore 加载更多插件
 * @version 1.6.2
 */

/**
 * @changelog
 * 1.6.2  + 新增 TXT_NOMORE_TIP 设置
 *        * 修复 click 事件下重复调用 _load 方法问题。
 *        * 修复 click 事件下 noMore 状态下仍然可以加载的问题。
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
                self.$stateBar = $('<div class="state"><i class="state-icon"></i><span class="state-txt"></span></div>');
                self.$stateTxt = self.$stateBar.find('.state-txt');
                self.$stateBar.addClass(me.initStyle);
                self.$stateTxt.text(me.settings.TXT_INIT_TIP);
                // 补充滑动距离
                if (self.currentEventType === 'scroll') {
                    self.$element.css({'min-height': winHeight - 40});
                }
                self.$element.after(self.$stateBar);
            }

            self.api = me.settings.API;
            self.index = index;
            self.page = oldState.page || me.settings.NUM_START_PAGE_INDEX;
            self.currentState = oldState.page || 'none';                                     // 设置当前状态
            self.currentEventType = oldState.event || me.settings.EVE_EVENT_TYPE;     // 临时存储事件类型，以供 _changeState 判断使用。
            if (self.currentEventType !== me.settings.EVE_EVENT_TYPE && self.currentEventType === 'click') {
                me._changeEvent('click', self);
            }
            if (me.settings.EVE_EVENT_TYPE === 'click') {
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
            me.$triggerTarget.on(eventType + '.sq.loadmore', function () {
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
                var isNoMore = self.$stateBar.hasClass('no-more');
                if (!isNoMore){
                    me._load(me._spliceApi(self), self);
                }
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
            me.$triggerTarget.off(eventType + '.sq.loadmore');
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
                self.$stateBar.addClass('no-more').removeClass('loading');
                if (me.settings.TXT_NOMORE_TIP) {
                    self.$stateTxt.text(me.settings.TXT_NOMORE_TIP);
                } else {
                    self.$stateBar.hide();
                }
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
            var currentState = self.$stateBar.data('currentState');
            if (currentState === 'loading') {
                return;
            }
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
                timeout: me.settings.XHR_TIMEOUT
            }).done(function (data) {
                me._loadedResult(data, self);
                if (me.settings.LOCAL_DATA) {
                    SQ.store.localStorage.set(api, data);
                }
            }).fail(function (data) {
                me._changeState('loadError', self);
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
            /*console.log(data, data !== undefined)
            if (!data) {
                me._changeState('loadError', self);
                return;
            }*/
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
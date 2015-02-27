/**
 * @file SQ.Modal 弹窗插件
 * @version 1.6.0
 */

/**
 * @changelog
 * 1.6.0  * 重命名为 SQ.Modal
 *        * 删除 trigget 方法，
 *        * 优化 _setModalPos 方法
 *        + 新增 DATA-API 调用方式，
 *        + 新增外部触发的事件，如 sq:modal:remove。
 * 1.5.1  * 为 ucweb 9.7 事件优化做兼容。
 * 1.5.0  * 重写插件，调用方式改为 $. 链式调用。
 * 1.0.3  * 修复 resize 导致报错的 BUG。
 * 1.0.2  * _setPopupPos 函数优化
 * 1.0.1  * 在设置了 ANIMATE 时，_setPopupPos 函数不使用 translate(-50%, -50%) 方法定位，因为会与动画产生冲突。
 *        * 修复 ANIMATE 设置问题。
 * 1.0.0  * 原 Dialog 插件重构为 Popup 插件。
 */

/*global $, SQ, console, jQuery*/
(function ($) {
    'use strict';
    /**
     * @name Modal
     * @classdesc 对话框插件。
     * @constructor
     * @param {object} config 插件配置（下面的参数为配置项，配置会写入属性）
     * @param {string} config.ANIMATE               动画类
     * @param {boolen} config.CANCEL_BTN            取消按钮显示设定，默认值：false
     * @param {string} config.CSS_CLASS             弹窗样式类，支持添加多个类：'.style1 .style2'
     * @param {string} config.CSS_POSITION          弹窗定位方式，默认值：'fixed'， 可以设置为：'absolute'
     * @param {number} config.CSS_TOP               弹窗 top 属性值
     * @param {number} config.CSS_RIGHT             弹窗 right 属性值
     * @param {number} config.CSS_BOTTOM            弹窗 bottom 属性值
     * @param {number} config.CSS_LEFT              弹窗 left 属性值
     * @param {number} config.CSS_WIDTH             弹窗 width 属性值
     * @param {number} config.CSS_HEIGHT            弹窗 height 属性值
     * @param {string} config.CSS_MASK_BACKGROUND   遮罩背景色，默认值：'#000000'
     * @param {string} config.CSS_MASK_OPACITY      遮罩透明度，默认值：0.5
     * @param {boolen} config.CANCEL_BTN            取消按钮显示设定，默认值：false
     * @param {boolen} config.CLOSE_BTN             关闭按钮显示设定，默认值：true
     * @param {number} config.DELAY                 延时显示对话框设置，单位：毫秒
     * @param {boolen} config.DISPOSABLE            设置弹窗是否是只显示一次，默认为 false
     * @param {string} config.EVE_EVENT_TYPE        绑定事件设置，默认值为：'click'
     * @param {boolen} config.HORIZONTAL            弹窗是否水平居中设定，值：'center'
     * @param {boolen} config.LOCK                  锁定操作，设为 true 将屏蔽触摸操作，默认为 false
     * @param {boolen} config.MASK                  遮罩设定，默认为 true
     * @param {number} config.NUM_CLOSE_TIME        对话框自动关闭时间，单位：毫秒
     * @param {boolen} config.OK_BTN                去掉按钮显示设定，默认值：false
     * @param {boolen} config.PREVENT_DEFAULT       默认动作响应设置，默认为 true，不响应默认操作
     * @param {boolen} config.VERTICAL              弹窗是否垂直居中设定，值：'middle'
     * @param {string} config.TXT_CLOSE_VAL         关闭按钮显示文字，默认值：'×'
     * @param {string} config.TXT_OK_VAL            确定按钮显示文字，默认值：'确定'
     * @param {string} config.TXT_CANCEL_VAL        取消按钮显示文字，默认值：'取消'
     * @param {function} config.beforeShow          打开弹窗前回调函数，该函数必须返回为 true 才能继续执行 show 函数
     * @param {function} config.show                打开弹窗回调函数
     * @param {function} config.ok                  点击确定按钮回调函数
     * @param {function} config.cancel              点击取消按钮回调函数
     * @param {function} config.close               关闭对话框回调函数
     * @param {function} config.reszie              resize 回调函数
     * @example $('.J_showFullModal').modal({
    CSS_CLASS: '.modal-demo',
    CSS_TOP: 10,
    CSS_RIGHT: 10,
    CSS_BOTTOM: 10,
    CSS_LEFT: 10,
    DISPOSABLE: true,
    beforeShow: function () {
        var me = this;
        me.$modalContent.append('全屏窗口');
        return true;
    },
    close: function () {
        tipModal('全屏窗口是一次性点击响应');
    }
});
     */

    var scope = 'sq-modal';
    var defaults = {
        EVE_EVENT_TYPE: 'click',
        CSS_POSITION: 'fixed',
        TXT_CLOSE_VAL: '×',
        TXT_OK_VAL: '确定',
        TXT_CANCEL_VAL: '取消',
        PREVENT_DEFAULT: true,
        LOCK: false,
        MASK: true,
        CSS_MASK_BACKGROUND: '#000000',
        CSS_MASK_OPACITY: 0.5,
        CLOSE_BTN: true
    };

    function Modal ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this.init();
    }

    Modal.prototype = {
        construtor: 'Modal',
        timer : undefined,
        resizeTimer : false,    // resize 
        closed : true,
        init: function () {
            var me = this;
            
            me.$win = $(window);
            me.$doc = $(document);
            me.$body = $('body');
            me.$target = $(me.settings.selector);
            me.customEvent = me.settings.selector.replace('.', ':');

            me.beforeShowFun = me.settings.beforeShow;
            me.showFun = me.settings.show;
            me.closeFun = me.settings.close;
            me.okFun = me.settings.ok;
            me.cancelFun = me.settings.cancel;
            me.resizeFun = me.settings.resize;

            me._bind();
        },
        /**
         * 事件绑定方法
         * @param {string} EVE_EVENT_TYPE 事件类型，'scroll' 或 'click'。
         * @private
         */
        _bind: function () {
            var me = this;
            var event = me.settings.DISPOSABLE ? '.sq.modal.once' : '.sq.modal';
            me.$doc.on(me.settings.EVE_EVENT_TYPE + event, me.settings.selector, function (e) {
                if (me.settings.PREVENT_DEFAULT) {
                    e.preventDefault();
                }
                if (me.settings.DISPOSABLE) {
                    me.$target.addClass('disabled');
                    me.$doc.off(me.settings.EVE_EVENT_TYPE + event);
                }
                if (me.settings.DELAY) {
                    setTimeout(function () {
                        me.show(e);
                    }, me.settings.DELAY);
                    return;
                }
                me.show(e);
            });

            me.$target.on('sq:modal:remove', function () {
                me.close();
            });
        },
        /**
         * 新建弹窗对象
         * @returns {*} $modalPanel
         * @private
         */
        _createModal: function () {
            var me = this;

            if (me.$modalPanel) {
                return me.$modalPanel;
            }
            // 初始化
            var $modalPanel = $('<div class="sq-modal"></div>');
            var $modalContent = $('<div class="content"></div>');
            var $close = $('<div class="close-btn">' + me.settings.TXT_CLOSE_VAL + '</div>');
            var $okBtn = $('<div class="ok-btn">' + me.settings.TXT_OK_VAL + '</div>');
            var $cancelBtn = $('<div class="cancel-btn">' + me.settings.TXT_CANCEL_VAL + '</div>');

            // 设置样式
            $modalPanel.css({
                'position' : me.settings.CSS_POSITION,
                'width' : me.settings.CSS_WIDTH,
                'height' : me.settings.CSS_HEIGHT,
                'z-index' : 1000
            });

            if (me.settings.CSS_CLASS) {
                var cssClasses = me.settings.CSS_CLASS.split(' ');
                var i;
                var len = cssClasses.length;
                for (i = 0; i < len; i++) {
                    var cssClass = cssClasses[i];
                    $modalPanel.addClass(cssClass.indexOf('.') === 0 ? cssClass.slice(1) : cssClass);
                }
            }
            
            // 装载内容
            $modalPanel.append($modalContent);
            // 设置显示按钮
            if (me.settings.CLOSE_BTN) {
                $modalPanel.append($close);
            }
            if (me.settings.OK_BTN) {
                $modalPanel.append($okBtn);
            }
            if (me.settings.CANCEL_BTN) {
                $modalPanel.append($cancelBtn);
            }

            $modalPanel.appendTo(me.$body);
            // 保存 Dom
            me.$modalPanel = $modalPanel;
            me.$modalContent = $modalContent;
            me.$okBtn = $okBtn;
            me.$cancelBtn = $cancelBtn;
            me.$close = $close;

            return $modalPanel;
        },
        /**
         * 设置弹窗位置
         * @private
         */
        _setModalPos: function () {
            var me = this;
            var supportBroswer = 'chrome';
            var isAnimate = me.settings.ANIMATE;
            var isMiddle = me.settings.VERTICAL === 'middle' ? true : false;
            var isCenter = me.settings.HORIZONTAL === 'center' ? true : false;
            var isSupportTransform = SQ.ua.browser.shell === 'ucweb' && SQ.ua.browser.version >= 9 || supportBroswer.indexOf(SQ.ua.browser.shell) !== -1;

            // 垂直居中时使用的 top 值，下面使用时会进行修正
            var verticalCenterTop;
            if (me.settings.CSS_POSITION === 'fixed') {
                verticalCenterTop = '50%';
            } else if (me.settings.CSS_POSITION === 'absolute') {
                var winHeight = window.innerHeight || me.$win.height();
                verticalCenterTop = me.$body.scrollTop() + winHeight / 2;
            }
            var mt = me.settings.CSS_HEIGHT ? me.settings.CSS_HEIGHT / 2 * -1 : me.$modalPanel.height() / 2 * -1;
            var ml = me.settings.CSS_WIDTH ? me.settings.CSS_WIDTH / 2 * -1 : me.$modalPanel.width() / 2 * -1;
            var css = {
                'top': me.settings.CSS_TOP || 'auto',
                'left': me.settings.CSS_LEFT || 'auto',
                'bottom': me.settings.CSS_BOTTOM || 'auto',
                'right': me.settings.CSS_RIGHT || 'auto'
            };

            // 当坐标全部未设置时给一个默认值，避免弹窗定位到页面最底部
            if (!me.settings.CSS_TOP && !me.settings.CSS_BOTTOM) {
                css.top = 0;
            }
            if (!me.settings.CSS_LEFT && !me.settings.CSS_RIGHT) {
                css.left = 0;
            }

            if (isMiddle && isCenter) {
                // 同时居中
                css.top = verticalCenterTop;
                css.left = '50%';
                if (isSupportTransform && !isAnimate) {
                    css['-webkit-transform'] = 'translate(-50%, -50%)';
                } else {
                    css['margin-top'] = mt;
                    css['margin-left'] = ml;
                }
            } else if (isMiddle) {
                // 垂直居中
                css.top = verticalCenterTop;
                if (isSupportTransform && !isAnimate) {
                    css['-webkit-transform'] = 'translateY(-50%)';
                } else {
                    css['margin-top'] = mt;
                }
            } else if (isCenter) {
                // 水平居中
                css.left = '50%';
                if (isSupportTransform && !isAnimate) {
                    css['-webkit-transform'] = 'translateX(-50%)';
                } else {
                    css['margin-left'] = ml;
                }
            }
            me.$modalPanel.css(css);
        },
        /**
         * 设置弹窗事件
         * @private
         */
        _setModalEvent : function () {
            var me = this;
            // 锁定操作
            if (me.settings.LOCK) {
                // 优化 Android 下 UCweb 浏览器触摸操作，减少滑动误操作
                // Ucweb 9.7 以后对 click 事件做了优化，取消 touchstart 默认操作会导致点击事件失效
                if (SQ.ua.os.name === 'android' && SQ.ua.browser.shell === 'ucweb' && SQ.ua.browser.version >= 9 && SQ.ua.browser.version < 9.7) {
                    me.$modalPanel.on('touchstart', function (e) {
                        e.preventDefault();
                    });
                } else {
                    me.$modalPanel.on('touchmove', function (e) {
                        e.preventDefault();
                    });
                }
                me.$modalPanel.on('mousewheel', function (e) {
                    e.preventDefault();
                });
            }
            me.$okBtn.on('click', function () {
                me.ok();
            });
            me.$cancelBtn.on('click', function () {
                me.cancel();
            });
            me.$close.on('click', function () {
                me.close();
            });
            me.$win.resize(function () {
                me.resize();
            });
        },
        _beforeShow: function (e) {
            var me = this;
            // 创建弹窗
            me.$modalPanel = me._createModal();
            // 绑定弹窗事件
            me._setModalEvent();
            // 添加动画
            if (me.settings.ANIMATE) {
                var animateClassName = me.settings.ANIMATE.indexOf('.') === 0 ? me.settings.ANIMATE.slice(1) : me.settings.ANIMATE;
                me.$modalPanel.addClass('animated ' + animateClassName);
            }
            // 为 DATA-API 模式触发自定义的 beforeShow 事件，
            // 自定义 beforeShow 事件不同于 beforeShowFun，它无法接收返回 true | false 从而判断是否继续执行
            me.$target.trigger('sq:modal:beforeShow', [me]);
            // 执行回调函数
            if (me.beforeShowFun) {
                return me.beforeShowFun(e);
            }
            return true;
        },
        /**
         * 显示对话框
         * @param e
         */
        show: function (e) {
            var me = this;
            if (!me.closed) {
                return;
            }
            if (!me._beforeShow(e)) {
                console.warn('SQ.Modal: _beforeShow function return false');
                return;
            }
            me.closed = false;
            if (me.settings.MASK) {
                me.mask();
            }
            // 为 DATA-API 模式触发自定义事件
            me.$target.trigger('sq:modal:show', [me]);
            // 执行回调函数，优先执行 show 回调函数可以确定弹窗中的内容，从而方便计算弹窗尺寸。
            if (me.showFun) {
                me.showFun(e);
            }
            // 设置弹窗位置
            me._setModalPos();
            me.$modalPanel.show();
            // 设置自动关闭
            if (me.settings.NUM_CLOSE_TIME) {
                me.time(me.settings.NUM_CLOSE_TIME);
            }
        },
        /**
         * 关闭对话框
         * @param type
         */
        close: function (type) {
            var me = this;
            // 清除定时关闭
            if (me.timer) {
                clearTimeout(me.timer);
            }
            if (me.$modalPanel) {
                me.$modalPanel.remove();
                me.$modalContent.empty();
                me.$modalPanel = null;
            }
            if (me.settings.MASK) {
                me.$mask.hide();
            }
            me.closed = true;
            // 为 DATA-API 模式触发自定义事件
            me.$target.trigger('sq:modal:close', [me]);
            if (me.closeFun && !type) {
                me.closeFun();
            }
        },
        /**
         * 定时关闭
         * @param {Number} 单位为秒, 无参数则停止计时器
         */
        time: function (second) {
            var me = this;
            if (!me.closed) {
                me.timer = setTimeout(function () {
                    me.close();
                }, second);
            }
        },
        /** 显示遮罩 */
        mask: function () {
            var me = this;
            var bodyH = me.$body.height();
            var winH = me.$win.height();
            var h = bodyH > winH ? bodyH : winH;
            var $mask = me.$mask || $('.sq-mask').length > 0 ? $('.sq-mask') : undefined;

            if ($mask) {
                $mask.css({
                    'width' : '100%',
                    'height' : h
                });
                $mask.show();
            } else {
                $mask = $('<div class="sq-mask"></div>');
                $mask.css({
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'right': 0,
                    'width': '100%',
                    'height': h,
                    'background': me.settings.CSS_MASK_BACKGROUND,
                    'opacity': me.settings.CSS_MASK_OPACITY,
                    'z-index': 999
                }).appendTo(me.$body);

                if (me.settings.LOCK) {
                    $mask.on('touchstart', function (e) {
                        e.preventDefault();
                    });
                    $mask.on('mousewheel', function (e) {
                        e.preventDefault();
                    });
                }
            }
            me.$mask = $mask;
        },
        ok: function (e) {
            var me = this;
            me.close('ok');
            // 为 DATA-API 模式触发自定义事件
            me.$target.trigger('sq:modal:ok', [me]);
            if (me.okFun) {
                me.okFun(e);
            }
        },
        cancel: function (e) {
            var me = this;
            me.close('cancel');
            // 为 DATA-API 模式触发自定义事件
            me.$target.trigger('sq:modal:cancel', [me]);
            if (me.cancelFun) {
                me.cancelFun(e);
            }
        },
        resize: function () {
            var me = this;
            if (me.$modalPanel) {
                me._setModalPos();
            }
        }
    };

    $.fn.modal = function ( options ) {
        var isZepto = typeof Zepto !== 'undefined' ? true : false;
        var isJQuery = typeof jQuery !== 'undefined' ? true : false;
        var plugin;
        var me = this;

        if (SQ.isObject(options)) {
            options = options || {};
            // 当使用 $(this).modal({...}) 调用时，无法获取 this.selector 值，
            // 所以去手动获取该 DOM 的类名
            options.selector = this.selector || '.' + this[0].className.split(' ').join('.');
        }

        // 如果页面中没有指定的 Dom 则生成一个插入到文档中，避免因 trigger() 触发 Modal 时找不到该 Dom 而报错。
        if ($(this.selector).length === 0) {
            me = $('<div class="' + this.selector.slice(1) + '" style="display:none"></div>');
            me.selector = this.selector;
            $('body').append(me);
        }
        
        
        me.each(function() {
            if (isJQuery) {
                if ( !$.data( this, scope ) ) {
                    $.data( this, scope, new Modal( me, options ) );
                }
            } else if (isZepto) {
                if (!me.data(scope)) {
                    plugin = new Modal( me, options );
                    me.data(scope, 'initialized');
                }
            }
        });
        // chain jQuery functions
        return me;
    };


    // DATA-API
    // ===============
    $(document).ready(function () {
        $('[data-'+ scope +']').each(function () {
            var $me = $(this);
            var pluginSetting = $me.data(scope);
            if (SQ.isObject(pluginSetting)) {
                $me.modal(pluginSetting);
            }
        });
    });
})($);
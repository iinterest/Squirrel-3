/**
 * @file SQ.TouchSlip 触摸滑动组件
 * @data 2013.7.10
 * @version 1.0.0
 */

/*global
 $: false,
 SQ: true,
 Zepto: true
 */

define(function(require, exports, module) {
    var SQ = require("core");
    _fun = {
        ios: function () { // 作用：判断是否为苹果的IOS设备
            var regularResult = navigator.userAgent.match(/.*OS\s([\d_]+)/),
                isiOS = !!regularResult;
            if (!this._versionValue && isiOS) {
                this._versionValue = regularResult[1].replace(/_/g, '.');
            }
            this.ios = function () {
                return isiOS;
            };
            return isiOS;
        },
        version: function () { // 作用：返回IOS的版本号
            return this._versionValue;
        },
        clone: function (object) { // 作用：用于原型继承
            function f() {}
            f.prototype = object;
            return new f();
        }
    };

    var slipjs = {
        _refreshCommon: function (wide_high, parent_wide_high) { // 作用：当尺寸改变时，需要重新取得相关的值
            var me = this;
            me.wide_high = wide_high || me.core[me.offset] - me.up_range;
            me.parent_wide_high      = parent_wide_high      || me.core.parentNode[me.offset];
            me._getCoreWidthSubtractShellWidth();
        },
        _initCommon: function (core, param) { // 作用：初始化
            var me = this;
            me.core = core;
            me.startFun    = param.startFun;
            me.moveFun     = param.moveFun;
            me.touchEndFun = param.touchEndFun;
            me.endFun      = param.endFun;
            me.DIRECTION   = param.DIRECTION;
            me.up_range    = param.up_range   || 0;
            me.down_range  = param.down_range  || 0;
            if (me.DIRECTION === 'x') {
                me.offset = 'offsetWidth';
                me._pos   = me.__posX;
            } else {
                me.offset = 'offsetHeight';
                me._pos   = me.__posY;
            }
            me.wide_high       = param.wide_high || me.core[me.offset] - me.up_range;
            me.parent_wide_high   = param.parent_wide_high || me.core.parentNode[me.offset];
            me._getCoreWidthSubtractShellWidth();

            me._bind("touchstart");
            me._bind("touchmove");
            me._bind("touchend");
            me._bind("webkitTransitionEnd");

            me.xy = 0;
            me.y = 0;
            me._pos(-me.up_range);
        },
        _getCoreWidthSubtractShellWidth: function () { // 作用：取得滑动对象和它父级元素的宽度或者高度的差
            var me = this;
            me.width_cut_coreWidth = me.parent_wide_high - me.wide_high;
            me.coreWidth_cut_width = me.wide_high - me.parent_wide_high;
        },
        handleEvent: function (e) { // 作用：简化addEventListener的事件绑定
            switch (e.type) {
            case "touchstart":
                this._start(e);
                break;
            case "touchmove":
                this._move(e);
                break;
            case "touchend":
            case "touchcancel":
                this._end(e);
                break;
            case "webkitTransitionEnd":
                this._transitionEnd(e);
                break;
            }
        },
        _bind: function (type, boole) { // 作用：事件绑定
            this.core.addEventListener(type, this, !!boole);
        },
        _unBind: function (type, boole) { // 作用：事件移除
            this.core.removeEventListener(type, this, !!boole);
        },
        __posX: function (x) { // 作用：当设置滑动的方向为“X”时用于设置滑动元素的坐标
            this.xy = x;
            this.core.style['webkitTransform'] = 'translate3d(' + x + 'px, 0px, 0px)';
            //this.core.style['webkitTransform'] = 'translate('+x+'px, 0px) scale(1) translateZ(0px)';
        },
        __posY: function (x) { // 作用：当设置滑动的方向为“Y”时用于设置滑动元素的坐标
            this.xy = x;
            this.core.style['webkitTransform'] = 'translate3d(0px, ' + x + 'px, 0px)';
            //this.core.style['webkitTransform'] = 'translate(0px, '+x+'px) scale(1) translateZ(0px)';
        },
        _posTime: function (x, time) { // 作用：缓慢移动
            this.core.style.webkitTransitionDuration = time + 'ms';
            this._pos(x);
        }
    };

    var SlipPage = _fun.clone(slipjs);
    //function SlipPage() {}
    //SQ.util.extend(SlipPage, slipjs);

    SlipPage._init = function (core, param) { // 作用：初始化
        var me           = this;
        me._initCommon(core, param);
        me.NUM_PAGES           = param.NUM_PAGES;
        me.page          = 0;
        me.AUTO_TIMER   = param.AUTO_TIMER;
        me.lastPageFun   = param.lastPageFun;
        me.firstPageFun  = param.firstPageFun;
        param.AUTO_TIMER && me._autoChange();
        param.no_follow ? (me._move = me._moveNoMove, me.next_time = 500) : me.next_time = 300;
    };
    SlipPage._start = function(e) { // 触摸开始
        var me = this,
            e = e.touches[0];
        me._abrupt_x     = 0;
        me._abrupt_x_abs = 0;
        me._start_x = me._start_x_clone = e.pageX;
        me._start_y = e.pageY;
        me._movestart = undefined;
        me.AUTO_TIMER && me._stop();
        me.startFun && me.startFun(e);
    };
    SlipPage._move = function(evt) { // 触摸中,跟随移动
        var me = this;
        me._moveShare(evt);
        if(!me._movestart){
            var e = evt.touches[0];
            evt.preventDefault();
            me.offset_x = (me.xy > 0 || me.xy < me.width_cut_coreWidth) ? me._dis_x/2 + me.xy : me._dis_x + me.xy;
            me._start_x  = e.pageX;
            if (me._abrupt_x_abs < 6) {
                me._abrupt_x += me._dis_x;
                me._abrupt_x_abs = Math.abs(me._abrupt_x);
                return;
            }
            me._pos(me.offset_x);
            me.moveFun && me.moveFun(e);
        }
    };
    SlipPage._moveNoMove = function(evt) { // 触摸中,不跟随移动，只记录必要的值
        var me = this;
        me._moveShare(evt);
        if(!me._movestart){
            evt.preventDefault();
            me.moveFun && me.moveFun(e);
        }
    };
    SlipPage._moveShare = function(evt) { // 不跟随移动和跟随移动的公共操作
        var me = this,
        e = evt.touches[0];
        me._dis_x = e.pageX - me._start_x;
        me._dis_y = e.pageY - me._start_y;	
        typeof me._movestart == "undefined" && (me._movestart = !!(me._movestart || Math.abs(me._dis_x) < Math.abs(me._dis_y)));
    };
    SlipPage._end = function(e) { // 触摸结束
        if (!this._movestart) {
            var me = this;
            me._end_x = e.changedTouches[0].pageX;
            me._range = me._end_x - me._start_x_clone;
            if(me._range > 35){
                me.page != 0 ? me.page -= 1 : (me.firstPageFun && me.firstPageFun(e));
            }else if(Math.abs(me._range) > 35){
                me.page != me.NUM_PAGES - 1 ? me.page += 1 : (me.lastPageFun && me.lastPageFun(e));
            }
            me.toPage(me.page, me.next_time);
            me.touchEndFun && me.touchEndFun(e);
        }
    };
    SlipPage._transitionEnd = function(e) { // 动画结束
        var me = this;
        e.stopPropagation();
        me.core.style.webkitTransitionDuration = '0';
        me._stop_ing && me._autoChange(), me._stop_ing = false;
        me.endFun && me.endFun();
    };
    SlipPage.toPage = function(num, time) { // 可在外部调用的函数，指定轮换到第几张，只要传入：“轮换到第几张”和“时间”两个参数。
        this._posTime(-this.parent_wide_high * num, time || 0);
        this.page = num;
    };
    SlipPage._stop = function() { // 作用：停止自动轮换
        clearInterval(this._autoChangeSet);
        this._stop_ing = true;
    };
    SlipPage._autoChange = function() { // 作用：自动轮换
        var me = this;
        me._autoChangeSet = setInterval(function() {
            me.page != me.NUM_PAGES - 1 ? me.page += 1 : me.page = 0;
            me.toPage(me.page, me.next_time);
        },me.AUTO_TIMER);
    };
    SlipPage.refresh = function(wide_high, parent_wide_high) { // 可在外部调用，作用：当尺寸改变时（如手机横竖屏时），需要重新取得相关的值。这时候就可以调用该函数
        this._refreshCommon(wide_high, parent_wide_high);
    };
            
    var SlipPx = _fun.clone(slipjs);
    //function SlipPx() {}
    //SQ.util.extend(SlipPx, slipjs);

    SlipPx._init = function(core,param) { // 作用：初始化
        var me  = this;
        me._initCommon(core,param);
        me.perfect     = param.perfect;
        me.SHOW_SCROLL_BAR = param.SHOW_SCROLL_BAR;
        if(me.DIRECTION == 'x'){
            me.page_x          = "pageX";
            me.page_y          = "pageY";
            me.width_or_height = "width";
            me._real           = me._realX;
            me._posBar         = me.__posBarX;
        }else{
            me.page_x          = "pageY";
            me.page_y          = "pageX";
            me.width_or_height = "height";
            me._real           = me._realY;
            me._posBar         = me.__posBarY;
        }
        if(me.perfect){
            me._transitionEnd = function(){};
            me._stop          = me._stopPerfect;
            me._slipBar       = me._slipBarPerfect;
            me._posTime       = me._posTimePerfect;
            me._bar_upRange   = me.up_range;
            me.no_bar         = false;
            me._slipBarTime   = function(){};
        }else{
            me.no_bar   = param.no_bar;
            me.core.style.webkitTransitionTimingFunction = "cubic-bezier(0.33, 0.66, 0.66, 1)";
        }
        if(me.SHOW_SCROLL_BAR){
            me._hideBar = function(){};
            me._showBar = function(){};
        }
        if(_fun.ios()){
            me.radius = 11;
        }else{
            me.radius = 0;
        }
        if(!me.no_bar){
            me._insertSlipBar(param);
            if(me.coreWidth_cut_width <= 0){
                me._bar_shell_opacity = 0;
                me._showBarStorage    = me._showBar;
                me._showBar           = function(){};	
            }
        }else{
            me._hideBar = function(){};
            me._showBar = function(){};
        }
    };
    SlipPx._start = function(e) { // 触摸开始
        var me = this,
            e = e.touches[0];
            me._animating = false;
        me._steps = [];
        me._abrupt_x     = 0;
        me._abrupt_x_abs = 0;
        me._start_x = me._start_x_clone = e[me.page_x];
        me._start_y = e[me.page_y];
        me._start_time = e.timeStamp || Date.now();
        me._movestart = undefined;
        !me.perfect && me._need_stop && me._stop();
        me.core.style.webkitTransitionDuration = '0';
        me.startFun && me.startFun(e);
    };
    SlipPx._move = function(evt) { // 触摸中
        var me = this,                   
            e = evt.touches[0],
            _e_page = e[me.page_x],
            _e_page_other = e[me.page_y],
            that_x = me.xy;
        me._dis_x = _e_page - me._start_x;
        me._dis_y = _e_page_other - me._start_y;
        (me.DIRECTION == 'x' && typeof me._movestart == "undefined") && (me._movestart = !!(me._movestart || (Math.abs(me._dis_x) < Math.abs(me._dis_y))));
        
        if(!me._movestart){
            evt.preventDefault();
            me._move_time = e.timeStamp || Date.now();
            me.offset_x = (that_x > 0 || that_x < me.width_cut_coreWidth - me.up_range) ? me._dis_x/2 + that_x : me._dis_x + that_x;    
            me._start_x = _e_page;
            me._start_y = _e_page_other;
            me._showBar();
            if (me._abrupt_x_abs < 6 ) {
                me._abrupt_x += me._dis_x;
                me._abrupt_x_abs = Math.abs(me._abrupt_x);
                return;
            }
            me._pos(me.offset_x);
            me.no_bar || me._slipBar();
            if (me._move_time - me._start_time > 300) {
                me._start_time    = me._move_time;
                me._start_x_clone = _e_page;
            }
            me.moveFun && me.moveFun(e);
        }
    };
    SlipPx._end = function(e) { // 触摸结束
        if (!this._movestart) {
            var me = this,
                e = e.changedTouches[0],
                duration = (e.timeStamp || Date.now()) - me._start_time,
                fast_dist_x = e[me.page_x] - me._start_x_clone;
            me._need_stop = true;
            if(duration < 300 && Math.abs(fast_dist_x) > 10) {
                if (me.xy > -me.up_range || me.xy < me.width_cut_coreWidth) {
                    me._rebound();
                }else{
                    var _momentum = me._momentum(fast_dist_x, duration, -me.xy - me.up_range, me.coreWidth_cut_width + (me.xy), me.parent_wide_high);
                    me._posTime(me.xy + _momentum.dist, _momentum.time);
                    me.no_bar || me._slipBarTime(_momentum.time);
                }
            }else{
                me._rebound();
            }
            me.touchEndFun && me.touchEndFun(e);
        }
    };
    SlipPx._transitionEnd = function(e) { // 滑动结束
        var me = this;
        if (e.target != me.core) return;
        me._rebound();
        me._need_stop = false;
    };
    SlipPx._rebound = function(time) { // 作用：滑动对象超出时复位
        var me = this,
            _reset = (me.coreWidth_cut_width <= 0) ? 0 : (me.xy >= -me.up_range ? -me.up_range : me.xy <= me.width_cut_coreWidth - me.up_range ? me.width_cut_coreWidth - me.up_range : me.xy);
        if (_reset == me.xy) {
            me.endFun && me.endFun();
            me._hideBar();
            return;
        }
        me._posTime(_reset, time || 400);
        me.no_bar || me._slipBarTime(time);
    };
    SlipPx._insertSlipBar = function(param) { // 插入滚动条
        var me = this;
        me._bar       = document.createElement('div');
        me._bar_shell = document.createElement('div');
        if(me.DIRECTION == 'x'){
            var _bar_css = 'height: 5px; position: absolute;z-index: 10; pointer-events: none;';
            var _bar_shell_css      = 'opacity: '+me._bar_shell_opacity+'; left:2px; bottom: 2px; right: 2px; height: 5px; position: absolute; z-index: 10; pointer-events: none;';
        }else{
            var _bar_css = 'width: 5px; position: absolute;z-index: 10; pointer-events: none;';
            var _bar_shell_css      = 'opacity: '+me._bar_shell_opacity+'; top:2px; bottom: 2px; right: 2px; width: 5px; position: absolute; z-index: 10; pointer-events: none; ';
        }
        var _default_bar_css = ' background-color: rgba(0, 0, 0, 0.5); border-radius: '+me.radius+'px; -webkit-transition: cubic-bezier(0.33, 0.66, 0.66, 1);' ;
        var _bar_css = _bar_css + _default_bar_css + param.bar_css;
        
        me._bar.style.cssText       = _bar_css;
        me._bar_shell.style.cssText = _bar_shell_css
        me._countAboutBar();
        me._countBarSize();
        me._setBarSize();
        me._countWidthCutBarSize();
        me._bar_shell.appendChild(me._bar);
        me.core.parentNode.appendChild(me._bar_shell);
        setTimeout(function(){me._hideBar();}, 500);
    };
    SlipPx._posBar = function(pos) {};
    SlipPx.__posBarX = function(pos) { // 作用：当设置滑动的方向为“X”时用于设置滚动条的坐标 
        var me = this;
        me._bar.style['webkitTransform'] = 'translate3d('+pos+'px, 0px, 0px)';
        //me._bar.style['webkitTransform'] = 'translate('+pos+'px, 0px)  translateZ(0px)';
    };
    SlipPx.__posBarY = function(pos) { // 作用：当设置滑动的方向为“Y”时用于设置滚动条的坐标 
        var me = this;
        //me._bar.style['webkitTransform'] = 'translate(0px, '+pos+'px)  translateZ(0px)';
        me._bar.style['webkitTransform'] = 'translate3d(0px, '+pos+'px, 0px)';
    };
    SlipPx._slipBar = function() { // 流畅模式下滚动条的滑动
        var me = this;
        var pos = me._about_bar * (me.xy + me.up_range);
        if (pos <= 0) {
            pos = 0;
        }else if(pos >= me._width_cut_barSize){
            pos = Math.round(me._width_cut_barSize);
        } 
        me._posBar(pos);
        me._showBar();
    };
    SlipPx._slipBarPerfect = function() { // 完美模式下滚动条的滑动
        var me = this;
        var pos = me._about_bar * (me.xy + me._bar_upRange);
        me._bar.style[me.width_or_height] = me._bar_size + 'px';
        if (pos < 0) {
            var size = me._bar_size + pos * 3;
            me._bar.style[me.width_or_height] = Math.round(Math.max(size, 5)) + 'px';
            pos = 0;
        }else if(pos >= me._width_cut_barSize){
            var size = me._bar_size - (pos - me._width_cut_barSize) * 3;
            if(size < 5) {size = 5;}
            me._bar.style[me.width_or_height] = Math.round(size) + 'px';
            pos = Math.round(me._width_cut_barSize + me._bar_size - size);
        }
        me._posBar(pos);
    };
    SlipPx._slipBarTime = function(time) { // 作用：指定时间滑动滚动条
        this._bar.style.webkitTransitionDuration = ''+time+'ms';
        this._slipBar();
    };
    SlipPx._stop = function() { // 流畅模式下的动画停止
        var me = this,
            _real_x = me._real();
        me._pos(_real_x);
        if(!me.no_bar){
            me._bar.style.webkitTransitionDuration = '0';
            me._posBar(me._about_bar * _real_x);
        }	
    };
    SlipPx._stopPerfect = function() { // 完美模式下的动画停止
        clearTimeout(this._aniTime);
        this._animating = false;
    };
    SlipPx._realX = function() { // 作用：取得滑动X坐标
        var _real_xy = getComputedStyle(this.core, null)['webkitTransform'].replace(/[^0-9-.,]/g, '').split(',');
        return _real_xy[4] * 1;
    };
    SlipPx._realY = function() { // 作用：取得滑动Y坐标
        var _real_xy = getComputedStyle(this.core, null)['webkitTransform'].replace(/[^0-9-.,]/g, '').split(',');
        return _real_xy[5] * 1;
    };
    SlipPx._countBarSize = function() { // 作用：根据比例计算滚动条的高度
        this._bar_size = Math.round(Math.max(this.parent_wide_high * this.parent_wide_high / this.wide_high, 5));
    };
    SlipPx._setBarSize = function() { // 作用：设置滚动条的高度
        this._bar.style[this.width_or_height] = this._bar_size + 'px';
    };
    SlipPx._countAboutBar = function() { // 作用：计算一个关于滚动条的的数值
        this._about_bar = ((this.parent_wide_high-4) - (this.parent_wide_high-4) * this.parent_wide_high / this.wide_high)/this.width_cut_coreWidth;
    };
    SlipPx._countWidthCutBarSize = function() { // 作用：计算一个关于滚动条的的数值
        this._width_cut_barSize = (this.parent_wide_high-4) - this._bar_size;
    };
    SlipPx.refresh = function(wide_high, parent_wide_high) {// 可在外部调用，作用：当尺寸改变时（如手机横竖屏时），需要重新取得相关的值。这时候就可以调用该函数
        var me = this;
        me._refreshCommon(wide_high, parent_wide_high);
        if(!me.no_bar){
            if(me.coreWidth_cut_width <= 0) {
                me._bar_shell_opacity   = 0;
                me._showBar       = function(){};	
            }else{
                me._showBar = me._showBarStorage || me._showBar;
                me._countAboutBar();
                me._countBarSize();
                me._setBarSize();
                me._countWidthCutBarSize();
            }
        }
        me._rebound(0);
    };
    SlipPx._posTimePerfect = function (x, time) { // 作用：完美模式下的改变坐标函数
        var me = this,
            step = x,
            i, l;
        me._steps.push({ x: x, time: time || 0 });
        me._startAni();
    };
    SlipPx._startAni = function () {// 作用：完美模式下的改变坐标函数
        var me = this,
            startX = me.xy,
            startTime = Date.now(),
            step, easeOut,
            animate;
        if (me._animating) return;
        if (!me._steps.length) {
            me._rebound();	
            return;
        }
        step = me._steps.shift();
        if (step.x == startX) step.time = 0;
        me._animating = true;
        animate = function () {
            var now = Date.now(),
                newX;
            if (now >= startTime + step.time) {
                me._pos(step.x);
                me._animating = false;
                me._startAni();
                return;
            }
            now = (now - startTime) / step.time - 1;
            easeOut = Math.sqrt(1 - now * now);
            newX = (step.x - startX) * easeOut + startX;
            me._pos(newX);
            if (me._animating) {
                me._slipBar();
                me._aniTime = setTimeout(animate, 1);
            }
        };
        animate();
    };
    SlipPx._momentum = function (dist, time, maxDistUpper, maxDistLower, size) { // 作用：计算惯性
        var deceleration = 0.001,
            speed = Math.abs(dist) / time,
            newDist = (speed * speed) / (2 * deceleration),
            newTime = 0, outsideDist = 0;
        if (dist > 0 && newDist > maxDistUpper) {
            outsideDist = size / (6 / (newDist / speed * deceleration));
            maxDistUpper = maxDistUpper + outsideDist;
            speed = speed * maxDistUpper / newDist;
            newDist = maxDistUpper;
        } else if (dist < 0 && newDist > maxDistLower) {
            outsideDist = size / (6 / (newDist / speed * deceleration));
            maxDistLower = maxDistLower + outsideDist;
            speed = speed * maxDistLower / newDist;
            newDist = maxDistLower;
        }
        newDist = newDist * (dist < 0 ? -1 : 1);
        newTime = speed / deceleration;
        return { dist: newDist, time: newTime };
    };
    SlipPx._showBar = function() {// 作用：显示滚动条
        var me = this;
        me._bar_shell.style.webkitTransitionDelay = "0ms";
        me._bar_shell.style.webkitTransitionDuration = '0ms';
        me._bar_shell.style.opacity = "1";
    };
    SlipPx._hideBar = function() {// 作用：隐藏滚动条
        var me = this;
        me._bar_shell.style.opacity = "0";
        me._bar_shell.style.webkitTransitionDelay  = "300ms";
        me._bar_shell.style.webkitTransitionDuration = '300ms';
    };

    function TouchSlip(config) {
        var me = this;
        var i;

        me.config = {

        };

        for (i in config) {
            if (config.hasOwnProperty(i)) {
                me.config[i] = config[i];
            }
        }

        me.triggerTarget = $(me.config.DOM_TRIGGER_TARGET)[0];

        if (_fun.ios() && (parseInt(_fun.version()) >= 5 && config.DIRECTION === 'x') && config.wit) {
            me.triggerTarget.parentNode.style.cssText += "overflow:scroll; -webkit-overflow-scrolling:touch;";
            return;
        }
        
        switch (me.config.MODE) {
        case "page":
            config.DIRECTION = "x";
            if (!this.SlipPage) {
                this.SlipPage = true;
                SlipPage._init(me.triggerTarget, config);
                return SlipPage;
            } else {
                var page = _fun.clone(SlipPage);
                page._init(me.triggerTarget, config);
                return page;
            }
            break;
        case "px":
            if (!this.SlipPx) {
                this.SlipPx = true;
                SlipPx._init(me.triggerTarget, config);
                return SlipPx;
            } else {
                var Px = _fun.clone(SlipPx);
                Px._init(me.triggerTarget, config);
                return Px;
            }
            break;
        }
        
    }
    module.exports = TouchSlip;
});
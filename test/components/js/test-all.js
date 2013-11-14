/*global
 $: false,
 SQ: true,
 Zepto: true,
 config: true
 */
"use strict";
//----------------------------------------------------------------------------
// Dialog test
//----------------------------------------------------------------------------
var dialogDemo1 = new SQ.Dialog({
    EVE_EVENT_TYPE : "click",
    DOM_TRIGGER_TARGET : ".J_showDemo1",
    TXT_CLOSE_VAL : "&times;",
    CSS_STYLE : ".dialog-demo1",
    FULLSCREEN_OFFSET : [20, 20],
    ANIMATE : ".bounceIn",
    MASK : true,
    LOCK : true,
    DESTROY : true,
    show : function () {
        var me = this;
        me.$dialogContent.append("<p class='demo-text'>单次响应的全屏窗口示例</p>");
    },
    resize : function () {

    }
});
var dialogDemo2 = new SQ.Dialog({
    EVE_EVENT_TYPE : "click",
    DOM_TRIGGER_TARGET : ".J_showDemo2",
    CSS_STYLE : ".dialog-demo2",
    CSS_WIDTH : 240,
    CSS_HEIGHT : 150,
    VERTICAL : "middle",
    HORIZONTAL : "center",
    //MASK : true,
    //LOCK : true,
    show : function () {
        var me = this;
        me.$dialogContent.append("<p class='demo-text'>固定尺寸窗口</p>");
        $(".J_closeBtn").off("click").on("click", function () {
            me.$okBtn.trigger("click");
        });
    },
    ok : function () {

    },
    cancel : function () {

    }
});
var dialogDemo3 = new SQ.Dialog({
    EVE_EVENT_TYPE : "click",
    DOM_TRIGGER_TARGET : ".J_showDemo3",
    CSS_STYLE : ".dialog-demo3",
    CSS_WIDTH : 240,
    CSS_HEIGHT : 100,
    VERTICAL : "middle",
    HORIZONTAL : "center",
    NUM_CLOSE_TIME : 2000,
    MASK : true,
    show : function () {
        var me = this;
        me.$dialogContent.append("<p class='demo-text'>2 秒后自动关闭</p>");
    },
    ok : function () {

    },
    cancel : function () {

    }
});

//----------------------------------------------------------------------------
// LazyLoad test
//----------------------------------------------------------------------------
var imglazyload = new SQ.LazyLoad({
    DOM_LAZY_ITEMS : ".J_lazyload",
    DOM_LAZY_PARENT : ".sq-list .icon",
    CSS_PLACEHOLDER : ".default-icon",
    IMG_PLACEHOLDER : "images/sq-icon.png",
    NUM_THRESHOLD : 250
});

//----------------------------------------------------------------------------
// LoadMore test
//----------------------------------------------------------------------------
var LoadMoreDemo = new SQ.LoadMore({
    EVE_EVENT_TYPE : "scroll",
    DOM_TRIGGER_TARGET : window,
    DOM_AJAX_BOX : ".J_ajaxWrap",
    DOM_STATE_BOX : ".J_scrollLoadMore",
    CSS_INIT_STYLE : "sq-loadMore-btn",
    //NUM_START_PAGE_INDEX : 1,
    //NUM_SCROLL_MAX_PAGE : 3,
    DATA_TYPE : "html",
    //LOCAL_DATA : true,
    render : function (data) {
        //console.log("render: " + data);
    },
    scrollEnd : function () {
        var me = this;
        me.$stateBox.addClass("sq-loadMore-clickState");
        //console.log("scrollEnd");
    },
    loaded : function () {
        var me = this;
        console.log(me.page);
        /*if (me.page === 3) {
            me.api = "data/list-900.json";
        }*/
        // 模拟第 n 次滑动加载失败
        if (me.page === 3) {
            me.api = "data/list-error.json";
        }
        //console.log("loaded");
    },
    loadError : function () {
        var me = this;
        //console.log(me.api)
        // 模拟滑动加载在点击加载后恢复正常
        me.api = "data/list.json";
        //console.log("loadError");
    }
});

//----------------------------------------------------------------------------
// TouchSlip test
//----------------------------------------------------------------------------
(function imgSlider() {
    // 图片画廊，横向滑动的图片
    var $imgSlider = $(".touch-img-slider").find("ul");
    var $dot = $(".dot").find("i");
    var len = $imgSlider.find(".touch-item").length;
    var W = len * 290;

    $imgSlider.width(W);

    function changeScreenEndFun() {
        $dot.removeClass("active");
        $dot.eq(this.page).addClass("active");
    }

    var picSlider = SQ.TouchSlip({
        MODE : "page",
        DOM_TRIGGER_TARGET : ".J_imgSlider",
        AUTO_TIMER: 5000,
        NUM_PAGES: 3,
        endFun: changeScreenEndFun
    });
}());

//----------------------------------------------------------------------------
// Suggest test
//----------------------------------------------------------------------------
(function suggest() {
    function renderSuggestPanel(me, ds) {
        SQ.TEMP = SQ.TEMP || {};
        var searchUri = config.search_URI + "&keyword=";
        var suggestList = "<ul>";
        var keywordList = "";
        var i, len;
        keywordList = ds.data;
        len = keywordList.length;

        if (len === 0) {
            return;
        }

        for (i = 0; i < len; i++) {
            var item = keywordList[i];
            if (!item.appName) {
                suggestList += '<li class="keyword"><a href="' + searchUri + item.keyword + '">' + item.keyword + '</a></li>';
            }
        }
        suggestList += "</ul>";
        me.$suggestPanel.append(suggestList).show();
    }

    var suggestTips = new SQ.Suggest({
        DOM_INPUT : ".J_searchInput",
        DOM_CLEAR_BTN : ".J_clearInput",
        DOM_SUGGEST_PANEL : ".J_suggest",
        API_URL : config.search_API,
        show : function (ds) {
            var me = this;
            renderSuggestPanel(me, ds);
        }
    });
}());

//----------------------------------------------------------------------------
// Tabs test
//----------------------------------------------------------------------------
function renderPanelContent(ds, $panel) {
    var hasLoadTab = $panel.find(".J_hasLoadTab").length > 0 ? true : false;
    // 选项卡异步加载
    if (!hasLoadTab && !SQ.core.isNull(ds)) {
        var $tabLoadWrap = $panel.find(".J_tabLoadWrap");
        $tabLoadWrap.addClass("J_hasLoadTab").append(ds.data);
    }
}

function creatLoadMore($panel, tabIndex) {
    // 清除原有滑动加载内容
    $(".J_scrollLoadWrap").remove();
    $(window).off("scroll");

    var index = parseInt(tabIndex, 10) + 1;
    var $appListWrap = $('<div class="sq-list vertical J_scrollLoadWrap"></div>');
    var $ul = $('<ul class="J_ajaxWrap'+ index +'"></div>');
    var $loadMore = $('<div class="J_scrollLoadMore' + index +' J_tabBtn" data-api="data/tabs'+ index +'.json"></div>');
    $appListWrap.append($ul).append($loadMore);
    $panel.append($appListWrap);

    var appList = new SQ.LoadMore({
        EVE_EVENT_TYPE: "scroll",
        DOM_TRIGGER_TARGET: window,
        DOM_AJAX_BOX: ".J_ajaxWrap" + index,
        DOM_STATE_BOX: ".J_scrollLoadMore" + index,
        CSS_INIT_STYLE: "sq-loadMore-btn",
        DATA_TYPE: "html",
        NUM_SCROLL_MAX_PAGE: 2
    });
}

var tabs = new SQ.Tabs({
    EVE_EVENT_TYPE: "click",
    DOM_TRIGGER_TARGET: ".J_tabs",
    DOM_TABS: ".tabs>li",
    DOM_PANELS: ".panels",
    //API_URL: "data/content.json",
    API_URL: ["data/tabs1.json", "data/tabs2.json", "data/tabs3.json"],
    CSS_LOADING_TIP: "tab-loading-tip",
    NUM_ACTIVE: 0,
    LOCAL_DATA: true,
    show: function ($tabs, $panels, tabIndex) {
        /*var $activePanels = $panels.eq(tabIndex);
        // 选项卡只会进行一次异步加载，所以要在 show 回调函数里执行 creatLoadMore
        if ($activePanels.hasClass("hasLoad")) {
            creatLoadMore($activePanels, tabIndex);
        }*/
    },
    loaded: function (data, $activePanels) {
        var tabIndex = $activePanels.index() - 1;
        renderPanelContent(data, $activePanels);
        /*// 首先在 loaded 回调函数里执行 creatLoadMore 确保显示顺序
        creatLoadMore($activePanels, tabIndex);
        $activePanels.addClass("hasLoad");*/
    }
});
/*global
 $: false,
 SQ: false,
 console: false
 */
(function () {
    var SQ = window.SQ || {};
    
    var tabs = new SQ.Tabs({
        EVE_EVENT_TYPE: "click",
        DOM_TRIGGER_TARGET: ".J_tabs",
        DOM_TABS: ".sq-nav-tabs>li",
        DOM_PANELS: ".sq-tab-content",
        API_URL: ["data/music-list-json.json", "data/music-pop-json.json", "data/music-list-json.json"],
        CSS_LOADING_TIP: "tab-loading-tip",
        NUM_ACTIVE: 0,
        LOCAL_DATA: true,
        //CLEAR_PANEL: true,
        show: function ($tabs, $panels, tabIndex) {
            if (musicList) {
                musicList.active(tabIndex);
            }
        },
        loaded: function (data, $activePanels, tabIndex) {
            var html = window.template.render("music-list", data);
            $activePanels.find(".J_ajaxWrap").append(html);
            if (imglazyload) {
                imglazyload.refresh();
            }
            if (musicList) {
                musicList.active(tabIndex);
            }
        }
    });

    var musicList = new SQ.LoadMore({
        API: ["data/music-list-json.json", "data/music-pop-json.json", "data/music-pop-json.json"],
        EVE_EVENT_TYPE: "scroll",
        DOM_TRIGGER_TARGET: window,
        DOM_AJAX_WRAP: ".J_ajaxWrap",
        CSS_STATE_BAR: ".music-list-loadmore",
        NUM_SCROLL_MAX_PAGE: 2,
        DATA_TYPE: "html",
        loaded: function (data, $ajaxWrap) {
            var html = window.template.render("music-list", data);
            $ajaxWrap.append(html);
            if (imglazyload) {
                imglazyload.refresh();
            }
        }
    });

    var popupDetail = new SQ.Popup({
        DOM_TRIGGER_TARGET: ".J_popupDetail",
        CSS_CLASS: ".popup-detail",
        CSS_TOP: 10,
        CSS_RIGHT: 10,
        CSS_BOTTOM: 10,
        CSS_LEFT: 10,
        MASK: true,
        LOCK: true,
        ANIMATE: ".flipInY quick",
        beforeShow: function () {
            var me = this;
            $.get("data/music-detail.json", function (data) {
                var html = window.template.render("music-detail", data);
                me.$popupContent.append(html);

                var h = window.innerHeight - 20 - 350;
                var $albumList = me.$popupContent.find(".album-list");
                $(".lyric").find("blockquote").addClass("star-roll");
                $albumList.height(h);
                setTimeout(function () {
                    $albumList.addClass("touch-box-scroll");
                    boxScroll();
                }, 700);
            });
            return true;
        },
        show: function () {
            
        }
    });

    var menuButton = new SQ.Button({
        MODE: "menu",
        EVE_EVENT_TYPE: "click",
        DOM_TRIGGER_TARGET: ".J_buttonMenu",
        ANIMATE: ".fadeIn quick"
    });

    function boxScroll() {
        var $wrap = $(".touch-box-scroll");
        var $list = $wrap.find("ol");
        var len = $list.find("li").length;
        var listH = len * 41;

        $list.height(listH);

        var BoxScroll = SQ.TouchSlip({
            MODE: "px",
            DOM_TRIGGER_TARGET: ".touch-box-scroll ol"
        });
    }

    var imglazyload = new SQ.LazyLoad({
        DOM_LAZY_ITEMS: ".J_lazyload",
        DOM_LAZY_PARENT: ".sq-list .icon",
        CSS_PLACEHOLDER: ".default-icon",
        ANIMATE: ".fadeIn",
        NUM_THRESHOLD: 250
    });

    var fixedButton = new SQ.Fixed({
        DOM_FIXED_ITEM: ".J_fixedGoTop",
        DOM_TRIGGER_TARGET: window,
        ARRY_FIXED_POSITION: ["auto", "auto", 20, 10],
        NUM_TRIGGER_POSITION: 300,
        NUM_ZINDEX: 31,
        ANIMATE: ".fadeIn",
        fixedIn: function () {
            var me = this;
            me.$fixedItems.show();
        },
        fixedOut: function () {
            var me = this;
            me.$fixedItems.hide();
        }
    });

    var fixedNav = new SQ.Fixed({
        DOM_FIXED_ITEM: ".J_fixedNav",
        DOM_TRIGGER_TARGET: window,
        NUM_ZINDEX: 99,
        PLACEHOLD: true
    });

    var panelMenu = new SQ.Panel({
        DOM_TRIGGER_TARGET: ".J_panelMenu",
        DOM_WRAPPER: ".wrapper",
        CSS_CLASS: ".panel-menu",
        CSS_WIDTH: 240,
        beforeShow: function () {
            console.log("beforeShow");
            return true;
        },
        show: function () {
            console.log("show");
        }
    });
}());

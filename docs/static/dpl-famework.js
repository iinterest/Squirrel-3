/**
 * dpl.js
 * @author Hesong <hesong@ucweb.com>
 * @copyright 2004-2012 UC优视 © <www.uc.cn>
 * @license BSD <http://opensource.org/licenses/bsd-license.php>
 */
 // ====================================================================
 //Lib Core

/*global
 $: false,
 SQ: false,
 console: false
 */

$(document).ready(function () {
    var $iframe = $(".dpl-frame").find("iframe");
    var $tree = $(".side-nav").find("a");
    var $li = $(".side-nav").find("li");

    $tree.on("click", function (e) {
        e.preventDefault();
        var $me = $(this);
        var src = $me.attr("href");
        if (src.length) {
            $li.removeClass("active");
            $me.parent().addClass("active");
            $iframe.attr("src", src);
        }
    });

    (function foldCode() {
        var $codeWrap = $(".J_foldCode");
        var $foldToggle = $codeWrap.find(".toggle");

        $foldToggle.on("click", function () {
            var $me = $(this);
            var $codeWrap = $me.parent();
            var h = 21;

            if ($me.hasClass("unfold")) {
                $me.text("View Source").removeClass("unfold");
                $codeWrap.css({ height : h});
            } else {
                $me.text("Hide Source").addClass("unfold");
                $codeWrap.css({ height : "auto"});
            }
        });
    }());
    
    (function featuresSlider() {
        var $slider = $(".J_featuresSlider");
        var $sliderBox = $slider.find("ul");
        var $prev = $slider.find(".prev");
        var $next = $slider.find(".next");
        var step = 200;
        var max = step * ($sliderBox.find("li").length - 5) * -1;
        
        $next.on("click", function () {
            if (parseInt($sliderBox.css("left"), 10) === max) {
                return;
            }
            $sliderBox.animate({
                left: "-=" + step
            });
        });
        $prev.on("click", function () {
            if (parseInt($sliderBox.css("left"), 10) === 0) {
                return;
            }
            $sliderBox.animate({
                left: "+=" + step
            });
        });
    }());
    
    (function animateDemo() {
        var $demo = $("#animate-demo");
        var $animateList = $(".J_animateDemo").find("a");

        $animateList.click(function () {
            var $me = $(this);
            var animateStyle = $me.attr("data-test");
            $animateList.removeClass("f-green");
            $me.addClass("f-green");
            $demo.removeClass().addClass("animated " + animateStyle);
        });

        if (window.SQ) {
            var fixedButton = new SQ.Fixed({
                DOM_FIXED_ITEM: ".animate-sandbox",
                DOM_TRIGGER_TARGET: window,
                ARRY_FIXED_POSITION: [10, 0, 0, 60],
                PLACEHOLD: true,
                NUM_ZINDEX: 31,
                fixedIn: function () {
                    // 设置固定布局时回调函数
                },
                fixedOut: function () {
                    // 取消固定布局时回调函数
                }
            });
        }
        
    }());

});//jQuery ready end

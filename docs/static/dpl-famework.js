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
    
    (function () {
        var $iframe = $(".doc-iframe").find("iframe");
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
    }());

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
        var animating = false;
        
        $next.on("click", function () {
            if (parseInt($sliderBox.css("left"), 10) === max || animating) {
                return;
            }
            animating = true;
            $sliderBox.animate({
                left: "-=" + step
            }, function () {
                animating = false;
            });
        });
        $prev.on("click", function () {
            if (parseInt($sliderBox.css("left"), 10) === 0 || animating) {
                return;
            }
            animating = true;
            $sliderBox.animate({
                left: "+=" + step
            }, function () {
                animating = false;
            });
        });
    }());
    
    (function animateDemo() {
        var $demo = $("#animate-demo");
        var $animateList = $(".J_animateDemo").find("a");

        $animateList.click(function () {
            var $me = $(this);
            var animateStyle = $me.attr("data-test");
            $animateList.removeClass("mt-green");
            $me.addClass("mt-green");
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
    
    (function costomize() {
        if ($("#customize").length === 0) {
            return;
        }

        (function selectEvent () {
            var $selectAll = $(".J_selectAll");
            var $checkbox = $("input:checkbox");
            var $customizeBtn = $(".J_customizeBtn");

            $selectAll.on("click", function () {
                var $me = $(this);
                var groupName = $me.attr("data-group");
                $("input[name="+ groupName +"]").prop("checked", this.checked);
                // 取消全选的同时，取消所有 DPL 勾选（为了简化逻辑）
                if (!this.checked) {
                    $("input[name=dpl]").each(function () {
                        this.checked = false;
                    });
                }
                updateSelectCountUi();
            });

            $checkbox.on("click", function () {
                var $me = $(this);
                var name = $me.attr("class");
                var groupName = $me.attr("name");
                var isAllSelect = true;
                var i;
                var len;
                var components = "";
                var hash = "#!components={components}";

                // 添加、解除全选勾选
                $("input[name="+ groupName +"]").each(function () {
                    if (!this.checked) {
                        isAllSelect = false;
                    }
                });
                $("input[data-group = "+ groupName +"]").prop("checked", isAllSelect);
                
                if (this.attributes["data-required"]) {
                    // 自动勾选 DPL 所需插件或组件
                    var requireds = this.attributes["data-required"].value.split(",");
                    len = requireds.length;
                    for (i = 0; i < len; i++) {
                        $("." + requireds[i]).prop("checked", true);
                    }
                } else {
                    // 自动取消当前选项所支持的 DPL 组件
                    $("input[data-required]").each(function () {
                        var requireds = this.attributes["data-required"].value.split(",");
                        if (requireds.indexOf(name) !== -1) {
                            this.checked = false;
                        }
                    });
                }

                // 计算请求位码
                $checkbox.each(function () {
                    if (this.className.indexOf("J_selectAll") !== -1) {
                        return;
                    }
                    if (this.checked) {
                        components += "1";
                    } else {
                        components += "0";
                    }
                });
                hash = hash.replace("{components}", components);

                $customizeBtn.attr("href", hash);
                updateSelectCountUi();
            });

        }());

        function updateSelectCountUi () {
            var groupName = ["components", "plugins", "dpl"];
            var i;
            var len = groupName.length;
            for (i = 0; i < len; i++) {
                var count = $("input[name="+ groupName[i] +"]:checked").length;
                var $count = $("." + groupName[i] + "-num");
                $count.text(count);
                if (count > 0) {
                    $count.addClass("hightlight");
                } else {
                    $count.removeClass("hightlight");
                }
            }
        }
    }());
    
    (function setDir() {
        var scrollTimer = 0;
        var scrollDelay = 200;
        var $dir = $(".doc-section-dir");
        var $li = $dir.find("li");
        var $tit = $("h3,h4,h5").filter(function () {
            return $(this).attr("id");
        });
        var y = [];
        var docH = $("body").height();
        var winH = $(window).height();

        if ($dir.length === 0) {
            return;
        }

        (function init () {
            $li.eq(0).addClass("active");
            $tit.each(function () {
                y.push($(this).offset().top);
            });
            trigger();
        }());
        
        function trigger () {
            function fire () {
                var scrollTop = window.scrollY;
                var i;
                var len = y.length;

                if (scrollTop <= 0) {
                    $li.removeClass("active");
                    $li.first().addClass("active");
                    return;
                }
                
                if (scrollTop >= docH - winH) {
                    $li.removeClass("active");
                    $li.last().addClass("active");
                    return;
                }
                
                for (i = 0; i < len; i++) {
                    if (scrollTop > y[i] - 100) {
                        var index = i + 1;
                        if (!$li.eq(index).hasClass("active")) {
                            $li.removeClass("active");
                            $li.eq(index).addClass("active");
                        }
                    }
                }
            }
            $(window).on("scroll", function () {
                // 添加 scroll 事件相应伐值，优化其性能
                if (!scrollTimer) {
                    scrollTimer = setTimeout(function () {
                        fire();
                        scrollTimer = 0;
                    }, scrollDelay);
                }
            });
        }

    }());

});//jQuery ready end

/**
 * dpl.js
 * @author Hesong <hesong@ucweb.com>
 * @copyright 2004-2012 UC优视 © <www.uc.cn>
 * @license BSD <http://opensource.org/licenses/bsd-license.php>
 */
 // ====================================================================
 //Lib Core



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

});//jQuery ready end

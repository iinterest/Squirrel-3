/*global $, SQ, console*/
(function ($) {
    'use strict';

    SQ.gestures.tap({
        el: 'a.sq-btn',
        event: '.sq.tap',
        callbackFun: function (e, $el) {
            e.preventDefault();
            var url = $el.attr('href');
            if (url && url !== '#') {
                window.location = url;
            }
        }
    });
})($);

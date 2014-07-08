/**
 * @file SQ.gestures
 * 手势函数
 * @version 0.5.0
 */
/*global SQ*/
SQ.gestures = {
    isSupportTouch: function () {
        'use strict';
        if (typeof window.ontouchstart === 'undefined') {
            return false;
        } else {
            return true;
        }
    },
    /**
     * 轻点
     * @param config
     */
    tap: function (config) {
        'use strict';
        var boundary = 20;
        var el = config.el;
        var event = config.event || '';
        var fun = config.callbackFun;

        function startHandle (e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            $(e.target).addClass('press');
            setTimeout(function () {
                $(e.target).removeClass('press');
            }, 200);
        }
        
        function endHandle (e) {
            var endX = e.changedTouches[0].clientX;
            var endY = e.changedTouches[0].clientY;
            if (Math.abs(endX - startX) < boundary && Math.abs(endY - startY) < boundary) {
                fun.call(el, e, $(e.target));
            }
            $(e.target).removeClass('press');
        }
        
        if (SQ.gestures.isSupportTouch()) {
            var startX = 0;
            var startY = 0;
            if (SQ.isString(el)) {
                $(document).on('touchstart' + event, el, startHandle).on('touchend' + event, el, endHandle);
            } else if (SQ.isArray(el)) {
                el.on('touchstart' + event, startHandle).on('touchend' + event, endHandle);
            }
        } else {
            $(el).on('click' + event, function (e) {
                fun.call(el, e, $(this));
            });
        }
    }
};
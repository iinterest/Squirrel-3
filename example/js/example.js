(function init() {
    'use strict';
    $('.J_menu').dropdown({
        ANIMATE: '.fadeIn quick'
    });

    $('.J_fixedGoTop').sticky({
        ARRY_FIXED_POSITION: ['auto', 10, 20, 'auto'],
        NUM_TRIGGER_POSITION: 300,
        fixedIn: function () {
            this.$element.show();
        },
        fixedOut: function () {
            this.$element.hide();
        }
    });
    
    $('.J_goBack').on('click', function (e) {
        e.preventDefault();
        history.go(-1);
    });
}());

var $animateDemo = $('#animate-demo');
$('.animate-effect').on('click', '.sq-btn', function (e) {
    'use strict';
    e.preventDefault();
    var $btn = $(this);
    var animateEffect = $btn.attr('data-effect');
    $btn.addClass('mt-green').siblings().removeClass('mt-green');
    $animateDemo.removeClass().addClass('animated ' + animateEffect);
});
    


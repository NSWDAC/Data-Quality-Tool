var $ = jQuery;

(function($) {
    $.fn.goTo = function() {
        $('html, body').animate({
            scrollTop: $(this||'body').offset().top + 'px'
        }, 1000);
        return this; // for chaining...
    };
})(jQuery);


require([
    "jquery", "underscore", "bootstrap", "moment", "moment-nb", "datetimepicker"
],
function($, _, _, moment) {
$(window).scroll(function() {
if ($(this).scrollTop() > 1){  
    $('.navbar').addClass("white");
  }
  else{
    $('.navbar').removeClass("white");
  }
});
$("a[href^='#']").on('click', function(event) {
  var target;
  target = this.hash;

  event.preventDefault();

  var navOffset;
  navOffset = $('.navbar').height();

  return $('html, body').animate({
    scrollTop: $(this.hash).offset().top - navOffset
  }, 300, function() {
    return window.history.pushState(null, null, target);
  });
});
var dMoment = moment().startOf('M').day(5).add(1, 'week');
dMoment = dMoment.isBefore(moment(), 'd') ? dMoment.add(1, 'month').startOf('M').day(5) : dMoment
$(document).ready(function() {
    $('#id_dato').datetimepicker({
        calendarWeeks: true,
        format: 'YYYY-MM-DD',
        defaultDate: dMoment,
        isValidCallback: function (theMoment, granularity) {
            if (granularity == 'd') {
                var isMoment = theMoment.clone().startOf('M').day(5).add(1, 'week');
                console.log(isMoment.format('YYYY-MM-DD'), theMoment.format('YYYY-MM-DD'))
                return isMoment.format('YYYY-MM-DD') == theMoment.format('YYYY-MM-DD');
            }
            return true
        },
        minDate: new Date(new Date().setHours(0,0,0,0))

       });
    })
});
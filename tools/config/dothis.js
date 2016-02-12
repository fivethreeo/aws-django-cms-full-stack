
require([
    "jquery", "underscore", "bootstrap", "text!/formfield.html", "moment", "moment-nb", "datetimepicker"
],
function($, _, B, fieldtmpl_text,moment) {

    var fieldtmpl = _.template(fieldtmpl_text);

	$(document).ready(function()  {
		$('.choose_setup').on('click', function(event) {
			load_params(event.target.id);
		});
	});

	function load_params(setup) {
	  var jqxhr = $.ajax( "/params", {data:{'setup':setup}, traditional: true} )
	  .done(function(msg) {
	  	create_form(msg.Parameters);
	  	console.log(msg)
		$('#choose_setup').hide();
	  })
	  .fail(function() {
	  })
	  .always(function() {
	  });
	}
	
    function create_form(params) {
    	var p = $('#params');
    	$.each(params, function(k, v){
    		p.append(fieldtmpl({key:k, value:v}))
    	})
    }

});
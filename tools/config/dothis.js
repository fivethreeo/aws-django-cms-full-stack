
function dothis($, _, _, moment){
	function load_params(setup) {
	  var jqxhr = $.ajax( "/params", {data:{'setup':setup}, traditional: true} )
	  .done(function() {
		$('#choose_setup').hide();
	  })
	  .fail(function() {
	  })
	  .always(function() {
	  });
	}
	$(document).ready(function()  {
		$('.choose_setup').on('click', function(event) {
			load_params(event.target.id);
		});
	});
}
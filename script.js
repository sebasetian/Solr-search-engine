let total;
$(document).ready(function () {
	$("button").click(function () {
		$.get('/search?text=' + $('#query').val(),data => {
			$('#result').removeAttr('hidden');
			console.log(data);
			
			
		});
	});
});
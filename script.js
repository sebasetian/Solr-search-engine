let total;
$(document).ready(function () {
	$("button").click(function () {
		$.get('/search?fl=id,title,og_description,og_url&text=' + $('#query').val() + '&sort=' + $('#select').val() + ' desc',data => {
			$('#result').removeAttr('hidden');
			$('#result').empty();
			let items = data.response.docs;
			for (let i = 0; i < 10;i++) {
				let content = "<h5>Result"+ (i+1) +": </h5><br><table>"
				let item = items[i];
				let keys = Object.keys(item);
				let values = Object.values(item);
				let url = values[values.length-1];
				if (keys[keys.length-1] !== 'og_url') {
					url = '#';
				}
				content += '<tr style="width:100vw"><td style="width:20vw">Key</td><td>Value<td></tr>';
				for (let j = 0; j < keys.length; j++) {
					if (keys[j]=="title" || keys[j]=='og_url') {
						content += '<tr style="width:100vw"><td style="width:20vw">' + keys[j] + '</td><td><a href=\"' + url + '\">' + values[j] + '</a><td></tr>';
					} else {
						content += '<tr style="width:100vw"><td style="width:20vw">' + keys[j] + '</td><td>' + values[j]  +'<td></tr>';
					}
				}
				content += "</table><br>"; 
				$('#result').append(content);
			}
		});
	});
});
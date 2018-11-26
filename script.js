let dict = {};
let isTrainFinished = false;
let data = [];
$(document).ready(function () {
	$.ajax({
		type: "GET",
		url: "URLtoHTML_mercury.csv",
		dataType: "text",
		success: function (data) { 
			processData(data);
		}, error: function (xhr, status, error) {
			console.log(error);
		}
	});
	$('#query').autoComplete({
		minChars:2,
		source: function(term,response) {
			$.getJSON('/suggest?word=' + term, function (data) {
				response(data);
			});
		}
	})
	$("#search").click(function () {
		onSubmit(true, null);
	});
});
function onSubmit(isCorrectNeed,text) {
	if (Object.keys(dict).length != 0) {
		let words = $('#query').val().split(' ');
		let correctArr = [];
		let isCorrected = false;
		let correctedStr = "";
		let len = 0;
		if (isCorrectNeed) {
			let space = "";
			for (let i = 0; i < words.length;i++) {
				let word = words[i];
				$.get('/correct?word=' + word,(corrected) => {
					if (corrected.length != 0 && corrected !== word) {
						isCorrected = true;
					} else {
						corrected = word;
					}
					correctedStr += space + corrected;
					correctArr[word] = corrected;
					len++;
					space = " ";
					if (len == words.length) {
						doQuery(correctedStr, isCorrected, correctArr, words);
					}
				});
			}
		} else {
			correctedStr = text;
			doQuery(correctedStr, isCorrected, correctArr, words);
		}
}
function doQuery(correctedStr, isCorrected, correctArr, words) {
		$.get('/search?fl=id,title,og_description,og_url&text=' + correctedStr + '&sort=' + $('#select').val() + ' desc', data => {
			$('#result').removeAttr('hidden');
			$('#result').empty();
			let items = data.response.docs;
			if (isCorrected) {
				let showText = "<p style='font-size:120%'>Showing results for <a href='#' id='correctText'>";
				words.forEach(word => {
					if (correctArr[word] != word) {
						showText += "<em>" + correctArr[word] + "</em> ";
					} else {
						showText += word + " ";
					}
				});
				showText += "</a></p><br>Search instead for <a href='#' id='originText'>" + $('#query').val() + "</a>";
				$('#result').append(showText);
				$('#correctText').click(function () {
					$('#query').val(correctedStr);
					onSubmit(false, correctedStr);
				});
				$('#originText').click(function () {
					onSubmit(false, $('#query').val());
				});
			}
			if (items.length != 0) {
				for (let i = 0; i < Math.min(items.length,10); i++) {
					let content = "<h5>Result" + (i + 1) + ": </h5><br><table>"
					let item = items[i];
					let keys = Object.keys(item);
					let values = Object.values(item);
					let url = values[values.length - 1];
					if (keys[keys.length - 1] !== 'og_url') {
						url = dict[values[0]];
					}
					$.get('/snippet?path=' + values[0] + '&query=' + correctedStr, (data) => {
						content += '<tr style="width:100vw"><td style="width:20vw">Key</td><td>Value<td></tr>';
						for (let j = 0; j < keys.length; j++) {

							if (keys[j] == "title" || keys[j] == 'og_url') {
								content += '<tr style="width:100vw"><td style="width:20vw">' + keys[j] + '</td><td><a href=\"' + url + '\">' + values[j] + '</a><td></tr>';
							} else {
								content += '<tr style="width:100vw"><td style="width:20vw">' + keys[j] + '</td><td>' + values[j] + '<td></tr>';
							}
						}
						content += "</table><br>";
						$('#result').append(content);
					});
				}
			} else {
				$('#result').append("<h5>No Record</h5>");
			}
		});
	} 
}
function processData(allText) {
	let allTextLines = allText.split(/\n/);
	for (let i = 1; i < allTextLines.length; i++) {
		let data = allTextLines[i].split(',');
		if (data.length == 2)
			dict["/Users/seb/CSCI572Solr/solr-7.5.0/mercurynews/" + data[0]] = data[1];
	}
}
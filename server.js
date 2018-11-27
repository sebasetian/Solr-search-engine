const express = require("express");
const app = express();
const axios = require('axios');
const port = process.env.PORT || 4200;
const solrNode = require("solr-node");
const spell = require('spell');
const dict = spell();
const fs = require('fs');
const textract = require('textract');
const extractor = require('unfluff');
const client = new solrNode({
	host: '127.0.0.1',
	port: '8983',
	core: 'myexample',
	protocol: 'http'
});
app.use(express.static(__dirname));
app.set('port', port);
app.get('/', (req, res) => {
	let text = fs.readFileSync("big.txt", "utf-8").toLowerCase();
	dict.load(text);
	res.sendFile(__dirname + '/index1.html');
});
app.get('/correct/', (req,res) => {
	let correctedwords = dict.suggest(req.query.word.toLowerCase());
	if (!correctedwords || correctedwords.length == 0 || !correctedwords[0].hasOwnProperty("word")) {
		 res.send("");
	}
	else {
		for (let cor of correctedwords) {
			if (cor.word.toLowerCase() == req.query.word.toLowerCase()) {
				res.send(req.query.word);
				return;
			}
		}
		res.send(correctedwords[0].word);
	}
});
app.get('/search/', (req, res) => {
	client.search("q=" + req.query.text + "&fl=" + req.query.fl+ "&sort=" + req.query.sort)
		.then(data => {
			res.send(data)})
		.catch(err => res.send("404"));
});
app.get('/suggest/', (req,res) => {
	axios.get("http://127.0.0.1:8983/solr/myexample/suggest?q=" + req.query.word)
	.then(response => {
		for (var key in response.data.suggest.suggest) {
			if (response.data.suggest.suggest.hasOwnProperty(key)) {
				let arr = [];
				response.data.suggest.suggest[key].suggestions.forEach(item => {
					arr.push(item.term);
				}); 
				res.send(arr);
			}
		}
	})
	.catch(err => res.sendStatus(500));
});
app.get('/snippet/', (req,res) => {
		let text = extractor.lazy(fs.readFileSync(req.query.path),'en').text();
		let querys = req.query.q.toLowerCase();
		let queryArr = querys.split(" ");
		let sentences = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
		let snippet = "";
		let idx = -1;
		// try to find all querys in one sentense first
		for(let i = 1; i < sentences.length;i++) {
			let sentense = sentences[i];
			if (sentense.toLowerCase().includes(querys)) {
				snippet = sentense;
				idx = sentense.toLowerCase().indexOf(querys);
				break;
			} else {
				let isAllIncluded = true;
				for (let j = 0; j < queryArr.length;j++) {
					if (snippet.length == 0 && sentense.toLowerCase().includes(queryArr[j]) && isNotTrivialWord(queryArr[j])) {
						snippet = sentense;
						idx = sentense.toLowerCase().indexOf(queryArr[j]);
					} else if (!sentense.toLowerCase().includes(queryArr[j])) {
						isAllIncluded = false;
					}
				}
				if (isAllIncluded) {
					snippet = sentense;
					break;
				}
			}
		}
		if (snippet.length > 160) {
			if (idx > 160) {
				snippet = "..." + snippet.substr(idx - 80);
			}
			if (snippet.length > 160) {
				snippet = snippet.substr(0,160) + "...";
			}
		}
		res.send(snippet);
});
function isNotTrivialWord(word) {
	let trivialWordList = ["the","is","are","were","am","was","he","she","it","i","you","a"];
	for (let w of trivialWordList) {
		if (word.toLowerCase() == w) return false;
	}
	return true;
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
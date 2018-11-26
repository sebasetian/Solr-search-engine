const express = require("express");
const app = express();
const axios = require('axios');
const port = process.env.PORT || 4000;
const solrNode = require("solr-node");
const spell = require('spell');
const dict = spell();
const fs = require('fs');
const client = new solrNode({
	host: '127.0.0.1',
	port: '8983',
	core: 'myexample',
	protocol: 'http'
});
app.use(express.static(__dirname));
app.set('port', port);
app.get('/', (req, res) => {
	let text = fs.readFileSync("big.txt", "utf-8");
	dict.load(text);
	res.sendFile(__dirname + '/index1.html');
});
app.get('/correct/', (req,res) => {
	let correctedwords = dict.suggest(req.query.word);
	if (!correctedwords || !correctedwords[0].hasOwnProperty("word")) {
		 res.send("");
	}
	else res.send(correctedwords[0].word);
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
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
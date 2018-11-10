const express = require("express");
const app = express();
const port = process.env.PORT || 4200;
const solrNode = require("solr-node");
const client = new solrNode({
	host: '127.0.0.1',
	port: '8983',
	core: 'myexample',
	protocol: 'http'
});

app.use(express.static(__dirname));
app.set('port', port);
app.get('/', (req, res) =>
	res.sendFile('index.html')
);
app.get('/search/', (req, res) => {
	client.search("q=" + req.query.text + "&fl=" + req.query.fl+ "&sort=" + req.query.sort)
		.then(data => {
			res.send(data)})
		.catch(err => res.send("404"));
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
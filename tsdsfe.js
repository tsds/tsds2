var fs      = require('fs');
var http    = require('http');
http.globalAgent.maxSockets = 100;  // Most Apache servers have this set at 100.
var request = require("request");
var	express = require('express');
var	app     = express().use(express.bodyParser());
var	server  = require("http").createServer(app);
var qs      = require('querystring');
var port    = process.argv[2] || 8001;

app.use("/conf", express.static(__dirname + "/conf"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/scripts", express.static(__dirname + "/scripts"));

app.get('/', function (req, res) {
	res.contentType("html");
	fs.readFile(__dirname+"/gui.htm", "utf8", function (err, data) {res.send(data)})
})

app.get('/tsdsfe', function (req, res) {
	options = parseOptions(req);
	res.send("OK");
})

server.listen(port);

function parseOptions(req) {

 	var options = {};
        
	function s2b(str) {if (str === "true") {return true} else {return false}}
	function s2i(str) {return parseInt(str)}

	options.catalog  =     req.query.catalog ||     req.body.catalog  || ""

	return options;
}
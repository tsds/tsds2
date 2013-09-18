var fs      = require('fs');
var http    = require('http');
http.globalAgent.maxSockets = 100;  // Most Apache servers have this set at 100.
var request = require("request");
var	express = require('express');
var	app     = express().use(express.bodyParser());
var	server  = require("http").createServer(app);
var qs      = require('querystring');
var port    = process.argv[2] || 8001;

var fs = require('fs'),
xml2js = require('xml2js');

app.get('/', function (req, res) {

		var parser = new xml2js.Parser();
		fs.readFile(__dirname + '/WebContent/conf/catalogs.xml', function(err, data) {
			parser.parseString(data, function (err, result) {
				console.log(JSON.stringify(result));
				console.log('Done');
			});
		});
});
server.listen(port);
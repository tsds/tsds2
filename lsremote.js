var	findit = require('findit');
var request = require("request");
var express = require('express');
var app = express();
var server = require("http").createServer(app);
var fs = require("fs");
var ftp = require('jsftp');
var jsdom = require("jsdom");
	
// get port number from command line option
var port = process.argv[2] || 8001;

function isNumeric(num){return !isNaN(num)}

// Command line mode.
if (!isNumeric(port)) {
	dir = port;
	lsremote(dir, function (files) {console.log(files);});
	return;
}
		
function lsremote(dir, callback) {
	if (dir.match(/^file|^\//)) {
		getlistlocal(dir, callback);
	} else if (dir.match(/^ftp[s]?/)) {
		getlistftp(dir, callback);
	} else if (dir.match(/^http[s]?/)) {
		getlisthttp(dir, callback);
	} else {
		getlistother(dir, callback);		
	}	
}

function getlistother(dir,callback) {
	callback("Protocol " + dir.replace(/(.*)\:.*/,'$1') + " not supported.");
}

function getlistftp(dir,callback) {

	var host = dir.replace(/^ftp[s]?\:\/\//,'');
	var path = host.replace(/(.*)\/(.*)/,'/$2');
	var host = host.replace(/(.*)\/(.*)/,'$1');
	
	port = 21;
	if (host.match(/\:/)) {
		var port = host.replace(/(.*)\:(.*)/,'$2');
		var host = host.replace(/(.*)\:(.*)/,'$1');
	}
	console.log("Attempting anonymous ftp directory listing at " + host + " on port " + port + " in path " + path);

	var ftpconn = new ftp({
							host: host,
							user: "anonymous",
							port: port,
							pass: ""
						});

	ftpconn.ls(path,
					function(err, tmp) {
						if (err) return console.error(err);
						callback(tmp);
				});
}

function getlisthttp(dir,callback) {

	request({uri: dir}, function(err, response, body) {
		var self = this;
		self.items = new Array();
		if (err && response.statusCode !== 200) {console.log('Request error.');}

		// Send the body param as the HTML code we will parse in jsdom
		// also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
		jsdom.env({
					html: body,
					scripts: ['http://code.jquery.com/jquery.min.js']
					},function (err, window) {
					
					// Use jQuery just as in a regular HTML page
					var $ = window.jQuery;
					var files = new Array();							
					var f = 0;
					
					$('a').each(function () {
						var tmp = $(this).attr('href');
						if (!tmp.match(/^\?/)) { // Skip files that start with "?".
							if (tmp.match(/\/$/)) {
								files[f] = new Array();
								files[f][0] = tmp;
							} else {
								files[f] = new Array();
								files[f][0] = tmp;
								files[f][1] = $($(this).parent().nextAll('td')[0]).text()
								files[f][2] = $($(this).parent().nextAll('td')[1]).text()
							}
							f = f+1;							
						}							
					});
					callback(files);						
				});				
	});
	
}

function getlistlocal(dir, callback) {
	dir = dir.replace(/file\:/,'');
	dir = dir.replace(/^\/\//,'/');
	var files = require('findit').sync(dir);
	callback(files);
}

app.use(express.bodyParser());
app.use("/deps", express.static(__dirname + "/deps"));
app.use(function (req, res, next) {res.contentType("text");next();});

app.get('/lsremote.js', function(req, res){
	res.contentType("html");

	dir = "";
	if (req.query.dir) {
		dir = req.query.dir;
	} else {
		res.send("");
	}
	
	if (dir.match(/^file|^\//)) {
		if (!(req.connection.remoteAddress === req.connection.address().address)) {
			var msg = "Listing of server directory is only allowed if client IP (" + req.connection.remoteAddress + ") = server IP ("+req.connection.address().address+")";
			console.log(msg);
			res.send(403, msg);
			return;
		}	
	}
	lsremote(dir, function (files) {console.log(files);res.send(files);});	
});

server.listen(port);
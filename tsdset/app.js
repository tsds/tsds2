var fs = require('fs');

eval(fs.readFileSync(__dirname +'/lib/expandtemplate.js', 'utf8'));
eval(fs.readFileSync(__dirname +'/lib/head.js', 'utf8'));

if (typeof(process.argv[2]) !== "undefined" && isNaN(process.argv[2])) {
	runtests(process.argv[2],process.argv[3] || false, process.argv[4] || false); return;
} else {
	var port = process.argv[2] || 8003;
}

// https://github.com/mikeal/request/issues/350
process.on('uncaughtException',function(error){console.log(error);});

//var url     = require('url');
var http    = require('http');
http.globalAgent.maxSockets = 100;  // Most Apache servers have this set at 100.
var request = require("request");
var	express = require('express');
var	app     = express().use(express.bodyParser());
var	server  = require("http").createServer(app);
var zlib    = require('zlib');
var qs      = require('querystring');

app.use("/deps", express.static(__dirname + "/deps"));
app.use("/lib", express.static(__dirname + "/lib"));
app.use("/tests", express.static(__dirname + "/tests"));
app.use("/html", express.static(__dirname + "/html"));

app.get('/proxy', function (req0, res0) {

	function parsereq(req, res) {

	    urlx = "";
	    // ?http://server/query?name=value&name=value
	    // ?server/query?name=value&name=value
	    for (var name in req.query) {
		var urlx = name + "=" + req.query[name] + "&";
	    }
	    
	    // ?url=http://server/query?name=value&name=value
	    // ?url=server/query?name=value&name=value
	    if (req.query.url === "") {res.send("URL must be specified\n");return "";}
	    
	    // Remove trailing &
	    urlx.replace(/\&$/,'');

	    urlx = req.query.url || urlx || res.send("URL must be specified\n");
	    if (!urlx.match(/^http\:\/\//)) {urlx = "http://" + urlx;}
	    return url.parse(urlx);
	}

	parts = parsereq(req0,res0);
	if (parts === "") return;
	console.log(parts);
	    
	var options = {host: parts.hostname, port: parts.port, path: parts.path,agent:false};
	console.log(options);
	if (!parts.hostname.match("www.google.com") && !parts.hostname.match("autoplot.org") && !parts.hostname.match("filefinder.elasticbeanstalk.com") ) {
	    res0.send(500,"Not allowed");
	}

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {res0.write(chunk);});
		res.on('end',function () {res0.end();});
		req.on('error', function(e) {console.log('Problem with request: ' + e.message)});
	    }).on('error', function(e) {res0.send(404,"Problem with request: " + e.message)})
	    req.end();
    })

app.get('/expandDD.htm', function (req, res) {
	res.contentType("html");
	fs.readFile(__dirname+"/expandDD.htm", "utf8", function (err, data) {res.send(data)})
})

app.get('/expandTemplate.htm', function (req, res) {
	res.contentType("html");
	fs.readFile(__dirname+"/expandTemplate.htm", "utf8", function (err, data) {res.send(data)})
})

app.get('/test', function (req, res) {
	options = parseOptions(req);
	options.res = res;
	Nr = runtests(options);
	res.end();
});

app.get('/', function (req, res) {
	options = parseOptions(req);
	options.res = res;
	if (options.template === "") {
		res.contentType("html");
		fs.readFile(__dirname+"/index.htm", "utf8", function (err, data) {res.send(data)})
	} else {
		expandtemplate(options,printresults1);
	}
})

server.listen(port);

function printresults1(files,headers,options) {

	res = options.res;
	if (headers.length) {
		files.forEach(function(file,i) {res.write(file + " " + headers[i]["last-modified"] + " " + headers[i]["content-length"] + "\n")});
	} else {
		files.forEach(function(file) {res.write(file + "\n")});
	}
	res.end();
	
}

function printresults2(files,headers,options) {

	res = options.res;
	var str = options.template + "," + options.timeRange + "," + options.type;
	
	if (options.debug) console.log(str);
	res.write(str + "\n");
	console.error(str);

	if (headers.length) {
		files.forEach(function(file,i) {
			str = file + " " + headers[i]["last-modified"] + " " + headers[i]["content-length"];
			if (options.debug) console.log(str);
			res.write(str + "\n");
			console.error(str);
		});
	} else {
		if (files.length < 10) {
			files.forEach(function(file) {
				if (options.debug) console.log(file);
				res.write(file + "\n");
				console.error(file);			
			});
		} else {
			for (i=0;i<5;i++) {
				if (options.debug) console.log(files[i]);
				res.write(files[i] + "\n");
				console.error(files[i]);
			}
			console.log("...")
			res.write("..." + "\n");
			for (i=files.length-5;i<files.length;i++) {
				if (options.debug) console.log(files[i]);
				res.write(files[i] + "\n");
				console.error(files[i]);
			}		
		}
		if (options.debug) console.log("");
		res.write("\n");
		console.error("\n");
	}
		
}

function runtests(options) {
	eval(fs.readFileSync(__dirname + "/" + options.testfile, 'utf8'));
	
	var Nr = 0;
	Tests.forEach(function(tests,i) {
		//console.error("Testing "+tests);
		test = tests.split(",");
		
		if (test[0] === '') return;

		options.template = test[0];
		options.timeRange = test[1];
		options.indexRange = test[1];
		options.type = test[2];

		var files = expandtemplate(options,printresults2);
		Nr = Nr + 1;
	});
	return Nr;
}


function parseOptions(req) {

 	var options = {};
        
	function s2b(str) {if (str === "true") {return true} else {return false}}
	function s2i(str) {return parseInt(str)}

	options.testfile  =     req.query.testfile  || req.body.testfile  || "tests/expandTemplate.tests.js"
	options.template  =     req.query.template  || req.body.template  || ""
	options.check     = s2b(req.query.check     || req.body.check     || "false");
	options.debug     = s2b(req.query.debug     || req.body.debug     || "false");
	options.type      =     req.query.type      || req.body.type      || ""
	options.timeRange =     req.query.timeRange || req.body.timeRange || "";
	options.indexRange =     req.query.indexRange || req.body.indexRange || "";

	if (options.type === "") {
		if (options.template.match("$") || options.template.match("%")) {
			options.type = "strftime";
		} else {
			options.type = "sprintf";
		}
	}

	if (options.debug) console.log(options);

	return options;
}

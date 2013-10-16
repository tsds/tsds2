var debug   = true;

var fs      = require('fs');
var request = require("request");
var	express = require('express');
var	app     = express().use(express.bodyParser());
var	server  = require("http").createServer(app);
var qs      = require('querystring');
var xml2js  = require('xml2js');
var port    = process.argv[2] || 8004;
var http    = require('http');
var url     = require('url');

http.globalAgent.maxSockets = 100;  // Most Apache servers have this set at 100.

//var plugin = require('./plugin.js');
var DC = "http://localhost:7999/sync/";

line       = "2001 01 02 0233 1 442 3 4 5 6";
timeformat = "yyyy MM dd HHmm s SSS";
timecols   = "1,2,3,4,5,6";
timeformat = "yyyy MM dd";
timecols   = "1,2,3";

//console.log(plugin.extractLine(line,timeformat,timecols))
app.use("/tsdsfe2/js", express.static(__dirname + "/js"));
app.use("/tsdsfe2/css", express.static(__dirname + "/css"));
app.use("/tsdsfe2/scripts", express.static(__dirname + "/scripts"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/scripts", express.static(__dirname + "/scripts"));

app.get('/tsdsfe.jyds', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		res.contentType("text/plain");
		res.send(fs.readFileSync(__dirname+"/scripts/tsdsfe.jyds"));
		return;
	}
});

app.get('/tsdsfe2/tsdsfe.jyds', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		res.contentType("text/plain");
		res.send(fs.readFileSync(__dirname+"/scripts/tsdsfe.jyds"));
		return;
	}
});


app.get('/', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		res.contentType("html");
		res.send(fs.readFileSync(__dirname+"/index.htm"));
		return;
	}
	handleRequest(req,res);

});

app.get('/tsdsfe2', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		res.contentType("html");
		res.send(fs.readFileSync(__dirname+"/index.htm"));
		return;
	}
	handleRequest(req,res);

});

server.listen(port);

if (process.argv[3]) {request("http://localhost:"+port+"/?"+process.argv[3], function (error, response, body) {console.log(body);});}

function catalog(options, cb) {

	var parser = new xml2js.Parser();
	var fname = __dirname + '/uploads/all.thredds';
	if (debug) console.log("Reading " + fname);

	var resp = [];

	var data = fs.readFileSync(fname);
	
	parser.parseString(data, function (err, result) {
		console.log(result)
		//var catalogRefs = JSON.stringify(result["catalog"]["catalogRef"]);
			var catalogRefs = result["catalog"]["catalogRef"];
			if (debug) console.log("Found " + catalogRefs.length + " catalogRef nodes.");

			var k = 0;
			for (var i = 0;i < catalogRefs.length;i++) {

				resp[i] = {};
				resp[i].value = catalogRefs[i]["$"]["ID"];
				resp[i].label = catalogRefs[i]["$"]["name"] || catalogRefs[i]["$"]["ID"];
				resp[i].href  = catalogRefs[i]["$"]["xlink:href"];

				if (options.catalog !== "^.*") {        
					if (options.catalog.substring(0,1) === "^") {
						if (!(catalogRefs[i]["$"]["ID"].match(options.catalog))) {
							delete resp[i];
						}        
					} else {
						if (!(catalogRefs[i]["$"]["ID"] === options.catalog)) {
							delete resp[i];
						}
					}
				}
			}
			
			resp = resp.filter(function(n){return n})

			if (options.dataset === "") {
				if (resp.length == 1 && options.catalog.substring(0,1) !== "^") {
					console.log("Fetching " + resp[0].href);
					request(resp[0].href, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							parser.parseString(body, function (err, result) {
								console.log(result["catalog"]["documentation"]);
								for (var k = 0; k < result["catalog"]["documentation"].length;k++) {
									resp[k].title = result["catalog"]["documentation"][k]["$"]["xlink:title"];
									resp[k].link  = result["catalog"]["documentation"][k]["$"]["xlink:href"];
								}
								cb(200,resp);
							})
						}
					})
				} else {
					cb(200,resp);
				}
			} else {
				dataset(options,resp,cb);
			}
		});

}

function dataset(options,resp,cb) {

	var parser = new xml2js.Parser();
	var j = 0;
	var N = resp.length;
	var datasets = [];
	var parents = [];

	var dresp = [];
	for (var i = 0; i < N;i++) {
		console.log("Fetching " + resp[i].href);
		request(resp[i].href, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				parser.parseString(body, function (err, result) {
					j = j+1;

					var parent = result["catalog"]["$"]["id"];
					var tmparr = result["catalog"]["dataset"];
					datasets = datasets.concat(tmparr);
					
					while (parents.length < datasets.length) {parents = parents.concat(parent)}

					if (j == N) {

						for (var i = 0;i < datasets.length;i++) {
							dresp[i]          = {};
							dresp[i].value    = datasets[i]["$"]["ID"];
							dresp[i].label    = datasets[i]["$"]["name"] || datasets[i]["$"]["ID"];
							dresp[i].catalog  = parents[i];

							if (options.dataset !== "^.*") {	
								if (options.dataset.substring(0,1) === "^") {
									if (!(datasets[i]["$"]["ID"].match(options.dataset))) {
										delete dresp[i];
										delete datasets[i];
									}	
								} else {
									if (!(datasets[i]["$"]["ID"] === options.dataset)) {
										delete dresp[i];
										delete datasets[i];
									} else {
										var z = i;
									}
								}
							}
						}

						console.log(datasets)
						if (options.parameters === "") {
							dresp = dresp.filter(function(n){return n;});
							console.log(datasets)
							if (dresp.length == 1 && options.dataset.substring(0,1) !== "^") {
								for (var k = 0; k < datasets[z]["documentation"].length;k++) {
									dresp[k].title = datasets[z]["documentation"][k]["$"]["xlink:title"];
									dresp[k].link  = datasets[z]["documentation"][k]["$"]["xlink:href"];
								}
								cb(200,dresp);
							} else {
								cb(200,dresp.filter(function(n){return n}));
							}
						} else {
							parameter(options,datasets.filter(function(n){return n}),parents,cb);						
						}						
					}
				})
			} else {
				j = j+1;
			}
		})
	}
}

function parameter(options,datasets,catalogs,cb) {

	var parameters = [];
	var parents = [];
	var cats = [];
	var resp = [];

	for (var i = 0;i < datasets.length;i++) {
		parameters = parameters.concat(datasets[i].variables[0].variable);
		var parent = datasets[i]["$"];

		var timeCoverage = datasets[i].timeCoverage;
		if (timeCoverage) {
			parent.start = timeCoverage[0].Start[0];
			parent.stop  = timeCoverage[0].End[0];
		}
		var cat = catalogs[i];
		while (parents.length < parameters.length) {
			parents.push(parent)
			cats.push(cat);
			//console.log(parents.length)
		}
	}							

		for (var i = 0;i < parameters.length;i++) {
			
			resp[i]           = {};
			resp[i].value     = parameters[i]["$"]["id"];
			resp[i].label     = parameters[i]["$"]["name"] || parameters[i]["$"]["id"];
			resp[i].catalog   = cats[i];
			resp[i].dataset   = parents[i]["ID"];
			resp[i].parameter = resp[i].value;
			resp[i].dd        = parameters[i]["$"];
						
			if (!('urltemplate' in resp[i].dd)) {resp[i].dd.urltemplate = parents[i]["urltemplate"]}
			if (!('timeformat' in resp[i].dd)) {resp[i].dd.timeformat = parents[i]["timeformat"]}
			if (!('timecolumns' in resp[i].dd)) {resp[i].dd.timecolumns = parents[i]["timecolumns"]}
			if (!('columns' in resp[i].dd)) {resp[i].dd.columns = parents[i]["columns"]}
			if (!('start' in resp[i].dd)) {resp[i].dd.start = parents[i]["start"]}
			if (!('stop' in resp[i].dd)) {resp[i].dd.stop = parents[i]["stop"]}

			if (options.parameters !== "^.*") {				
				if (options.parameters.substring(0,1) === "^") {
					if (!(parameters[i]["$"]["id"].match(options.parameters))) {
						delete resp[i];
					}
				} else  {				
					if (!(parameters[i]["$"]["id"] === options.parameters)) {
						delete resp[i];
					}
				}
			}
		}
		resp = resp.filter(function(n){return n});

		var columns = resp[0].dd.timecolumns + "," + resp[0].dd.columns;
		
		// TODO: Do this for each part of resp.  Concatenate output.
		if (options.start || options.stop) {
			start = options.start || resp[0].dd.start;
			stop  = options.stop  || resp[0].dd.stop;
			if (Date.parse(options.start) < Date.parse(resp[0].dd.start)) {start = resp[0].dd.start}
			if (Date.parse(options.stop) > Date.parse(resp[0].dd.stop)) {stop = resp[0].dd.stop}
			//console.log("template="+resp[0].dd.urltemplate+"&timeRange="+start+"/"+stop);

			var urltemplate = url.parse(resp[0].dd.urltemplate,true);
			//console.log(urltemplate)
			console.log(options)
			if (urltemplate.query.plugin) {
				args = "plugin="+urltemplate.query.plugin;
			}
			if (urltemplate.query.source) {
				args = args + "&template="+urltemplate.query.source;
			}
			var dc = DC+"?"+args+"&timeRange="+start+"/"+stop;

			if (options.return === "urilist") {
				cb(0,dc+"&return=urilist");
			}
			if (options.return === "urilistflat") {
				cb(0,dc+"&return=urilistflat");
			}
			// If more than one resp, this won't work.
			if (options.return === "redirect") {
				cb(302,dc);
			}
			// If more than one resp, this won't work.
			if (options.return === "jyds") {
				cb(0,"http://localhost:"+port+"/tsdsfe.jyds");
			}
			// If more than one resp, this won't work.
			if (options.return === "dd") {
				cb(0,JSON.stringify(resp[0].dd));
			}

			if (options.return === "stream") {				 
				dc = dc+"&forceUpdate=true&forceWrite=true&return=stream"
					+"&lineRegExp="+ resp[0].dd.lineregex
					+"&timecolumns="+resp[0].dd.timecolumns
					+"&timeformat="+resp[0].dd.timeformat
					+"&streamFilterReadColumns="+columns
					+"&lineFormatter=formattedTime&outformat="+options.outformat
					+"&streamFilterComputeFunction="+options.filter
					+"&streamFilterComputeWindow="+options.filterWindow
					+"&streamOrder=true"
					;
				
				//dc = dc+"&return=stream&lineRegExp="+resp[0].dd.lineregex + "&timecolumns="+resp[0].dd.timecolumns+"&timeformat="+resp[0].dd.timeformat+"&streamFilterReadColumns="+columns+"&lineFormatter=formattedTime&outformat="+options.outformat;
				console.log(dc)
				cb(0,dc)
			}
			// If more than one resp, this won't work.
			if (options.attach === "true") {
			}
		} else {
			console.log("here")
			cb(200,resp);
		}
		
}

function handleRequest(req, res) {
	var options = parseOptions(req);
	console.log("Handling " + req.originalUrl)
	catalog(options, function (status, data) {
		if (status == 0) {
			if (!data.match(/^http/)) {
				console.log("Sending "+data)				
				res.send(data);
				return;
			}
			console.log("Streaming from "+data)
			http.get(url.parse(data), function(res0) {				 
			    var data = [];
			    res0.on('data', function(chunk) {
			        res.write(chunk);
			    }).on('end', function() {
			    	res.end();
			    })
			}).on('error', function () {
		    	res.send(502);
		    });
		} else if (status == 301) {
			res.redirect(301,data);
		} else {
			res.send(status,data);
		}
		if (debug) console.log("Sent response.");
	});
}

function parseOptions(req) {
	var options = {};
    
	function s2b(str) {if (str === "true") {return true} else {return false}}
	function s2i(str) {return parseInt(str)}

	options.all        = req.query.all        || req.query.body      || "/uploads/all.thredds";
	options.catalog    = req.query.catalog    || req.body.catalog    || "^.*";
	options.dataset    = req.query.dataset    || req.body.dataset    || "";
	options.parameters = req.query.parameters || req.body.parameters || "";
	options.start      = req.query.start      || req.body.start      || "";
	options.stop       = req.query.stop       || req.body.stop       || "";
	options.return     = req.query.return     || req.body.return     || "stream";
	options.attach     = req.query.attach     || req.body.attach     || "";
	options.outformat  = req.query.outformat  || req.body.outformat  || "0";
	options.filter     = req.query.filter     || req.body.filter     || "";
	options.filterWindow = req.query.filterWindow     || req.body.filterWindow     || "0";
	
	return options;

}

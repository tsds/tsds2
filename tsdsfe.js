var fs      = require('fs');
var http    = require('http'); http.globalAgent.maxSockets = 100;  // Most Apache servers have this set at 100.
var request = require("request");
var	express = require('express');
var	app     = express().use(express.bodyParser());
var	server  = require("http").createServer(app);
var qs      = require('querystring');
var fs      = require('fs');
var xml2js  = require('xml2js');
var port    = process.argv[2] || 8004;

var debug = true;

function catalog(options, cb) {

	var parser = new xml2js.Parser();
	var fname = __dirname + '/uploads/all.thredds';
	if (debug) console.log("Reading " + fname);

	var resp = [];

	var data = fs.readFileSync(fname);

	parser.parseString(data, function (err, result) {
			//var catalogRefs = JSON.stringify(result["catalog"]["catalogRef"]);
			var catalogRefs = result["catalog"]["catalogRef"];
			if (debug) console.log("Found " + catalogRefs.length + " catalogRef nodes.");

			for (var i = 0;i < catalogRefs.length;i++) {
				resp[i] = {};
				resp[i].value = catalogRefs[i]["$"]["ID"];
				resp[i].label = catalogRefs[i]["$"]["name"] || catalogRefs[i]["$"]["ID"];
				resp[i].href  = catalogRefs[i]["$"]["xlink:href"];

				//console.log(catalogRefs[i]["$"]["ID"])
				if (options.parameters !== "^.*") {	
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
			
			if (options.dataset === "") {
				cb(resp.filter(function(n){return n}));
			} else {
				dataset(options,resp.filter(function(n){return n}),cb);
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
					
					//console.log(datasets)
					while (parents.length < datasets.length) {parents = parents.concat(parent)}

					if (j == N) {

						for (var i = 0;i < datasets.length;i++) {
							dresp[i]          = {};
							dresp[i].value    = datasets[i]["$"]["ID"];
							dresp[i].label    = datasets[i]["$"]["name"] || datasets[i]["$"]["ID"];
							dresp[i].catalog  = parents[i];

							if (options.dataset !== "^.*") {	
								if (options.catalog.substring(0,1) === "^") {
									if (!(datasets[i]["$"]["ID"].match(options.dataset))) {
										delete dresp[i];
									}	
								} else {
									if (!(datasets[i]["$"]["ID"] === options.dataset)) {
										delete dresp[i];
									}
								}
							}
						}

						if (options.parameters === "") {
							cb(dresp.filter(function(n){return n}));
						} else {
							parameter(options,datasets,parents,cb);						
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
			if (!('start' in resp[i].dd)) {resp[i].dd.start = parents[i]["start"]}
			if (!('stop' in resp[i].dd)) {resp[i].dd.stop = parents[i]["stop"]}

			if (options.parameters !== "^.*") {				
				if (options.parameters.substring(0,1) === "^") {
					if (!parameters[i]["$"]["id"].match(options.parameters)) {
						delete resp[i];
					}
				} else  {				
					if (!parameters[i]["$"]["id"] === options.parameters) {
						delete resp[i];
					}
				}
			}
		}							

		cb(resp.filter(function(n){return n}));


}

function handleRequest(req, res) {
	var options = parseOptions(req);
	console.log("Handling " + req.originalUrl)
	catalog(options, function (data) {
		res.send(data);
		if (debug) console.log("Sent response.");
	});
}

function parseOptions(req) {
	var options = {};
    
	function s2b(str) {if (str === "true") {return true} else {return false}}
	function s2i(str) {return parseInt(str)}

	options.all        = req.query.all        || req.query.body      || "/uploads/all.thredds";
	options.catalog    = req.query.catalog    || req.body.catalog    || ".*";
	options.dataset    = req.query.dataset    || req.body.dataset    || "";
	options.parameters = req.query.parameters || req.body.parameters || "";
	options.start      = req.query.start      || req.body.start      || "";
	options.stop       = req.query.stop       || req.body.stop       || "";
	
	return options;

}

app.get('/', function (req, res) {handleRequest(req,res)});
server.listen(port);
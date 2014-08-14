function s2b(str) {if (str === "true") {return true} else {return false}}
function s2i(str) {return parseInt(str)}

// Get port number from command line option.
var port          = s2i(process.argv[2] || 8000);
var debugapp      = s2b(process.argv[3] || "false");
var debugcache    = s2b(process.argv[4] || "false");
var debugstream   = s2b(process.argv[5] || "false");

var AUTOPLOT = "http://autoplot.org/plot/SimpleServlet";
var DC       = "http://localhost:7999/sync/";
var JYDS     = "http://autoplot.org/git/jyds/tsdsfe.jyds";  // Used to create images.

// Typical Apache setting to have server located at http://server/get
// ProxyPass /get http://localhost:port retry=1
// ProxyPassReverse /get http://localhost:port

var TSDSFE   = "http://tsds.org/get/";
var TSDSFE   = "http://localhost:"+port+"/";

// If XMLBASE !== "", xml:base attribute in all.thredds will be replaced with XMLBASE.
// all.thredds may be located on any server provided that relative paths are given for
// catalogRef attribute xlink:href, which points to a TSML file for each catalogRef.
var XMLBASE = TSDSFE+"catalogs/"; 

// Server timeout time in milliseconds
var TIMEOUT  = 1000*60*15; 

// Location to store cached metadata
var CDIR     = __dirname+"/cache/";

// Dependencies
var fs      = require('fs');
var request = require("request");
var	express = require('express');
var	app     = express().use(express.bodyParser());
var	server  = require("http").createServer(app);
var qs      = require('querystring');
var xml2js  = require('xml2js');
var http    = require('http');
var url     = require('url');
var util    = require('util');
var crypto  = require("crypto");

var expandISO8601Duration = require("tsdset").expandISO8601Duration;

// Most Apache servers have this set at 100
http.globalAgent.maxSockets = 100;  

// Serve files in these directories as static files
app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/catalogs", express.static(__dirname + "/catalogs"));

// Main entry point
app.get('/', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		res.contentType("html");
		res.send(fs.readFileSync(__dirname+"/index.htm"));
		return;
	}
	handleRequest(req,res);
});

// Start the server
server
	.listen(port)
	.setTimeout(TIMEOUT,function() {console.log("TSDSFE server timeout ("+(TIMEOUT/(100*60))+" minutes).")});

console.log(Date().toString() + " - TSDSFE running on port "+port);

function handleRequest(req, res) {
	var options = parseOptions(req);

	if (debugapp) console.log("handleRequest(): Handling " + req.originalUrl);

	// Metadata responses are cached as files with filename based on MD5 hash of request.
	var urlsig = crypto.createHash("md5").update(req.originalUrl).digest("hex");	
	var CDIR   = __dirname+"/cache/";
	var cfile  = CDIR+urlsig+".json";

	if (debugcache) {
		if (fs.existsSync(cfile)) {
			console.log("handleRequest(): Metadata cache found "+cfile.replace(__dirname,""));
		} else {
			// No cache will exist if outformat is selected.  Data are not cached by TSDSFE.
			console.log("handleRequest(): Metadata cache not found "+cfile.replace(__dirname,""));
		}
	}
	
	if (options.usemetadatacache && fs.existsSync(cfile)) {
		if (debugcache) {
			console.log("handleRequest(): Using metadata cache file.");
		}
		// Send the cached response and finish
		fs.createReadStream(cfile).pipe(res);
		return;
	}

	// Requests may be made that span multiple catalogs.  Separation identifier is ";".
	// See tests.js for examples.  This is not a well-tested feature.
	var N  = options.catalog.split(";").length;

	// Count of number of catalog responses already sent.  Incremented each time data is sent.
	// TODO: Move this inside of stream() and use stream.Nc as variable.
	var Nc = 0;

	res.setHeader("Content-Type","text/plain"); 

	if (N > 1) {
		var catalogs   = options.catalog.split(";");
		var datasets   = options.dataset.split(";");
		var parameters = options.parameters.split(";");
		var starts     = options.start.split(";");
		var stops      = options.stop.split(";");

		if (debugapp) console.log("handleRequest(): Concatenated parameter request. N = "+N);
		
		var Options = [];
		var str = JSON.stringify(options);
		for (var i=0;i<N;i++) {
			Options[i] = {};
			Options[i] = JSON.parse(str);
			Options[i].catalog    = catalogs[i];
			Options[i].dataset    = datasets[i];
			Options[i].parameters = parameters[i];
			Options[i].start      = starts[i];
			Options[i].stop       = stops[i];
		}
		catalog(Options[0], stream);
		return;
	}
	
	catalog(options, stream);

	function stream(status, data) {
		if (debugapp) console.log("stream(): Stream called.")

		// TODO: Not all stream options will work for requests that span multiple catalogs.  Document and fix.

		if (options.attach === "true") {
			// TODO: Add this option and document it in API.
			//res.setHeader('Content-disposition', 'attachment; filename=data')
		}

		if (status == 0) {

			// If data was not a URL, send it.
			if (!data.match(/^http/)) {
				if (debugapp) console.log("stream(): Sending "+data);				
				res.write(data);
				
				Nc = Nc + 1;
				if (N > 1) res.write("\n");
				if (Nc == N) {
					res.end();
				} else {
					catalog(Options[Nc], stream);
				}
				return;
			}

			// If stream was called with a URL, pipe the data through.
			if (debugapp) console.log("stream(): Streaming from\n\t"+data)

			// Request data from URL.
			var sreq = http.get(data, function(res0) {

				var urldata = [];

				//http.get(url.parse(data), function(res0) {
				//util.pump(res0,res);return;
				//if (debugapp) console.log(res0.headers)
				//res.setHeader('Content-Disposition','attachment; filename='+res0.headers['content-disposition']);

				if (res0.headers["content-type"])
						res.setHeader('Content-Type',res0.headers["content-type"]);

				if (res0.headers["content-length"])
					res.setHeader('Content-Length',res0.headers["content-length"]);
					if (res0.headers["expires"])
						res.setHeader('Expires',res0.headers["expires"]);

					res0.setTimeout(1000*60*15,function () {console.log("----Timeout")});

					res0
						.on('data', function(chunk) {
							res.write(chunk);
							if (debugapp) {
								if (data.length == 0) console.log("stream(): Got first chunk of size "+chunk.length+".");
							}
							//urldata = urldatadata+chunk;
							//if(!flushed) res0.pause();
							//console.log("Got chunk of size "+chunk.length);
							//console.log(data)
						})
						.on('end', function() {
							if (debugapp) console.log('stream(): Got end.');
							Nc = Nc + 1;
							if (Nc == N) {
								if (debugapp) console.log("stream(): Sending res.end().");
								res.end();
							} else {
								if (debugapp) console.log("stream(): Calling catalog with Nc="+Nc);
								catalog(Options[Nc], stream);
							}
						})
						.on('error',function (err) {
							console.log(err);
							console.log(res0);
						});
			}).on('error', function (err) {
				console.log("Error when attempting to get: ");
				console.log("\t" + data);
				console.log("Error:")
				console.log(err)

				res.status(502).send("Error when attempting to retrieve data from data from upstream server "+data.split("/")[2]);
			});
		} else if (status == 301) {
			res.redirect(301,data);
		} else {
			console.log("Sending JSON.");

			if (typeof(data) === "string") {
				// Script.
				res.setHeader('Content-Type','text/plain');
				res.write(data);
				res.end();
				return;
			} else {
				res.write(JSON.stringify(data));
			}
			

			if (data.length > 0) {
				// Cache the JSON.
				if (!fs.existsSync(CDIR)) {
					fs.mkdirSync(CDIR);
				}
				// TODO: This should really be a sync operation.  Need to check if it is already being
				// written before attempting to write.
				fs.writeFile(cfile,JSON.stringify(data),function (err) {
					if (debugcache) console.log("Wrote JSON cache file for request "+req.originalUrl);console.log("\t"+cfile);
				})
			} else {
				if (debugcache) console.log("JSON for " + req.originalUrl + " has zero length.  Not writing cache file.")
			}

			Nc = Nc + 1;
			if (N > 1) res.write("\n");
			if (Nc == N) {
				res.end();
			} else {
				catalog(Options[Nc], stream);
			}
		}
	}		
}

function parseOptions(req) {
	var options = {};
	
	function s2b(str) {if (str === "true") {return true} else {return false}}
	function s2i(str) {return parseInt(str)}

	options.all          = req.query.all          || req.query.body        || "/catalogs/all.thredds";
	options.catalog      = req.query.catalog      || req.body.catalog      || "^.*";
	options.dataset      = req.query.dataset      || req.body.dataset      || "";
	options.parameters   = req.query.parameters   || req.body.parameters   || "";
	options.groups       = req.query.groups       || req.body.groups       || "";
	options.start        = req.query.start        || req.body.start        || "";
	options.stop         = req.query.stop         || req.body.stop         || "";
	options.return       = req.query.return       || req.body.return       || "stream";
	options.attach       = req.query.attach       || req.body.attach       || "";
	options.outformat    = req.query.outformat    || req.body.outformat    || "1";
	options.filter       = req.query.filter       || req.body.filter       || "";
	options.filterWindow = req.query.filterWindow || req.body.filterWindow || "0";
	options.usecache     = s2b(req.query.usecache || req.body.usecache     || "true");

	// Always use cache and don't try to see if update exists.  If false and update fails, cache will be used
	// and warning given in header.
	options.usemetadatacache = s2b(req.query.usemetadatacache || req.body.usemetadatacache     || "true");
	
	if ((options.start === "") && (options.start === "")) {
		options.return = "dd";
	}

	// Not implemented.
	//options.useimagecache = s2b(req.query.useimagecache || req.body.useimagecache     || "true");
	
	return options;
}

// After catalog() executes, it either calls dataset() or stream()
// (will call stream() if only catalog information was requested.)
function catalog(options, cb) {

	// TODO: Allow this to be a URL.  Follow pattern similar to dataset().

	//console.log(options)
	var parser = new xml2js.Parser();
	var fname = __dirname + '/catalogs/all.thredds';
	var resp = [];

	var urlsig = crypto.createHash("md5").update(fname).digest("hex");	
	var cfile = CDIR+urlsig+".json";
	
	if (debugapp) console.log("catalog(): Reading " + fname);
	var data = fs.readFileSync(fname);
	console.log("catalog(): Parsing.");

	parser.parseString(data, function (err, result) {

		// TODO: Save parsed file as json as done in dataset().

		console.log("catalog(): Done parsing.");
		var catalogRefs = result["catalog"]["catalogRef"];
		var xmlbase     = XMLBASE || result["catalog"]["$"]["xml:XMLBASE"];

		if (debugapp) console.log("catalog(): Found " + catalogRefs.length + " catalogRef nodes.");
		//console.log(options.catalog)
		var k = 0;
		for (var i = 0;i < catalogRefs.length;i++) {
			resp[i] = {};
			resp[i].value = catalogRefs[i]["$"]["ID"];
			resp[i].label = catalogRefs[i]["$"]["name"] || catalogRefs[i]["$"]["ID"];
			resp[i].href  = xmlbase+catalogRefs[i]["$"]["xlink:href"];

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
				if (debugapp) console.log("catalog(): Fetching " + resp[0].href);
				//var opts = {uri:resp[0].href,timeout:1000}; // timeout does not work
				var opts = {uri:resp[0].href}; // Does not work
				var xreq = request(opts, function (error, response, body) {
					if (debugapp) console.log("catalog(): Done Fetching " + resp[0].href);
					if (!error && response.statusCode == 200) {
						if (debugapp) console.log("catalog(): Parsing " + resp[0].href);
						parser.parseString(body, function (err, result) {
							if (err) {console.log("catalog(): Parse error.");cb(500,"Error when parsing "+resp[0].href)};
							if (debugapp) console.log("catalog(): Done parsing " + resp[0].href);
							if (debugapp) console.log(result["catalog"]["documentation"]);
							for (var k = 0; k < result["catalog"]["documentation"].length;k++) {
								resp[k].title = result["catalog"]["documentation"][k]["$"]["xlink:title"];
								resp[k].link  = result["catalog"]["documentation"][k]["$"]["xlink:href"];
							}
							cb(200,resp);
						})
					} else {
						console.log("catalog(): Download Error.")
					}
				});
				//does not work.
				//xreq.connection.setTimeout(10, function () {console.log("Timeout");cb(500,"Timeout when attempting to fetch "+resp[0].href)});
			} else {
				cb(200,resp);
			}
		} else {
			dataset(options,resp,cb);
		}
	});
}

// After dataset() executes, it either calls parameter() or stream().
// (will call stream() if only dataset information was requested.)
function dataset(options, catalogs, cb) {

	var parser = new xml2js.Parser();
	var j = 0;
	var N = catalogs.length;
	if (N == 0) {cb(200,"[]");return;}
	var datasets = [];
	var parents = [];
	var dresp = [];

	// TODO: Add a header if error along the way was saved by a cache file.

	// Loop over each catalog
	for (var i = 0; i < N;i++) {
		var urlsig = crypto.createHash("md5").update(catalogs[i].href).digest("hex");	
		
		// cache file for each catalog
		var cfile = CDIR+urlsig+".json";

		if (fs.existsSync(cfile) && options.usemetadatacache) {
			// If cache file exists and always using metadata cache
			if (debugcache) {
				console.log("dataset(): usemetadatacache = true.  Reading cache file "+cfile);
				console.log("dataset(): for URL "+catalogs[i].href);
			}
			var tmp = JSON.parse(fs.readFileSync(cfile).toString());
			if (debugcache) console.log("dataset(): Done");

			j = j+1;
			afterparse(tmp);

		} else {

			// Do head request for catalog file that contains list of datasets.
			var hreq = request.head(catalogs[i].href, function (herror, hresponse) {
				if (!herror && hresponse.statusCode != 200) {
					herror = true;
				}

				if (herror) {
					if (debugcache) {
						console.log("dataset(): Error when making head request for "+hresponse.request.uri.href);
						console.log("dataset(): Will check if cache file exists.");
					}
				}

				if (fs.existsSync(cfile) && !herror) {
					var dhead = new Date(hresponse.headers["last-modified"]);
					if (debugcache) console.log("dataset(): Last-modified time: "+dhead);
					var fstat = fs.statSync(cfile).mtime;
					var dfile = new Date(fstat);
					if (debugcache) console.log('dataset(): Cache file found.  File created: ' + fstat);
					var age = dhead.getTime() - dfile.getTime();
					if (debugcache) console.log('dataset(): last modified time - file last write time = '+age);
				}

				if (age <= 0) {
					console.log("dataset(): Cache file has not expired.  Reading cache file "+cfile.replace(__dirname,""));
					console.log("dataset(): for URL "+hresponse.request.uri.href);
					var tmp = JSON.parse(fs.readFileSync(cfile).toString());
					if (debugcache) console.log("dataset(): Done");

					j = j+1;
					afterparse(tmp);
					return;
				}

				if (debugapp) console.log("dataset(): Fetching " + hresponse.request.uri.href);
				request(hresponse.request.uri.href, function (error, response, body) {
					if (!error && response.statusCode != 200) {
						error = true;
					}

					if ((error) && fs.existsSync(cfile))  {
						if (debugapp) console.log("dataset(): Request failed for "+hres.request.uri.href);
						if (debugapp) console.log("dataset(): Using cached file.")
						var tmp = JSON.parse(fs.readFileSync(cfile).toString());
						j = j+1;
						afterparse(tmp);
						return;
					}
					if ((error) && !fs.existsSync(cfile) && (N == 1))  {
						if (debugapp) console.log("Could not fetch "+response.request.uri.href + " and no cached version exists.");
						cb("502","Could not fetch "+response.request.uri.href + " and no cached version exists.");
						return;
					}

					if (debugapp) console.log("dataset(): Done fetching.");
					if (debugapp) console.log("dataset(): Parsing.");

					if (!error && response.statusCode == 200) {
						parser.parseString(body, function (err, tmp) {

							if (err) {
								cb("502","Could not parse "+hres.request.uri.href+".");
								return;
							}

							if (debugapp) console.log("dataset(): Done parsing.");
							if (debugcache) console.log("dataset(): Writing cache file"+cfile);
							fs.writeFileSync(cfile,JSON.stringify(tmp));
							if (debugapp) console.log("dataset(): Done.")

							j = j+1;

							afterparse(tmp);
						})
					} else {
						j = j+1;
					}
				});
			})
		}
	}

	function afterparse(result) {

		var parent = result["catalog"]["$"]["id"] || result["catalog"]["$"]["ID"];
		var tmparr = result["catalog"]["dataset"];
		datasets = datasets.concat(tmparr);
		while (parents.length < datasets.length) {parents = parents.concat(parent)}

		if (j == N) {

			for (var i = 0;i < datasets.length;i++) {
				dresp[i]          = {};
				dresp[i].value    = datasets[i]["$"]["id"] || datasets[i]["$"]["ID"];
				dresp[i].label    = datasets[i]["$"]["name"] || dresp[i].value;
				dresp[i].catalog  = parents[i];

				//console.log(options.dataset)
				if (options.dataset !== "^.*") {	
					if (options.dataset.substring(0,1) === "^") {
						if (!(dresp[i].value.match(options.dataset))) {
							delete dresp[i];
							delete datasets[i];
						}	
					} else {
						if (!(dresp[i].value === options.dataset)) {
							delete dresp[i];
							delete datasets[i];
						} else {
							var z = i;
						}
					}
				}
			}
			if (options.parameters === "" && !(options.groups === "^.*")) {
				dresp = dresp.filter(function(n){return n;});
				if (dresp.length == 1 && options.dataset.substring(0,1) !== "^") {
					if (typeof(datasets[z]["documentation"]) !== "undefined") {
						for (var k = 0; k < datasets[z]["documentation"].length;k++) {
							dresp[k].title = datasets[z]["documentation"][k]["$"]["xlink:title"];
							dresp[k].link  = datasets[z]["documentation"][k]["$"]["xlink:href"];
						}
					} else {
						dresp[0].title = "No dataset documentation in catalog";
						dresp[0].link  = "";									
					}
					cb(200,dresp);
				} else {
					cb(200,dresp.filter(function(n){return n}));
				}
			} else {
				parameter(options,parents,datasets.filter(function(n){return n}),cb);
			}						
		}
	}
}

function parameter(options, catalogs, datasets, cb) {

	if (options.groups === "^.*") {
		options.parameters = "^.*";
	}

	var parameters = [];
	var parents = [];
	var cats = [];
	var resp = [];
	
	for (var i = 0;i < datasets.length;i++) {
		parameters = parameters.concat(datasets[i].variables[0].variable);
		var parent = datasets[i]["$"];

		var timeCoverage = datasets[i].timeCoverage;
		if (timeCoverage) {
			parent.start    = timeCoverage[0].Start[0];

			parent.stop = "P0D";
			if (timeCoverage[0].End)
				parent.stop     = timeCoverage[0].End[0];

			parent.cadence = "";
			if (timeCoverage[0].Cadence)
				parent.cadence  = timeCoverage[0].Cadence[0];

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
		resp[i].value     = parameters[i]["$"]["id"] || parameters[i]["$"]["ID"];
		resp[i].label     = parameters[i]["$"]["name"] || resp[i].value || "";
		resp[i].units     = parameters[i]["$"]["units"] || "";
		resp[i].catalog   = cats[i];
		resp[i].dataset   = parents[i]["id"] || parents[i]["ID"];
		resp[i].parameter = parameters[i]["$"]["id"] || parameters[i]["$"]["ID"];
		resp[i].dd        = parameters[i]["$"];
		
		if (!('urltemplate' in resp[i].dd))  {resp[i].dd.urltemplate = parents[i]["urltemplate"]}
		if (!('urlsouce' in resp[i].dd))     {resp[i].dd.urlsource = parents[i]["urlsource"]}
		if (!('urlprocessor' in resp[i].dd)) {resp[i].dd.urlprocessor = parents[i]["urlprocessor"]}
		if (!('timeformat' in resp[i].dd))   {resp[i].dd.timeformat = parents[i]["timeformat"]}
		if (!('timecolumns' in resp[i].dd))  {resp[i].dd.timecolumns = parents[i]["timecolumns"]}
		if (!('columns' in resp[i].dd))      {resp[i].dd.columns = parents[i]["columns"]}
		if (!('start' in resp[i].dd))        {resp[i].dd.start = parents[i]["start"]}
		if (!('stop' in resp[i].dd))         {resp[i].dd.stop = parents[i]["stop"]}
		if (!('cadence' in resp[i].dd))      {resp[i].dd.cadence = parents[i]["cadence"]}
		if (!('fillvalue' in resp[i].dd))    {resp[i].dd.fillvalue = parameters[i]["$"]["fillvalue"] || ""}
		
		if (options.parameters !== "^.*") {				

			var value = resp[i].value;
			//console.log(value)

			if (options.parameters.substring(0,1) === "^") {
				if (!(parameters[i]["$"]["id"].match(options.parameters))) {
					delete resp[i];
				}
			} else  {
				var re = new RegExp("/^"+value+"$/");
				//console.log(options.parameters)
				var mt = options.parameters.match(value);
				//console.log(mt)
				if (!mt) {
					delete resp[i];
				} else if (mt[0].length != value.length) {
					delete resp[i];
				} else {
					if (debugapp)
						console.log("parameter(): Match in catalog for requested parameter "+value+".")
				}
			}
		}
	}
	resp = resp.filter(function(n){return n});

	if ((options.parameters === "^.*") || (options.start === "" && options.stop === "")) {
		cb(200,resp);
		return;
	}
	
	if (options.groups === "^.*") {
		var parinfo = {};

		for (i = 0;i<resp.length;i++) {
			parinfo[resp[i].value] = {};
			parinfo[resp[i].value].columns = resp[i].dd.columns;
			parinfo[resp[i].value].units = resp[i].dd.units;
		}

		var ddresp = [];

		for (j=0;j< datasets[0].groups[0].group.length;j++) {
			ddresp[j] = {};
			ddresp[j].dd = {};

			var groups = datasets[0].groups[0].group[j]["$"].id.split(",");
			var groupcols = [];
			var groupunits = [];
			for (i=0;i<groups.length;i++) {
				groupcols[i] = parinfo[groups[i]].columns;
				groupunits[i] = parinfo[groups[i]].units;
			}
			datasets[0].groups[0].group[j]["$"].columns = groupcols.join(",");
			datasets[0].groups[0].group[j]["$"].units = groupunits.join(",");
			ddresp[j].dd.columns =  groupcols.join(",");
			ddresp[j].dd.id      =  groups.join(",");
			ddresp[j].dd.label   =  datasets[0].groups[0].group[j]["$"].label;

		}
		console.log(datasets[0].groups[0].group);
		console.log(ddresp);

		// Get JSON for group list
		cb(200,ddresp);
		return;
	}
	
	if (typeof(resp[0]) === "undefined") {cb(200,"[]");return;}

	var columns = resp[0].dd.timecolumns;
	for (var z = 0;z<resp.length;z++) {
		columns = columns + "," + resp[z].dd.columns;
	}

	start = options.start || resp[0].dd.start;
	stop  = options.stop  || resp[0].dd.start;

	if (debugapp) console.log("parameter(): Requested start : " + options.start);
	if (debugapp) console.log("parameter(): DD start        : " + resp[0].dd.start);
	if (debugapp) console.log("parameter(): Requested stop  : " + options.stop);
	if (debugapp) console.log("parameter(): DD stop         : " + resp[0].dd.stop);

	var urltemplate  = resp[0].dd.urltemplate;
	var urlprocessor = resp[0].dd.urlprocessor;
	var urlsource    = resp[0].dd.urlsource;
		
	if (Date.parse(stop) < Date.parse(start)) {
		cb(500,"Stop time is before than start time.");
		return;
	}
	if (Date.parse(start) > Date.parse(stop)) {
		cb(500,"Start time is later than stop time.");
		return;
	}

	var args = "";
	if (urlprocessor) {
		args = "&plugin="+urlprocessor;
	}
	if (urltemplate) {
		args = args + "&template="+urltemplate;
	} 
	if (urlsource) {
		args = args + "&source="+urlsource;
	}

	if (args) {
		var dc = DC+"?"+args+"&timeRange="+start+"/"+stop;
	} else {
		var dc = DC+"?timeRange="+start+"/"+stop;
	}
		

	if (options.return === "urilist") {
		cb(0,dc+"&return=urilist");
	}
	if (options.return === "urilistflat") {
		cb(0,dc+"&return=urilistflat");
	}
	if (options.return === "png" || options.return === "pdf" || options.return === "svg" || options.return === "jyds" || options.return === "matlab" || options.return === "idl") {
		// If more than one resp, this won't work.

		var Labels = "'";
		var Parameters = "";
		for (var z = 0;z<resp.length;z++) {
			Parameters = Parameters + resp[z].parameter + ",";
			Labels = Labels + resp[z].parameter + " [" + resp[z].dd.units + "]','";
		}

		if ((options.return === "matlab") || (options.return === "idl")) {

			if (options.return === "matlab") var ext = "m";
			if (options.return === "idl") var ext = "pro";

			var script = fs.readFileSync(__dirname + "/scripts/tsdsfe."+ext).toString();
			console.log(script)
			script = script.replace("__SERVER__",TSDSFE).replace("__QUERYSTRING__","catalog="+resp[0].catalog+"&dataset="+resp[0].dataset+"&parameters="+Parameters.slice(0,-1)+"&start="+start+"&stop="+stop+"&outformat=2");
			script = script.replace("__LABELS__",Labels.slice(0,-2));
			cb(200,script);
			return;
		}

		var tmp = expandISO8601Duration(start+"/"+stop,{debug:false})
		console.log(tmp);
		start = tmp.split("/")[0].substring(0,10);
		stop = tmp.split("/")[1].substring(0,10);

		url = JYDS + "?server="+TSDSFE+"&catalog="+resp[0].catalog+"&dataset="+resp[0].dataset+"&parameters="+resp[0].parameter+"&timerange="+start+"/"+stop;

		if (options.return === "jyds") {
			cb(301,"http://autoplot.org/autoplot.jnlp?open=vap+jyds:"+url);
			return;
		}

		console.log(resp[0].dd.fillvalue)
		if (resp[0].label != "") {url = url + "&labels="+resp[0].label};
		if (resp[0].units != "")  {url = url + " ["+resp[0].units+"]" +"&units="+resp[0].units;}
		if (resp[0].dd.fillvalue != "")  {url = url + "&fills="+resp[0].dd.fillvalue};

		var format = "image/png";
		if (options.return === "pdf") {format = "application/pdf"}
		if (options.return === "svg") {format = "image/svg%2Bxml"}
		
		var aurl = AUTOPLOT + "?drawGrid=true&format="+format+"&plot.xaxis.drawTickLabels=true&width=800&height=200&url=vap+jyds:" + encodeURIComponent(url);	
		cb(0,aurl);
		return;
	}

	if (debugapp) {
		console.log("parameter(): options = ")
		console.log(options);
	}
	if (options.return === "dd") {
		ddresp = [];
		for (var z = 0;z<resp.length;z++) {
			//ddresp[z] = resp[z].dd;
			ddresp[z] = {};
			ddresp[z].columnIDs        = resp[z].dd.ID;
			ddresp[z].columnLabels     = resp[z].dd.label;
			ddresp[z].columnUnits      = resp[z].dd.units;
			ddresp[z].columnTypes      = resp[z].dd.type;
			ddresp[z].columnFillValues = resp[z].dd.fillvalue;
			ddresp[z].columnRenderings = resp[z].dd.rendering;
			ddresp[z].start = resp[z].dd.start;
			ddresp[z].stop = resp[z].dd.stop;


			ddresp[z].urltemplate = "";
			if (options.outformat === "1") {
				ddresp[z].columns = "" + (z+2);
				ddresp[z].timeFormat = "%Y-%m-%DT%H%M%SZ";
				ddresp[z].timeColumns = ""+1;
			}
			if (options.outformat === "2") {
				ddresp[z].columns = "" + (z+7);
				ddresp[z].timeFormat = "%Y %m %D %H %M %S";
				ddresp[z].timeColumns = "1,2,3,4,5,6";
			}
		}
		
		cb(200,ddresp);
	}
	
	if ((options.return === "stream") || (options.return === "redirect")) {				 
		dc = dc
				+"&return=stream"
				+"&lineRegExp="+(resp[0].dd.lineregex || ".")
				+"&timecolumns="+resp[0].dd.timecolumns
				+"&timeformat="+resp[0].dd.timeformat
				+"&streamFilterReadColumns="+columns
				+"&streamFilterTimeFormat="+options.outformat
				+"&streamFilterComputeFunction="+options.filter
				+"&streamFilterComputeWindow="+options.filterWindow
				+"&streamFilterExcludeColumnValues="+resp[0].dd.fillvalue
				+"&streamOrder=true"
				+"&streamGzip=false"
				;

		if (!options.usecache) dc = dc+"&forceUpdate=true&forceWrite=true"

		if (options.return === "redirect") {
			// If more than one resp, this won't work.
			cb(302,dc);
		}

		//dc = dc+"&return=stream&lineRegExp="+resp[0].dd.lineregex + "&timecolumns="+resp[0].dd.timecolumns+"&timeformat="+resp[0].dd.timeformat+"&streamFilterReadColumns="+columns+"&lineFormatter=formattedTime&outformat="+options.outformat;
		//console.log(dc)
		cb(0,dc)
	}
}
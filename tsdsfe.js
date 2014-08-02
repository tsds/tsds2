var debug        = true;
var debugcatalog = false;

var AUTOPLOT = "http://autoplot.org/plot/dev/SimpleServlet";
var TSDSFE   = "http://tsds.org/get/";
var TIMEOUT  = 1000*60*15; // Server timeout time in seconds.
var port     = process.argv[2] || 8004;
var DC       = "http://localhost:7999/sync/";

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

http.globalAgent.maxSockets = 100;  // Most Apache servers have this set at 100.

app.use("/tsdsfe/js", express.static(__dirname + "/js"));
app.use("/tsdsfe/css", express.static(__dirname + "/css"));
app.use("/tsdsfe/scripts", express.static(__dirname + "/scripts"));
app.use("/tsdsfe/uploads", express.static(__dirname + "/uploads"));

app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/uploads", express.static(__dirname + "/uploads"));

app.get('/tsdsfe/tsdsfe.jyds', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		res.contentType("text/plain");
		res.send(fs.readFileSync(__dirname+"/scripts/tsdsfe.jyds"));
		return;
	}
});

app.get('/tsdsfe.jyds', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		res.contentType("text/plain");
		res.send(fs.readFileSync(__dirname+"/scripts/tsdsfe.jyds"));
		return;
	}
});

app.get('/tsdsfe', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		res.contentType("html");
		res.send(fs.readFileSync(__dirname+"/index.htm"));
		return;
	}
	//res.setTimeout(1000*60*15);
	//req.setTimeout(1000, function () {console.log("Request Timeout")});

	//setTimeout(function () {res.end();},60*3*1000)
	handleRequest(req,res);
});

app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/uploads", express.static(__dirname + "/uploads"));

app.get('/tsdsfe.jyds', function (req, res) {
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
	//res.setTimeout(1000*60*15);
	handleRequest(req,res);
});

server
	.listen(port)
	.setTimeout(TIMEOUT,function() {console.log("TSDSFE server timeout (15 minutes).")});

function handleRequest(req, res) {
	var options = parseOptions(req);

	if (debug) console.log("Handling " + req.originalUrl);

	//console.log(req)
	var urlsig = crypto.createHash("md5").update(req.originalUrl).digest("hex");
	//console.log(urlsig);

	options.urlsignature = urlsig;
	
	// Cache of metadata
	var cdir  = __dirname+"/cache/";
	var cfile = cdir+urlsig+".json";

	if (options.usemetadatacache && fs.existsSync(cfile)) {
		console.log("Using cache.");
		fs.createReadStream(cfile).pipe(res);
		return;
	}

	var Nc = 0;
	var N  = options.catalog.split(";").length;

    res.setHeader("Content-Type","text/plain"); 


	if (N > 1) {
		var catalogs   = options.catalog.split(";");
		var datasets   = options.dataset.split(";");
		var parameters = options.parameters.split(";");
		var starts     = options.start.split(";");
		var stops      = options.stop.split(";");

		if (debug) console.log("Concatenated parameter request. N = "+N);
		
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
		if (debug) console.log("Stream called.")
		//if (debug) console.log(options);
		// If more than one resp, this won't work.

		if (options.attach === "true") {
			//res.setHeader('Content-disposition', 'attachment; filename=data')
		}

		if (status == 0) {
			if (!data.match(/^http/)) {
				if (debug) console.log("Sending "+data);				
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

			if (debug) console.log("Streaming from\n"+data)
			var sreq = http.get(data, function(res0) {
			//http.get(url.parse(data), function(res0) {
				//util.pump(res0,res);return;
		    	var data = [];
		    	if (debug) console.log(res0.headers)
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
		        			if (data.length == 0) console.log("Got first chunk of size "+chunk.length);
		        			data = data+chunk;
		        			//if(!flushed) res0.pause();
		        			//console.log("Got chunk of size "+chunk.length);
		        			//console.log(data)
		    			})
		    			.on('end', function() {
			    			if (debug) console.log('got end.');
				    			Nc = Nc + 1;
				    			//if (N > 1) res.write("\n");
			    				if (Nc == N) {
			    				if (debug) console.log("Sending res.end().");
			    				//res.write("\n")
			    				//console.log(data)
				    			res.end();
		    				} else {
		    					if (debug) console.log("Calling catalog with Nc="+Nc);
		    					catalog(Options[Nc], stream);
		    				}
		    			})
		    			.on('error',function (err) {
		    				console.log(err);
		    			});
			}).on('error', function (err) {
				console.log(err)
	    		res.status(502).send("Error when attempting to retrieve data from data from upstream server: "+err);
	    	});
		} else if (status == 301) {
			res.redirect(301,data);
		} else {
			console.log("Sending JSON.")
			res.write(JSON.stringify(data));
			
			if (!fs.existsSync(cdir)) {
				fs.mkdirSync(cdir);
			}
			fs.writeFile(cfile,JSON.stringify(data),function (err) {
				console.log("Wrote metadata cache file: "+cfile);
			});

			Nc = Nc + 1;
    		if (N > 1) res.write("\n");
    		if (Nc == N) {
	    		res.end();
	    	} else {
	    		catalog(Options[Nc], stream);
	    	}
		}
		//if (debug) console.log("Sent response.");
	}		
}

function parseOptions(req) {
	var options = {};
    
	function s2b(str) {if (str === "true") {return true} else {return false}}
	function s2i(str) {return parseInt(str)}

	options.all          = req.query.all          || req.query.body        || "/uploads/all.thredds";
	options.catalog      = req.query.catalog      || req.body.catalog      || "^.*";
	options.dataset      = req.query.dataset      || req.body.dataset      || "";
	options.parameters   = req.query.parameters   || req.body.parameters   || "";
	options.groups       = req.query.groups       || req.body.groups       || "";
	options.start        = req.query.start        || req.body.start        || "";
	options.stop         = req.query.stop         || req.body.stop         || "";
	options.return       = req.query.return       || req.body.return       || "stream";
	options.attach       = req.query.attach       || req.body.attach       || "";
	options.outformat    = req.query.outformat    || req.body.outformat    || "0";
	options.filter       = req.query.filter       || req.body.filter       || "";
	options.filterWindow = req.query.filterWindow || req.body.filterWindow || "0";
	options.usecache     = s2b(req.query.usecache || req.body.usecache     || "true");
	options.usemetadatacache = s2b(req.query.usemetadatacache || req.body.usemetadatacache     || "true");
	
	// Not implemented.
	//options.useimagecache = s2b(req.query.useimagecache || req.body.useimagecache     || "true");
	
	return options;
}

function catalog(options, cb) {

	var parser = new xml2js.Parser();
	var fname = __dirname + '/uploads/all.thredds';
	if (debug) console.log("Reading " + fname);

	var resp = [];

	var data = fs.readFileSync(fname);

	parser.parseString(data, function (err, result) {
		//console.log(result)
		//var catalogRefs = JSON.stringify(result["catalog"]["catalogRef"]);
			var catalogRefs = result["catalog"]["catalogRef"];
			if (debug) console.log("Found " + catalogRefs.length + " catalogRef nodes.");
			//console.log(options.catalog)
			var k = 0;
			for (var i = 0;i < catalogRefs.length;i++) {
				//console.log(catalogRefs[i]["$"]["ID"])
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
					if (debug) console.log("Fetching " + resp[0].href);
					request(resp[0].href, function (error, response, body) {
						if (debug) console.log("Done Fetching " + resp[0].href);
						if (!error && response.statusCode == 200) {
							parser.parseString(body, function (err, result) {
								if (err) console.log("Parse error.")
								if (debugcatalog) console.log(result["catalog"]["documentation"]);
								for (var k = 0; k < result["catalog"]["documentation"].length;k++) {
									resp[k].title = result["catalog"]["documentation"][k]["$"]["xlink:title"];
									resp[k].link  = result["catalog"]["documentation"][k]["$"]["xlink:href"];
								}
								cb(200,resp);
							})
						} else {
							console.log("Download Error.")
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
	if (N == 0) {cb(200,"[]");return;}
	var datasets = [];
	var parents = [];
	var dresp = [];
	for (var i = 0; i < N;i++) {
		if (debug) console.log("Fetching " + resp[i].href);
		request(resp[i].href, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				parser.parseString(body, function (err, result) {
					if (debug) console.log("Done fetching and parsing.");

					j = j+1;

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
		if (!('fillvalue' in resp[i].dd))    {resp[i].dd.fill = parameters[i]["$"]["fillvalue"] || ""}

		if (0) {
			delete resp[i].dd.urltemplate;
			delete resp[i].dd.urlsource;
			delete resp[i].dd.urlprocessor;
			delete resp[i].dd.lineregex;
			delete resp[i].dd.timeformat;
			delete resp[i].dd.timecolumns;
			delete resp[i].dd.columns;
		}
		//delete resp[i].fill;
		//delete resp[i].label;
		//delete resp[i].units;
		//delete resp[i].units;
		
		if (options.parameters !== "^.*") {				
			if (options.parameters.substring(0,1) === "^") {
				if (!(parameters[i]["$"]["id"].match(options.parameters))) {
					delete resp[i];
				}
			} else  {
				console.log("resp[i].value = "+resp[i].value)
				var re = new RegExp("/^"+resp[i].value+"$/")
				var mt = options.parameters.match(resp[i].value);
				console.log(mt)
				if (!mt) {
					//console.log("Deleting "+parameters[i]["$"]["id"])
					delete resp[i];
				} else if (mt.index > 1) {
					delete resp[i];
				} else {
					console.log("Keeping "+resp[i].value)
				}
			}
		}
	}
	resp = resp.filter(function(n){return n});
	//console.log(resp[0])
	
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

	if (options.start || options.stop) {
		start = options.start || resp[0].dd.start;
		stop  = options.stop  || resp[0].dd.stop;

		if (debug) console.log("Requested start :" + Date.parse(options.start));
		if (debug) console.log("DD start        :" + Date.parse(resp[0].dd.start));
		if (debug) console.log("Requested stop  :" + Date.parse(options.stop));
		if (debug) console.log("DD stop         :" + Date.parse(resp[0].dd.stop));

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
		if (options.return === "redirect") {
			// If more than one resp, this won't work.
			cb(302,dc);
		}
		if (options.return === "png" || options.return === "pdf" || options.return === "svg") {
			// If more than one resp, this won't work.

			var format = "image/png";
			if (options.return === "pdf") {format = "application/pdf"}
			if (options.return === "svg") {format = "image/svg%2Bxml"}
			
			var tmp = expandISO8601Duration(start+"/"+stop,{debug:false})
			console.log(tmp);
			start = tmp.split("/")[0].substring(0,10);
			stop = tmp.split("/")[1].substring(0,10);
			url = TSDSFE + "tsdsfe.jyds?server="+TSDSFE+"&catalog="+resp[0].catalog+"&dataset="+resp[0].dataset+"&parameters="+resp[0].parameter+"&timerange="+start+"/"+stop;
			if (resp[0].label !== "") url = url + "&labels="+resp[0].label;
			if (resp[0].units !== "")  {url = url + " ["+resp[0].units+"]" +"&units="+resp[0].units;}
			if (resp[0].fill !== "")  url = url + "&fills="+resp[0].fill;
			var aurl = AUTOPLOT + "?drawGrid=true&format="+format+"&plot.xaxis.drawTickLabels=true&width=800&height=200&url=vap+jyds:" + encodeURIComponent(url);	
			console.log(aurl);
			console.log(typeof(aurl))
			cb(0,aurl);
		}
		if (options.return === "jyds") {
			// If more than one resp, this won't work.
			cb(0,"http://localhost:"+port+"/tsdsfe.jyds");
		}
		if (options.return === "dd") {
			ddresp = [];
			for (var z = 0;z<resp.length;z++) {
				ddresp[z] = resp[z].dd;
				ddresp[z].urltemplate = "";
				if (options.outformat === "1") {
					ddresp[z].columns = "" + (z+2);
					ddresp[z].timeformat = "ISO8601";
					ddresp[z].timecolumns = ""+1;
				}
				if (options.outformat === "2") {
					ddresp[z].columns = "" + (z+7);
					ddresp[z].timeformat = "YYYY mm DD HH MM SS.SSS";
					ddresp[z].timecolumns = "1,2,3,4,5,6";
				}
			}
			cb(0,JSON.stringify(ddresp));
		}
		
		if (options.return === "stream") {				 
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

			//dc = dc+"&return=stream&lineRegExp="+resp[0].dd.lineregex + "&timecolumns="+resp[0].dd.timecolumns+"&timeformat="+resp[0].dd.timeformat+"&streamFilterReadColumns="+columns+"&lineFormatter=formattedTime&outformat="+options.outformat;
			//console.log(dc)
			cb(0,dc)
		}
	} else {
		cb(200,resp);
	}	
}
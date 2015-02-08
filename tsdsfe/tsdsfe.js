
function s2b(str) {if (str === "true") {return true} else {return false}}
function s2i(str) {return parseInt(str)}

// Get port number from command line option.
var port          = s2i(process.argv[2] || 8000);
var debugapp      = s2b(process.argv[3] || "false");
var debugcache    = s2b(process.argv[4] || "false");
var debugstream   = s2b(process.argv[5] || "false");

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
var util    = require("util");
var clc     = require('cli-color');
var os      = require("os");

function logc(str,color) {var msg = clc.xterm(color); console.log(msg(str));};

var expandISO8601Duration = require(__dirname + "/../tsdset/lib/expandtemplate").expandISO8601Duration;

// Most Apache servers have this set at 100
http.globalAgent.maxSockets = 100;  

if (fs.existsSync(__dirname + "/conf/config."+os.hostname()+".js")) {
	// Look for host-specific config file conf/config.hostname.js.
	if (debugapp) {console.log("Using configuration file conf/config."+os.hostname()+".js")}
	var config = require(__dirname + "/conf/config."+os.hostname()+".js").config();
} else {
	// Default
	if (debugapp) {console.log("Using configuration file conf/config.js")}
	var config = require(__dirname + "/conf/config.js").config();
}

if (config.TSDSFE.match(/http:\/\/localhost/)) {
	if (!config.AUTOPLOT.match(/http:\/\/localhost/)) {
		console.log("Warning: stream(): Image request will not work because Autoplot image servlet specified by config.AUTOPLOT must be localhost if config.TSDSFE is localhost.")
	}
}

// Serve files in these directories as static files
app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use('/scripts', express.directory(__dirname + "/scripts"));
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/catalogs", express.static(__dirname + "/catalogs"));

app.use(express.compress());

// Main entry point
app.get('/', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		res.contentType("html");
		res.send(fs.readFileSync(__dirname+"/index.htm"));
		return;
	}
	handleRequest(req,res);
})

// Start the server
server
	.listen(config.PORT)
	.setTimeout(config.TIMEOUT,function() {console.log("TSDSFE server timeout ("+(config.TIMEOUT/(100*60))+" minutes).")});


var CDIR = config.CACHEDIR;
if (!config.CACHEDIR.match(/^\//)) {
	CDIR   = __dirname+"/cache/";
}
if (!fs.existsSync(CDIR)) {
	fs.mkdirSync(CDIR)
}

logc((new Date()).toISOString() + " - [tsdsfe] listening on port "+config.PORT,10);

function handleRequest(req, res) {

	var options = parseOptions(req);

	if (debugapp) {
		console.log("handleRequest(): Handling " + req.originalUrl);
		console.log("handleRequest(): options: ");
		console.log(options)
	}

	//res.header('Access-Control-Allow-Origin', '*');
	//res.header('Access-Control-Allow-Methods', 'GET,POST');
	//res.header('Access-Control-Allow-Headers', 'Content-Type');

	options.res = res;
	options.req = req;

	// Metadata responses are cached as files with filename based on MD5 hash of request.
	var urlsig = crypto.createHash("md5").update(req.originalUrl).digest("hex");	

	var cfile  = CDIR + urlsig + ".json";

	// No cache will exist if one of outformat={0,1,2} is selected.  Data are not cached by TSDSFE.
	if (debugcache) {
		if (fs.existsSync(cfile)) {
			if (debugcache) console.log("handleRequest(): Metadata response cache found for url = " + req.originalUrl);
		} else {
			if (debugcache) console.log("handleRequest(): Metadata response cache not found for url = " + req.originalUrl);
		}
	}
	
	if (options.usemetadatacache && fs.existsSync(cfile)) {
		if (debugcache) {
			console.log("handleRequest(): Using response cache file.");
		}
		// Send the cached response and finish
		fs.createReadStream(cfile).pipe(res);
		return;
	} else {
		if (debugcache) console.log("handleRequest(): Not using metadata response cache file if found because usemetadatacache = false.")
	}

	// Catch case where ?catalog=CATALOG&return={tsds,autoplot-bookmarks,spase}
	if ( (options.return === "autoplot-bookmarks") || (options.return === "tsds") ) {

		if (options.outformat == 1) {
			options.outformat = "xml";
		}

		if (debugapp) console.log("handleRequest(): Request is for " + options.return)
		if (options.outformat === "json") {
			res.setHeader("Content-Type","application/json"); 
		} else {
			res.setHeader("Content-Type","text/xml"); 
			options.outformat = "xml";
		}

		// Get list of all catalogs and their URLs		
		url = config["TSDSFE"] + "?catalog=^.*";
		if (debugapp) console.log("handleRequest(): Requesting "+url)
		request(url, function (err,catres,catbody) {

			catalogjson = JSON.parse(catbody);

			// Iterate through catalog and find one that matches requested catalog.
			for (var i = 0;i < catalogjson.length;i++) {
				if (catalogjson[i].label.match(options.catalog)) {
					url = catalogjson[i].href;

					if (debugapp) console.log("handleRequest(): Calling getandparse() with URL " + url);

					// Request the matched catalog and parse it.
					if (options.return === "tsds") {
						getandparse(url,options,function (ret) {
							if (options.outformat === "xml") {
								if (debugapp) console.log("handleRequest(): Sending TSDS XML.");
								res.write(ret.toString());	
								res.end();									
							} else {
								res.write(JSON.stringify(ret));	
								res.end();																		
							}
						});
					}

					if (options.return === "autoplot-bookmarks") {
						var outformat = options.outformat;
						options.outformat = "json"; // This causes getandparse to return TSDS JSON, which tsds2bookmarks requires.
						if (debugapp) console.log("handleRequest(): Calling getandparse() with URL " + url)
						getandparse(url,options,function (ret) {
							options.outformat = outformat;
							var tsds2other = require(__dirname + "/js/tsds2other.js").tsds2other;
							if (debugapp) console.log("handleRequest(): Converting TSDS XML catalog to Autoplot bookmark XML.");

							// Filename signature is based on input + transformation code.
							var retsig  = crypto.createHash("md5").update(JSON.stringify(ret)+tsds2other.toString()).digest("hex");
							var retfile = CDIR + retsig + ".xml";

							if (fs.existsSync(retfile)) {
								if (debugcache) console.log("handleRequest(): Cache of autoplot-bookmarks file found for input "+url);
								ret = fs.readFileSync(retfile);
								finish(ret);
							} else {
								if (debugcache) console.log("handleRequest(): No cache of autoplot-bookmarks file found for input = "+url);
								tsds2other(ret, "autoplot-bookmarks", function (ret) {
									finish(ret);
									if (debugcache) console.log("handleRequest(): Writing cache file for autoplot-bookmarks for input = "+url)
									fs.writeFileSync(retfile,ret);
								});
								
							}

							function finish(ret) {
								if (outformat === "xml") {
									res.write(ret.toString());
									res.end();
								} else {
									res.write(JSON.stringify(ret));	
									res.end();																											
								}

							}
						});
					}

				}
			}			
		})

		return;
	}

	// Requests may be made that span multiple catalogs.  Separation identifier is ";".
	// See tests.js for examples.
	var N  = options.catalog.split(";").length;

	// Count of number of catalog responses already sent.  Incremented each time data is sent.
	// TODO: Move this inside of stream() and use stream.Nc as variable.
	var Nc = 0;

	//Sending this to the browser causes only one chunk to be rendered followed by
	//trailing garbage.
	//res.setHeader("Content-Type","text/plain"); 

	if (N > 1) {

		// If any one of these is missing a ";", first value is used.
		var catalogs    = options.catalog.split(";");
		var datasets    = options.dataset.split(";");
		var parameterss = options.parameters.split(";");
		var starts      = options.start.split(";");
		var stops       = options.stop.split(";");
		
		if (debugapp) console.log("handleRequest(): Concatenated parameter request. N = "+N);
		
		var Options = [];

		for (var i=0;i<N;i++) {
			Options[i]             = {};
			// Clone options object.
			for (var key in options) {
				if ((key !== "req") || (key !== "res")) {
					Options[i][key] = options[key];
				}
			}
			Options[i].catalog     = catalogs[i] || options.catalog.split(";")[0];
			Options[i].dataset     = datasets[i] || options.dataset.split(";")[0];
			Options[i].parameterss = parameterss[i] || options.parameters.split(";")[0];
			Options[i].start       = starts[i] || options.start.split(";")[0];
			Options[i].stop        = stops[i] || options.stop.split(";")[0];
		}
		// If N > 1, stream will call again (catalog(Options[1], stream)) when first data request is complete, etc.
		// If response if for an image, client will need to split it.
		catalog(Options[0], stream);
		return;
	}

	catalog(options, stream);

	function stream(status, data) {
		if (debugapp) console.log("stream(): Stream called.")

		// TODO: Not all stream options will work for requests that span multiple catalogs.
		// Document and fix.

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

			// By default, use attach = true.  If displaying stream in browser, must
			// return un-gzipped data from DataCache.  DataCache sends concatenated gzip
			// files, which most browsers don't handle.  Result is first file is displayed and
			// then trailing garbage.  See
			// http://stackoverflow.com/questions/16740034/http-how-to-send-multiple-pre-cached-gzipped-chunks
			if ((options.attach) && ((options.return === "stream") || (options.return === "redirect"))) {
				if (req.headers['accept-encoding']) {
					if (req.headers['accept-encoding'].match("gzip")) {
						res.setHeader('Content-Encoding','gzip');
						// Request a gzipped stream from DataCache.
						data = data.replace("streamGzip=false","streamGzip=true");
					}
				}
				//var fname = req.originalUrl;//.replace(/^&/,"").replace(/\&/g,"_").replace(/\=/g,"-")+"txt";
				//console.log(fname)
				//res.setHeader("Content-Disposition", "attachment;filename="+fname);
			}

			// If stream was called with a URL, pipe the data through.
			if (debugapp) console.log("stream(): Streaming from\n\t"+data)
			
			//Better method for Nc == 0
			//request.get(data).pipe(res);
			//return;

			// Request data from URL.
			var urldata = "";

			var sreq = http.get(data, function(res0) {

				if (Nc == 0) {
					if (res0.headers["content-type"])
						res.setHeader('Content-Type',res0.headers["content-type"]);

					if (res0.headers["content-length"])
						res.setHeader('Content-Length',res0.headers["content-length"]);
					
					if (res0.headers["expires"])
						res.setHeader('Expires',res0.headers["expires"]);
				}

				res0.setTimeout(1000*60*15,function () {console.log("--- Timeout for\n\t"+data)});

				res0
					.on('data', function(chunk) {
						res.write(chunk);
						if (debugapp) {
							if (data.length == 0) console.log("stream(): Got first chunk of size "+chunk.length+".");
						}
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
		} else if (status == 301 || status == 302) {
			if (debugstream) console.log("stream(): Redirecting to "+data);
			res.redirect(status,data);
		} else {
			if (debugstream) console.log("Sending JSON.");

			if (typeof(data) === "string") {
				// Script.
				// TODO: Does not handle concatenated requests.
				res.setHeader('Content-Type','text/plain');
				res.write(data);
				res.end();
				return;
			} else {
				if (N > 1) {
					if (Nc == 0) {
						res.write("[");
					}
				}
				res.write(JSON.stringify(data));
			}

			if (data.length > 0) {
				// Cache the JSON.
				if (!fs.existsSync(CDIR)) {
					fs.mkdirSync(CDIR);
				}
				fs.writeFileSync(cfile,JSON.stringify(data));
				if (debugcache)  {
					console.log("Wrote JSON request cache file " + cfile.replace(__dirname+" for " + req.originalUrl));
				}
			} else {
				if (debugcache) console.log("JSON for " + req.originalUrl + " has zero length.  Not writing cache file.")
			}

			Nc = Nc + 1;
			if (N > 1 && N != Nc) res.write(",");
			if (Nc == N) {
				if (N > 1) {
					res.write("]");
				}
				res.end();
			} else {
				if (debugapp) {console.log("Calling catalog again.")}
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
	options.timerange    = req.query.timerange    || req.body.timerange    || "";
	options.return       = req.query.return       || req.body.return       || "stream";
	options.outformat    = req.query.outformat    || req.body.outformat    || "1";
	options.filter       = req.query.filter       || req.body.filter       || "";
	options.filterWindow = req.query.filterWindow || req.body.filterWindow || "";
	options.usecache     = s2b(req.query.usecache || req.body.usecache     || "true"); // Send DataCache parameter usecache.
	options.attach       = s2b(req.query.attach   || req.body.attach       || "true");

	//plotoptions      = "width=500&height=100&font=sans-8&column=10em%2C100%25-3em&row=1em%2C100%25-4em&renderType=&color=%230000ff&fillColor=%23aaaaff&foregroundColor=%23ffffff&backgroundColor=%23000000";

	// Always use TSDSFE cache and don't try to see if update exists.  If false and update fails, cache will be used
	// and warning given in header.
	options.usemetadatacache = s2b(req.query.usemetadatacache || req.body.usemetadatacache || "false");
	
	if ((options.start === "") && (options.start === "") && (options.return === "stream")) {
		if (debugapp) console.log("parseOptions(): No start and stop given.  Resetting return to dd")
		options.return = "dd";
	}
	if (options.timerange !== "") {
		options.start = options.timerange.split("/")[0];
		options.stop  = options.timerange.split("/")[1];
	}

	if (options.return === "tsds" && options.outformat != "json") {
		options.outformat = "xml";
	}
	if (options.return === "autoplot-bookmarks" && options.outformat != "json") {
		options.outformat = "xml";
	}

	if (options.return === "dd" || options.return.match("urilist")) {
		// options.return === "urilistflat" is technically not a JSON format, but processing is same
		// until just before response is sent.
		options.outformat = "json";
	}

	// Not implemented.
	//options.useimagecache = s2b(req.query.useimagecache || req.body.useimagecache     || "true");
	
	return options;
}

// Get XML from URL and convert to JSON.
function getandparse(url,options,callback) {

	// Retrieves XML or JSON from a URL and stores XML and JSON as a cache file.
	// Callback is passed XML or JSON depending on options.outformat.

	if (debugapp) console.log("getandparse(): Called with outformat = "+options.outformat);
	
	var urlsig = crypto.createHash("md5").update(url).digest("hex");	

	// Cache file with no extension for each catalog
	var cfile = config.CACHEDIR+urlsig;

	// JSON cache file for each catalog
	var cfilejson = config.CACHEDIR+urlsig+".json";

	// XML cache file for each catalog
	var cfilexml = config.CACHEDIR+urlsig+".xml";

	// Don't do head requests if cache file exists and usemetadatacache=true.
	if (!options.outformat != "xml" && fs.existsSync(cfilejson) && options.usemetadatacache) {
		// If cache file exists and always using metadata cache
		if (debugcache) {
			console.log("getandparse(): usemetadatacache = true and cache file for url = " + url);
			console.log("getandparse(): for URL "+url);
		}
		var tmp = JSON.parse(fs.readFileSync(cfilejson).toString());
		if (debugcache) console.log("getandparse(): Done.");
		callback(tmp);
		return;
	}
	if (options.outformat != "xml" && fs.existsSync(cfilexml) && options.usemetadatacache) {
		// If cache file exists and always using metadata cache
		if (debugcache) {
			console.log("getandparse(): usemetadatacache = true and cache file exists.  Reading cache file for url = " + url);
			console.log("getandparse(): for URL "+url);
		}
		var tmp = fs.readFileSync(cfilexml).toString();
		if (debugcache) console.log("getandparse(): Done.");
		callback(tmp);
		return;
	}

	// Do head request and fetch if necessary.  Cache if fetched.
	if (options.outformat !== "xml" && fs.existsSync(cfilejson)) {
		if (debugcache) console.log("getandparse(): Cache file found for url = " + url);
		headthenfetch(url,"json");
		return;
	}
	if (options.outformat === "xml" && fs.existsSync(cfilexml)) {
		if (debugcache) console.log("getandparse(): Cache file found for url = " + url);
		headthenfetch(url,"xml");
		return;
	}

	// Fetch and then cache.
	if (options.outformat != "xml") {
		if (debugcache) console.log("getandparse(): No cache file found for url = " + url);
		fetch(url,"json");
		return;
	} else {
		if (debugcache) console.log("getandparse(): No cache file found for url = " + url);
		fetch(url,"xml");
		return;
	}

	function headthenfetch(url,type) {

		// Do head request for file that contains list of datasets.
		if (debugcache) console.log("headthenfetch(): Doing head request on "+url);
		var hreq = request.head(url, function (herror, hresponse) {
			if (!herror && hresponse.statusCode != 200) {
				herror = true;
			}

			if (herror) {
				if (debugcache) {
					console.log("headthenfetch(): Error when making head request on " + url);
					console.log("headthenfetch(): Will try request for "+url);
					age = 1;
				}
			}

			var dhead = new Date(hresponse.headers["last-modified"]);
			if (debugcache) console.log("headthenfetch(): Last-modified time: " + dhead);
			var fstat = fs.statSync(cfile+"."+type).mtime;
			var dfile = new Date(fstat);
			if (debugcache) console.log('headthenfetch(): Cache file created: ' + fstat);
			var age = dhead.getTime() - dfile.getTime();
			if (debugcache) console.log('headthenfetch(): Last-modified - Cache file created = ' + age);
			var found = true;

			if (age <= 0) {
				if (debugcache) console.log("headthenfetch(): Cache file has not expired.  Reading cache file "+(cfile+"."+type).replace(__dirname,""));
				if (debugcache) console.log("headthenfetch(): for URL "+hresponse.request.uri.href);
				var tmp = fs.readFileSync(cfile+"."+type).toString();
				if (type === "json") {	
					var tmp = JSON.parse(tmp);
				}
				if (debugcache) console.log("headthenfetch(): Done.");
				callback(tmp);
			} else {
				if (debugcache) console.log("headthenfetch(): Cache file has expired.");				
				fetch(url,type);
			}

			if (!hresponse) {
				console.error("headthenfetch(): Error when attempting to access " + url);
				options.res.status(502).send("Error when attempting to access " + url + "\n");
				console.error(config)
				return;
			}


		});
	}

	function fetch(url,type) {
		if (debugapp) console.log("fetch(): Fetching " + url);
		request(url, function (error, response, body) {

			if (debugapp) console.log("fetch(): Done fetching.");

			if (error) {
				console.log("fetch(): Error when attempting to access " + url + " :");
				console.log(error);
			}

			if (response.statusCode != 200) {
				console.log("fetch(): Status code was not 200 when attempting to access " + url);
			}

			if (error || response.statusCode != 200) {
				error = true;
			}

			if (error) {
				if (fs.existsSync(cfile+"."+type))  {
					if (debugapp) console.log("fetch(): Request failed for " + url);
					if (debugapp) console.log("fetch(): but found cached file. Using it.");
					// TODO: Add a header noting expired cache found but cache was used (because failed request).
					var tmp = fs.readFileSync(cfile+"."+type).toString();
					if (options.outformat == "json") { 
						var tmp = JSON.parse(tmp);
					}
					callback(tmp);
				} else {
					if (!fs.existsSync(cfile+"."+type))  {
						console.error("fetch(): Request failed for " + url);
						console.error("fetch(): and no cached version exists.  Sending 502.");
						options.res.status(502).send("Error when attempting to access " + url + "\n");
					}
				}
				return;
			}

			var isjson = false;
			var isxml  = false;

			if (body.match(/^\s*\[|^\s*{/)) { // Response is JSON
				if (debugapp) console.log("fetch(): Response was JSON");	
				isjson = true;
			} else {
				if (debugapp) console.log("fetch(): Response was XML");
				isxml = true;
			}

			if (isxml) {
				if (options.outformat === "xml") {
					if (debugapp) console.log("fetch(): Returning XML.");

					if (debugapp) console.log("fetch(): Calling callback(xml).");
					callback(body);

					if (debugcache) console.log("fetch(): Writing XML cache file for url = " + url);
					fs.writeFileSync(cfilexml,body);
					if (debugcache) console.log("fetch(): Done.");
				} else {
					if (debugapp) console.log("fetch(): Parsing "+url);
					var parser = new xml2js.Parser();
					parser.parseString(body, function (err, json) {

						if (debugapp) console.log("fetch(): Done parsing.");

						if (err) {
							options.res.status(502).send("Could not parse " + url + ".\n"+err);
							console.log("fetch(): Could not parse "+url+".\n");
							console.log(err);

							return;
						}

						if (debugapp) console.log("fetch(): Calling callback(json).");
						callback(json);

						if (debugcache) console.log("fetch(): Writing JSON cache file for url = " + url);
						fs.writeFileSync(cfilejson,JSON.stringify(json));
						if (debugcache) console.log("fetch(): Done.");
					});
				}
			} else {
				if (options.outformat === "xml") {
					var builder = new xml2js.Builder();
					var xml = builder.buildObject(JSON.parse(body));

					if (debugapp) console.log("fetch(): Calling callback(xml).");
					callback(xml);

					if (debugcache) console.log("fetch(): Writing XML cache file for url = " + url);
					fs.writeFileSync(cfilexml,xml);
					if (debugcache) console.log("fetch(): Done.");
				} else {
					if (debugapp) console.log("fetch(): Calling callback(json).");
					callback(body);
				}				
				if (debugcache) console.log("fetch(): Writing JSON cache file for url = " + url);
				fs.writeFileSync(cfilejson,JSON.stringify(body));
				if (debugcache) console.log("fetch(): Done.");
			}
		})
	}
}

// After catalog() executes, it either calls dataset() or stream()
// (will call stream() if only catalog information was requested.)
function catalog(options, cb) {

	getandparse(config.CATALOG,options,afterparse);

	function afterparse(result) {

		// Given JSON containing information in config.CATALOG, form JSON response.
		// config.CATALOG contains links to all catalogs available.
		var resp = [];

		var catalogRefs = result["catalog"]["catalogRef"];
		var xmlbase     = config.XMLBASE || result["catalog"]["$"]["xml:XMLBASE"] || "";
		if (debugapp) console.log("catalog(): Setting xmlbase to " + xmlbase);

		if (debugapp) console.log("catalog(): Found " + catalogRefs.length + " catalogRef nodes.");

		// Loop over each catalogRef and remove ones that don't match pattern.
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


		// Now we have a list of URLs for catalogs associated with the catalog pattern.
		// Remove empty elements of array. (Needed?)
		resp = resp.filter(function(n){return n});
		if (resp.length == 0) {
			console.log("Error: No matching catalogs.");
		}

		if (options.dataset === "") {
			// If no dataset was requested and only one catalog URL in list,
			// add information from within the catalog to the response.
			if (resp.length == 1 && options.catalog.substring(0,1) !== "^") {
				// If only one catalog matched pattern.
				getandparse(resp[0].href,options,
					function (result) {
						var oresp = [];
						oresp[0] = {};
						oresp[0].title = "Catalog configuration";
						oresp[0].link  = resp[0].href;
						for (var k = 1; k < result["catalog"]["documentation"].length;k++) {
							oresp[k] = {};
							oresp[k].title = result["catalog"]["documentation"][k-1]["$"]["xlink:title"];
							oresp[k].link  = result["catalog"]["documentation"][k-1]["$"]["xlink:href"];
						}
						cb(200,oresp);
					})
			} else {
				// If more than one catalog matched pattern,
				// return will be values, labels, and hrefs for each catalog.
				cb(200,resp);
			}
		} else {
			// If dataset was requested, pass list of catalog URLs to dataset().
			dataset(options,resp,cb);
		}
	}
}

// After dataset() executes, calls parameter() or stream().
// (will call stream() if only dataset information was requested.)
function dataset(options, catalogs, cb) {

	if (catalogs.length == 0) {cb(200,"[]");return;}

	var datasets = [];
	var parents = [];
	var dresp = [];

	if (debugapp) console.log("dataset(): Called.")

	// Loop over each catalog
	for (var i = 0; i < catalogs.length;i++) {
		getandparse(catalogs[i].href,options,afterparse);
	}

	function afterparse(result) {

		if (typeof(afterparse.j) === "undefined") afterparse.j = 0;

		// TODO: Deal with case of result === "", which means getandparse() failed.
		afterparse.j = afterparse.j+1;

		var parent = result["catalog"]["$"]["id"] || result["catalog"]["$"]["ID"];
		var tmparr = result["catalog"]["dataset"];
		datasets = datasets.concat(tmparr);
		while (parents.length < datasets.length) {parents = parents.concat(parent)}

	    //console.log(catalogs[afterparse.j-1].value)
		if (parent !== catalogs[afterparse.j-1].value) {
			console.log("ID of catalog in THREDDS specified with a URL does not match ID of catalog found in catalog.");
			console.log("ID in THREDDS: "+parent);
			console.log("ID in catalog: "+catalogs[afterparse.j-1].value);
			options.res.status(502).send("ID of catalog found in "+catalogs[afterparse.j-1].href+" does not match ID associated with URL in "+config.CATALOG);
		    return;
		}
		var dresp = [];

		// If all of the dataset URLs have been parsed.
		if (afterparse.j == catalogs.length) {

			for (var i = 0;i < datasets.length;i++) {
				dresp[i]         = {};
				dresp[i].value   = datasets[i]["$"]["id"] || datasets[i]["$"]["ID"];
				dresp[i].label   = datasets[i]["$"]["label"] || datasets[i]["$"]["name"] || dresp[i].value;
				dresp[i].catalog = parents[i];

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
			//console.log(options.parameters)
			if (options.parameters === "" && !(options.groups === "^.*")) {
				dresp = dresp.filter(function(n){return n;}); // Needed?
				if (dresp.length == 1 && options.dataset.substring(0,1) !== "^") {
					if (typeof(datasets[z]["documentation"]) !== "undefined") {
						for (var k = 0; k < datasets[z]["documentation"].length;k++) {
							//console.log(datasets[z]["documentation"][k])
							dresp[k] = {};
							dresp[k].title = "";
							dresp[k].link = "";
							dresp[k].text = "";
							if (datasets[z]["documentation"][k]["$"]) {
								if (datasets[z]["documentation"][k]["$"]["xlink:title"])
									dresp[k].title = datasets[z]["documentation"][k]["$"]["xlink:title"];
								if (datasets[z]["documentation"][k]["$"]["xlink:href"])
									dresp[k].link  = datasets[z]["documentation"][k]["$"]["xlink:href"];
							}
							if (datasets[z]["documentation"][k]["_"])
								dresp[k].text  = datasets[z]["documentation"][k]["_"];
							if (typeof(datasets[z]["documentation"][k]) === "string")
								dresp[k].text  = datasets[z]["documentation"][k];
						}
					} else {
						dresp[0] = {};
						dresp[0].title = "No dataset documentation in catalog";
						dresp[0].link  = "";
						dresp[0].text  = "";							
					}
					cb(200,dresp);
				} else {
					cb(200,dresp);
				}
			} else {
				parameter(options,parents,datasets.filter(function(n){return n}),cb);
			}						
		}
	}
}

function parameter(options, catalogs, datasets, cb) {

	if (debugapp) console.log("parameter(): Called.")
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
		resp[i].columnLabels = parameters[i]["$"]["columnLabels"] || "";
		resp[i].type = parameters[i]["$"]["type"] || "";
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
		if (!('lineregex' in resp[i].dd))    {resp[i].dd.lineregex = parents[i]["lineregex"]}
		if (!('fillvalue' in resp[i].dd))    {resp[i].dd.fillvalue = parameters[i]["$"]["fillvalue"] || ""}

		if (resp[i].dd.columns.split(",").length > 1) {
			if (resp[i].columnLabels === "") {
				resp[i].columnLabels = resp[i].dd.columns;
			}
		}

		if (debugapp) console.log(resp[i].dd)
		
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
					if (debugapp) console.log("parameter(): Match in catalog for requested parameter "+value+".")
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
		if (debugapp) console.log(datasets[0].groups[0].group);
		if (debugapp) console.log(ddresp);

		// Get JSON for group list
		cb(200,ddresp);
		return;
	}
	
	if (typeof(resp[0]) === "undefined") {cb(200,"[]");return;}

	var columns = resp[0].dd.timecolumns || 1;
	for (var z = 0;z<resp.length;z++) {
		columns = columns + "," + resp[z].dd.columns;
	}

	// Interpretation of timeRanges:
	// DATE/DURATION       = DATE/now+DURATION
	// DURATION/DATE       = DATE+DURATION/DATE
	// DATE1/DATE2         = DATE1/DATE2
	// DURATION1/DURATION2 = now+DURATION1/now+DURATION2

	start = options.start || resp[0].dd.start;
	stop  = options.stop  || resp[0].dd.start;

	var tmp = expandISO8601Duration(start+"/"+stop,{debug:false});

	//start = tmp.split("/")[0].substring(0,10);
	//stop = tmp.split("/")[1].substring(0,10);

	start = tmp.split("/")[0].replace("T00:00:00.000Z","");
	stop = tmp.split("/")[1].replace("T00:00:00.000Z","");

	if (debugapp) console.log("parameter(): Requested start : " + options.start);
	if (debugapp) console.log("parameter(): Expanded start  : " + start);
	if (debugapp) console.log("parameter(): DD start        : " + resp[0].dd.start);
	if (debugapp) console.log("parameter(): Requested stop  : " + options.stop);
	if (debugapp) console.log("parameter(): Expanded stop   : " + stop);
	if (debugapp) console.log("parameter(): DD stop         : " + resp[0].dd.stop);

	var urltemplate  = resp[0].dd.urltemplate.replace("mirror:http://",config.MIRROR);
	var urlprocessor = resp[0].dd.urlprocessor;
	var urlsource    = resp[0].dd.urlsource;
		
	if ((new Date(stop)).getTime() < (new Date(start)).getTime()) {
		cb(500,"Stop time is before start time.");
		return;
	}

	//if (Date.parse(start) > Date.parse(stop)) {
	if ((new Date(start)).getTime() > (new Date(stop)).getTime()) {	
		cb(500,"Start time is after stop time.");
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
		var dc = config.DC+"?"+args+"&timeRange="+start+"/"+stop;
	} else {
		var dc = config.DC+"?timeRange="+start+"/"+stop;
	}
	
	if (options.return === "urilist") {
		cb(0,dc+"&return=urilist");
		return;
	}
	if (options.return === "urilistflat") {
		cb(0,dc+"&return=urilistflat");
		return;
	}

	if (options.return === "viviz") {
		var viviz = config.VIVIZ 
					+ "#" 
					+ config.TSDSFE 
					+ "%3Fcatalog%3D" + options.catalog
					+ "%26dataset%3D" + options.dataset
					+ "%26parameters%3D" + options.parameters
					+ "%26return%3Dpng%26"
					+ "&strftime=start%3D-P1D%26stop%3D$Y-$m-$d"
					+ "&start=" + options.start
					+ "&stop=" + options.stop;
		cb(302,viviz);
		return;
	}

	if (options.return === "png" || options.return === "pdf" || options.return === "svg" || options.return === "jnlp" || options.return === "matlab" || options.return === "idl") {
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

			if (config.TSDSFE.match(/http:\/\/localhost/)) {
				console.log("Warning: stream(): Possible configuration error.  Serving an IDL or MATLAB script containing a TSDSFE URL that is localhost")
				//cb(501,"Server configuration error related to address of TSDSFE ("+config.TSDSFE+").");
				//return;
			}

			var script = fs.readFileSync(__dirname + "/scripts/tsdsfe."+ext).toString();

			script = script.replace("__SERVER__",config.TSDSFE).replace("__QUERYSTRING__","catalog="+resp[0].catalog+"&dataset="+resp[0].dataset+"&parameters="+Parameters.slice(0,-1)+"&start="+start+"&stop="+stop+"&outformat=2");
			script = script.replace("__LABELS__",Labels.slice(0,-2));
			cb(200,script);
			return;
		}

		var tmp = expandISO8601Duration(start+"/"+stop,{debug:false})
		//console.log(tmp);

		// For now, don't use relative times because TSDS interpretation is different from Autoplot (TSDS should change to match Autoplot's.)
		start = tmp.split("/")[0].substring(0,10);
		stop = tmp.split("/")[1].substring(0,10);

		url = config.JYDS + "?server="+config.TSDSFE+"&catalog="+resp[0].catalog+"&dataset="+resp[0].dataset+"&parameters="+resp[0].parameter+"&timerange="+start+"/"+stop;

		console.log(resp[0])
		if (resp[0].columnLabels !== '') {
			url = url + "&labels="+resp[0].columnLabels;
		} else if (resp[0].label != "") {
			url = url + "&labels="+resp[0].label;
		}
		if (resp[0].units != "")  {url = url +"&units="+resp[0].units;}
		
		if (resp[0].dd.fillvalue != "")  {url = url + "&fills="+resp[0].dd.fillvalue};

		console.log("vap+jyds:"+url)

		if (options.return === "jnlp") {
			cb(301,"http://autoplot.org/autoplot.jnlp?open=vap+jyds:"+url);
			return;
		}


		//console.log(resp[0].dd.fillvalue)


		var format = "image/png";
		if (options.return === "pdf") {format = "application/pdf"}
		if (options.return === "svg") {format = "image/svg%2Bxml"}
		
		var aurl = config.AUTOPLOT + "?drawGrid=true&format="+format+"&plot.xaxis.drawTickLabels=true&column="+encodeURIComponent("0%+5em,100%-5em")+"&width=800&height=200&url=vap+jyds:" + encodeURIComponent(url);	

		console.log(aurl)
		//if (debugapp) console.log(url)


		if (config.TSDSFE.match(/http:\/\/localhost/)) {
			if (!config.AUTOPLOT.match(/http:\/\/localhost/)) {
				console.log("Error: stream(): Autoplot image servlet specified by config.AUTOPLOT must be localhost if config.TSDSFE is localhost.")
				cb(501,"Server configuration error related to address of Autoplot servlet ("+config.AUTOPLOT+") and address of TSDSFE ("+config.TSDSFE+").");
				return;
			}
		}
		cb(0,aurl);
		return;
	}

	if (debugapp) {
		//console.log("parameter(): options = ")
		//console.log(options);
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
		return;
	}
	
	if ((options.return === "stream") || (options.return === "redirect")) {				 
		dc = dc
				+"&return=stream"
				+"&lineRegExp="+(resp[0].dd.lineregex || "")
				+"&timecolumns="+(resp[0].dd.timecolumns || "")
				+"&timeformat="+(resp[0].dd.timeformat || "")
				+"&streamFilterReadColumns="+columns
				+"&streamFilterTimeFormat="+options.outformat
				+"&streamFilterComputeFunction="+options.filter
				+"&streamFilterComputeWindow="+options.filterWindow
				+"&streamFilterExcludeColumnValues="+(resp[0].dd.fillvalue || "")
				+"&streamOrder=true"
				+"&streamGzip=false"
				;


		// Remove name=value when value === "".
		dc = dc.replace(/[^=&]+=(&|$)/g,"").replace(/&$/,"");
		if (!options.usecache) dc = dc+"&forceUpdate=true&forceWrite=true"

		if (options.return === "redirect") {
			// If more than one resp, this won't work.
			cb(302,dc);
			return;
		}

		//dc = dc+"&return=stream&lineRegExp="+resp[0].dd.lineregex + "&timecolumns="+resp[0].dd.timecolumns+"&timeformat="+resp[0].dd.timeformat+"&streamFilterReadColumns="+columns+"&lineFormatter=formattedTime&outformat="+options.outformat;
		//console.log(dc)
		cb(0,dc);
		return;
	}

	cb(500,"Query parameter return="+options.return+" not recognized.");

}
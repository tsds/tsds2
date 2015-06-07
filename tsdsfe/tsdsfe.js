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
var os      = require("os");

var log    = require("./log.js");

var expandISO8601Duration = require(__dirname + "/../tsdset/lib/expandtemplate").expandISO8601Duration;

// Helper functions
function s2b(str) {if (str === "true") {return true} else {return false}}
function s2i(str) {return parseInt(str)}

// Command line arguments
var port          = s2i(process.argv[2] || 8000);
var debugapp      = s2b(process.argv[3] || "false");
var debugcache    = s2b(process.argv[4] || "false");
var debugstream   = s2b(process.argv[5] || "false");

process.on('exit', function () {
	console.log('Received exit signal.  Removing partially written files.');
	// TODO: 
	// Remove partially written files by inspecting cache/locks/*.writing
	// Remove streaming locks by inspecting cache/locks/*.streaming
	console.log('Done.  Exiting.');
})
process.on('SIGINT', function () {
	process.exit();
});

if (fs.existsSync(__dirname + "/conf/config."+os.hostname()+".js")) {
	// Look for host-specific config file conf/config.hostname.js.
	if (debugapp) {
		log.logc((new Date()).toISOString() + " - [tsdsfe] Using configuration file conf/config."+os.hostname()+".js",10);
	}
	var config = require(__dirname + "/conf/config."+os.hostname()+".js").config();
	config.CONFIGFILE = __dirname + "/conf/config."+os.hostname()+".js";
} else {
	// Default
	if (debugapp) {
		log.logc((new Date()).toISOString() + " - [tsdsfe] Using configuration file conf/config.js",10);
	}
	var config = require(__dirname + "/conf/config.js").config();
	config.CONFIGFILE = __dirname + "/conf/config.js";
}

if (config.TSDSFE.match(/http:\/\/localhost/)) {
	if (!config.AUTOPLOT.match(/http:\/\/localhost/)) {
		console.log("Warning: stream(): Image request will not work because Autoplot image servlet specified by config.AUTOPLOT must be localhost if config.TSDSFE is localhost.");
	}
}

// In more recent versions of node.js, is set at Infinity.
// Previously it was 5.  Apache uses 100.
http.globalAgent.maxSockets = config.maxSockets;  

// Serve files in these directories as static files and allow directory listings.
app.use("/js", express.static(__dirname + "/js"));
app.use('/js', express.directory(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use('/css', express.directory(__dirname + "/css"));
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use('/scripts', express.directory(__dirname + "/scripts"));
app.use("/catalogs", express.static(__dirname + "/catalogs"));
app.use("/catalogs", express.directory(__dirname + "/catalogs"));
app.use("/log", express.static(__dirname + "/log"));
app.use("/log", express.directory(__dirname + "/log"));

// Compress response (depending on request headers).
app.use(express.compress());

status = {};
status["VIVIZ"] = {}
status["VIVIZ"]["state"] = true;
status["VIVIZ"]["message"] = "Connection to ViViz server has failed.  Requests for galleries will fail.  Removing option to view images as a gallery.  A notice of this failure was sent to the site administrator.";                                                                      

status["DATACACHE"] = {}
status["DATACACHE"]["state"] = true;
status["DATACACHE"]["message"] = "Connection to DataCache server has failed.  Requests for metadata will continue to work, but requests for data and images will fail.  A notice of this failure was sent to the site administrator.";                                                                      

status["AUTOPLOT"] = {}
status["AUTOPLOT"]["state"] = true;
status["AUTOPLOT"]["message"] = "Connection to Autoplot image server has failed.  Removing option to view images.  A notice of this failure was sent to the site administrator.";

// Get the status of services used by TSDSFE.
app.get('/status', function (req, res) {
	res.send(JSON.stringify(status))
})

// Test a request using curl-test.sh, which displays log information associated with request from DataCache and TSDSFE.
app.get('/test', function (req, res) {
	var com = 'test/curl-test.sh "' + req.protocol + '://' + req.host + ":" + port + req.originalUrl.replace("test","") + '"'
	var child = require('child_process').exec(com)
	child.stdout.on('data', function (buffer) {
		// [1m and [0m are open and close bold tags for shell.
		if (req.headers['user-agent'].match("curl")) {
			res.write(buffer.toString())
		} else {
			res.write(buffer.toString().replace('[1m','').replace('[0m',''))			
		}
	});
	child.stdout.on('end', function() { 
		res.end()
	});
	return
})

// Main entry point
app.get('/', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		// If no query parameters, return index.htm
		res.contentType("html");
		res.send(fs.readFileSync(__dirname+"/index.htm"));
	} else {
		// Call main entry function
		handleRequest(req,res);
	}
})

// Start the server
server.listen(config.PORT)

server.on('connection', function(socket) {

	if (false) {
		socket.on('disconnect', function(socket) {
			console.log("Connection disconnected");
		})
	
		socket.on('close', function(socket) {
			console.log("Connection closed");
		})
	
		socket.on('end', function(socket) {
			console.log("Connection ended");
		})
	
		socket.on('timeout', function(socket) {
			console.log("Socket timeout");
		})
				  
		socket.setTimeout(config.TIMEOUT,
				function(obj) {
			console.log("TSDSFE server timeout ("+(config.TIMEOUT/(1000*60))+" minutes).");
			server.getConnections(function(err,cnt) {console.log(cnt)})
	
			if (obj) {
				// For debugging.  Still getting mysterious timeouts.
				console.log(obj._events.request);
	
			}
		})
	}
})

// Local cache directory
var CDIR = config.CACHEDIR
if (!config.CACHEDIR.match(/^\//)) {
	// If relative path given for CACHEDIR, prepend with __dirname.
	CDIR   = __dirname+"/cache/"
}
if (!fs.existsSync(CDIR)) {
	// Create cache directory if not found
	fs.mkdirSync(CDIR)
}

// Create directories if needed.
config = log.init(config)

log.logc((new Date()).toISOString() + " - [tsdsfe] listening on port "+config.PORT,10);

setInterval(checkdeps, 10000)

function checkdeps() {
	request(config.VIVIZ, function (err,depsres,depsbody) {
		if (err) console.log(err)
		if (depsres.statusCode != "200") {
			console.log("Problem with "+config.VIVIZ)
			status["VIVIZ"]["state"] = false;
		} else {
			status["VIVIZ"]["state"] = true;
		}
	});

	request(config.AUTOPLOT + "?url=vap+inline:randn(100)", function (err,depsres,depsbody) {
		if (err) console.log(err)
		if (depsres.statusCode != "200") {
			console.log("Problem with "+config.AUTOPLOT)
			status["AUTOPLOT"]["state"] = false;
		} else {
			status["AUTOPLOT"]["state"] = true;
		}
	});

}

function handleRequest(req, res) {

	var message =  req.connection.remoteAddress + "," + req.originalUrl;		
	if (req.headers['x-forwarded-for']) {
		var message = req.headers['x-forwarded-for'].split(",")[0] + "," + req.originalUrl + ",";
	} 

	// Create detailed log file name based on current time and other information.
	var loginfo = crypto.createHash("md5").update((new Date()).toISOString() + message).digest("hex");

	// Set log file name as response header
	res.header('x-tsdsfe-log',loginfo)

	res.config = config;

	log.logapp(loginfo + "," + message, res)

	if (debugapp) {
		log.logres("Configuration file = "+JSON.stringify(config.CONFIGFILE), res)
		log.logres("Configuration file contents = "+JSON.stringify(config), res)
		log.logres("req.headers = "+JSON.stringify(req.headers), res)
		log.logres("req.headers['x-forwarded-for'] = " + JSON.stringify(req.headers['x-forwarded-for']), res)
		log.logres("req.connection.remoteAddress = " + JSON.stringify(req.connection.remoteAddress), res)
		log.logres("req.originalUrl = " + JSON.stringify(req.originalUrl), res)
		log.logres("options = " + JSON.stringify(options), res)
	}

	var options = parseOptions(req, res)
	
	if (typeof(options) === "undefined") {
		log.logres("Error parsing options.  502 was sent.", res)
		return
	}
	//res.header('Access-Control-Allow-Origin', '*');
	//res.header('Access-Control-Allow-Methods', 'GET,POST');
	//res.header('Access-Control-Allow-Headers', 'Content-Type');

	if ( (options.return === "log") ) {
		console.log(options)
		var excludeIPs = "f528764d"
		// Get directory listing and start streaming lines in files that match catalog=CATALOG
	    var com = "grep --no-filename -e '" + req.originalUrl.replace("&return=log","").replace("/?","") + "' " + config.LOGDIRAPPPUBLIC + "*.log | grep -v " + excludeIPs + " | cut -f1,3,4 -d,"
	    var child = require('child_process').exec(com)
	    console.log(com)
	    log.logres("Sending output of shell command: "+com, res)
	    child.stdout.on('data', function (buffer) {
	    	res.write(buffer.toString())
	    });
	    child.stdout.on('end', function() { 
	    	log.logres("Finished sending output of shell command.", res)
	    	res.end()
	    });
	    return
	}
	
	options.res = res;
	options.req = req;

	// Metadata responses are cached as files with filename based on MD5 hash of request.
	// TODO: Sort URL so a=b&c=d and c=d&a=b are treated as equivalent.
	// TODO: Create lock file while json cache file is being written.

	// Don't include cache option in signature for cache
	var urlreduced = req.originalUrl.replace(/&use.*cache=(true|false)&*/,"")

	var urlsig = crypto.createHash("md5").update(urlreduced).digest("hex")	
	var cfile  = CDIR + urlsig + ".json"
	var ifile  = CDIR + urlsig + "." + options.return

	if ((options.format == "png") || (options.format == "pdf") || (options.format == "svg")) {
		var isimagereq = true
	} else {
		var isimagereq = false
	}

	// No cache will exist if one of format={0,1,2} is selected.  Data are not cached by TSDSFE.
	if (!isimagereq) {
		if (debugcache) {
			if (fs.existsSync(cfile)) {
				if (debugcache) {
					log.logres("Metadata response cache found for, req.originalUrl = " + JSON.stringify(req.originalUrl), res)
				}
			} else {
				log.logres("Metadata response cache not found for, req.originalUrl = " + JSON.stringify(req.originalUrl), res)
			}
		}
		if (options.usemetadatacache && fs.existsSync(cfile)) {
			if (debugcache) {
				log.logres("Using response cache file because options.usemetadatacache = true and cache file exists.", res)
			}
			// Send the cached response and finish
			fs.createReadStream(cfile).pipe(res);
			return;
		} else {
			if (debugcache && !isimagereq) { 
				log.logres("Not using metadata response cache file if found because usemetadatacache = false, file does not exist, or request is for an image.",res)
			}
		}
	} else {
		if (debugcache) {
			if (fs.existsSync(ifile)) {
				log.logres("Image response cache found for, req.originalUrl = " + JSON.stringify(req.originalUrl), res)
			} else {
				log.logres("Image response cache found for, req.originalUrl = " + JSON.stringify(req.originalUrl), res)
			}
		}
		if (options.useimagecache && fs.existsSync(ifile) && !fs.existsSync(ifile + ".writing")) {
			if (debugcache) {
				log.logres("Using response cache file.", res);
				log.logres("Writing (sync) " + ifile + ".streaming", res)
			}

			// Write lock file
			fs.writeFileSync(ifile + ".streaming","");

			// Send the cached response and return
			if (debugcache) {
				log.logres("Streaming " + ifile, res)
			}			
	
			var stream = fs.createReadStream(ifile);
			stream.pipe(res);
			stream.on('error', function () {
				if (debugcache) {
					log.logres("Error when attempting to stream cached image.  Removing (sync) " + ifile + ".streaming", res)
				}
				fs.unlinkSync(ifile + ".streaming");
			});
			stream.on('end', function () {
				if (debugcache) {
					log.logres("Finished streaming cached image. Removing (sync) " + ifile + ".streaming", res)
				}
				fs.unlinkSync(ifile + ".streaming");
			});
			return;
		} else {
			if (debugcache) {
				log.logres("Not using image response cache file if found because useimagecache = false, file does not exist, or a cache file is being written.", res)
			}
		}
	}

	// Catch case where ?catalog=CATALOG&return={tsds,autoplot-bookmarks,spase}
	if ( (options.return === "autoplot-bookmarks") || (options.return === "tsds") ) {

		if (options.format == 1) {
			options.format = "xml";
		}

		if (debugapp) {
			log.logres("Request is for " + options.return, res)
		}
		if (options.format === "json") {
			res.setHeader("Content-Type","application/json"); 
		} else {
			res.setHeader("Content-Type","text/xml"); 
			options.format = "xml";
		}

		// Get list of all catalogs and their URLs		
		url = config["TSDSFE"] + "?catalog=^.*";
		if (debugapp) {
			log.logres("Requesting "+url, res)
		}

		request(url, function (err,catres,catbody) {

			catalogjson = JSON.parse(catbody);

			// Iterate through catalog and find one that matches requested catalog.
			for (var i = 0;i < catalogjson.length;i++) {

				if (catalogjson[i].label.match(options.catalog)) {
					url = catalogjson[i].href;

					if (debugapp) {
						log.logres("Calling getandparse() with URL " + url, res)
					}

					// Request the matched catalog and parse it.
					if (options.return === "tsds") {
						getandparse(url,options,function (ret) {
							if (options.format === "xml") {
								if (debugapp) {
									log.logres("Sending TSDS XML.", res)
								}
								res.write(ret.toString());	
								res.end();									
							} else {
								res.write(JSON.stringify(ret));	
								res.end();																		
							}
						});
					}

					if (options.return === "autoplot-bookmarks") {
						var format = options.format;
						options.format = "json"; // This causes getandparse to return TSDS JSON, which tsds2bookmarks requires.
						if (debugapp) {
							log.logres("Calling getandparse() with URL " + url, res)
						}
						getandparse(url,options,function (ret) {
							options.format = format;
							var tsds2other = require(__dirname + "/js/tsds2other.js").tsds2other;
							if (debugapp) {
								log.logres("Converting TSDS XML catalog to Autoplot bookmark XML.", res)
							}

							// Filename signature is based on input + transformation code.
							var retsig  = crypto.createHash("md5").update(JSON.stringify(ret)+tsds2other.toString()).digest("hex");
							var retfile = CDIR + retsig + ".xml";

							if (fs.existsSync(retfile)) {
								if (debugcache) {
									log.logres("Cache of autoplot-bookmarks file found for input "+url, res)
								}
								ret = fs.readFileSync(retfile);
								finish(ret);
							} else {
								if (debugcache) {
									log.logres("No cache of autoplot-bookmarks file found for input = "+url, res)
								}
								tsds2other(ret, "autoplot-bookmarks", function (ret) {
									finish(ret);
									if (debugcache) {
										log.logres("Writing cache file for autoplot-bookmarks for input = "+url, res)
									}
									fs.writeFileSync(retfile,ret);
								});
								
							}

							function finish(ret) {
								if (format === "xml") {
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
		
		if (debugapp) {
			log.logres("handleRequest(): Concatenated parameter request. N = "+N, res)
		}
		
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
		
		if (debugapp) {
			log.logres("Stream called.", options.res);
		}

		// TODO: Not all stream options will work for requests that span multiple catalogs.
		// Document and fix.

		if (status == 0) {

			// If data was not a URL, send it.
			if (!data.match(/^http/)) {
				if (debugapp) {
					log.logres("Sending "+data, options.res)
				}
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
			if ((options.attach) && ((options.return === "data") || (options.return === "redirect"))) {
				if (req.headers['accept-encoding']) {
					if (req.headers['accept-encoding'].match("gzip")) {
						//res.setHeader('Content-Encoding','gzip');
						// Request a gzipped stream from DataCache.
						//data = data.replace("streamGzip=false","streamGzip=true");
					}
				}
				//var fname = req.originalUrl;//.replace(/^&/,"").replace(/\&/g,"_").replace(/\=/g,"-")+"txt";
				//console.log(fname)
				//res.setHeader("Content-Disposition", "attachment;filename="+fname);
			}

			// If stream was called with a URL, pipe the data through.
			if (debugapp) {
				log.logres("Streaming from "+data, options.res)
			}
			
			//Better method for Nc == 0
			//request.get(data).pipe(res);
			//return;

			// Request data from URL.
			var urldata = "";

			var sreq = http.get(data, function(res0) {

				log.logres("Headers from " + data + ":" + res0.headers, res)
				res.setHeader('x-datacache-log',res0.headers['x-datacache-log'])

				if (res0.headers['x-tsdsfe-warning'])
					res.setHeader('x-tsdsfe-warning',res0.headers['x-tsdsfe-warning'])
							
				if (Nc == 0) {
					if (res0.headers["content-type"])
						res.setHeader('Content-Type',res0.headers["content-type"]);

					if (res0.headers["content-length"])
						res.setHeader('Content-Length',res0.headers["content-length"]);
					
					if (res0.headers["expires"])
						res.setHeader('Expires',res0.headers["expires"]);
				}

				res0.setTimeout(1000*60*15,function () {
					console.log("--- Timeout for request to " + data)
				});

				if (isimagereq) {
					var writeok = true;
					if (fs.existsSync(ifile + ".streaming")) {
						if (debugcache) {
							log.logres("File is being streamed.  Not writing image to cache.", res)
						}
						writeok = false;
					}
					if (fs.existsSync(ifile + ".writing")) {
						if (debugcache) {
							log.logres("File is being written.  Not writing image to cache.", res)
						}
						writeok = false;
					}
					if (writeok) {
						if (debugcache) {
							log.logres("Writing (sync) " + ifile + ".writing", res)
						}
						fs.writeFileSync(ifile + ".writing","");
						istream = fs.createWriteStream(ifile);
						istream.on('finish',function () {
							if (debugcache) {
								log.logres("Finished writing image.  Removing (sync) " + ifile + ".writing", res)
							}
							fs.unlinkSync(ifile + ".writing");
						})
					}
				}
				res0
					.on('data', function(chunk) {
						// Send chunk to client
						res.write(chunk);
						
						if (isimagereq && writeok) {
							// Write chunk to cache file.
							istream.write(chunk);
						}

						if (debugapp) {
							if (data.length == 0) {
								log.logres("Recieved first chunk of image request of size " + chunk.length + " . Straming it and writing chunk to cache file.", res)
							}
						}
					})
					.on('end', function() {
						if (isimagereq && writeok) {
							if (debugcache) {
								log.logres("Finished recieving image.  Calling end event for image write stream.", res)
							}
							istream.end();
						}

						// If N > 0, could use convert image1.png image2.png image3.png -append stack.png
						if (debugcache && isimagereq) {
							log.logres("Finished writing " + ifile + " and removing .writing file.", res)
						}
						if (debugapp) {
							log.logres('Got end.', options.res)
						}
						Nc = Nc + 1;
						if (Nc == N) {
							if (debugapp) {
								log.logres("Calling res.end().", options.res)
							}
							res.end();
						} else {
							if (debugapp) {
								log.logres("Calling catalog with Nc="+Nc, options.res)
							}
							catalog(Options[Nc], stream);
						}
					})
					.on('error',function (err) {
						log.logres("Error for request to " + data + ": " + JSON.stringify(err));
						console.log(err);
						console.log(res0);
						if (debugcache) {
							log.logres("Deleting image cache file due to error.", options.res)
						}
						fs.unlinkSync(ifile)
					})
			}).on('error', function (err) {
				var tmpstr = "Error when attempting to retrieve data from data from upstream server "+data.split("/")[2]
				log.logres(tmpstr, options.res)
				res.status(502).send(tmpstr)
			})
		} else if (status == 301 || status == 302) {
			if (debugstream) {
				log.logres("Redirecting to "+data, res)
			}
			res.redirect(status,data);
		} else {
			if (debugstream) {
				log.logres("Sending JSON.", res)
			}

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
					log.logres("Wrote JSON request cache file " + cfile.replace(__dirname+" for " + req.originalUrl), res);
				}
			} else {
				if (debugcache) {
					log.logres("JSON for " + req.originalUrl + " has zero length.  Not writing cache file.", res)
				}
			}

			Nc = Nc + 1;
			if (N > 1 && N != Nc) res.write(",");
			if (Nc == N) {
				if (N > 1) {
					res.write("]");
				}
				res.end();
			} else {
				if (debugapp) {
					log.logres("Calling catalog() again.", res)
				}
				catalog(Options[Nc], stream);
			}
		}
	}		
}

function parseOptions(req, res) {

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
	options.return       = req.query.return       || req.body.return       || "data";
	options.format       = req.query.format       || req.body.format       || "";
	options.style        = req.query.style        || req.body.style        || "";
	options.type         = req.query.type         || req.body.type         || "";
	options.filter       = req.query.filter       || req.body.filter       || "";
	options.filterWindow = req.query.filterWindow || req.body.filterWindow || "";
	options.attach       = s2b(req.query.attach   || req.body.attach       || "true");

	// If any of the cache options are false and update fails, cache will be used if found (and warning is given in header).
	options.usedatacache     = s2b(req.query.usedatacache     || req.body.usedatacache     || "true"); // Sent as DataCache parameter.
	options.useimagecache    = s2b(req.query.useimagecache    || req.body.useimagecache    || "true"); // Images are cached locally.
	options.usemetadatacache = s2b(req.query.usemetadatacache || req.body.usemetadatacache || "true"); // Metadata is cached locally.

	// TODO: If any input option is not in list of valid inputs, send warning in header.
	
	if ((options.return === "image") && (options.style === "")) {
		options.style === "0"
	}	
	if ((options.return === "image") && (options.style === "0")) {
		options.style = "drawGrid=true"+
						"&color=%230000ff"+
						"&backgroundColor=none"+
						"&foregroundColor=%23000000"+
						"&column="+encodeURIComponent("0%+6em,100%-5em")+
						"&row="+encodeURIComponent("0%+2em,100%-4em")+
						"&width=800"+
						"&height=200";
	}

	if ((options.return === "image") && (options.style === "1")) {
		options.style = "drawGrid=true"+
						"&color=%23ffff00"+
						"&backgroundColor=%23000000"+
						"&foregroundColor=%23ffff00"+
						"&column="+encodeURIComponent("0%+6em,100%-6em")+
						"&row="+encodeURIComponent("0%+2em,100%-4em")+
						"&width=800"+
						"&height=200";
	}

	if ((options.return === "image") && (options.style === "2")) {
		options.style = "drawGrid=false"+
						"&backgroundColor=none"+
						"&column="+encodeURIComponent("0%+0px,100%-0px")+
						"&row="+encodeURIComponent("0%+0px,100%-0px")+
						"&width=800"+
						"&height=100";
	}

	if ((options.return === "image") && (options.format === "")) {
		options.format = "png";
	}

	if ((options.return === "data") && (options.format === "")) {
		options.format = "1";
	}
	if ((options.return === "script") && (options.format === "")) {
		options.format = "matlab";
	}
	//plotoptions      = "width=500&height=100&font=sans-8&column=10em%2C100%25-3em&row=1em%2C100%25-4em&renderType=&color=%230000ff&fillColor=%23aaaaff&foregroundColor=%23ffffff&backgroundColor=%23000000";

	
	if (options.timerange !== "") {
		if (debugapp) {
			log.logres("Timerange given.  Extracting start/stop from it.", res)
		}
		var tmparr = options.timerange.split("/")
	
		if (tmparr.length != 2) {
			var tmperr ="Error: Input timerange (should be of form YYYY-MM-DD/YYY-MM-DD) is not valid: " + options.timerange;
			log.logres(tmperr, res)
			log.logres("Sending 502.", res)
			res.status(502).send(tmperr)
			return;
		}
		options.start = tmparr[0];
		options.stop  = tmparr[1];
	}

	if ((options.start === "") && (options.start === "") && (options.return === "data")) {
		if (debugapp) {
			log.logres("No start/stop or timerange specified.  Setting return=dd", res)
		}
		options.return = "dd";
	}

	if (options.return === "tsds" && options.format != "json") {
		options.format = "xml";
	}
	if (options.return === "autoplot-bookmarks" && options.format != "json") {
		options.format = "xml";
	}

	if (options.return === "dd" || options.return.match("urilist")) {
		// options.return === "urilistflat" is technically not a JSON format, but processing is same
		// until just before response is sent.
		options.format = "json";
	}
	
	return options;
}

// Get XML from URL and convert to JSON.
function getandparse(url,options,callback) {

	// Retrieves XML or JSON from a URL and stores XML and JSON as a cache file.
	// Callback is passed XML or JSON depending on options.format.

	if (debugapp) {
		log.logres("Called with format = "+JSON.stringify(options.format), options.res)
	}
	
	var urlsig = crypto.createHash("md5").update(url).digest("hex");	

	// Cache file with no extension for each catalog
	var cfile = config.CACHEDIR+urlsig;

	// JSON cache file for each catalog
	var cfilejson = config.CACHEDIR+urlsig+".json";

	// XML cache file for each catalog
	var cfilexml = config.CACHEDIR+urlsig+".xml";

	// Don't do head requests if cache file exists and usemetadatacache=true.
	if (!options.format != "xml" && fs.existsSync(cfilejson) && options.usemetadatacache) {
		// If cache file exists and always using metadata cache
		if (debugcache) {
			log.logres("usemetadatacache = true and JSON cache file found for for url = " + url, options.res)
			log.logres("Reading and parsing JSON cache file (sync).", options.res)
		}
		var tmp = JSON.parse(fs.readFileSync(cfilejson).toString());
		if (debugcache) {
			log.logres("Done.", options.res)
		}
		callback(tmp);
		return;
	}
	if (options.format != "xml" && fs.existsSync(cfilexml) && options.usemetadatacache) {
		// If cache file exists and always using metadata cache
		if (debugcache) {
			log.logres("usemetadatacache = true and cache file exists.  Reading XML cache file for url = " + url, options.res)
		}
		log.logres("Reading and parsing XML cache file (sync).", options.res)
		var tmp = fs.readFileSync(cfilexml).toString();
		if (debugcache) {
			log.logres("Done.", options.res)
		}
		callback(tmp);
		return;
	}

	// Do head request and fetch if necessary.  Cache if fetched.
	if (options.format !== "xml" && fs.existsSync(cfilejson)) {
		if (debugcache) {
			log.logres("Cache file found for url = " + url, options.res)
		}
		headthenfetch(url,"json");
		return;
	}
	if (options.format === "xml" && fs.existsSync(cfilexml)) {
		if (debugcache) {
			log.logres("Cache file found for url = " + url, options.res)
		}
		headthenfetch(url,"xml");
		return;
	}

	// Fetch and then cache.
	if (options.format != "xml") {
		if (debugcache) {
			log.logres("No cache file found for url = " + url, options.res)
		}
		fetch(url,"json");
		return;
	} else {
		if (debugcache) {
			log.logres("No cache file found for url = " + url, options.res)
		}
		fetch(url,"xml");
		return;
	}

	function headthenfetch(url,type) {

		// Do head request for file that contains list of datasets.
		if (debugcache) {
			log.logres("Doing (async) head request on "+url, options.res)
		}
		var hreq = request.head(url, function (herror, hresponse) {
			if (!herror && hresponse.statusCode != 200) {
				herror = true;
			}

			if (herror) {
				if (debugcache) {
					log.logres("Error when making head request on " + url, options.res)
					log.logres("Will try request for " + url, options.res)
					age = 1;
				}
			}

			var dhead = new Date(hresponse.headers["last-modified"]);
			if (debugcache) {
				log.logres("Last-modified time: " + dhead, options.res)
			}
			var fstat = fs.statSync(cfile+"."+type).mtime;
			var dfile = new Date(fstat);
			if (debugcache) {
				log.logres('Cache file created: ' + fstat, options.res)
			}
			var age = dhead.getTime() - dfile.getTime();
			if (debugcache) {
				log.logres('Last-modified - Cache file created = ' + age, options.res)
			}
			var found = true;

			if (age <= 0) {
				if (debugcache) {
					log.logres("Cache file has not expired.  Reading cache file "+(cfile+"."+type).replace(__dirname,""), options.res)
					log.logres("for URL " + hresponse.request.uri.href, options.res)
					log.logres("Reading cache file (sync) ", options.res)
				}
				var tmp = fs.readFileSync(cfile+"."+type).toString();
				if (type === "json") {	
					var tmp = JSON.parse(tmp);
				}
				if (debugcache) {
					log.logres("Done.", options.res)
				}
				callback(tmp);
			} else {
				if (debugcache) {
					log.logres("Cache file has expired.", options.res)
				}
				fetch(url,type,true);
			}

			if (!hresponse) {
				log.logres("Error when attempting to access " + url, options.res)
				log.logres("Sending 502 error ", options.res)
				console.error("Error when attempting to access " + url)
				options.res.status(502).send("Error when attempting to access " + url + "\n")
				console.error(config)
				return;
			}


		});
	}

	function fetch(url,type,isexpired) {
		if (debugapp) {
			log.logres("Fetching " + url, options.res);
		}

		request(url, function (error, response, body) {

			if (debugapp) {
				log.logres("Done fetching.", options.res)
			}

			if (error) {
				log.logres("Error when attempting to access " + url + " :" + JSON.stringify(error), options.res);
			}

			if (response.statusCode != 200) {
				log.logres("Status code was not 200 when attempting to access " + url, options.res);
			}

			if (error || response.statusCode != 200) {
				error = true;
			}

			if (error) {
				if (fs.existsSync(cfile+"."+type))  {
					if (debugapp) {
						log.logres("Using expired cache because request failed for " + url, options.res);
					}
					// Add a header noting cache was used (because failed request).
					if (isexpired) {
						res.header('x-tsdsfe-warning',"Used expired cache because failed request for " + url);
					} else {
						res.header('x-tsdsfe-warning',"Used cache because failed request for " + url);
					}
					var tmp = fs.readFileSync(cfile+"."+type).toString();
					if (options.format == "json") { 
						var tmp = JSON.parse(tmp);
					}
					callback(tmp);
				} else {
					if (!fs.existsSync(cfile+"."+type))  {
						log.logres("Error when attempting to access " + url + " and not cached version found.\n", options.res);
						options.res.status(502).send("Error when attempting to access " + url + " and no cached version found.\n");
					}
				}
				return;
			}

			var isjson = false;
			var isxml  = false;

			if (body.match(/^\s*\[|^\s*{/)) {
				if (debugapp) {
					log.logres("Response was JSON", options.res)
				}
				isjson = true;
			} else {
				if (debugapp) {
					log.logres("Response is XML.", options.res)
				}
				isxml = true;
			}

			if (isxml) {
				if (options.format === "xml") {
					if (debugapp) {
						log.logres("Returning XML.", options.res)
						log.logres("Calling callback(xml).", options.res)
					}
					callback(body);

					if (debugcache) {
						log.logres("Writing (sync) XML cache file for url = " + url, options.res)
					}
					fs.writeFileSync(cfilexml,body);
					if (debugcache) {
						log.logres("Done.", options.res)
					}
				} else {
					if (debugapp) {
						log.logres("Parsing "+url, options.res)
					}
					var parser = new xml2js.Parser();
					parser.parseString(body, function (err, json) {

						if (debugapp) {
							log.logres("Done parsing.", options.res)
						}

						if (err) {
							log.logres("Sending 502.  Could not parse "+url+".\n", options.res)
							options.res.status(502).send("Could not parse " + url + ".\n"+err, options.res)
							return;
						}

						if (debugapp) {
							log.logres("Calling callback(json).", options.res)
						}
						callback(json);

						if (debugcache) {
							log.logres("Writing (sync) JSON cache file for url = " + url, options.res)
						}
						fs.writeFileSync(cfilejson,JSON.stringify(json));
						if (debugcache) {
							log.logres("Done.", options.res)
						}
					})
				}
			} else {
				if (options.format === "xml") {
					var builder = new xml2js.Builder();
					var xml = builder.buildObject(JSON.parse(body));

					if (debugapp) {
						log.logres("Calling callback(xml).", options.res)
					}
					callback(xml);

					if (debugcache) {
						log.logres("Writing XML cache file for url = " + url, options.res)
					}
					fs.writeFileSync(cfilexml,xml);
					if (debugcache) { 
						log.logres("Done.", options.res)
					}
				} else {
					if (debugapp) {
						log.logres("Calling callback(json).", options.res)
					}
					callback(body);
				}				
				if (debugcache) {
					log.logres("Writing JSON cache file for url = " + url, options.res)
				}
				fs.writeFileSync(cfilejson,JSON.stringify(body));
				if (debugcache) {
					log.logres("Done.", options.res)
				}
			}
		})
	}
}

// After catalog() executes, it either calls dataset() or stream()
// (will call stream() if only catalog information was requested.)
function catalog(options, cb) {

	if (debugapp) {
		log.logres("Called", options.res)
	}
	
	getandparse(config.CATALOG,options,afterparse);

	function afterparse(result) {

		// Given JSON containing information in config.CATALOG, form JSON response.
		// config.CATALOG contains links to all catalogs available.
		var resp = [];

		var catalogRefs = result["catalog"]["catalogRef"];
		var xmlbase     = config.XMLBASE || result["catalog"]["$"]["xml:XMLBASE"] || "";
		if (debugapp) {
			log.logres("Setting xmlbase to " + xmlbase, options.res)
		}

		if (debugapp) {
			log.logres("Found " + catalogRefs.length + " catalogRef nodes.", options.res)
		}

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
			log.logres("Error: No matching catalogs.", options.res)
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

	if (debugapp) {
		log.logres("dataset(): Called.", options.res)
	}

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
		while (parents.length < datasets.length) {
		    parents = parents.concat(parent);
		}

		// TODO: This won't catch case when pattern is used; afterparse may not have been called with results in same order as catalog array.
		if (catalogs.length == 1) {
		    if (parent !== catalogs[afterparse.j-1].value) {
		    	log.logres("ID of catalog in THREDDS specified with a URL does not match ID of catalog found in catalog.", options.res)
		    	log.logres("\tID in THREDDS ["+config.CATALOG+"]: "+parent, options.res)
		    	log.logres("\tID in catalog ["+catalogs[afterparse.j-1].href+"]: "+catalogs[afterparse.j-1].value, options.res)
		    	options.res.status(502).send("ID of catalog found in "+catalogs[afterparse.j-1].href+" does not match ID associated with URL in "+config.CATALOG);
		    	return;
		    }
		}
		var dresp = [];

		// If all of the dataset URLs have been parsed.
		if (afterparse.j == catalogs.length) {

			for (var i = 0;i < datasets.length;i++) {
				dresp[i]         = {};
				dresp[i].value   = datasets[i]["$"]["id"] || datasets[i]["$"]["ID"];
				dresp[i].label   = datasets[i]["$"]["label"] || datasets[i]["$"]["name"] || dresp[i].value;
				dresp[i].catalog = parents[i];

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
				dresp = dresp.filter(function(n){return n;}); // Needed?
				if (dresp.length == 1 && options.dataset.substring(0,1) !== "^") {
					if (typeof(datasets[z]["documentation"]) !== "undefined") {
						for (var k = 0; k < datasets[z]["documentation"].length;k++) {
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
						dresp[k] = {};
						dresp[k].title = "No dataset documentation in catalog";
						dresp[k].link  = "";
						dresp[k].text  = "";							
					}
					// TODO: Do the following using getandparse().  Document how it works.
					console.log(datasets[z])
					var filecite = __dirname + "/" + catalogs[afterparse.j-1].href.replace(config.TSDSFE,"").replace(/\.xml|\.json/,'.cite');
					if (fs.existsSync(filecite)) {
						var text = fs.readFileSync(filecite)
									 .toString()
									 .replace("{{DATASET}}",datasets[z]["$"].name)
									 .replace("{{DATE}}",new Date().toISOString().substring(0,10));
						var k = dresp.length;
						dresp[k] = {};
						dresp[k].title = "Suggested dataset acknowledgement";
						dresp[k].link  = "";
						dresp[k].text  = text;												
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

	if (debugapp) {
		log.logres("Called.", options.res)
	}
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
		}
	}							
		
	for (var i = 0;i < parameters.length;i++) {
			
		resp[i]           = {};
		resp[i].value     = parameters[i]["$"]["id"] || parameters[i]["$"]["ID"];
		resp[i].label     = parameters[i]["$"]["name"] || resp[i].value || "";
		resp[i].units     = parameters[i]["$"]["units"] || "";
		resp[i].columnLabels = parameters[i]["$"]["columnLabels"] || "";
		resp[i].type      = parameters[i]["$"]["type"] || "";
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
		
		if (options.parameters !== "^.*") {				

			var value = resp[i].value;

			if (options.parameters.substring(0,1) === "^") {
				if (!(parameters[i]["$"]["id"].match(options.parameters))) {
					delete resp[i];
				}
			} else  {
				var re = new RegExp("/^"+value+"$/");
				var mt = options.parameters.match(value);
				if (!mt) {
					delete resp[i];
				} else if (mt[0].length != value.length) {
					delete resp[i];
				} else {
					if (debugapp) {
						log.logres("Match in catalog for requested parameter "+value+".", options.res)
					}
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
		if (debugapp) {
			log.logres(datasets[0].groups[0].group, options.res)
			log.logres(ddresp, options.res);
		}

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

	if ((options.start === '') && (options.stop !== '')) {
	    options.start = "-P1D";
	}
	if ((options.stop === '') && (options.start !== '')) {
	    options.stop = "P1D";
	}
	start = options.start || resp[0].dd.start;
	stop  = options.stop  || resp[0].dd.start;

	var tmp = expandISO8601Duration(start+"/"+stop,{debug:false});

	//start = tmp.split("/")[0].substring(0,10);
	//stop = tmp.split("/")[1].substring(0,10);

	start = tmp.split("/")[0].replace("T00:00:00.000Z","");
	stop = tmp.split("/")[1].replace("T00:00:00.000Z","");

	
	if (debugapp) {
		log.logres("Requested start : " + options.start, options.res)
		log.logres("Expanded start  : " + start, options.res)
		log.logres("DD start        : " + resp[0].dd.start, options.res)
		log.logres("Requested stop  : " + options.stop, options.res)
		log.logres("Expanded stop   : " + stop, options.res)
		log.logres("DD stop         : " + resp[0].dd.stop, options.res)
	}

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

	if (options.return === "image" && options.format === "viviz") {
		var viviz = config.VIVIZ 
					+ "#" 
					+ config.TSDSFE 
					+ "%3Fcatalog%3D" + options.catalog
					+ "%26dataset%3D" + options.dataset
					+ "%26parameters%3D" + options.parameters
					+ "%26return%3Dimage"
					+ "%26format%3Dpng"
					+ "%26type%3D"+options.type
		            + "%26style%3D0"
					+ "&strftime=start%3D-P1D%26stop%3D$Y-$m-$d"
					+ "&start=" + options.start
					+ "&stop=" + options.stop;
		cb(302,viviz);
		return;
	}

	if (options.return === "image" || options.return === "script") {

		// If more than one resp, this won't work.
		var Labels = "'";
		var Parameters = "";
		for (var z = 0;z<resp.length;z++) {
			Parameters = Parameters + resp[z].parameter + ",";
			Labels = Labels + resp[z].parameter + " [" + resp[z].dd.units + "]','";
		}

		if ((options.return === "script")) {

			if (options.format === "matlab") var ext = "m";
			if (options.format === "idl") var ext = "pro";

			var script = fs.readFileSync(__dirname + "/scripts/tsdsfe."+ext).toString();

			script = script
						.replace("__SERVER__",config.TSDSFE)
						.replace("__QUERYSTRING__",
									"catalog="+resp[0].catalog+
									"&dataset="+resp[0].dataset+
									"&parameters="+Parameters.slice(0,-1)+
									"&start="+start+
									"&stop="+stop+
									"&format=2");
			script = script.replace("__LABELS__",Labels.slice(0,-2));
			if (config.TSDSFE.match(/http:\/\/localhost/)) {
				log.logres("Warning: stream(): Possible configuration error.  Serving an IDL or MATLAB script containing a TSDSFE URL that is localhost", options.res)
				script=script.replace("__COMMENT__","!!! Warning: Possible TSDSFE configuration error - script contains a TSDSFE URL that is localhost")
			} else {
				script=script.replace("__COMMENT__","")
			}

			cb(200,script);
			return;
		}

		var tmp = expandISO8601Duration(start+"/"+stop,{debug:false})

		// For now, don't use relative times because TSDS interpretation is different from Autoplot (TSDS should change to match Autoplot's.)
		start = tmp.split("/")[0].substring(0,10);
		stop = tmp.split("/")[1].substring(0,10);

		url = config.JYDS +
				"?server="+config.TSDSFE+
				"&catalog="+resp[0].catalog+
				"&dataset="+resp[0].dataset+
				"&parameters="+resp[0].parameter+
				"&timerange="+start+"/"+stop+
				"&type="+options.type;

		if (resp[0].columnLabels !== '') {
			url = url + "&labels="+resp[0].columnLabels;
		} else if (resp[0].label != "") {
			url = url + "&labels="+resp[0].label;
		}
		if (resp[0].units != "")  {url = url +"&units="+resp[0].units;}
		
		if (resp[0].dd.fillvalue != "")  {url = url + "&fills="+resp[0].dd.fillvalue};

		if (debugapp) {
			log.logres("vap+jyds:"+url, options.res)
		}

		if (options.format === "jnlp") {
			cb(301,"http://autoplot.org/autoplot.jnlp?open=vap+jyds:"+url);
			return;
		}

		var format = "image/png";
		if (options.format === "pdf") {format = "application/pdf"}
		if (options.format === "svg") {format = "image/svg%2Bxml"}
		
		var aurl = config.AUTOPLOT + "?format="+format+"&" + options.style + "&url=vap+jyds:" + encodeURIComponent(url);	

		log.logres("vap+jyds:"+url, options.res);

		if (config.TSDSFE.match(/http:\/\/localhost/)) {
			if (!config.AUTOPLOT.match(/http:\/\/localhost/)) {
				log.logres("Error: stream(): Autoplot image servlet specified by config.AUTOPLOT must be localhost if config.TSDSFE is localhost.", options.res)
				cb(501,"Server configuration error related to address of Autoplot servlet ("+config.AUTOPLOT+") and address of TSDSFE ("+config.TSDSFE+").");
				return;
			}
		}
		cb(0,aurl);
		return;
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
			if (options.format === "1") {
				ddresp[z].columns = "" + (z+2);
				ddresp[z].timeFormat = "%Y-%m-%DT%H%M%SZ";
				ddresp[z].timeColumns = ""+1;
			}
			if (options.format === "2") {
				ddresp[z].columns = "" + (z+7);
				ddresp[z].timeFormat = "%Y %m %D %H %M %S";
				ddresp[z].timeColumns = "1,2,3,4,5,6";
			}
		}
		
		cb(200,ddresp);
		return;
	}
	
	if ((options.return === "data") || (options.return === "redirect")) {				 
		dc = dc
				+"&return=stream"
				+"&lineRegExp="+(resp[0].dd.lineregex || "")
				+"&timecolumns="+(resp[0].dd.timecolumns || "")
				+"&timeformat="+(resp[0].dd.timeformat || "")
				+"&streamFilterReadColumns="+columns
				+"&streamFilterTimeFormat="+options.format
				+"&streamFilterComputeFunction="+options.filter
				+"&streamFilterComputeWindow="+options.filterWindow
				+"&streamFilterExcludeColumnValues="+(resp[0].dd.fillvalue || "")
				+"&streamOrder=true"
				+"&streamGzip=false"
				;

		// Remove name=value when value === "".
		dc = dc.replace(/[^=&]+=(&|$)/g,"").replace(/&$/,"");
		if (!options.usedatacache) dc = dc+"&forceUpdate=true&forceWrite=true"

		if (options.return === "redirect") {
			// If more than one resp, this won't work.
			cb(302,dc);
			return;
		}

		cb(0,dc);
		return;
	}

	cb(500,"Query parameter return="+options.return+" not recognized.");

}
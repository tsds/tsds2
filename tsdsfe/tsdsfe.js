var fs      = require('fs')
var os      = require("os")
var request = require("request")
var express = require('express')
var app     = express().use(express.bodyParser())
var server  = require("http").createServer(app)
var qs      = require('querystring')
var xml2js  = require('xml2js')
var http    = require('http')
var url     = require('url')
var util    = require('util')
var crypto  = require("crypto")
var clc     = require('cli-color')

var servers = require('./servers.js')
var deps    = require('./deps.js')

// Helper functions
function s2b(str) {if (str === "true") {return true} else {return false}}
function s2i(str) {return parseInt(str)}
function ds() {return (new Date()).toISOString() + " [tsdsfe] "}

var argv    = require('yargs')
				.default
				({
					'port': 8004,
					'debugall': "false",
					'debugconsole': "false",
					'debugapp': "false",
					'debugcache': "false",
					'debugstream': "false",
					'checkdeps': "true",
					'checkservers': "true"
				})
				.argv

argv.checkdeps = s2b(argv.checkdeps)
argv.checkservers = s2b(argv.checkservers)

var debug = {}
for (key in argv) {
	if (key.search(/^debug/) != -1) {
		key2 = key.replace('debug',"")
		if (argv.debugall === "true") {
			debug[key2] = true
		} else {
			debug[key2] = s2b(argv[key])
		}
	}			
}

var port         = s2i(argv.port)
var debugall     = s2b(argv.debugall)
var debugapp     = s2b(argv.debugapp)
var debugcache   = s2b(argv.debugcache)
var debugstream  = s2b(argv.debugstream)
var debugconsole = s2b(argv.debugconsole)

if (argv.help || argv.h) {
	console.log("Usage: node tsdsfe.js [--port=8004 "
					+ "--debug{all,app,cache,stream,console} false "
					+ "--check{servers,deps} true]"
				)
	return
}

//http://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
process.setMaxListeners(0)
server.setMaxListeners(0)

if (fs.existsSync("../../datacache/log.js")) {
	// Development
	var develdatacache = true
	var log = require("../../datacache/log.js")
} else {
	// Production
	var develdatacache = false
	var log = require("./node_modules/datacache/log.js")
}

if (fs.existsSync("../../viviz")) {
	// Development
	var develviviz = true
} else {
	// Production
	var develviviz = false
}

if (fs.existsSync("../../tsdset/lib/expandtemplate.js")) {
	// Development
	var develtsdset = true
	var expandISO8601Duration = 
			require("../../tsdset/lib/expandtemplate.js")
			.expandISO8601Duration
} else {
	// Production
	var develtsdset = false
	var expandISO8601Duration = 
			require("./node_modules/tsdset/lib/expandtemplate")
			.expandISO8601Duration
}

process.on('uncaughtException', function(err) {
	if (err.errno === 'EADDRINUSE') {
		console.log(ds() + "Address already in use.")
	} else {
		console.log(err.stack)
	}
	var tmps = ds();
	fs.appendFileSync('tsds-error-'+tmps.split(" ")[0]+".log", err)
	process.exit(1)
})

process.on('SIGINT', function () {
	process.exit()
})

process.on('exit', function () {
	console.log(ds() + "Received exit signal.")
	clc.red(ds() 
		+ "(NOT IMPLEMENTED) Removing partially written files.")

	if (deps.startdeps.datacache) {
		console.log(ds() + "Stopping datacache server.")
		deps.startdeps.datacache.kill('SIGINT')
	}

	if (deps.startdeps.viviz) {
		console.log(ds() + "Stopping viviz server.")
		deps.startdeps.viviz.kill('SIGINT')
	}

	console.log(ds() + "Stopping autoplot server.")
	deps.stopdeps('autoplot')
	
	console.log(ds() + "Exiting.")
})

// Read configuration file in conf/ directory.
if (fs.existsSync(__dirname + "/conf/config." + os.hostname() + ".js")) {
	// Look for host-specific config file conf/config.hostname.js.
	if (debugapp && debugconsole) {
		console.log(ds() 
					+ "Using configuration file conf/config."
					+ os.hostname() + ".js")
	}
	var tmpfname = __dirname + "/conf/config." + os.hostname() + ".js"
	var config = require(tmpfname).config()
	config.CONFIGFILE = tmpfname
} else {
	// Default
	if (debugapp && debugconsole) {
		console.log(ds() + "Using configuration file conf/config.js")
	}
	var config = require(__dirname + "/conf/config.js").config()
	config.CONFIGFILE = __dirname + "/conf/config.js"
}
config.argv = argv

// In more recent versions of node.js, is set at Infinity.
// Previously it was 5.  Apache uses 100.
http.globalAgent.maxSockets = config.maxSockets

// Serve files in these directories as static files and allow
// directory listings.
var dirs = ["js","css","scripts","catalogs","log"]
for (var i in dirs) {
	app.use("/" + dirs[i], express.static(__dirname + "/" + dirs[i]))
	app.use("/" + dirs[i], express.directory(__dirname + "/" + dirs[i]))
}
// Compress response (depending on request headers).
app.use(express.compress())

// Get the status of services used by TSDSFE.
app.get('/status', function (req, res) {
	var addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
	var c = {}
	if (deps) {
		if (deps.checkdeps.status) {
			c.deps = deps.checkdeps.status
		}
	}
	if (checkservers) {
		if (checkservers.status) {
			c.servers = checkservers.status
		}
	}
	res.send(JSON.stringify(c))
})

// Test a request using curl-test.sh, which displays log information associated
// with request from DataCache and TSDSFE.
app.get('/test', function (req, res) {
	var com = __dirname + '/test/curl-test.sh "' 
				+ config.TSDSFE + req.originalUrl.replace("/test/","") + '"'

	var addr  = req.headers['x-forwarded-for'] || req.connection.remoteAddress
	console.log(ds() + "Request from " + addr + " for " + req.originalUrl)
	console.log(ds() + "Evaluating " + com.replace(__dirname,""))

	var child = require('child_process').exec(com)

	child.stdout.on('data', function (buffer) {
		if (req.headers['user-agent'].match("curl")) {
			res.write(buffer.toString())
		} else {
			// [1m and [0m are open and close bold tags for shell.
			// curl-test.sh includes them in output.
			res.write(buffer.toString().replace('[1m','').replace('[0m',''))			
		}
	})
	child.stdout.on('end', function() {res.end()})
	return
})

// Main entry route
app.get('/', function (req, res) {
	if (Object.keys(req.query).length === 0) {
		// If no query parameters, return index.htm
		res.contentType("html")
		res.send(fs.readFileSync(__dirname+"/index.htm"))
	} else {
		// Call main entry function
		var addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
		console.log(ds() + "Request from " + addr + ": " + req.originalUrl)
		handleRequest(req,res)
	}
})

// For debugging mysterious timeouts.
if (false) {
	server.on('connection', function(socket) {
			var key = socket.remoteAddress+":"+socket.remotePort
			console.log("Socket connected to "+key)

			socket.on('disconnect', function(socket) {
				console.log("Socket disconnect to "+key)
			})
			socket.on('close', function(socket) {
				console.log("Socket closed to     "+key)
			})
			socket.on('end', function(socket) {
				console.log("Socket end to        "+key)
			})
			socket.on('timeout', function(socket) {
				console.log("Socket timeout to    "+key)
			})		  
			socket.setTimeout(config.TIMEOUT,
				function(obj) {
					console.log("TSDSFE server timeout ("+(config.TIMEOUT/(1000*60))+" minutes).")
					server.getConnections(function(err,cnt) {console.log(cnt)})
					if (obj) {
						console.log(obj._events.request)
					}
			})
	})
}

// Local cache directory
if (!config.CACHEDIR.match(/^\//)) {
	// If relative path given for CACHEDIR, prepend with __dirname.
	config.CACHEDIR = __dirname + "/cache/"
}
if (!fs.existsSync(config.CACHEDIR)) {
	// Create cache directory if not found
	fs.mkdirSync(config.CACHEDIR)
}

// If relative path given for LOGDIR, prepend with __dirname.
// (Needed because in log.js __dirname is location of log.js.)
if (!config.LOGDIR.match(/^\//)) {
	config.LOGDIR = __dirname + "/log/"
}

// Look for PNGQuant (for reducing png sizes by 80%)
var pngquant_exists = false
if (!config.PNGQUANT.match(/^\//)) {
	// If relative path given, prepend with __dirname.
	config.PNGQUANT = __dirname + "/" + config.PNGQUANT
}
if (fs.existsSync(config.PNGQUANT)) {
	pngquant_exists = true
}
if (!pngquant_exists) {
	console.log(ds() + "Note: " 
		+ clc.blue(config.PNGQUANT.replace(__dirname+"/","") 
		+ " not found.  Image file size will not be reduced."))
}

// Look for ImageMagick convert (for resizing images)
var convert_exists = false
if (!config.CONVERT.match(/^\//)) {
	// If relative path given, prepend with __dirname.
	config.CONVERT = __dirname + "/" + config.CONVERT
}
if (fs.existsSync(config.CONVERT)) {
	convert_exists = true
}
if (!convert_exists) {
	var result = ""
	try {
		var execSync = require('child_process').execSync;
		var result = execSync('which convert').toString().replace(/\n/,"");
		console.log(ds() + "Note: " 
				+ clc.blue(config.CONVERT 
				+ " specified in "
				+ config.CONFIGFILE.replace(__dirname+"/","")
				+ " not found. Using found "
				+ result))
		convert_exists = true
		config.CONVERT = result;
	} catch (e) {}
	if (!convert_exists) {
		console.log(ds() + "Note: " 
				+ clc.blue(config.CONVERT 
				+ " not found and 'which convert'"
				+ " did not return path. Canvas size"
				+ " for Autoplot image will be based on smallest width."))
	}
}

// Initialize logging.
config = log.init(config)

var msg = "";
if (develdatacache || develtsdset || develviviz) {
	msg = "Using devel version of:"
}
if (develdatacache) {msg = msg + " datacache"}
if (develviviz) {msg = msg + " viviz"}
if (develtsdset) {msg = msg + " tsdset"}
if (msg !== "") {
	console.log(ds() + "Note: " + clc.blue(msg))
}

if (argv.checkdeps) {
	var deps = require('./deps.js')
	//setTimeout(function () {deps.checkdeps(config)}, 5000)
	console.log(ds() + "Checking dependencies every " 
					 + config.DEPSCHECKPERIOD/1000 + " seconds.")
	setInterval(function() {deps.checkdeps(config)}, config.DEPSCHECKPERIOD)
} else {
	console.log(ds() + "Note: " + clc.blue("Dependency checks disabled."))
}

if (argv.checkservers) {
	var checkservers = require('./servers.js').checkservers
	// Check servers 5 seconds after start-up
	console.log(ds() + "Checking servers in 5 seconds.")
	setTimeout(function () {checkservers(config)}, 5000)
} else {
	console.log(ds() + "Note: " + clc.blue("Server checks disabled."))
}

deps.startdeps('datacache', config)
deps.startdeps('viviz', config)
deps.startdeps('autoplot', config)

// Start the server.  TODO: Wait until deps are ready.
server.listen(config.PORT)

console.log(ds() + "Listening on port " + config.PORT + ". See " + config.TSDSFE)

function handleRequest(req, res) {

	//res.header('Access-Control-Allow-Origin', '*');
	//res.header('Access-Control-Allow-Methods', 'GET,POST');
	//res.header('Access-Control-Allow-Headers', 'Content-Type');

	var options = parseOptions(req, res)

	res.options = JSON.parse(JSON.stringify(options))

	//log.logapp(options.ip + " " + req.originalUrl, config)

	// Set log file name as response header
	res.header('x-tsdsfe-log', options.logsig)

	log.logres("Configuration file = "+JSON.stringify(config.CONFIGFILE), res.options)
	log.logres("req.headers = "+JSON.stringify(req.headers), res.options)
	log.logres("req.headers['x-forwarded-for'] = " + JSON.stringify(req.headers['x-forwarded-for']), res.options)
	log.logres("req.connection.remoteAddress = " + JSON.stringify(req.connection.remoteAddress), res.options)
	log.logres("req.originalUrl = " + JSON.stringify(req.originalUrl), res.options)
	log.logres("options = " + JSON.stringify(options), res.options)

	options.res = res
	options.req = req

	if (typeof(options) === "undefined") {
		// TODO: Implement this.
		log.logres("Error parsing options.  Sent 502.", res.options)
		return
	}

	if (options.return === "log") {
		console.log(options)
		// hash of 127.0.0.1 = f528764d
		var excludeIPs = "f528764d"
		// Get directory listing and start streaming lines in files
		// that match catalog=CATALOG
		var com = "grep --no-filename -e"
			+ " '"
			+ req.originalUrl.replace("&return=log", "").replace("/?", "")
			+ "' " 
			+ config.LOGDIRAPPPUBLIC + "*.log"
			+ " | grep -v " + excludeIPs
			+ " | cut -f1,3,4 -d,";
		var child = require('child_process').exec(com)
		console.log(com)
		log.logres("Sending output of shell command: "+com, res.options)
		child.stdout.on('data', function (buffer) {
			res.write(buffer.toString())
		})
		child.stdout.on('end', function() { 
			log.logres("Finished sending output of shell command."
						+ " Sending res.end().", res.options)
			res.end()
		})
		return
	}
	
	// Metadata and images responses are cached as files with filename based on MD5 hash of request.
	// TODO: Sort URL so a=b&c=d and c=d&a=b are treated as equivalent.
	// TODO: Create lock file while json cache file is being written.

	var urlo = req.originalUrl.split("&")
	var urlr = []
	var k = 0
	for (var j in urlo) {
		if ((!urlo[j].match("cache") && !urlo[j].match("image."))
			|| urlo[j].match("image.quant")) {
			urlr[k] = urlo[j]
			k = k+1;
		}
	}
	var urlreduced = urlr.join("&")
	//console.log("URL Original     : " + req.originalUrl)
	//console.log("URL for signature: " + urlreduced)

	var urlsig = crypto.createHash("md5").update(urlreduced).digest("hex")	

	// JSON cache filename
	var cfile  = config.CACHEDIR + urlsig + ".json"

	// Base image
	var ifile = config.CACHEDIR + urlsig 
				+ "." + options.image.width
				+ "x" + options.image.height
				+ "." + options.format

	// Returned image.  If sizes differ, returned image will be a converted
	// version of base image.  (To address issue that for small canvas sizes,
 	// Autoplot produces images with text that takes up most of the canvas.)
	var ifiler = config.CACHEDIR + urlsig 
				+ "." + options.image.widthr
				+ "x" + options.image.heightr
				+ "." + options.format

	if ((options.format === "png") 
			|| (options.format === "pdf") 
			|| (options.format === "svg")) {
		var isimagereq = true
	} else {
		var isimagereq = false
	}

	// TODO: Skip below if return=data because no cache will exist if one
	// of format={0,1,2} is selected. (Data are not cached by TSDSFE.)
	if (!isimagereq) {
		if (options.usemetadatacache) {
			if (fs.existsSync(cfile)) {
				log.logres("Metadata response cache found for originalUrl = " + urlreduced, res.options)
				log.logres("Using response cache file because usemetadatacache = true.", res.options)
				// Send the cached response and finish
				fs.createReadStream(cfile).pipe(res)
				return					
			} else {
				log.logres("Metadata response cache not found for originalUrl = " + urlreduced, res.options)
			}
		} else {
			log.logres("Not looking for response cache file because usemetadatacache = false.", res.options)
		}
	} else {
		if (fs.existsSync(ifiler)) {
			log.logres("Image response cache found for originalUrl = " + req.originalUrl, res.options)
		} else {
			log.logres("Image response cache not found for originalUrl = " + req.originalUrl, res.options)
		}
		if (options.useimagecache) {
		  	if (fs.existsSync(ifiler) && !fs.existsSync(ifiler + ".writing")) {
				log.logres("Using response cache file.", res.options)
				log.logres("Writing (sync) " + ifiler.replace(__dirname,"")
								+ ".streaming", res.options)

				// Write lock file
				fs.writeFileSync(ifiler + ".streaming","")

				log.logres("Streaming " + ifiler, res.options)

				// Send the cached response and return		
				var stream = fs.createReadStream(ifiler)
				stream
					.on('error', function () {
						log.logres("Error when attempting to stream cached image.", res.options)
						log.logres("Removing (sync) " + ifiler.replace(__dirname,"")+ ".streaming", res.options)
						fs.unlinkSync(ifiler + ".streaming")
					})
					.on('close', function () {
						log.logres("Stream close event.", res.options)
					})
					.on('end', function () {
						log.logres("Stream end event.", res.options)
						log.logres("Removing (sync) " 
							+ ifiler.replace(__dirname,"")
							+ ".streaming", res.options)
						fs.unlinkSync(ifiler + ".streaming")
					})
				stream.pipe(res)
				return
			}
		} else {
			log.logres("Not using image response cache file if"
						+ " found because useimagecache = false.", 
						res.options)
		}
	}

	// Catch case where ?catalog=CATALOG&return={tsds,autoplot-bookmarks,spase}
	if ( options.return === "autoplot-bookmarks" || options.return === "tsds" ) {

		log.logres("Request is for " + options.return, res.options)

		if (options.format == 1) {
			options.format = "xml"
		}
		if (options.format === "json") {
			res.setHeader("Content-Type", "application/json")
		} else {
			res.setHeader("Content-Type", "text/xml")
			options.format = "xml"
		}

		// Get list of all catalogs and their URLs		
		url = config["TSDSFE"] + "?catalog=^.*"
		log.logres("Requesting "+url, res.options)

		request(url, function (err,catres,catbody) {

			catalogjson = JSON.parse(catbody);

			// Iterate through catalog and find one that matches
			// requested catalog.
			for (var i = 0;i < catalogjson.length;i++) {

				if (catalogjson[i].label.match(options.catalog)) {
					url = catalogjson[i].href;

					log.logres("Calling getandparse() with URL " + url, res.options)

					// Request the matched catalog and parse it.
					if (options.return === "tsds") {
						getandparse(url,options,res,function (ret) {
							if (options.format === "xml") {
								log.logres("Sending TSDS XML.", res.options)
								res.write(ret.toString())
								res.end()					
							} else {
								res.write(JSON.stringify(ret))
								res.end()													
							}
						})
					}

					if (options.return === "autoplot-bookmarks") {
						var format = options.format
						// This causes getandparse to return TSDS JSON, which tsds2bookmarks requires.
						options.format = "json"
						log.logres("Calling getandparse() with URL " + url, res.options)
						getandparse(url,options,res,function (ret) {
							options.format = format
							var tsds2other = require(__dirname + "/js/tsds2other.js").tsds2other

							log.logres("Converting TSDS XML catalog to Autoplot bookmark XML.", res.options)

							// Filename signature is based on input + transformation code.
							var retsig  = crypto.createHash("md5").update(JSON.stringify(ret)+tsds2other.toString()).digest("hex")
							var retfile = config.CACHEDIR + retsig + ".xml"

							if (fs.existsSync(retfile)) {
								log.logres("Cache of autoplot-bookmarks file found for input "+url, res.options)
								ret = fs.readFileSync(retfile)
								finish(ret)
							} else {
								log.logres("No cache of autoplot-bookmarks file found for input = "+url, res.options)
								tsds2other(ret, "autoplot-bookmarks", function (ret) {
									finish(ret)
									log.logres("Writing cache file for autoplot-bookmarks for input = "+url, res.options)
									fs.writeFileSync(retfile,ret)
								})
								
							}

							function finish(ret) {
								if (format === "xml") {
									res.write(ret.toString())
									res.end()
								} else {
									res.write(JSON.stringify(ret))
									res.end()																						
								}
							}
						})
					}
				}
			}			
		})
		return
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
		var catalogs    = options.catalog.split(";")
		var datasets    = options.dataset.split(";")
		var parameterss = options.parameters.split(";")
		var starts      = options.start.split(";")
		var stops       = options.stop.split(";")
		
		log.logres("handleRequest(): Concatenated parameter request. N = "
						+ N, res.options)
		
		var Options = [];

		for (var i=0;i<N;i++) {
			Options[i]             = {};
			// Clone options object.
			for (var key in options) {
				if ((key !== "req") || (key !== "res")) {
					Options[i][key] = options[key]
				}
			}
			Options[i].catalog     = catalogs[i] || options.catalog.split(";")[0]
			Options[i].dataset     = datasets[i] || options.dataset.split(";")[0]
			Options[i].parameterss = parameterss[i] || options.parameters.split(";")[0]
			Options[i].start       = starts[i] || options.start.split(";")[0]
			Options[i].stop        = stops[i] || options.stop.split(";")[0]
		}
		// If N > 1, stream will call again (catalog(Options[1], stream)) when 
		// first data request is complete, etc.  If response if for an image, 
		// client will need to split it.
		catalog(Options[0], res, stream)
		return
	}

	catalog(options, res, stream);

	function stream(status, data, res) {
		
		log.logres("Stream called.", res.options)

		// TODO: Not all stream options will work for requests that
		// span multiple catalogs.  Document and fix.

		if (status == 0) {

			// If data was not a URL, send it.
			if (!data.match(/^http/)) {
				log.logres("Sending "+data, res.options)
				res.write(data)
				
				Nc = Nc + 1
				if (N > 1) res.write("\n")
				if (Nc == N) {
					res.end()
				} else {
					catalog(Options[Nc], res, stream)
				}
				return
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
			log.logres("Streaming from " + data, res.options)

			if (isimagereq && options.format !== "png") {
				var ifilews  = fs.createWriteStream(ifile)
				var rd = request.get(data);
				// TODO: Check for error here.
				rd.pipe(res)
				rd.pipe(ifilews)
				return
			}

			if (isimagereq && options.format === "png") {

				if (options.image.widthr !== options.image.width) {

					var sizeo = options.image.width + "x" + options.image.height
					var sizer = options.image.widthr + "x" + options.image.heightr

					log.logres("Creating and returning smaller image based on larger image.", res.options)
					log.logres("Base size: "+sizeo+"; Returned size: "+sizer, res.options)

					var child = require('child_process')

					// ifiler write stream
					var ifilerws = fs.createWriteStream(ifiler);
					var convertr  = child.spawn(config.CONVERT,['-quality','100','-resize',sizer,'-','-'])
					var pngquantr = child.spawn(config.PNGQUANT,['--quality','10','-'])
					
					// ifile write stream
					var ifilews  = fs.createWriteStream(ifile);
					var pngquant = child.spawn(config.PNGQUANT,['--quality','10','-'])

					if (!pngquant_exists || !options.image.quant) {
						if (!pngquant_exists) {
							log.logres(config.PNGQUANT + " not found.", res.options)
						}
						if (!options.image.quant) {
							log.logres("image.quant == false.", res.options)
						}
						log.logres(" Not reducing image size with pngquant.", res.options)

						// Pipe convertr stdout to resposse
						convertr.stdout.pipe(res)

						// Pipe convertr stdout to ifiler
						convertr.stdout.pipe(ifilerws)

						// Pipe request data into convertr stdin
						request.get(data).pipe(convertr.stdin)					

						return
					}

					// Pipe pngquantr stdout to ifiler
					pngquantr.stdout.pipe(ifilerws)

					// Pipe pngquantr stdout to resposse
					pngquantr.stdout.pipe(res)

					// Pipe convertr stdout into pngquant stdin
					convertr.stdout.pipe(pngquantr.stdin)

					// Pipe pngquant stdout to ifile
					pngquant.stdout.pipe(ifilews)

					// Pipe request data into pngquant stdin
					request.get(data).pipe(pngquant.stdin)					

					// Pipe request data into convertr stdin
					request.get(data).pipe(convertr.stdin)					

					return
				} else {

					var child = require('child_process')

					// ifile write stream
					var ifilews  = fs.createWriteStream(ifile);

					log.logres("Not creating scaled image based on larger image.", res.options)

					if (!pngquant_exists || !options.image.quant) {
						if (!pngquant_exists) {
							log.logres(config.PNGQUANT + " not found.", res.options)
						}
						if (!options.image.quant) {
							log.logres("image.quant == false.", res.options)
						}
						log.logres(" Not reducing image size with pngquant.", res.options)
						log.logres(config.PNGQUANT + " not found.  Not reducing image size with pngquant.", res.options)
						var rd = request.get(data)
						rd.pipe(res)
						rd.pipe(ifilews)
						return
					}

					log.logres("Reducing image size with pngquant.", res.options)

					var pngquant = child.spawn(config.PNGQUANT,['--quality','10','-'])

					// Pipe pngquant stdout to ifile
					pngquant.stdout.pipe(ifilews)

					// Pipe pngquant stdout to response
					pngquant.stdout.pipe(res)

					// Pipe request data into pngquant stdin
					request
					.get(data)
					.on('error', function (err) {
						console.log(err)
						var tmpstr  = "Error when attempting to retrieve data from data from " + data
						var tmpstr2 = "Error " + err.code + " when attempting to retrieve data from data from " + data.split("?")[0]
						res.setHeader('x-tsdsfe-error',tmpstr2)
						log.logres(tmpstr, res.options)
						res.status(502).send(tmpstr)
					})
						.on('response', function(res0) {
							if (res0.statusCode !== "200") {
								// TODO: Abort and send error.
							}
						log.logres("Headers from " + data + ":" + JSON.stringify(res0.headers), res.options)
						if (res0.headers['content-type']) {
							res.setHeader('content-type',res0.headers['content-type'])
						}
						if (res0.headers['x-datacache-log']) {
							res.setHeader('x-datacache-log',res0.headers['x-datacache-log'])
						}
						if (res0.headers['x-tsdsfe-warning']) {
							res.setHeader('x-tsdsfe-warning',res0.headers['x-tsdsfe-warning'])
						}
						})
						.pipe(pngquant.stdin)
					return
				}
			}

			// Request data from URL.
			var urldata = "";

			var sreq = http.get(data, function(res0) {

				log.logres("Headers from " + data + ":" + JSON.stringify(res0.headers), res.options)

				if (res0.headers['x-datacache-log']) {
					res.setHeader('x-datacache-log',res0.headers['x-datacache-log'])
				}
				if (res0.headers['x-tsdsfe-warning']) {
					res.setHeader('x-tsdsfe-warning',res0.headers['x-tsdsfe-warning'])
				}
							
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
					if (res0.statusCode != 200) {
						var writeok = false;
						log.logres("Image request response not 200.  Not writing image to cache.", res.options)						
					} else {
						var writeok = true;						
					}

					if (fs.existsSync(ifiler + ".streaming")) {
						log.logres("File is being streamed.  Not writing image to cache.", res.options)
						writeok = false;
					}
					if (fs.existsSync(ifiler + ".writing")) {
						log.logres("File is being written.  Not writing image to cache.", res.options)
						writeok = false;
					}
					if (writeok) {
						log.logres("Writing (sync) " + ifiler + ".writing", res.options)
						fs.writeFileSync(ifiler + ".writing","")
						istream = fs.createWriteStream(ifiler)
						istream
							.on('finish',function () {
								if (!fs.existsSync("deps/bin/pngquant")) {
									log.logres("deps/bin/pngquant not found.  Not creating smaller version of png.", res.options)
									log.logres("Finished writing image.  Removing (sync) " + ifiler + ".writing", res.options)
									fs.unlinkSync(ifiler + ".writing")
									return
								}
								var child = require('child_process')
								var com = 'deps/bin/pngquant -f --ext .quant.png --quality 10'+' '+ifiler

								log.logres("Creating smaller png of full using " + com, res.options)
								child.exec(com , function(error, stdout, stderr) {
									log.logres("Finished writing image and smaller version.  Removing (sync) " + ifile + ".writing", res.options)
									fs.unlinkSync(ifiler + ".writing")
									if (error) console.log(error)
									if (stdout) console.log(stdout)
									if (stderr) console.log(stderr)
								})

							})
						.on('error', function (err) {
							if (err) console.log(err)
							log.logres("Error when attempting to write image to cache. Error = " + err + " Removing (sync) " + ifile + ".streaming", res.options)
							console.log("Removing: "+ifile + ".streaming")
							// Test in case finish triggered first then error.
							if (fs.existsSync(ifile + ".streaming")) {
								fs.unlinkSync(ifile + ".streaming")
							}
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

						if (data.length == 0) {
							log.logres("Recieved first chunk of image request of size " + chunk.length + " . Straming it and writing chunk to cache file.", res.options)
						}
					})
					.on('end', function() {
						if (isimagereq && writeok) {
							log.logres("Finished recieving image.  Calling end event for image write stream.", res.options)
							istream.end();
						}

						// If N > 0, could use convert image1.png image2.png image3.png -append stack.png
						if (isimagereq) {
							if (writeok) {
								log.logres("Finished writing " + ifile + " and removing .writing file.", res.options)
							}
						}
						log.logres('Got end.', res.options)
						Nc = Nc + 1;
						if (Nc == N) {
							log.logres("Calling res.end().", res.options)
							res.end();
						} else {
							log.logres("Calling catalog with Nc="+Nc, res.options)
							catalog(Options[Nc], res, stream);
						}
					})
					.on('error',function (err) {
						log.logres("Error for request to " + data + ": " + JSON.stringify(err), debugconsole)
						console.log(err)
						console.log(res0)
						log.logres("Deleting image cache file due to error.", res.options)
						fs.unlinkSync(ifile)
					})
			}).on('error', function (err) {
				var tmpstr = "Error when attempting to retrieve data from data from upstream server "+data.split("/")[2]
				log.logres(tmpstr, res.options)
				res.status(502).send(tmpstr)
			})
		} else if (status == 301 || status == 302) {
			log.logres("Redirecting to "+data, res.options)
			res.redirect(status,data);
		} else {
			log.logres("Sending JSON.", res.options)

			if (typeof(data) === "string") {
				// Script.
				// TODO: Does not handle concatenated requests.
				res.setHeader('Content-Type','text/plain')
				res.write(data)
				res.end()
				return
			} else {
				if (N > 1) {
					if (Nc == 0) {
						res.write("[")
					}
				}
				res.write(JSON.stringify(data))
			}

			if (data.length > 0) {
				// Cache the JSON.
				if (!fs.existsSync(config.CACHEDIR)) {
					fs.mkdirSync(config.CACHEDIR)
				}
				fs.writeFileSync(cfile,JSON.stringify(data))
				log.logres("Wrote JSON request cache file " + cfile.replace(__dirname,""), res.options)
			} else {
				log.logres("JSON for " + req.originalUrl + " has zero length.  Not writing cache file.", res.options)
			}

			Nc = Nc + 1
			if (N > 1 && N != Nc) res.write(",");
			if (Nc == N) {
				if (N > 1) {
					res.write("]")
				}
				res.end()
			} else {
				log.logres("Calling catalog() again.", res.options)
				catalog(Options[Nc], res, stream)
			}
		}
	}		
}

function parseOptions(req, res) {

	var options = {}

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

	options.debug = {}

	options.debug["app"]     = req.query.debugapp       || req.body.debugapp
	options.debug["stream"]  = req.query.debugstream    || req.body.debugstream
	options.debug["cache"]   = req.query.debugutil      || req.body.debugutil

	// Over-ride true debug option if command line debug option is not true.
	for (key in debug) {
		if (debug[key] && options.debug[key] === "true") {
			options.debug[key] = true
		} else {
			options.debug[key] = debug[key]
		}
	}

	if (req.headers['x-forwarded-for']) {
		options.ip = req.headers['x-forwarded-for'].replace(/\s+/g,"")
	} else {
		options.ip = req.connection.remoteAddress
	}

	// Create detailed log file name based on current time, originalUrl, and request IP address
	var logsig = crypto
					.createHash("md5")
					.update(ds() + options.ip + req.originalUrl)
					.digest("hex")
					.substring(0,4)

	options.logcolor = Math.round(255*parseFloat(Math.random().toString().substring(1)));
	options.logfile  = config.LOGDIRRES + logsig
	options.logsig   = logsig

	log.logres("Request from " + options.ip + " " + req.originalUrl, options)

	// If any of the cache options are false and update fails, cache will be used if found (and warning is given in header).
 	// Sent as DataCache parameter.
	options.usedatacache     = s2b(req.query.usedatacache     || req.body.usedatacache     || "true")
	// Images are cached locally.
	options.useimagecache    = s2b(req.query.useimagecache    || req.body.useimagecache    || "true") 
	// Metadata is cached locally.
	options.usemetadatacache = s2b(req.query.usemetadatacache || req.body.usemetadatacache || "true") 

	// TODO: If any input option is not in list of valid inputs, send warning in header.

	if ((options.return === "image") && (options.type === "")) {
		options.type = "timeseries"
	}	
	
	if ((options.return === "image") && (options.style === "")) {
		options.style = "0"
	}	

	options.image = {};
	options.image.quant   = s2b(req.query['image.quant']  || "true")
	options.image.width   = req.query['image.width']  || ""
	options.image.height  = req.query['image.height'] || ""
	options.image.widthr  = req.query['image.width']  || ""
	options.image.heightr = req.query['image.height'] || ""

	if (options.image.width) {
		var widtha  = options.image.width.split(",")
		var heighta = options.image.height.split(",")
		if (widtha.length > 0) {
			var maxw = parseFloat(widtha[0])
			var maxh = parseFloat(heighta[0])
			// First element is returned image size
			// that will be scaled based on max width.
			options.image.widthr  = maxw 
			options.image.heightr = maxh 
			var tmpw,tmph
			for (var i in widtha) {
				tmpw = parseFloat(widtha[i])
				tmph = parseFloat(heighta[i])
				if (tmpw > maxw) {
					maxw = tmpw;
					maxh = tmph;
				}
			}
			// Max element is original image size that will be reduced to widthr.
			options.image.width  = maxw 
			options.image.height = maxh 
		}
	}

	if ((options.return === "image") && (options.style === "0")) {

		options.image.width   = options.image.width  || "800"
		options.image.height  = options.image.height || "200"
		options.image.widthr  = options.image.widthr  || "800"
		options.image.heightr = options.image.heightr || "200"

		options.stylestr =   "drawGrid=true"
							+ "&backgroundColor=none"
							+ "&foregroundColor=%23000000"
							+ "&column="+ encodeURIComponent("0%+6em,100%-5em")
							+ "&row="   + encodeURIComponent("0%+2em,100%-4em")
							+ "&width=" + options.image.width
							+ "&height="+ options.image.height

	}
	if ((options.return === "image") && (options.style === "1")) {
		options.image.width   = options.image.width  || "800"
		options.image.height  = options.image.height || "200"
		options.image.widthr  = options.image.widthr  || "800"
		options.image.heightr = options.image.heightr || "200"

		options.stylestr =   "drawGrid=true"
							+ "&backgroundColor=%23000000"
							+ "&foregroundColor=%23ffff00"
							+ "&column="+encodeURIComponent("0%+6em,100%-6em")
							+ "&row="+encodeURIComponent("0%+2em,100%-4em")
							+ "&width="+options.image.width
							+ "&height="+options.image.height
	}
	if ((options.return === "image") && (options.style === "2")) {
		options.image.width   = options.image.width  || "800"
		options.image.height  = options.image.height || "100"
		options.image.widthr  = options.image.widthr  || "800"
		options.image.heightr = options.image.heightr || "200"

		options.stylestr =   "drawGrid=false"
							+ "&backgroundColor=none"
							+ "&column="+encodeURIComponent("0%+0px,100%-0px")
							+ "&row="+encodeURIComponent("0%+0px,100%-0px")
							+ "&width="+options.image.width
							+ "&height="+options.image.height
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
	
	if (options.timerange !== "") {
		log.logres("Timerange given.  Extracting start/stop from it.", options)
		var tmparr = options.timerange.split("/")
		var err = "Error: Input timerange (should be of form YYYY-MM-DD/YYY-MM-DD) is not valid: " + options.timerange
		if (tmparr.length != 2) {
			log.logres(err, options)
			log.logres("Sending 502.", options)
			res.status(502).send(err)
			return
		} else if (tmparr[0].length != 10 || tmparr[1].length != 10) {
			log.logres(err, res.options)
			log.logres("Sending 502.", options)
			res.status(502).send(err)
			return
		} else {
			options.start = tmparr[0]
			options.stop  = tmparr[1]
		}
	}

	if ((options.start === "") && (options.start === "") && (options.return === "data")) {
		log.logres("No start/stop or timerange specified.  Setting return=dd", options)
		options.return = "dd"
	}

	if (options.return === "tsds" && options.format !== "json") {
		options.format = "xml"
	}
	if (options.return === "autoplot-bookmarks" && options.format !== "json") {
		options.format = "xml"
	}

	if (options.return === "dd" || options.return.match("urilist")) {
		// options.return === "urilistflat" is technically not a JSON format, 
		// but processing is same until just before response is sent.
		options.format = "json"
	}
	
	return options
}

// Get XML from URL and convert to JSON.
function getandparse(url, options, res, cb) {

	// Retrieves XML or JSON from a URL and stores XML and JSON as a cache file.
	// Callback is passed XML or JSON depending on options.format.

	log.logres("Called with format = " + options.format, res.options)
	
	var urlsig = crypto.createHash("md5").update(url).digest("hex")

	// Cache file with no extension for each catalog
	var cfile = config.CACHEDIR + urlsig

	// JSON cache file for each catalog
	var cfilejson = config.CACHEDIR + urlsig + ".json"

	// XML cache file for each catalog
	var cfilexml = config.CACHEDIR + urlsig + ".xml"

	// Don't do HEAD request if cache file exists and usemetadatacache=true.
	if (options.usemetadatacache) {
		if (options.format !== "xml" && fs.existsSync(cfilejson)) {
			log.logres("usemetadatacache = true and JSON cache file found for url = " + url, res.options)
			log.logres("Reading and parsing JSON cache file (sync).", res.options)
			var tmp = JSON.parse(fs.readFileSync(cfilejson).toString())
			log.logres("Done.", res.options)
			cb(tmp)
			return
		}
		if (options.format === "xml" && fs.existsSync(cfilexml)) {
			log.logres("usemetadatacache = true and XML cache file exists for url = " + url, res.options)
			log.logres("Reading and parsing XML cache file (sync).", res.options)
			var tmp = fs.readFileSync(cfilexml).toString()
			log.logres("Done.", res.options)
			cb(tmp)
			return
		}
	}

	// Do head request and fetch if necessary.  Cache if fetched.
	if (options.format !== "xml" && fs.existsSync(cfilejson)) {
		log.logres("Cache file found for url = " + url, res.options)
		headthenfetch(url, "json")
		return
	}
	if (options.format === "xml" && fs.existsSync(cfilexml)) {
		log.logres("Cache file found for url = " + url, res.options)
		headthenfetch(url, "xml")
		return
	}

	// Fetch and then cache.
	if (options.format != "xml") {
		log.logres("No cache file found for url = " + url, res.options)
		fetch(url,"json")
		return
	} else {
		log.logres("No cache file found for url = " + url, res.options)
		fetch(url,"xml")
		return
	}

	function headthenfetch(url,type) {

		// Do head request for file that contains list of datasets.
		log.logres("Doing (async) head request on "+url, res.options)
		var hreq = request.head(url, function (herror, hresponse) {
			if (!herror && hresponse.statusCode != 200) {
				herror = true
			}

			if (herror) {
				log.logres("Error when making head request on " + url, res.options)
				log.logres("Will try request for " + url, res.options)
				age = 1
			}

			var dhead = new Date(hresponse.headers["last-modified"]);
			log.logres("Last-modified time: " + dhead, res.options)
			var fstat = fs.statSync(cfile+"."+type).mtime
			var dfile = new Date(fstat)
			log.logres('Cache file created: ' + fstat, res.options)
			var age = dhead.getTime() - dfile.getTime();
			log.logres('Last-modified - Cache file created = ' + age, res.options)
			var found = true

			if (age <= 0) {
				log.logres("Cache file has not expired.  Reading cache file "
						+ (cfile+"."+type).replace(__dirname,""), res.options)
				log.logres("for URL " + hresponse.request.uri.href, res.options)
				log.logres("Reading cache file (sync) ", res.options)
				var tmp = fs.readFileSync(cfile+"."+type).toString()
				if (type === "json") {	
					log.logres("Parsing cache file.", res.options)
					console.log(tmp)
					tmp2 = JSON.parse(tmp)
					console.log(tmp2)
				}
				log.logres("Done.", res.options)
				cb(tmp)
			} else {
				log.logres("Cache file has expired.", res.options)
				fetch(url,type,true)
			}

			if (!hresponse) {
				log.logres("Error when attempting to access " + url, res.options)
				log.logres("Sending 502 error ", res.options)
				console.error("Error when attempting to access " + url)
				options.res.status(502).send("Error when attempting to access " + url + "\n")
				console.error(config)
				return
			}
		})
	}

	function fetch(url,type,isexpired) {

		log.logres("Fetching " + url, res.options)

		request(url, function (error, response, body) {

			log.logres("Done fetching.", res.options)

			if (error) {
				log.logres("Error when attempting to access " 
							+ url + " :" 
							+ JSON.stringify(error), res.options)
			}

			if (response.statusCode != 200) {
				log.logres("Status code was not 200 when attempting to access " 
								+ url, res.options)
			}

			if (error || response.statusCode != 200) {
				error = true;
			}

			if (error) {
				if (fs.existsSync(cfile+"."+type))  {

					log.logres("Using expired cache because request failed for " + url, res.options)

					// Add a header noting cache was used (because failed request).
					if (isexpired) {
						res.header('x-tsdsfe-warning',"Used expired cache because failed request for " + url)
					} else {
						res.header('x-tsdsfe-warning',"Used cache because failed request for " + url)
					}
					var tmp = fs.readFileSync(cfile+"."+type).toString()
					if (options.format == "json") { 
						var tmp = JSON.parse(tmp)
					}
					cb(tmp)
				} else {
					if (!fs.existsSync(cfile+"."+type))  {
						log.logres("Error when attempting to access " + url + " and not cached version found.\n", res.options)
						options.res.status(502).send("Error when attempting to access " + url + " and no cached version found.\n")
					}
				}
				return
			}

			var isjson = false
			var isxml  = false

			if (body.match(/^\s*\[|^\s*{/)) {
				log.logres("Response was JSON", res.options)
				isjson = true;
			} else {
				log.logres("Response is XML.", res.options)
				isxml = true
			}

			if (isxml) {
				if (options.format === "xml") {
					log.logres("Returning XML.", res.options)
					log.logres("Calling cb(xml).", res.options)
					cb(body);
					log.logres("Writing (sync) XML cache file for url = " + url, res.options)
					fs.writeFileSync(cfilexml,body)
					log.logres("Done.", res.options)
				} else {
					log.logres("Parsing "+url, res.options)
					var parser = new xml2js.Parser();
					parser.parseString(body, function (err, json) {

						log.logres("Done parsing.", res.options)

						if (err) {
							log.logres("Sending 502.  Could not parse "+url+".\n", res.options)
							options.res.status(502).send("Could not parse " + url + ".\n"+err, res.options)
							return
						}

						log.logres("Calling cb(json).", res.options)
						cb(json)

						log.logres("Writing (sync) JSON cache file for url = " + url, res.options)

						fs.writeFileSync(cfilejson,JSON.stringify(json))
						log.logres("Done.", res.options)
					})
				}
			} else {
				if (options.format === "xml") {
					var builder = new xml2js.Builder();
					var xml = builder.buildObject(JSON.parse(body))

					log.logres("Calling cb(xml).", res.options)
					cb(xml)

					log.logres("Writing XML cache file for url = " + url, res.options)

					fs.writeFileSync(cfilexml,xml)
					log.logres("Done.", res.options)
				} else {
					log.logres("Calling cb(json).", res.options)
					cb(JSON.parse(body))
				}				
				log.logres("Writing JSON cache file for url = " + url, res.options)
				fs.writeFileSync(cfilejson,JSON.stringify(body))
				log.logres("Done.", res.options)
			}
		})
	}
}

// After catalog() executes, it either calls dataset() or stream()
// (will call stream() if only catalog information was requested.)
function catalog(options, res, cb) {

	log.logres("Called", res.options)
	
	getandparse(config.CATALOG, options, res, afterparse)

	function afterparse(result) {

		// Given JSON containing information in config.CATALOG, form JSON response.
		// config.CATALOG contains links to all catalogs available.
		var resp = [];

		var catalogRefs = result["catalog"]["catalogRef"]
		var xmlbase     = config.XMLBASE || result["catalog"]["$"]["xml:XMLBASE"] || ""

		log.logres("Setting xmlbase to " + xmlbase, res.options)

		log.logres("Found " + catalogRefs.length + " catalogRef nodes.", res.options)

		// Loop over each catalogRef and remove ones that don't match pattern.
		for (var i = 0;i < catalogRefs.length;i++) {

			resp[i]       = {}
			resp[i].value = catalogRefs[i]["$"]["ID"]
			resp[i].label = catalogRefs[i]["$"]["name"] || catalogRefs[i]["$"]["ID"]
			resp[i].href  = xmlbase+catalogRefs[i]["$"]["xlink:href"]

			if (options.catalog !== "^.*") {
				if (options.catalog.substring(0,1) === "^") {
					if (!(catalogRefs[i]["$"]["ID"].match(options.catalog))) {
						delete resp[i]
					}        
				} else {
					if (!(catalogRefs[i]["$"]["ID"] === options.catalog)) {
						delete resp[i]
					}
				}
			}
		}

		// Now we have a list of URLs for catalogs associated with the catalog pattern.
		// Remove empty elements of array. (Needed?)
		resp = resp.filter(function(n){return n})
		if (resp.length == 0) {
			log.logres("Error: No matching catalogs.", res.options)
		}

		if (options.dataset === "") {
			// If no dataset was requested and only one catalog URL in list,
			// add information from within the catalog to the response.
			if (resp.length == 1 && options.catalog.substring(0,1) !== "^") {
				// If only one catalog matched pattern.
				getandparse(resp[0].href,options, res,
					function (result) {
						console.log(result)
						var oresp = []
						oresp[0] = {}
						oresp[0].title = "Catalog configuration"
						oresp[0].link  = resp[0].href
						if (result["catalog"]["documentation"]) {
							for (var k = 1; k < result["catalog"]["documentation"].length;k++) {
								oresp[k] = {}
								oresp[k].title = result["catalog"]["documentation"][k-1]["$"]["xlink:title"]
								oresp[k].link  = result["catalog"]["documentation"][k-1]["$"]["xlink:href"]
							}
						}
						cb(200, oresp, res)
					})
			} else {
				// If more than one catalog matched pattern,
				// return will be values, labels, and hrefs for each catalog.
				cb(200, resp, res)
			}
		} else {
			// If dataset was requested, pass list of catalog URLs to dataset().
			dataset(options, resp, res, cb)
		}
	}
}

// After dataset() executes, calls parameter() or stream().
// (will call stream() if only dataset information was requested.)
function dataset(options, catalogs, res, cb) {

	if (catalogs.length == 0) {
		cb(200, "[]", res)
		return
	}

	var datasets = []
	var parents = []
	var dresp = []

	log.logres("dataset(): Called.", res.options)

	// Loop over each catalog
	for (var i = 0; i < catalogs.length;i++) {
		getandparse(catalogs[i].href, options, res, afterparse);
	}

	function afterparse(result) {

		if (typeof(afterparse.j) === "undefined") {afterparse.j = 0}

		// TODO: Deal with case of result === "", which means getandparse() failed.
		afterparse.j = afterparse.j+1

		console.log(typeof(result))
		console.log(result)
		var parent = result["catalog"]["$"]["id"] || result["catalog"]["$"]["ID"]
		var tmparr = result["catalog"]["dataset"]
		datasets = datasets.concat(tmparr)
		while (parents.length < datasets.length) {
		    parents = parents.concat(parent)
		}

		// TODO: This won't catch case when pattern is used; afterparse may not have been called with results in same order as catalog array.
		if (catalogs.length == 1) {
			if (parent !== catalogs[afterparse.j-1].value) {
				log.logres("ID of catalog in THREDDS specified with a URL does not match ID of catalog found in catalog.", res.options)
				log.logres("ID in THREDDS ["+config.CATALOG+"]: "+parent, res.options)
				log.logres("ID in catalog ["+catalogs[afterparse.j-1].href+"]: "+catalogs[afterparse.j-1].value, res.options)
				options.res.status(502).send("ID of catalog found in "+catalogs[afterparse.j-1].href+" does not match ID associated with URL in "+config.CATALOG);
				return
			}
		}
		var dresp = []

		// If all of the dataset URLs have been parsed.
		if (afterparse.j == catalogs.length) {

			for (var i = 0;i < datasets.length;i++) {
				dresp[i]         = {}
				dresp[i].value   = datasets[i]["$"]["id"] || datasets[i]["$"]["ID"]
				dresp[i].label   = datasets[i]["$"]["label"] || datasets[i]["$"]["name"] || dresp[i].value
				dresp[i].catalog = parents[i]

				if (options.dataset !== "^.*") {	
					if (options.dataset.substring(0,1) === "^") {
						if (!(dresp[i].value.match(options.dataset))) {
							delete dresp[i]
							delete datasets[i]
						}	
					} else {
						if (!(dresp[i].value === options.dataset)) {
							delete dresp[i]
							delete datasets[i]
						} else {
							var z = i
						}
					}
				}
			}

			if (options.parameters === "" && !(options.groups === "^.*")) {
				dresp = dresp.filter(function(n){return n;}); // Needed?
				if (dresp.length == 1 && options.dataset.substring(0,1) !== "^") {
					if (typeof(datasets[z]["documentation"]) !== "undefined") {
						for (var k = 0; k < datasets[z]["documentation"].length;k++) {
							dresp[k] = {}
							dresp[k].title = ""
							dresp[k].link  = ""
							dresp[k].text  = ""
							if (datasets[z]["documentation"][k]["$"]) {
								if (datasets[z]["documentation"][k]["$"]["xlink:title"])
									dresp[k].title = datasets[z]["documentation"][k]["$"]["xlink:title"]
								if (datasets[z]["documentation"][k]["$"]["xlink:href"])
									dresp[k].link  = datasets[z]["documentation"][k]["$"]["xlink:href"]
							}
							if (datasets[z]["documentation"][k]["_"])
								dresp[k].text  = datasets[z]["documentation"][k]["_"]
							if (typeof(datasets[z]["documentation"][k]) === "string")
								dresp[k].text  = datasets[z]["documentation"][k]
						}
					} else {
						dresp[k]       = {}
						dresp[k].title = "No dataset documentation in catalog"
						dresp[k].link  = ""
						dresp[k].text  = ""							
					}
					// TODO: Do the following using getandparse().  Document how it works.
					//console.log(datasets[z])
					var filecite = __dirname + "/" + catalogs[afterparse.j-1].href.replace(config.TSDSFE,"").replace(/\.xml|\.json/,'.cite')
					if (fs.existsSync(filecite)) {
						var text = fs.readFileSync(filecite)
									 .toString()
									 .replace("{{DATASET}}",datasets[z]["$"].name)
									 .replace("{{DATE}}",new Date().toISOString().substring(0,10));
						var k = dresp.length
						dresp[k]       = {}
						dresp[k].title = "Suggested dataset acknowledgement"
						dresp[k].link  = ""
						dresp[k].text  = text
					}
					cb(200,dresp, res)
				} else {
					cb(200,dresp, res)
				}
			} else {
				parameter(options,parents,datasets.filter(function(n){return n}),res,cb)
			}						
		}
	}
}

function parameter(options, catalogs, datasets, res, cb) {

	log.logres("Called.", res.options)

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
					log.logres("Match in catalog for requested parameter "+value+".", res.options)
				}
			}
		}
	}
	resp = resp.filter(function(n){return n});

	if ((options.parameters === "^.*") || (options.start === "" && options.stop === "")) {
		cb(200,resp, res);
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
		log.logres(datasets[0].groups[0].group, res.options)
		log.logres(ddresp, res.options);

		// Get JSON for group list
		cb(200,ddresp, res);
		return;
	}
	
	if (typeof(resp[0]) === "undefined") {cb(200,"[]",res);return;}

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

	log.logres("Requested start : " + options.start, options)
	log.logres("Expanded start  : " + start, options)
	log.logres("DD start        : " + resp[0].dd.start, options)
	log.logres("Requested stop  : " + options.stop, options)
	log.logres("Expanded stop   : " + stop, options)
	log.logres("DD stop         : " + resp[0].dd.stop, options)

	var urltemplate  = resp[0].dd.urltemplate.replace("mirror:http://",config.MIRROR);
	var urlprocessor = resp[0].dd.urlprocessor;
	var urlsource    = resp[0].dd.urlsource;
		
	if ((new Date(stop)).getTime() < (new Date(start)).getTime()) {
		cb(500,"Stop time is before start time.",res);
		return;
	}

	//if (Date.parse(start) > Date.parse(stop)) {
	if ((new Date(start)).getTime() > (new Date(stop)).getTime()) {	
		cb(500,"Start time is after stop time.",res);
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
		var dc = config.DATACACHE+"?"+args+"&timeRange="+start+"/"+stop;
	} else {
		var dc = config.DATACACHE+"?timeRange="+start+"/"+stop;
	}
	
	if (options.return === "urilist") {
		cb(0,dc + "&return=urilist",res)
		return
	}
	if (options.return === "urilistflat") {
		cb(0,dc + "&return=urilistflat",res)
		return
	}

	if (options.return === "image" && options.format === "viviz") {
		var dirprefix = config.TSDSFE 
						+ "?catalog="    + options.catalog
						+ "&dataset="    + options.dataset
						+ "&parameters=" + options.parameters
						+ "&return=image"
						+ "&format=png"
						+ "&type="  + options.type
		            	+ "&style=" + options.style

		var viviz = config.VIVIZEXTERNAL 
					+ "#" 
					+ "dirprefix=" 
					+   encodeURIComponent(dirprefix)
					+ "&fulldir="
					+ 	encodeURIComponent("&image.width=800&image.height=200")
					//+ "&thumbdir="
					//+ 	encodeURIComponent("&image.width=400&image.height=100")
					+ "&strftime="
					+ 	encodeURIComponent("&start=-P1D&stop=$Y-$m-$d")
					+ "&start=" + options.start
					+ "&stop="  + options.stop;
		cb(302, viviz, res)
		return
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
				log.logres("Warning: stream(): Possible configuration error.  Serving an IDL or MATLAB script containing a TSDSFE URL that is localhost", res.options)
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

		var labels = "";
		var units = "";
		var fills = "";
		for (var z = 0; z < resp.length;z++) {

			if (resp[z].label != "") {
				labels = labels + resp[z].label + ",";
			}
			if (resp[z].units != "")  {
				units = units + resp[z].units + ","
			}
			
			if (resp[z].dd.fillvalue != "")  {
				fills = fills +resp[z].dd.fillvalue + ","
			}

		}

		var jydsargs =    "?labels=" + labels.slice(0,-1) 
						+ "&units=" + units.slice(0,-1) 
						+ "&fills=" + fills.slice(0,-1)						
						+ "&catalog="+options.catalog
						+ "&dataset="+options.dataset
						+ "&parameters="+options.parameters
						+ "&timerange="+start+"/"+stop
						+ "&type="+options.type
						+ "&server=" + config.TSDSFE; 


		config.JNLP = "http://autoplot.org/autoplot.jnlp"
		var jnlpargs = "?open=vap+jyds:"

		console.log("JYDS    : " + config.JYDS)
		console.log("jydsargs: " + jydsargs + "\n")

	
		if (options.format === "jnlp") {
			console.log("JNLP:     " + config.JNLP + "\n")
			console.log("jnlpargs: " + jnlpargs + "JYDS + jydsargs\n")
			// Should be using the following, but the script for autoplot.jnlp
			// does not decode the argument of open.
			//cb(301,config.JNLP + jnlpargs + encodeURIComponent(config.JYDS + jydsargs))
			// This works:
			//console.log("jnlpargs: " + jnlpargs + "encodeURIComponent(JYDS + jydsargs)\n")
			cb(301,config.JNLP + jnlpargs + config.JYDS + jydsargs,res)
			return
		}

		var format = "image/png";
		if (options.format === "pdf") {format = "application/pdf"}
		if (options.format === "svg") {format = "image/svg%2Bxml"}

		var apargs = "?format="+format
					+ "&" + options.stylestr
					+ "&url=vap+jyds:"

		console.log("AUTOPLOT: " + config.AUTOPLOT)
		console.log("apargs: " + apargs + "encodeURIComponent(JYDS + jydsargs)\n")	
		var aurl = config.AUTOPLOT + apargs + encodeURIComponent(config.JYDS + jydsargs)
		console.log("Making request to: AUTOPLOT + apargs + encodeURIComponent(config.JYDS + jydsargs)")
		console.log("i.e.,\n"+aurl+"\n")

		if (config.TSDSFE.match(/http:\/\/localhost/)) {
			if (!config.AUTOPLOT.match(/http:\/\/localhost/)) {
				log.logres("Error: stream(): Autoplot image servlet specified by config.AUTOPLOT must be localhost if config.TSDSFE is localhost.", res.options)
				cb(501,"Server configuration error related to address of Autoplot servlet ("+config.AUTOPLOT+") and address of TSDSFE ("+config.TSDSFE+").",res);
				return;
			}
		}
		cb(0, aurl, res)
		return
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
		
		cb(200,ddresp,res);
		return;
	}
	
	if ((options.return === "data") || (options.return === "redirect")) {				 
		dc = dc
				+"&return=stream"
				+"&lineRegExp="+(resp[0].dd.lineregex || "")
				+"&streamFilterReadTimeFormat="+(resp[0].dd.timeformat || "")
				+"&streamFilterReadColumns="+columns
				+"&streamFilterWriteTimeFormat="+options.format
				+"&streamFilterWriteComputeFunction="+options.filter
				+"&streamFilterWriteComputeFunctionWindow="+options.filterWindow
				+"&streamFilterWriteComputeFunctionExcludes="+(resp[0].dd.fillvalue || "")
				+"&streamOrder=true"
				+"&streamGzip=false"
				;

		// Remove name=value when value === "".
		dc = dc.replace(/[^=&]+=(&|$)/g,"").replace(/&$/,"");
		if (!options.usedatacache) dc = dc+"&forceUpdate=true&forceWrite=true"

		if (options.return === "redirect") {
			// If more than one resp, this won't work.
			cb(302,dc,res);
			return;
		}

		cb(0,dc,res);
		return;
	}

	cb(500,"Query parameter return="+options.return+" not recognized.",res);
}
var fs      = require('fs')
var os      = require("os")

var request = require("request")
var express = require('express')
var app     = express()
var serveIndex  = require('serve-index')
var compression = require('compression')
var server  = require("http").createServer(app)
var qs      = require('querystring')
var xml2js  = require('xml2js')
var http    = require('http')
var url     = require('url')

var crypto  = require("crypto")
var clc     = require('cli-color')
var argv    = require('yargs')
				.default
				({
					'port': 8004,
					'debugtoconsole': "",
					'debugtofile': "",
					'checkdeps': "true",
					'checkservers': "true",
					'startdeps': "true"
				})
				.argv

var deps = require('./deps.js')
var servers = require('./servers.js')
var checkservers = servers.checkservers
var servertests = servers.tests

// Helper functions
function s2b(str) {if (str === "true") {return true} else {return false}}
function s2i(str) {return parseInt(str)}
function ds() {return (new Date()).toISOString() + " [tsdsfe] "}

var debugs = 'all,app,stream'
if (argv.help || argv.h) {
	console.log("Usage: node tsdsfe.js"
					+ " [--port PORT"
					+ " --debugto{file,console} {"+debugs+"}"
					+ " --check{servers,deps} true|false"
					+ " --startdeps true|false]"
				)
	return
}
var tsds2other = require(__dirname + "/js/tsds2other.js").tsds2other

argv.checkdeps    = s2b(argv.checkdeps)
argv.checkservers = s2b(argv.checkservers)
argv.startdeps    = s2b(argv.startdeps)

if (!argv.startdeps) {
	argv.checkdeps = false
	argv.checkservers = false
}

var debug = {}
debug["tofile"] = {};
var tmpa = argv.debugtofile.split(",")
for (var i = 0; i < tmpa.length; i++) {
	if (tmpa[i] !== "") debug["tofile"][tmpa[i]] = true
}
// torf = true or false.  Place in object so we don't need to
// iterate over keys each time in log functions.
// If false, no logging is needed.
debug["tofile"]["torf"] = false
if (Object.keys(debug["tofile"]).length > 1) {
	debug["tofile"]["torf"] = true
}

debug["toconsole"] = {}
var tmpb = argv.debugtoconsole.split(",")
for (var i = 0; i < tmpb.length; i++) {
	if (tmpb[i] !== "") debug["toconsole"][tmpb[i]] = true
}
if (Object.keys(debug["toconsole"]).length > 1) {
	debug["toconsole"]["torf"] = true
}

// http://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
process.setMaxListeners(0)
server.setMaxListeners(0)

var path = "datacache/log.js"
if (fs.existsSync("../../" + path)) {
	// Development.  Assumes datacache repo checked out in same dir as tsds2.
	var develdatacache = true
	var log = require("../../" + path)
} else {
	// Production
	var develdatacache = false
	var log = require("./node_modules/" + path)
}

if (fs.existsSync("../../viviz")) {
	var develviviz = true 	// Development
} else {
	var develviviz = false	// Production
}

path = "tsdset/lib/expandtemplate.js"
if (fs.existsSync("../../" + path)) {
	// Development
	var develtsdset = true
	var expandISO8601Duration = require("../../" + path).expandISO8601Duration
} else {
	// Production
	var develtsdset = false
	var expandISO8601Duration = require("./node_modules/"+path).expandISO8601Duration
}

var expandDD = require("../tsdsdd/expandDD.js").expandDD

// If uncaughtException, write error log file
process.on('uncaughtException', function(err) {
	if (err.errno === 'EADDRINUSE') {
		console.log(ds() + clc.red("Port " + config.PORT + " already in use."))
	} else {
		console.log(err.stack)
	}
	var tmps = ds().split(" ")[0]
	fs.appendFileSync('tsds-error-' + tmps + ".log", err)
	process.exit(1)
})

// Catch CTRL-C
process.on('SIGINT', function () { process.exit() })

// Handle CTRL-C
process.on('exit', function () {
	console.log("\n" + ds() + "Received exit signal.")
	console.log(ds() + clc.red("(NOT IMPLEMENTED)") 
					 + " Removing partially written files.")

	if (deps.startdeps.datacache) {
		console.log(ds() + "Stopping datacache server.")
		deps.startdeps.datacache.kill('SIGINT')
	}
	if (deps.startdeps.viviz) {
		console.log(ds() + "Stopping viviz server.")
		deps.startdeps.viviz.kill('SIGINT')
	}
	if (deps.startdeps.autoplot) {
		console.log(ds() + "Stopping autoplot server.")
		deps.startdeps.autoplot.kill('SIGINT')
	}
	console.log(ds() + "Exiting.")
})

// Read configuration file in conf/ directory.
if (fs.existsSync(__dirname + "/conf/config." + os.hostname() + ".js")) {
	// Look for host-specific config file conf/config.hostname.js.
	console.log(ds() + "Using configuration file conf/config."
					 + os.hostname() + ".js")
	var tmpfname = __dirname + "/conf/config." + os.hostname() + ".js"
	var config = require(tmpfname).config()
	config.CONFIGFILE = tmpfname
} else {
	// Default
	console.log(ds() + "Using configuration file conf/config.js")
	var config = require(__dirname + "/conf/config.js").config()
	config.CONFIGFILE = __dirname + "/conf/config.js"
}
config.argv = argv

if (argv.port) {
	port = s2i(argv.port)
} else {
	port = config.PORT
}

// In more recent versions of node.js, is set at Infinity.
// Previously it was 5.  Apache uses 100.
http.globalAgent.maxSockets = config.maxSockets

// Serve files in these directories as static files and allow dir listings.
var dirs = ["js","css","scripts","catalogs","log","test/data","examples"]
for (var i in dirs) {
	app.use("/" + dirs[i], express.static(__dirname + "/" + dirs[i]))
	app.use("/" + dirs[i], serveIndex(__dirname + "/" + dirs[i], {'icons': true}))
	//app.use("/" + dirs[i], express.directory(__dirname + "/" + dirs[i]))
}

app.use(compression())

// Get the status of services used by TSDSFE (used by index.html)
app.get('/status', function (req, res) {
	var addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
	var c = {}
	c.servers = {}
	c.deps = {}
	if (checkservers) {
		if (checkservers.status) {
			for (var key in checkservers.status) {
				if (checkservers.status[key].type === "server") {
					c.servers[key] = checkservers.status[key]
				}
				if (checkservers.status[key].type === "dependency") {
					c.deps[key] = checkservers.status[key]
				}
			}
		} else {
			var TESTS = servertests(config);
			for (var server in TESTS) {
				if (TESTS[server].type === "server") {
					c.servers[server] = "";
				}
			}	
		}
	}
	//if (Object.keys(c.deps).length == 0) {
	c.deps["active"] = argv.startdeps
	//}
	res.send(JSON.stringify(c))
})

// Main entry route
app.get('/', function (req, res) {
	//console.log(req.query)
	if (Object.keys(req.query).length === 0) {
		// If no query parameters, return index.htm
		res.contentType("html")
		res.send(fs.readFileSync(__dirname+"/index.htm"))
	} else {
		// Call main entry function
		var addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
		if (req.originalUrl.toString().indexOf("istest=true") == -1) {
			console.log(ds() + "Request from " + addr + ": " + req.originalUrl)
		}
		handleRequest(req,res)
	}
})

// HAPI Entry route 0.
app.get('/:catalog/:cadence?/hapi', function (req, res) {
	res.contentType("application/json");
	cadence = ""
	if (req.params.cadence) {
		cadence = "/" + req.params.cadence;
	}
	url = config["TSDSFE"] 
			+ "?catalog="+req.params.catalog+cadence
			+ "&dataset=^.*"
			+ "&usemetadatacache=false"

	request(url, function (err, catres, catbody) {
		datasetjson = JSON.parse(catbody);
		res.contentType("html");
		res.send(fs.readFileSync(__dirname+"/hapi.htm")
				.toString()
				.replace(/__EXAMPLE_ID__/g,datasetjson[0]["value"])
				.replace(/__CATALOG__/g,req.params.catalog+cadence)
				.replace(/__SERVER__/g, config["TSDSFEEXTERNAL"]));
		})

})

// HAPI Entry route.
app.get('/:catalog/:cadence?/hapi/capabilities', function (req, res) {
	res.contentType("application/json");
	cadence = ""
	if (req.params.cadence) {
		cadence = "/" + req.params.cadence;
	}
	res.contentType("Content-Type: application/json");
	res.send('{"HAPI": "1.1","outputFormats": [ "csv", "binary" ]}');
})

// HAPI Entry route 1.
app.get('/:catalog/:cadence?/hapi/catalog', function (req, res) {
	res.contentType("application/json");
	// Get list of all catalogs and their URLs
	cadence = ""
	if (req.params.cadence) {
		cadence = "/" + req.params.cadence;
	}
	url = config["TSDSFE"] 
			+ "?catalog="+req.params.catalog+cadence
			+ "&dataset=^.*"
			+ "&usemetadatacache=false"
	console.log(url)
	//log.logres("Requesting " + url, res.opts)
	request(url, function (err, catres, catbody) {
		datasetjson = JSON.parse(catbody);
		//console.log(datasetjson);
		var catalog = {};
		catalog["HAPI"] = "1.1";
		catalog["catalog"] = [];
		for (var i = 0;i < datasetjson.length; i++) {
			catalog["catalog"][i] = {"id": datasetjson[i]["value"]};
		}
		res.send(JSON.stringify(catalog,null,4));
		return;
	})
})

// HAPI Entry route 2.
app.get('/:catalog/:cadence?/hapi/info', function (req, res) {
	res.contentType("application/json");
	// Get list of all catalogs and their URLs
	cadence = ""
	if (req.params.cadence) {
		cadence = "/" + req.params.cadence;
	}
	if (req.query.parameters) {
		var parameters = req.query.parameters
	} else {
		var parameters = "^.*"
	}
	//console.log(req.params)
	url = config["TSDSFE"] 
			+ "?catalog="+req.params.catalog+cadence
			+ "&dataset="+req.query.id
			+ "&parameters="+parameters
			+ "&usemetadatacache=false"
    //console.log(url)
	//log.logres("Requesting " + url, res.opts)
	request(url, function (err, catres, catbody) {
		parametersjson = JSON.parse(catbody);
		var catalog = {};
		catalog["startDate"] = parametersjson[0]["dd"].start;
		catalog["stopDate"] = parametersjson[0]["dd"].stop;
		catalog["cadence"] = parametersjson[0]["dd"].cadence;
		catalog["description"] = parametersjson[0]["datasetinfo"].label;
		catalog["resourceID"] = parametersjson[0].spaseid;
		catalog["creationDate"] = (new Date()).toISOString();

		catalog["HAPI"] = "1.1";
		catalog["parameters"] = [];
		catalog["parameters"][0] = {
			"name": "Time",
			"type": "isotime",
			"length": 24
		}
		var io = 0;
		if (parametersjson[0]["dd"].name === "Time") {
			io = 1;
		}
		for (var i = io;i < parametersjson.length; i++) {
			var size = 1;
			var units = "";
			if (parametersjson[i]["dd"].columns) {
				if (parametersjson[i]["dd"].columns.match(/,/)) {
					size = parametersjson[i]["dd"].columns.split(",").length;
				}
				if (parametersjson[i]["dd"].columns.match(/-/)) {
					tmp = parametersjson[i]["dd"].columns.split("-");
					size = 1+s2i(tmp[1]) - s2i(tmp[0]);
				}
			}
			if (parametersjson[i]["dd"].units) {
				units = parametersjson[i]["dd"].units.split(",")[0];
			}
			catalog["parameters"][i-io+1] = 
				{
					"name": parametersjson[i]["value"],
					"type": "double",
					"size": [size],
					"units": units,
					"description": parametersjson[i]["dd"].label,
					"fill": parametersjson[i]["dd"].fillvalue || null
				}
		}
		res.send(JSON.stringify(catalog,null,4));
		return;
	})
})

// HAPI Entry route 3.
app.get('/:catalog/:cadence?/hapi/data', function (req, res) {
	// Get list of all catalogs and their URLs
	cadence = ""
	if (req.params.cadence) {
		cadence = "/" + req.params.cadence;
	}
	if (req.query.parameters) {
		var parameters = req.query.parameters
	} else {
		var parameters = "^.*"
	}

	url = config["TSDSFE"] 
			+ "?catalog="+req.params.catalog+cadence
			+ "&dataset="+req.query.id
			+ "&parameters="+parameters
			+ "&usemetadatacache=false"
    //console.log(url)
    var include = req.query.include || "";
    var url0 = ""
    if (include === "header") {
		url0 = config["TSDSFE"] + "/" + req.params.catalog+cadence+"/hapi/info/?id="+req.query.id;   	
    }

	request(url, function (err, catres, catbody) {
		parametersjson = JSON.parse(catbody);
		var parameterscsv = [];
		for (var i = 0;i < parametersjson.length; i++) {
			parameterscsv[i] = parametersjson[i]["value"];
		}
		//console.log(parameterscsv.join(","))
		url = config["TSDSFE"] 
				+ "?catalog="+req.params.catalog+cadence
				+ "&dataset="+req.query.id
				+ "&parameters="+parameterscsv.join(",")
				+ "&start="+req.query["time.min"]
				+ "&stop="+req.query["time.max"]
				+ "&usemetadatacache=false"
		//console.log(url)

		if (req.query.format === "binary") {
			res.contentType("application/octet-stream");
			var byline = require('byline');
			d = byline(request.get(url));
		} else {
			res.contentType("text/csv");
			d = request.get(url);
		}
		if (include === "header") {
				request(url0, function (err, resheader, bodyheader) {
					var Readable = require('stream').Readable
					s = new Readable
					s.push("#" + bodyheader.replace(/\n/g,'\n#') + "\n")
					s.push(null)
				    var StreamConcat = require('stream-concat');
				    combinedStream = new StreamConcat([s,d]);
				    combinedStream.pipe(res)
				})
		} else {
			//console.log("--here")
			//res.setHeader('content-disposition', 'attachment; filename=null');
			res.removeHeader('content-disposition');
			//console.log(res._headers)
			if (req.query.format === "binary") {
				d
				.on('data', 
					function(line) {
						linea = line.toString().split(",");
						time = new Buffer(linea[0].length)
						time.write(linea[0])
						val = new Buffer(8*(linea[0].length-1))
						for (var i = 1;i<line[0].length+1;i++) {
							val.writeDoubleLE(linea[i])
						}
						res.write(time);
						res.write(val);
					})
				.on('end', function() {res.end()})
			} else {
				d.pipe(res).on('finish', function () {
					//console.log(res._headers);
				});
			}
		}
		return;
	})

})

// Create catalogs/dd directory
if (!fs.existsSync(__dirname + "/catalogs/dd")) {
	fs.mkdirSync(__dirname + "/catalogs/dd")
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
	console.log(ds() 
		+ "Note: " 
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
		var result = execSync('which convert').toString().replace(/\n/,"")
		console.log(ds() 
				+ "Note: " 
				+ clc.blue(config.CONVERT 
				+ " specified in "
				+ config.CONFIGFILE.replace(__dirname+"/","")
				+ " not found. Using found "
				+ result))
		convert_exists = true
		config.CONVERT = result
	} catch (e) {}
	if (!convert_exists) {
		console.log(ds() 
				+ "Note: " 
				+ clc.blue(config.CONVERT 
				+ " not found and 'which convert'"
				+ " did not return path. Canvas size"
				+ " for Autoplot image will be based on smallest width."))
	}
}

// Initialize logging.
config = log.init(config)

// Report on versions of dependencies being used.
var msg = ""
if (develdatacache || develtsdset || develviviz) {
	msg = "Using devel version of:"
}
if (develdatacache) {msg = msg + " datacache"}
if (develtsdset) {msg = msg + " tsdset"}
if (develviviz) {msg = msg + " viviz"}
if (msg !== "") {console.log(ds() + "Note: " + clc.blue(msg))}

if (!argv.checkdeps) {
	console.log(ds() + "Note: " + clc.blue("Dependency checks disabled."))
}

if (argv.checkservers) {
	// Check servers 5 seconds after start-up
	console.log(ds() + "Starting checks in 5 seconds.")
	setTimeout(function () {checkservers(config)}, 5000)
} else {
	console.log(ds() + "Note: " + clc.blue("Server checks disabled."))
}

if (argv.startdeps) {
	deps.startdeps('datacache', config)
	deps.startdeps('viviz', config)
	deps.startdeps('autoplot', config)
} else {
	console.log(ds() + "Note: " + clc.blue("Dependencies will not be started."))
}

// Start the server.  TODO: Wait until deps are ready.
app.listen(port)
console.log(ds() + "Listening on port " + port + ". See " + config.TSDSFE)

////////////////////////////////////////////////////////////////////////////////

function handleRequest(req, res, options) {

	// CORS
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,POST');
	res.header('Access-Control-Allow-Headers', 'Content-Type');

	if (!options) {
		var options = parseOptions(req, res);
	}

	if (options.dd !== "") {
		log.logres("Input is dd: " + options.dd, options, "app")
		expandDD(decodeURIComponent(options.dd), function (err, cat) {
			var ddfile = crypto
							.createHash("md5")
							.update(decodeURIComponent(options.dd))
							.digest("hex")
			log.logres("Writing " + "catalogs/dd/" + ddfile + ".json",
						 options, "app")
			// TODO: Proper thread-safe caching.
			if (fs.existsSync("catalogs/dd/" + ddfile + ".json")) {
				var data = fs.readFileSync("catalogs/dd/" + ddfile + ".json");
				options.catalog = ddfile;
				options.cataloglist = "-";
				options.dd = "";
				req.query.usemetadatacache = "true";
				log.logres("Calling handleRequest()", options, "app")
				handleRequest(req, res, options);				
			} else {
				fs.writeFile("catalogs/dd/" + ddfile + ".json", JSON.stringify(cat), 
					function () {
						options.catalog = ddfile;
						options.cataloglist = "-";
						options.dd = "";
						req.query.usemetadatacache = "true";
						log.logres("Calling handleRequest()", options, "app");
						handleRequest(req, res, options);
					}
				)
			}
		})
		return;
	}

	// Copy options
	res.opts = JSON.parse(JSON.stringify(options));

	if (typeof(res.opts) === "undefined") {
		// TODO: Implement this.
		log.logres("Error parsing options.  Sent 502.", res.opts)
		return
	}

	// Set log file name as response header
	res.header('x-tsdsfe-log', res.opts.logsig);

	// Log original URL to application log file if not a test.
	if (!req.originalUrl.match("istest=true")) {
		log.logapp(res.opts.ip + " " + req.originalUrl, config);
	}

	// Log request information to response log file.
	log.logres("Configuration file = " 
				+ JSON.stringify(config.CONFIGFILE), res.opts)
	log.logres("req.headers = "
				+ JSON.stringify(req.headers), res.opts)
	log.logres("req.headers['x-forwarded-for'] = " 
				+ JSON.stringify(req.headers['x-forwarded-for']), res.opts)
	log.logres("req.connection.remoteAddress = " 
				+ JSON.stringify(req.connection.remoteAddress), res.opts)
	log.logres("req.originalUrl = " 
				+ JSON.stringify(req.originalUrl), res.opts)
	//log.logres("options = " + JSON.stringify(options), res.opts)

	if (res.opts.return === "log") {
		//console.log(res.opts)
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
		//console.log(com)
		log.logres("Sending output of shell command: "+com, res.opts)
		child.stdout.on('data', function (buffer) {
			res.write(buffer.toString())
		})
		child.stdout.on('end', function() { 
			log.logres("Finished sending output of shell command."
						+ " Sending res.end().", res.opts)
			res.end()
		})
		return
	}
	
	// Metadata and images responses are cached as files with filename
	// based on MD5 hash of request.
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
	var urlsig     = crypto.createHash("md5").update(urlreduced).digest("hex")	

	// JSON cache filename
	var cfile = config.CACHEDIR + urlsig + ".json"

	// Base image
	var ifile = config.CACHEDIR + urlsig 
				+ "." + res.opts.image.width
				+ "x" + res.opts.image.height
				+ "." + res.opts.format

	// Returned image.  If sizes differ, returned image will be a converted
	// version of base image.  (To address issue that for small canvas sizes,
 	// Autoplot produces images with text that takes up most of the canvas.)
	var ifiler = config.CACHEDIR + urlsig 
				+ "." + res.opts.image.widthr
				+ "x" + res.opts.image.heightr
				+ "." + res.opts.format

	if ((res.opts.format === "png") 
		|| (res.opts.format === "pdf") 
		|| (res.opts.format === "svg")) {
		var isimagereq = true
	} else {
		var isimagereq = false
	}

	// TODO: Skip below if return=data because no cache will exist if one
	// of format={0,1,2} is selected. (Data are not cached by TSDSFE.)
	if (!isimagereq) {
		if (res.opts.usemetadatacache) {
			if (fs.existsSync(cfile)) {
				log.logres("Metadata response cache found for originalUrl = " + urlreduced, res.opts)
				log.logres("Using response cache file because usemetadatacache = true.", res.opts)
				// Send the cached response and finish
				fs.createReadStream(cfile).pipe(res)
				return					
			} else {
				log.logres("Metadata response cache not found for originalUrl = " + urlreduced, res.opts)
			}
		} else {
			log.logres("Not looking for response cache file because usemetadatacache = false.", res.opts)
		}
	} else {
		if (fs.existsSync(ifiler)) {
			log.logres("Image response cache found for originalUrl = " + req.originalUrl, res.opts)
			var stats = fs.statSync(ifiler);
			var size = stats["size"];
			if (size == 0) {
				log.logres("Image response cache file is zero bytes. Not using.", res.opts);
			}
			if (size > 0 && res.opts.useimagecache && !fs.existsSync(ifiler + ".writing")) {

				log.logres("Using response cache file.", res.opts)
				log.logres("Writing (sync) " + ifiler.replace(__dirname,"")
								+ ".streaming", res.opts)

				// Write lock file
				fs.writeFileSync(ifiler + ".streaming", "")

				log.logres("Streaming " + ifiler, res.opts)

				// Send the cached response and return		
				var stream = fs.createReadStream(ifiler)
				stream
					.on('error', function () {
						log.logres("Error when attempting to stream cached image.", res.opts)
						log.logres("Removing (sync) " 
							+ ifiler.replace(__dirname + "/","")
							+ ".streaming", res.opts)
						fs.unlinkSync(ifiler + ".streaming")
					})
					.on('close', function () {
						log.logres("Stream close event.", res.opts)
					})
					.on('end', function () {
						log.logres("Stream end event.", res.opts)
						log.logres("Removing (sync) " 
							+ ifiler.replace(__dirname + "/","")
							+ ".streaming", res.opts)
						fs.unlinkSync(ifiler + ".streaming")
					})
				stream.pipe(res)
				return
			}
		}
	}

	// Requests may be made that span multiple catalogs.  
	// Separation identifier is ";".  See tests for examples.

	// If any one of these is missing a ";", first value is used.
	var catalogs    = options.catalog.split(";")
	var datasets    = options.dataset.split(";")
	var parameterss = options.parameters.split(";")
	var starts      = options.start.split(";")
	var stops       = options.stop.split(";")

	var N = Math.max(catalogs.length,datasets.length,parameterss.length,
					 starts.length,stops.length)

	res.N = N
	res.Nc = 0

	// Catch case where ?catalog=CATALOG&return={tsds,autoplot-bookmarks,spase}
	if (res.opts.return === "autoplot-bookmarks" || res.opts.return === "tsds") {

		log.logres("Request is for " + options.return, res.opts)

		if (res.opts.format === "json") {
			res.setHeader("Content-Type", "application/json")
		} else if (res.opts.format === "xml") {
			res.setHeader("Content-Type", "text/xml")
		} 

		if (res.opts.cataloglist === "-") {
			finish(config["TSDSFE"] + "/catalogs/dd/" + options.catalog + ".json")
		} else {
			// Get list of all catalogs and their URLs
			url = config["TSDSFE"] 
					+ "?catalog=^.*"
					+ "&usemetadatacache=" + res.opts.usemetadatacache
			log.logres("Requesting " + url, res.opts)
			request(url, function (err, catres, catbody) {
				catalogjson = JSON.parse(catbody);
				// Iterate through list of catalogs and find one that matches
				// requested catalog.
				for (var i = 0;i < catalogjson.length; i++) {
					if (catalogjson[i].label.match(res.opts.catalog)) {
						url = catalogjson[i].href;
						break;
					}
				}
				finish(url)
			})
		}

		function finish(url) {

			log.logres("Calling getandparse() with URL " + url, res.opts)

			// Request the matched catalog and parse it.
			if (res.opts.return === "tsds") {
				getandparse(url, res, function (ret) {
					if (res.opts.format === "xml") {
						log.logres("Streaming TSDS XML.", res.opts);
						stream(0, ret, res);
					} else {
						log.logres("Streaming TSDS JSON.", res.opts);
						stream(0, JSON.stringify(ret, null, 4), res);
					}
				})
			}

			if (options.return === "autoplot-bookmarks") {

				log.logres("Calling getandparse() with URL " + url, res.opts)

				// getandparse() determines return type from res.opts.format.
				// We always want JSON here, so temporarily set
				// res.opts.format = "json";
				var format_orig = res.opts.format;
				res.opts.format = "json";

				getandparse(url, res, function (ret) {

					// Undo temporary setting.
					res.opts.format = format_orig;


					// We want to cache the results of tsds2other here.
					// getandparse only caches pre-tsds2other result.
					// TODO: pass getandparse() tsds2other as a callback so 
					// caching is done there and not here.

					// Cache filename signature is based on input + transformation code.
					var retsig  = crypto
									.createHash("md5")
									.update(JSON.stringify(ret) + tsds2other.toString()).digest("hex")
					var retfile = config.CACHEDIR + retsig + ".xml"

					if (fs.existsSync(retfile) && res.opts.usemetadatacache) {
						log.logres("Cache of autoplot-bookmarks file found for input " + url, res.opts)
						fs.readFile(retfile, 
							function (err, ret) {
								res.write(ret.toString())
								res.end()
							})
					} else {
						log.logres("No cache of autoplot-bookmarks XML file found for input = " + url, res.opts)
						log.logres("Converting TSDS JSON catalog to Autoplot bookmark XML.", res.opts)
						tsds2other(ret, "autoplot-bookmarks", config, function (ret) {
							log.logres("Streaming XML.", res.opts);
							stream(0, ret, res);
							log.logres("Writing (sync) cache file containing XML for autoplot-bookmarks for input = " + url, res.opts)
							fs.writeFileSync(retfile, ret)
						})	
					}
				})
			}
		}
		return
	}

	if (N > 1) {
		
		if (isimagereq) {
			var tmpstr = "Concatenated requests for images not supported."
			log.logres(tmpstr, res.opts)
			res.status(502).send(tmpstr)
		}

		log.logres("Concatenated parameter request. N = " + N, res.opts)
		
		var Options = [];

		for (var i = 0;i < N;i++) {
			Options[i] = {};
			// Clone options object.
			for (var key in options) {
				if ((key !== "req") || (key !== "res")) {
					Options[i][key] = options[key]
				}
			}
			Options[i].catalog     = catalogs[i] || catalogs[0]
			Options[i].dataset     = datasets[i] || datasets[0]
			Options[i].parameters  = parameterss[i] || parameterss[0]
			Options[i].start       = starts[i] || starts[0]
			Options[i].stop        = stops[i]  || stops[0]
		}
		// If N > 1, stream will call catalog when first data
		// request is complete, etc.  If response if for an image, 
		// client will need to split it.
		res.opts = Options[0]
		res.Options = Options
		catalog(res, stream)
		return
	}

	catalog(res, stream);

	function stream(status, data, res) {

		// TODO: Not all stream options will work for requests that
		// span multiple catalogs.  Document and fix.
		
		log.logres("Stream called.", res.opts, "stream")
		// See https://kb.acronis.com/content/39790
		// Probably want to change this approach ...
		var fname = req.originalUrl
						.replace(/^&|^\/\?/,"")
						.replace(/:/g,"")
						.replace(/\//g,"!")
						.replace(/\&/g,"_")
						.replace(/\=/g,"-")
						.replace(/\,/g,"_")

		if (options.return === "urilist" && options.format === "ascii") {var ext = ".txt"}
		if (options.return === "urilist" && options.format === "xml") {var ext = ".xml"}
		if (options.return === "urilist" && options.format === "json") {var ext = ".json"}

		if (options.return === "tsds" && options.format === "xml") {var ext = ".xml"}
		if (options.return === "tsds" && options.format === "json") {var ext = ".json"}

		if (options.return === "data") {var ext = ".txt"}

		// TODO: redirect implies return=data.  Need better notation.
		// Redirect allows data to not need to be piped through tsdsfe.
		// So return=data&style=header won't work anyway.
		if (options.return === "redirect") {var ext = ".txt"}

		if (   res.Nc == 0 
			&& options.attach
			&& (   options.return === "tsds" 
				|| options.return === "urilist" 
				|| options.return === "data" 
				|| options.return === "redirect"
				)
			) {
			var fname = fname + ext;
			log.logres("Setting file attachement name to " 
							+ fname + ".", res.opts, "stream")
			res.setHeader("Content-Disposition", "attachment;filename=" + fname);

			if (req.headers['accept-encoding']) {
				if (req.headers['accept-encoding'].match("gzip")) {
					// If displaying stream in
					// browser, must return un-gzipped data from DataCache.  DataCache
					// sends concatenated gzip files, which most browsers don't handle.
					// Result is first file is displayed and then trailing garbage.  See
					// http://stackoverflow.com/questions/16740034/http-how-to-send-multiple-pre-cached-gzipped-chunks

					//res.setHeader('Content-Encoding','gzip');
					// Request a gzipped stream from DataCache.
					//data = data.replace("streamGzip=false","streamGzip=true");
				}
			}
		}

		if (status == 0) {

			// If data was not a URL, send it.
			if (!data.match(/^http/)) {
				//log.logres("Sending " + data, res.opts, "stream")
				res.write(data)
				
				res.Nc = res.Nc + 1
				if (res.N > 1) res.write("\n")
				if (res.Nc == res.N) {
					res.end()
				} else {
					res.opts = Options[res.Nc]
					catalog(res, stream)
				}
				return
			}

			// If stream was called with a URL, pipe the data through.
			log.logres("Streaming from " + data, res.opts, "stream")

			if (isimagereq && options.format !== "png") {
				var ifilews = fs.createWriteStream(ifile)
				// TODO: Check for error here.
				var rd = request
							.get(data)
							.on('response', function(response) {
 								// 200
								console.log(response.statusCode)
								 // 'image/png'
								console.log(response.headers['content-type'])
							})
							.on('error', function(err) {
    							console.log(err)
  							})
				rd.pipe(res)
				rd.pipe(ifilews)
				return
			}

			if (isimagereq && options.format === "png") {

				if (options.image.widthr !== options.image.width) {

					var sizeo = options.image.width + "x" + options.image.height
					var sizer = options.image.widthr + "x" + options.image.heightr

					log.logres("Creating and returning smaller image based"
							   + " on larger image.", res.opts)
					log.logres("Base size: "+sizeo+"; Returned size: "
								+ sizer, res.opts)

					var child = require('child_process')

					// ifiler write stream
					var ifilerws = fs.createWriteStream(ifiler);
					var convertr  = child.spawn(config.CONVERT,
									['-quality','100','-resize',sizer,'-','-'])
					var pngquantr = child.spawn(config.PNGQUANT,
									['--quality','10','-'])
					
					// ifile write stream
					var ifilews  = fs.createWriteStream(ifile);
					var pngquant = child.spawn(config.PNGQUANT,
									['--quality','10','-'])

					if (!pngquant_exists || !options.image.quant) {
						if (!pngquant_exists) {
							log.logres(config.PNGQUANT + " not found.", res.opts)
						}
						if (!options.image.quant) {
							log.logres("image.quant == false.", res.opts)
						}
						log.logres("Not reducing image size with pngquant.", res.opts)

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

					log.logres("Not creating scaled image based on" 
								+ " larger image.", res.opts)

					if (!pngquant_exists || !options.image.quant) {
						if (!pngquant_exists) {
							log.logres(config.PNGQUANT + " not found.", res.opts)
						}
						if (!options.image.quant) {
							log.logres("image.quant == false.", res.opts)
						}
						log.logres("Not reducing image size with pngquant.", res.opts)
						log.logres(config.PNGQUANT + " not found.  Not reducing"
									+ " image size with pngquant.", res.opts)
						var rd = request.get(data)
						rd.pipe(res)
						rd.pipe(ifilews)
						return
					}

					log.logres("Reducing image size with pngquant.", res.opts)

					var pngquant = child.spawn(config.PNGQUANT,
												['--quality','10','-'])

					// Pipe pngquant stdout to ifile
					pngquant.stdout.pipe(ifilews)

					// Pipe pngquant stdout to response
					pngquant.stdout.pipe(res)

					// Pipe request data into pngquant stdin
					request
					.get(data)
					.on('error', function (err) {
						var tmpstr  = "Error '" 
							+ err.code 
							+ "' when attempting to retrieve data from "
							+ data
						var tmpstr2 = "Error " 
							+ err.code 
							+ " when attempting to retrieve data from " 
							+ data.split("?")[0]
						res.setHeader('x-tsdsfe-error',tmpstr2)
						log.logres(tmpstr2, res.opts, "stream")
						log.logres("Removing " 
							+ ifile.replace(__dirname + "/",""), res.opts, "stream")
						if (fs.existsSync(ifile)) {
							fs.unlinkSync(ifile)
						}
						res.status(502).send(tmpstr)
					})
					.on('response', function(res0) {
						if (res0.statusCode !== 200) {
							log.logres("Non-200 status code (" + res0.statusCode+ ") from image request.", res.opts, "stream")
							log.logres("TODO: Handle this!", res.opts, "stream")
						}
						log.logres("Headers: " 
							+ JSON.stringify(res0.headers), res.opts, "stream")
						if (res0.headers['x-autoplot-exception']) {
							// TODO: Put this in other parts of code above.
							// Should image be cached in this case? Perhaps
							// we need to cache headers too?
							log.logres("-- Autoplot exception. Sending it and not aborting as exceptions are unreliable.", res.opts, "stream")
							res.setHeader('x-autoplot-exception',
										  res0.headers['x-autoplot-exception'])
							return;

							res.status(502).send(decodeURIComponent(res0.headers['x-autoplot-exception']));
							log.logres("Removing " 
								+ ifile.replace(__dirname + "/",""), res.opts, "stream")
							if (fs.existsSync(ifile)) {
								fs.unlinkSync(ifile)
							}
						}
						if (res0.headers['content-type']) {
							res.setHeader('content-type',
										  res0.headers['content-type'])
						}
						if (res0.headers['x-datacache-log']) {
							res.setHeader('x-datacache-log',
										  res0.headers['x-datacache-log'])
						}
						if (res0.headers['x-tsdsfe-warning']) {
							res.setHeader('x-tsdsfe-warning',
										  res0.headers['x-tsdsfe-warning'])
						}
					})
					.pipe(pngquant.stdin)
					return
				}
			}

			// Request data from URL.
			var sreq = http.get(data, function (res0) {

				log.logres("Headers from request: " 
					+ JSON.stringify(res0.headers), res.opts, "stream")

				if (res.Nc == 0) {

					log.logres("Setting response headers.", res.opts, "stream")

					if (res0.headers['x-datacache-log']) {
						res.setHeader('x-datacache-log',
										res0.headers['x-datacache-log'])
					}
					if (res0.headers['x-tsdsfe-warning']) {
						res.setHeader('x-tsdsfe-warning',
										res0.headers['x-tsdsfe-warning'])
					}

					if (res0.statusCode != 200) {
						log.logres("Non-200 status code.  Sending it and aborting.", res.opts, "stream");
						res.setHeader('x-tsdsfe-error',res0.statusMessage);
						if (res0.headers["x-datacache-error"]) {
							res.setHeader('x-datacache-error',res0.headers["x-datacache-error"]);
							res.status(res0.statusCode).send("Datacache error: " + res0.headers["x-datacache-error"]);
						} else {
							res.status(res0.statusCode).send(res0.statusMessage);
						}
						return;
					}

					if (res0.headers["content-type"]) {
						res.setHeader('Content-Type',
										res0.headers["content-type"])
					}
					if (res0.headers["content-length"]) {
						res.setHeader('Content-Length',
										res0.headers["content-length"])
					}
					if (res0.headers["expires"]) {
						res.setHeader('Expires',res0.headers["expires"])
					}

					if (options.style === "header-0") {
							res.write(res["header-0"])
					}
					if (options.style === "header-1") {
							res.write(res["header-1"])
					}

				}

				res0
					.on('data', function (chunk) {
						if (0) {//(data.length != 0) {
							log.logres("Recieved chunk of size " 
								+ chunk.length + ". Streaming it.",
								  res.opts, "stream")
						}
						// Send chunk to client
						res.write(chunk)
					})
					.on('end', function() {
						log.logres('Got end.', res.opts, "stream")
						res.Nc = res.Nc + 1;
						if (res.Nc == res.N) {
							log.logres("Calling res.end().", res.opts, "stream")
							res.end();
						} else {
							log.logres("Calling catalog with Nc = "
								+ res.Nc, res.opts, "stream")
							res.opts = res.Options[res.Nc]
							catalog(res, stream);
						}
					})
					.on('error',function (err) {
						log.logres("Error for request to " 
							+ data + ": " 
							+ JSON.stringify(err), res.opts, "stream")
						console.log(err)
						console.log(res0)
					})
			}).on('error', function (err) {
				var tmpstr = "Error when attempting to retrieve data "
							+ "from backend server."
				//res.status(502).send(tmpstr)
				//var tmpstr = tmpstr + " (" + data.split("/")[2] + ")";
				//log.logres(tmpstr, res.opts, "stream")
			})
		} else if (status == 301 || status == 302) {
			log.logres("Redirecting to "+data, res.opts, "stream")
			res.redirect(status, data);
		} else if (status === 500 || status === 501 || status == 502 || status == 504) {
			// https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
			log.logres("Sending text/plain.", res.opts, "stream")
			res.status(status).send(data)
			return;
		} else {
			// Script
			if (typeof(data) === "string") {
				// TODO: Handle concatenated requests.
				log.logres("Sending text/plain.", res.opts, "stream")
				res.setHeader('Content-Type','text/plain')
				res.write(data)
				res.end()
				return;
			} else {
				log.logres("Sending JSON.", res.opts, "stream")
				if (N > 1) {
					if (res.Nc == 0) {
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
				log.logres("Wrote JSON request cache file " 
							+ cfile.replace(__dirname + "/",""), 
							  res.opts, "stream")
			} else {
				log.logres("JSON for " + req.originalUrl 
					+ " has zero length.  Not writing cache file.",
					  res.opts, "stream")
			}

			res.Nc = res.Nc + 1
			if (res.N > 1 && res.N != res.Nc) {
				res.write(",")
			}
			if (res.Nc == res.N) {
				// Close JSON array.
				if (res.N > 1) { res.write("]") }
				res.end()
			} else {
				log.logres("Calling catalog() again.", res.opts, "stream")
				res.opts = Options[res.Nc]
				catalog(res, stream)
			}
		}
	}
}

function parseOptions(req, res) {

	var options = {}

	options.cataloglist  = req.query.cataloglist  || config.CATALOGLIST;
	options.catalog      = req.query.catalog      || "^.*";
	options.dataset      = req.query.dataset      || "";
	options.parameters   = req.query.parameters   || "";
	options.groups       = req.query.groups       || "";
	options.start        = req.query.start        || "";
	options.stop         = req.query.stop         || "";
	options.timerange    = req.query.timerange    || "";
	options.return       = req.query.return       || "data";
	options.format       = req.query.format       || "";
	options.style        = req.query.style        || "";
	options.type         = req.query.type         || "";
	options.filter       = req.query.filter       || "";
	options.filterWindow = req.query.filterWindow || "";
	options.attach       = s2b(req.query.attach   || "true");
	options.istest       = s2b(req.query.istest   || "false");

	options.dd           =  req.query.dd          || "";

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

	options.logcolor = Math.round(255*parseFloat(Math.random().toString().substring(1)));
	options.logfile  = config.LOGDIRRES + logsig
	options.logsig   = logsig
	options.debug    = debug
	options.config   = config

	log.logres("Request from " + options.ip + " " + req.originalUrl, options, "app")

	// If any of the cache options are false and update fails, cache will be used if found (and warning is given in header).
 	// Sent as DataCache parameter.
	options.usedatacache     = s2b(req.query.usedatacache     || "true")
	// Images are cached locally.
	options.useimagecache    = s2b(req.query.useimagecache    || "true") 
	// Metadata is cached locally.
	options.usemetadatacache = s2b(req.query.usemetadatacache || "true") 

	// TODO: If any input option is not in list of valid inputs, send warning in header.

	if ((options.return === "image") && (options.type === "")) {
		options.type = "timeseries"
	}	
	
	if ((options.return === "image") && (options.style === "")) {
		options.style = "0"
	}	

	if ((options.return === "data") && (options.style === "")) {
		options.style = "noheader"
	}	

	options.image = {};
	options.image.quant   = s2b(req.query['image.quant']  || "true")
	options.image.width   = req.query['image.width']  || ""
	options.image.height  = req.query['image.height'] || ""
	options.image.widthr  = req.query['image.width']  || ""
	options.image.heightr = req.query['image.height'] || ""

	// This is allowed because we can't control font size.
	// Use, e.g., image.width=400,800 to make fonts much smaller relative to
	// everything else.
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

		// Need to use default colors if more than one parameter; can't pass
		// multiple colors.
		var color = ""
		if (options.parameters.split(",").length == 1) {
			var color = "&color=%23000000"; 
		}

		var column = "0%+8em,100%-6em"
		if (options.type === "timeseriessc" || options.type === "timeseriesscoff") {
			column = "0%+4em,100%-6em"			
		}

		//+ "&backgroundColor=none" // Reduces image size but not working since 05/26/2016 servlet

		options.stylestr =   "drawGrid=true"
							+ "&foregroundColor=%23000000"
							+ color
							+ "&fillColor=%23000000"
							+ "&column="+ encodeURIComponent("0%+8em,100%-5em")
							+ "&row="   + encodeURIComponent("0%+2em,100%-4em")
							+ "&width=" + options.image.width
							+ "&height="+ options.image.height
	}
	if ((options.return === "image") && (options.style === "1")) {
		options.image.width   = options.image.width  || "800"
		options.image.height  = options.image.height || "200"
		options.image.widthr  = options.image.widthr  || "800"
		options.image.heightr = options.image.heightr || "200"

		var color = ""
		if (options.parameters.split(",").length == 1) {
			var color = "%23ffff00"; 
		}

		var column = "0%+8em,100%-6em"
		if (options.type === "timeseriessc" || options.type === "timeseriesscoff") {
			column = "0%+4em,100%-6em"			
		}

		options.stylestr =   "drawGrid=true"
							+ "&backgroundColor=%23000000"
							+ "&foregroundColor=%23ffff00"
							+ "&color=" + color
							+ "&column="+encodeURIComponent(column)
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
	if ((options.return === "metadata") && (options.format === "")) {
		options.format = "header-1";
	}
	if ((options.return === "data") && (options.format === "")) {
		options.format = "ascii-1";
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
			log.logres(err, res.opts)
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

	if (options.return === "tsds" && options.format === "") {
		options.format = "xml"
	}
	if (options.return === "autoplot-bookmarks" && options.format === "") {
		options.format = "xml"
	}

	// This return type is quite different from tsds and autoplot-bookmarks.
	// catalog, dataset, parameter, start, stop are all required.
	if (options.return === "urilist" && options.format === "") {
		options.format = "json"
		// Other option is ascii.
	}
	
	return options
}

// Get XML or JSON from URL and convert to JSON or XML.
function getandparse(url, res, cb) {

	// Retrieves XML or JSON from a URL and stores XML and JSON as a cache file.
	// Callback is passed XML or JSON depending on options.format.

	log.logres("Called with format = " + res.opts.format + "; url = " + url, res.opts)
	
	var urlsig = crypto.createHash("md5").update(url).digest("hex")

	// Cache file with no extension for each catalog
	var cfile = config.CACHEDIR + urlsig

	// JSON cache file for each catalog
	var cfilejson = config.CACHEDIR + urlsig + ".json"

	// XML cache file for each catalog
	var cfilexml = config.CACHEDIR + urlsig + ".xml"

	// Don't do HEAD request if cache file exists and usemetadatacache=true.
	if (res.opts.usemetadatacache) {
		if (res.opts.format !== "xml" && fs.existsSync(cfilejson)) {
			log.logres("usemetadatacache = true and JSON cache file found for url = " + url, res.opts)
			log.logres("Reading and parsing JSON cache file (sync).", res.opts)
			var tmp = JSON.parse(fs.readFileSync(cfilejson))
			log.logres("Done.", res.opts)
			cb(tmp)
			return
		}
		if (res.opts.format === "xml" && fs.existsSync(cfilexml)) {
			log.logres("usemetadatacache = true and XML cache file exists for url = " + url, res.opts)
			log.logres("Reading and parsing XML cache file (sync).", res.opts)
			var tmp = fs.readFileSync(cfilexml).toString()
			log.logres("Done.", res.opts)
			cb(tmp)
			return
		}
	}

	// Do head request and fetch if necessary.  Cache if fetched.
	if (res.opts.format !== "xml" && fs.existsSync(cfilejson)) {
		log.logres("Cache file " + cfilejson.replace(__dirname + "/","") + " found for url = " + url, res.opts)
		headthenfetch(url, "json")
		return
	}
	if (res.opts.format === "xml" && fs.existsSync(cfilexml)) {
		log.logres("Cache file " + cfilexml.replace(__dirname + "/","") + " found for url = " + url, res.opts)
		headthenfetch(url, "xml")
		return
	}

	// Fetch and then cache.
	if (res.opts.format !== "xml") {
		log.logres("No cache file found for url = " + url, res.opts)
		fetch(url,"json")
		return
	} else {
		log.logres("No cache file found for url = " + url, res.opts)
		fetch(url,"xml")
		return
	}

	function headthenfetch(url, type) {

		// Do head request for file that contains list of datasets.
		log.logres("Doing (async) head request on "+url, res.opts)
		var hreq = request.head(url, function (herror, hresponse) {
			if (!herror && hresponse.statusCode != 200) {
				herror = true
			}

			if (herror) {
				log.logres("Error when making head request on " + url, res.opts)
				log.logres("Will try request for " + url, res.opts)
				age = 1
			}

			var dhead = new Date(hresponse.headers["last-modified"]);
			log.logres("Last-modified time: " + dhead, res.opts)
			var fstat = fs.statSync(cfile+"."+type).mtime
			var dfile = new Date(fstat)
			log.logres('Cache file created: ' + fstat, res.opts)
			var age = dhead.getTime() - dfile.getTime();
			log.logres('Last-modified - Cache file created = ' + age, res.opts)
			var found = true

			if (age <= 0) {
				log.logres("Cache file has not expired.  Reading cache file "
						+ (cfile+"."+type).replace(__dirname+"/cache/",""), res.opts)
				log.logres("for URL " + hresponse.request.uri.href, res.opts)
				log.logres("Reading cache file (sync) ", res.opts)
				var tmp = fs.readFileSync(cfile+"."+type).toString()
				if (type === "json") {	
					log.logres("Parsing cache file.", res.opts)
					var tmp2 = JSON.parse(tmp)
					log.logres("Done.", res.opts)
					cb(tmp2)
				} else {
					log.logres("Done.", res.opts)
					cb(tmp)
				}
			} else {
				log.logres("Cache file has expired.", res.opts)
				fetch(url,type,true)
			}

			if (!hresponse) {
				log.logres("Error when attempting to access " + url, res.opts)
				log.logres("Sending 502 error ", res.opts)
				console.error("Error when attempting to access " + url)
				res.opts.status(502).send("Error when attempting to access " + url + "\n")
				console.error(config)
				return
			}
		})
	}

	function fetch(url, type, isexpired) {

		log.logres("Fetching " + url, res.opts)

		request(url, function (error, response, body) {

			log.logres("Done fetching.", res.opts)

			if (error || !response) {
				log.logres("Error when attempting to access " 
							+ url + " :" 
							+ JSON.stringify(error), res.opts);
				error = true;
			}

			if (response) {
				if (response.statusCode != 200) {
					error = true;
					if (response.statusCode != 200) {
						log.logres("Status code was not 200 when attempting to access " 
										+ url, res.opts)
					}
				}
			}

			if (error) {
				log.logres("Error when attempting to access " 
							+ url + " :" 
							+ JSON.stringify(error), res.opts)
			}

			if (error) {
				if (fs.existsSync(cfile+"."+type))  {

					log.logres("Using expired cache because request failed for " + url, res.opts)

					// Add a header noting cache was used (because failed request).
					if (isexpired) {
						res.header('x-tsdsfe-warning',"Used expired cache because failed request for " + url)
					} else {
						res.header('x-tsdsfe-warning',"Used cache because failed request for " + url)
					}
					var tmp = fs.readFileSync(cfile+"."+type).toString()
					if (res.opts.format === "json") { 
						var tmp = JSON.parse(tmp)
					}
					cb(tmp)
				} else {
					if (!fs.existsSync(cfile+"."+type))  {
						log.logres("Error when attempting to access " + url + " and no cached version found.\n", res.opts)
						res.status(502).send("Error when attempting to access " + url + " and no cached version found.\n")
					}
				}
				return
			}

			var isjson = false
			var isxml  = false

			if (body.match(/^\s*\[|^\s*{/)) {
				log.logres("Response was JSON", res.opts)
				isjson = true;
			} else {
				log.logres("Response is XML.", res.opts)
				isxml = true
			}

			if (isxml) {
				if (res.opts.format === "xml") {
					log.logres("Returning XML.", res.opts)
					log.logres("Calling cb(xml).", res.opts)
					cb(body);
					log.logres("Writing (sync) XML cache file for url = " + url, res.opts)
					fs.writeFileSync(cfilexml,body)
					log.logres("Done.", res.opts)
				} else {
					log.logres("Parsing "+url, res.opts)
					var parser = new xml2js.Parser();
					// TODO: Catch error here.
					parser.parseString(body, function (err, json) {

						log.logres("Done parsing.", res.opts)

						if (err) {
							log.logres("Sending 502.  Could not parse "+url+".\n", res.opts)
							res.opts.status(502).send("Could not parse " + url + ".\n"+err, res.opts)
							return
						}

						log.logres("Calling cb(json).", res.opts)
						cb(json)

						log.logres("Writing (sync) JSON cache file for url = " + url, res.opts)

						fs.writeFileSync(cfilejson,JSON.stringify(json))
						log.logres("Done.", res.opts)
					})
				}
			} else {
				if (res.opts.format === "xml") {
					var builder = new xml2js.Builder();
					var xml = builder.buildObject(JSON.parse(body))

					log.logres("Calling cb(xml).", res.opts)
					cb(xml)

					log.logres("Writing XML cache file for url = " + url, res.opts)

					fs.writeFileSync(cfilexml,xml)
					log.logres("Done.", res.opts)
				} else {
					log.logres("Calling cb(json).", res.opts)
					cb(JSON.parse(body))
				}				
				log.logres("Writing JSON cache file for url = " + url, res.opts)
				//fs.writeFileSync(cfilejson,JSON.stringify(body))
				fs.writeFileSync(cfilejson, body)
				log.logres("Done.", res.opts)
			}
		})
	}
}

// After catalog() executes, it either calls dataset() or stream().
// (Calls stream() only if catalog information was requested.)
function catalog(res, cb) {

	log.logres("Called.", res.opts)

	if (res.opts.cataloglist === "-") {
		// Creates an equivalent of CATALOGLIST with a single catalog for a dd.
		var result = 
			{
				"catalog": 
					{
						"$":
							{
								'name': 'Catalog',
								'xmlns': 'http://www.unidata.ucar.edu/namespaces/thredds/InvCatalog/v1.0',
								'xmlns:xlink': 'http://www.w3.org/1999/xlink'
							},
						"catalogRef":
							[{
								"$":
									{
										'ID': res.opts.catalog,
										'xlink:title': '',
										'xlink:href': "dd/" + res.opts.catalog + ".json"
									}
							}]
					}
			}
		//console.log(result)
		afterparse(result)
		return
	}

	// Get and parse catalog list.
	getandparse(res.opts.cataloglist, res, afterparse)

	function afterparse(result) {
		// Given JSON containing information in config.CATALOGLIST, form JSON response.
		// config.CATALOGLIST contains links to all catalogs available.
		var resp = [];

		var catalogRefs = result["catalog"]["catalogRef"]
		var xmlbase     = config.XMLBASE || result["catalog"]["$"]["xml:XMLBASE"] || ""

		log.logres("Setting xmlbase to " + xmlbase, res.opts)

		log.logres("Found " + catalogRefs.length + " catalogRef node(s).", res.opts)

		// Loop over each catalogRef and remove ones that don't match pattern.
		for (var i = 0;i < catalogRefs.length;i++) {

			resp[i]       = {}
			resp[i].value = catalogRefs[i]["$"]["ID"]
			resp[i].label = catalogRefs[i]["$"]["name"] || catalogRefs[i]["$"]["ID"]
			resp[i].href  = xmlbase+catalogRefs[i]["$"]["xlink:href"]

			if (res.opts.catalog !== "^.*") {
				if (res.opts.catalog.substring(0,1) === "^") {
					if (!(catalogRefs[i]["$"]["ID"].match(res.opts.catalog))) {
						delete resp[i]
					}        
				} else {
					if (!(catalogRefs[i]["$"]["ID"] === res.opts.catalog)) {
						delete resp[i]
					}
				}
			}
		}

		// Now we have a list of URLs for catalogs associated with the catalog pattern.
		// Remove empty elements of array. (TODO: Needed?)
		resp = resp.filter(function(n){return n})

		if (resp.length == 0) {
			if (res.opts.cataloglist !== "-" && res.opts.catalog.length != 32) {
				log.logres("Error: No matching catalogs in list.", res.opts)
				var list = "List:"
				for (var i = 0; i < catalogRefs.length;i++) {
					list = list + " " + catalogRefs[i]["$"]["ID"] 
				}
				log.logres(list, res.opts)
				cb(501,  "Error: No matching catalogs with ID = "
						+ res.opts.catalog
						+ " in "
						+ res.opts.cataloglist
						+ ". Options are "
						+ list + "\n", res);
				return
			} else {
				// If catalog is a dd md5, this will work.
				log.logres("No matches.  Try again with res.opts.cataloglist = -.", res.opts)
				// TODO: Check if dd file exists.  If not send error "Catalog with ID not fund in catalogs/dd".
				// Otherwise response is something like
				// Error when attempting to access
				// http://localhost:8004/catalogs/dd/xf5e6af45e1430aa4b2e3f0ea964f7985 and no cached version found
				res.opts.cataloglist = "-"
				catalog(res, cb)
				return
			}
		}

		if (res.opts.dataset === "") {
			// If no dataset was requested and only one catalog URL in list,
			// add information from within the catalog to the response.
			if (resp.length == 1 && res.opts.catalog.substring(0,1) !== "^") {
				// If only one catalog matched pattern.
				getandparse(resp[0].href, res,
					function (result) {
						//console.log(result)
						var oresp = []
						oresp[0] = {}
						oresp[0].title = "Catalog configuration"
						oresp[0].link  = config["TSDSFEEXTERNAL"] + "?catalog="+res.opts.catalog+"&return=tsds&attach=false"
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
			dataset(resp, res, cb)
		}
	}
}

// After dataset() executes, calls parameter() or stream().
// (Will call stream() if only dataset information was requested.)
function dataset(catalogs, res, cb) {

	// catalogs is a list of catalog ids for all datasets in matched catalogs.

	if (catalogs.length == 0) {
		cb(200, "[]", res)
		return
	}

	var datasets = []
	var parents = []
	var dresp = []

	log.logres("Called.", res.opts)

	// Loop over each catalog
	for (var i = 0; i < catalogs.length; i++) {
		//console.log("Getting " + catalogs[i].href)
		getandparse(catalogs[i].href, res, afterparse);
	}

	//function HAPI2TSDS(result) {
		// repeat for all i
		// i = 0;
		//	getandparse(result["catalog"][i]["id"], res, afterparseHAPI, i)
		//
		// function afterparseHAPI(resultHAPI, i) {
		//     catalog[i]["info"] = resultHAPI
		//	   Assemble.
		//     afterparse(result)
		//}
	//}

	function afterparse(result) {

		// Extract catalog information.

		if (typeof(result) === "string") {
			console.log("Variable returned is string?!  Try parsing again ...");
			result = JSON.parse(result)
		}

		// If result["HAPI"]
		// Loop through each dataset and get parameter information and build result["catalog"]. Call afterparse(result)
		//if (result[HAPI]) {
		//   HAPI2TSDS(result);
		//   return;
		//}

		if (typeof(afterparse.j) === "undefined") {afterparse.j = 0}

		// TODO: Deal with case of result === "", which means getandparse() failed.
		afterparse.j = afterparse.j+1

		var parent = result["catalog"]["$"]["id"] || result["catalog"]["$"]["ID"]

		var tmparr = result["catalog"]["dataset"]
		datasets = datasets.concat(tmparr);

		// Case where timeCoverage node applies to all datasets in catalog.
		if (result["catalog"]["timeCoverage"]) {
			var Start = result["catalog"]["timeCoverage"][0]["Start"]
			if (Start)
				Start = Start[0]
			var End = result["catalog"]["timeCoverage"][0]["End"]
			if (End)
				End = End[0]
		}
        
        var tmpcat = {};
        tmpcat["$"] = result["catalog"]["$"]
        tmpcat.timeCoverage = result["catalog"]["documentation"]
        tmpcat.documentation = result["catalog"]["timeCoverage"]
        //console.log(result["catalog"]["dataset"])
        //if (result["catalog"]["dataset"][0]["SPASE"]) {
	    //    tmpcat.spaseid = result["catalog"]["dataset"][0]["SPASE"][0]["ID"][0];
	    //    console.log(result["catalog"]["dataset"][0]["SPASE"][0]["ID"][0])
        //}

		// Copy the parent node so that each dataset has a parent.
		while (parents.length < datasets.length) {
		    parents = parents.concat(parent)
		}

		// TODO: This won't catch case when pattern is used; afterparse may
		// not have been called with results in same order as catalog array.
		if (catalogs.length == 1) {
			if (parent !== catalogs[afterparse.j-1].value) {
			var msg = "Error: ID (" + catalogs[afterparse.j-1].value + ")" + " of catalog referenced in master catalog [" + config.CATALOGLIST  + "]"
						+ " does not match ID (" +  parent + ") of catalog containing dataset "
						+ "[" + catalogs[afterparse.j-1].href + "]."
				log.logres(msg, res.opts);
				cb(500, msg, res);
				return;
			}
		}
		var dresp = []

		// If all of the dataset URLs have been parsed.
		if (afterparse.j == catalogs.length) {

			for (var i = 0;i < datasets.length;i++) {
				if (Start) {
					datasets[i]["timeCoverage"] = []
					datasets[i]["timeCoverage"][0] = {}
					datasets[i]["timeCoverage"][0]["Start"] = [Start]
				}
				if (End) {
					if (!datasets[i]["timeCoverage"]) {
						datasets[i]["timeCoverage"] = []
						datasets[i]["timeCoverage"][0] = {}
					}
					datasets[i]["timeCoverage"][0]["End"] = [End]
				}
				datasets[i].catalog = tmpcat

				dresp[i]         = {}
				dresp[i].value   = datasets[i]["$"]["id"] || datasets[i]["$"]["ID"]
				dresp[i].label   = datasets[i]["$"]["label"] || datasets[i]["$"]["name"] || dresp[i].value

				if (res.opts.dataset !== "^.*") {	
					if (res.opts.dataset.substring(0,1) === "^") {
						if (!(dresp[i].value.match(res.opts.dataset))) {
							delete dresp[i]
							delete datasets[i]
						}	
					} else {
						if (!(dresp[i].value === res.opts.dataset)) {
							delete dresp[i]
							delete datasets[i]
						} else {
							var z = i
						}
					}
				}
			}

			dresp = dresp.filter(function(n){return n;}); // Needed?
			// If no parameters specified.
			if (res.opts.parameters === "" && !(res.opts.groups === "^.*")) {

				if (dresp.length == 1 && res.opts.dataset.substring(0,1) !== "^") {
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
					//console.log("---" + filecite)
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
					cb(200, dresp, res)
				} else {
					cb(200, dresp, res)
				}
			} else {
				parameter(datasets.filter(function(n){return n}), res, cb)
			}						
		}
	}
}

function parameter(datasets, res, cb) {

	//console.log(datasets)

	log.logres("Called.", res.opts)

	if (res.opts.groups === "^.*") {
		res.opts.parameters = "^.*";
	}


	//res.datasets = datasets;

	var parameterlist = [];
	var parameters = [];
	var parents = [];
	var cats = [];
	var resp = [];
	//console.log(catalogs)

	// Get list of all parameters in all datasets
	for (var i = 0;i < datasets.length;i++) {

		parameters = parameters.concat(datasets[i].variables[0].variable);
		var parent = datasets[i]["$"];

		if (datasets[i]["SPASE"]) {
			parent.spaseid = datasets[i]["SPASE"][0]["ID"][0];
		}
		//console.log(datasets[i]["SPASE"][0]["ID"][0])
		var timeCoverage = datasets[i].timeCoverage;

		if (timeCoverage[0]) {
			if (timeCoverage[0].Start) {
				parent.start = timeCoverage[0].Start[0];
			} else {
				parent.start = "P0D";
			}
			
			if (timeCoverage[0].End) {
				parent.stop = timeCoverage[0].End[0];
			} else {
				parent.stop = "P0D";
			}

			if (timeCoverage[0].Cadence) {
				parent.cadence = timeCoverage[0].Cadence[0];
			} else {
				parent.cadence = "";				
			}
		}

		parent.catalog = datasets[i]["catalog"]
		while (parents.length < parameters.length) {
			parents.push(parent)
		}
	}						

	//console.log(parents)
	//console.log(res.opts.parameters)
	var parametersa = res.opts.parameters.split(",")
	for (var i = 0;i < parameters.length;i++) {

		var id = parameters[i]["$"]["id"] || parameters[i]["$"]["ID"] || "";

		parameterlist[i] = id;

		if (id === "") {
			if (parameters[i]["$"]["columns"].match(/,|-/)) {
				id = "columns" + parameters[i]["$"]["columns"];
			} else {
				id = "column" + parameters[i]["$"]["columns"];
			}
			parameters[i]["$"]["id"] = id;
		}

		resp[i]            = {};
		resp[i].value      = id;
		resp[i].catalog    = parents[i]["catalog"]["$"]["id"]
		resp[i].dataset    = parents[i]["id"] || parents[i]["ID"];
		resp[i].spaseid    = parents[i]["spaseid"] || ""
		//console.log(parents[i])
		resp[i].parameters = id;
		resp[i].dd         = parameters[i]["$"];
		resp[i].cataloginfo = parents[i]["catalog"]
		resp[i].datasetinfo = parents[i];

		//console.log(parents)
		if (!('urltemplate' in resp[i].dd))  {resp[i].dd.urltemplate = parents[i]["urltemplate"] || ""}
		if (!('timeformat' in resp[i].dd))   {resp[i].dd.timeformat = parents[i]["timeformat"] || "$Y-$m-$dT$H:$M:$S.$(millis)Z"}
		if (!('timecolumns' in resp[i].dd))  {resp[i].dd.timecolumns = parents[i]["timecolumns"] || "1-" + resp[i].dd.timeformat.split(/,|\s/).length}
		if (!('columns' in resp[i].dd))      {resp[i].dd.columns = parents[i]["columns"]}
		if (!('start' in resp[i].dd))        {resp[i].dd.start = parents[i]["start"]}
		if (!('stop' in resp[i].dd))         {resp[i].dd.stop = parents[i]["stop"]}

		if (!('urlsource' in resp[i].dd))    {resp[i].dd.urlsource = parents[i]["urlsource"] || ""}
		if (!('urlprocessor' in resp[i].dd)) {resp[i].dd.urlprocessor = parents[i]["urlprocessor"] || ""}

		if (!('cadence' in resp[i].dd))      {resp[i].dd.cadence = parents[i]["cadence"] || ""}
		if (!('delim' in resp[i].dd))        {resp[i].dd.delim = parents[i]["delim"] || ""}
		if (!('lineregex' in resp[i].dd))    {resp[i].dd.lineregex = parents[i]["lineregex"] || ""}
		if (!('fillvalue' in resp[i].dd))    {resp[i].dd.fillvalue = parents[i]["fillvalue"] || ""}
		
		if (resp[i].dd.timecolumns === "1-1") {
			resp[i].dd.timecolumns = "1";
		}

		if (res.opts.parameters !== "^.*") {				

			var value = resp[i].value;

			if (res.opts.parameters.substring(0,1) === "^") {
				if (!(resp[i].parameters.match(res.opts.parameters))) {
					delete resp[i];
				}
			} else  {
				var found = false;
				// TODO: Need to verify uritemplates the same (in same file or
				// response from service.)
				for (var j = 0;j < parametersa.length; j++) {
					if (parametersa[j] === value) {
						found = true;
						break;
						log.logres("Match in catalog for requested parameter "+value+".", res.opts)
					}
				} 
				if (!found) {
					delete resp[i];
				}
			}
		}
	}

	resp = resp.filter(function(n){return n});

	if ((res.opts.parameters === "^.*") || (res.opts.start === "" && res.opts.stop === "")) {
		// Return matching parameters.
		cb(200, resp, res);
		return;
	}

	if (typeof(resp[0]) === "undefined") {
		// No parameters means no further processing can be done.
		var plural = (res.opts.parameters.split(",").length > 1 ? "s" : "")
		var msg = "No match in catalog for any of the requested parameter"
					+ plural + " ("
					+ res.opts.parameters + "). Available parameters: "
					+ parameterlist.join(", ") + "\n";
		log.logres(msg + ". Sending 500 response.", res.opts);
		cb(500, msg, res);
		return;
	}
	
	if (res.opts.groups === "^.*") {
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
		log.logres(datasets[0].groups[0].group, res.opts)
		log.logres(ddresp, res.opts);

		// Get JSON for group list
		cb(200, ddresp, res);
		return;
	}
	
	//console.log(resp)

	var columns = resp[0].dd.timecolumns || 1;
	for (var z = 0;z < resp.length; z++) {
		columns = columns + "," + resp[z].dd.columns;
	}

	// Interpretation of timeRanges:
	// DATE/DURATION       = DATE/now+DURATION
	// DURATION/DATE       = DATE+DURATION/DATE
	// DATE1/DATE2         = DATE1/DATE2
	// DURATION1/DURATION2 = now+DURATION1/now+DURATION2

	if ((res.opts.start === '') && (res.opts.stop !== '')) {
	    res.opts.start = "-P1D";
	}
	if ((res.opts.stop === '') && (res.opts.start !== '')) {
	    res.opts.stop = "P1D";
	}
	var start = res.opts.start || resp[0].dd.start;
	var stop  = res.opts.stop  || resp[0].dd.start;

	var tmp = expandISO8601Duration(start+"/"+stop,{debug:false});

	var tmpdd = expandISO8601Duration(
					resp[0].dd.start
					+ "/"
					+ resp[0].dd.stop, {debug:false});

	if (1) {
		start  = tmp.split("/")[0].replace("T00:00:00.000Z","");
		stop   = tmp.split("/")[1].replace("T00:00:00.000Z","");
		startdd = tmpdd.split("/")[0].replace("T00:00:00.000Z","");
		stopdd  = tmpdd.split("/")[1].replace("T00:00:00.000Z","");
	}

	if (0) {
		start   = tmp.split("/")[0];
		stop    = tmp.split("/")[1];
		startdd = tmpdd.split("/")[0];
		stopdd  = tmpdd.split("/")[1];
	}

	log.logres("Requested start  : " + res.opts.start, res.opts)
	log.logres("Expanded start   : " + start, res.opts)
	log.logres("DD start         : " + resp[0].dd.start, res.opts)
	log.logres("Expanded DD start: " + startdd, res.opts)

	log.logres("Requested stop   : " + res.opts.stop, res.opts)
	log.logres("Expanded stop    : " + stop, res.opts)
	log.logres("DD stop          : " + resp[0].dd.stop, res.opts)
	log.logres("Expanded DD stop : " + stopdd, res.opts)

	var urltemplate  = resp[0].dd.urltemplate
							.replace("mirror:http://",config.MIRROR)
							.replace("mirror:ftp://",config.MIRROR);
	var urlprocessor = resp[0].dd.urlprocessor;
	var urlsource    = resp[0].dd.urlsource;
	var cadence = resp[0].dd.cadence
	if ((new Date(stop)).getTime() < (new Date(start)).getTime()) {
		cb(500, "Stop time is before start time.", res);
		return;
	}

	if ((new Date(start)).getTime() > (new Date(stop)).getTime()) {	
		cb(500, "Start time is after stop time.", res);
		return;
	}

	if  ((new Date(startdd)).getTime() > (new Date(start)).getTime()) {
		log.logres("Requested start < Catalog start.  "
			+ " Setting requested start to catalog start.", res.opts);
		start = startdd
	}

	if  ((new Date(stopdd)).getTime() < (new Date(stop)).getTime()) {
		log.logres("Requested stop > Catalog stop.  "
			+ " Setting requested stop to catalog stop.", res.opts);
		res.opts.stop = stopdd
		stop = stopdd
	}

	res.opts.start = start
	res.opts.stop = stop

	//console.log(res.opts)
	var args = "";
	if (urlprocessor) {
		args = "&plugin=" + urlprocessor;
	}
	if (urltemplate) {
		args = args + "&template=" + urltemplate;
	} 
	if (urlsource) {
		args = args + "&source=" + urlsource;
	}

	if (args) {
		var dc = config.DATACACHE + "?" + args + "&timeRange=" + start + "/" + stop;
	} else {
		var dc = config.DATACACHE + "?timeRange=" + start + "/" + stop;
	}
	
	if (res.opts.istest) {
		dc = dc + "&istest=true"
	}

	if (res.opts.return === "urilist") {
		if (res.opts.return === "urilist" && res.opts.format === "ascii") {
			dc = dc + "&return=urilistflat"
		} else {
			dc = dc + "&return=urilist"
		}
		cb(0, dc, res)
		return
	}

	if (res.opts.return === "image" && res.opts.format === "viviz") {
		var dirprefix = config.TSDSFE + "/"
						+ "?catalog="    + res.opts.catalog
						+ "&dataset="    + res.opts.dataset
						+ "&parameters=" + res.opts.parameters
						+ "&return=image"
						+ "&format=png"
						+ "&type="  + res.opts.type
		            	+ "&style=" + res.opts.style
 						+ "&image.width=800&image.height=200"

 		// Find start year of selected data.  Then selected the day number
 		// of interest.
		var startyr = start.substring(0,4);
		var begin = new Date(startyr + "-01-01");
		var end   = new Date(stop);
		var diff  = end.getTime() - begin.getTime();
		var day = Math.floor(diff/(1000*60*60*24));

		strftime = "&start=-P1D&stop=$Y-$m-$d";
		if (cadence.match(/PT/) && cadence.match(/H$/)) {
			//strftime = "&start=$Y-$m-${d;delta=3}&stop=${Y;offset=0}-${m;offset=0}-${d;offset=2}";
			// Something goes wrong with the day calculation when passed to viviz.
			//strftime = "&start=$Y-$m-${d;delta=30}&stop=${Y;offset=0}-${m;offset=0}-${d;offset=30}";
			//day = Math.floor(day/30);
		}
		//console.log(dirprefix);
		//console.log(strftime);
		var viviz = config.VIVIZEXTERNAL 
					+ "#"
					+ "dir=" + encodeURIComponent(dirprefix)
					+ "&strftime=" + encodeURIComponent(strftime)
					+ "&start=" + startdd
					+ "&stop="  + stopdd
					+ "&regexp=" + startyr
					+ "&number=" + day
					+ "&showDropdowns=false&showAttributes=false&showAboutText=false&showCatalog=false"

		cb(302, viviz, res)
		return
	}

	if (res.opts.return === "image" || res.opts.return === "script") {

		// If more than one resp, this won't work.
		var Labels = "'";
		var Parameters = "'";
		for (var z = 0; z < resp.length; z++) {
			Parameters = Parameters + resp[z].dd.id + " [" + resp[z].dd.units + "]','";
			Labels = Labels + resp[z].dd.label + " [" + resp[z].dd.units + "]','";
		}

		if ((res.opts.return === "script")) {

			if (res.opts.format === "matlab") var ext = "m";
			if (res.opts.format === "idl") var ext = "pro";
			if (res.opts.format === "python") var ext = "py";

			var warning = "!!! Warning: Possible"
							+ " TSDSFE configuration error"
							+ " - script contains a TSDSFE"
							+ " URL that with a server = localhost."
							+ " Script will not work unless TSDSFE is running"
							+ " on localhost";
			if (res.opts.format === "autoplot") {
				var url = config.TSDSFEEXTERNAL
								+ "?catalog=" + resp[0].catalog
								+ "&dataset=" + resp[0].dataset
								+ "&parameters=" + res.opts.parameters
								+ "&start=" + start
								+ "&stop=" + stop
								+ "&type=" + res.opts.type

				var script =  "1. Start Autoplot using http://autoplot.org/autoplot.jnlp\n"
							+ "2. Enter the following URL in the Autoplot address bar.\n"
							+ "3. Open the script tab to see the script.\n\n"
							+ url;

				if (config.TSDSFEEXTERNAL.match(/http:\/\/localhost/)) {
					script = warning + "\n\n" + script;
				}

				cb(200, script, res);
				console.log("---")
				console.log(script)
				return;
			}

			var script = fs.readFileSync(__dirname 
								+ "/scripts/tsdsfe." + ext).toString();

			script = script
						.replace("__SERVER__",config.TSDSFEEXTERNAL)
						.replace("__STATUS__",config.TSDSFEEXTERNAL + "?catalog=" + resp[0].catalog)
						.replace("__QUERYSTRING__",
									"catalog=" + resp[0].catalog
									+ "&dataset=" + resp[0].dataset
									+ "&parameters=" + res.opts.parameters
									+ "&start=" + start
									+ "&stop=" + stop
									+ "&return=data"
									+ "&format=ascii-2");
			//script = script.replace("__LABELS__",Labels.slice(0,-2));
			script = script.replace("__LABELS__",Parameters.slice(0,-2));
			if (config.TSDSFEEXTERNAL.match(/http:\/\/localhost/)) {
				log.logres("Warning: stream(): " + warning, res.opts)
				script = script.replace("__COMMENT__",warning)
			} else {
				script = script.replace("__COMMENT__","")
			}

			cb(200, script, res);
			return;
		}

		// For now, don't use relative times because TSDS interpretation is
		// different from Autoplot (TSDS should change to match Autoplot's.)
		start = res.opts.start.substring(0,10);
		stop = res.opts.stop.substring(0,10);

		function joinresp(resp, el) {
			if (resp.length == 1) {return resp[0]["dd"][el]};
			var str = ""
			// Remove commas in ID.
			for (var i = 0; i < resp.length-1; i++) {
				str = str + resp[i]["dd"][el].replace(",","") + ","
			}
			return str + resp[i]["dd"][el].replace(",","")
		}

		var extra = ""
		if (resp[0].dd.columnLabels) {
			extra = extra + "&labels=" + joinresp(resp, 'columnLabels').replace(/\|/g,"%7C");;
		} else {
			extra = extra + "&labels=" + joinresp(resp, 'id').replace(/\|/g,"%7C");
		}
		if (resp[0].dd.units) {
			extra = extra + "&units=" + joinresp(resp, 'units');
		}
		if (resp[0].dd.fillvalue) {
			extra = extra + "&fills=" + joinresp(resp, 'fillvalue');
		}

		//console.log(resp[0].dd.columnLabels)
	    //console.log(extra)
		// A parameter may be a vector type.  In this case, don't specify
		// color (which forces all lines to be same color in Autoplot.)
		if (resp[0]["dd"]["type"] === "vector" || resp[0]["dd"]["type"] === "scalars") {
			res.opts.stylestr = res.opts.stylestr.replace(/&color=.*?&/,"&");
		}
		//console.log(resp[0]["dd"]["type"])
		//console.log(res.opts.stylestr)

		var baseargs = 	  "?catalog=" + res.opts.catalog
						+ "&dataset=" + res.opts.dataset
						+ "&parameters=" + res.opts.parameters
						+ "&timerange=" + start+"/"+stop
						+ "&type=" + res.opts.type

		log.logres("JYDS    : " + config.JYDS, res.opts)

		if (res.opts.format === "jnlp") {

			//console.log(extra)
			// TODO: If request URL is localhost, use config.TSDSFE? (So 
			// jnlp will run offline?)
			server = config.TSDSFEEXTERNAL;
			JYDS = config.JYDSEXTERNAL;

			config.JNLP = "http://autoplot.org/autoplot.jnlp"
			var jnlpargs = "?open=vap+jyds:"
			var jydsargs = baseargs + "&server=" + server + extra

			log.logres("config.JNLP  : " + config.JNLP, res.opts)
			log.logres("JNLP redirect: " + config.JNLP + jnlpargs + JYDS + jydsargs, res.opts)
			// Should be using the following, but the script for autoplot.jnlp
			// does not decode the argument of open.
			//cb(301,config.JNLP + jnlpargs + encodeURIComponent(config.JYDS + jydsargs))
			// This works:
			cb(301, config.JNLP + jnlpargs + JYDS + jydsargs, res)
			return
		}

		var server = config.TSDSFE + "/";
		if (!config.AUTOPLOT.match(/http\:\/\/localhost/)) {
			server = config.TSDSFEEXTERNAL;
		} 

		var jydsargs = baseargs + "&server=" + server + extra

		var format = "image/png";
		if (res.opts.format.match(/^pdf/)) {format = "application/pdf"}
		if (res.opts.format.match(/^svg/)) {format = "image/svg%2Bxml"}
		var apargs = "?format="+format
					+ "&" + res.opts.stylestr
					+ "&url=vap+jyds:"

		log.logres("AUTOPLOT: " + config.AUTOPLOT, res.opts)
		log.logres("apargs: " + apargs, res.opts)	
		log.logres("jydsargs: " + jydsargs, res.opts)	
		var aurl = config.AUTOPLOT + apargs + encodeURIComponent(config.JYDS + jydsargs)

		if (res.opts.format.match(/url$/)) {
			cb(200, aurl, res)
			return
		}

		log.logres("Making request to: AUTOPLOT + apargs + encodeURIComponent(config.JYDS + jydsargs)", res.opts)
		log.logres(aurl, res.opts)
		log.logres("JYDS URL: " + config.JYDS + jydsargs, res.opts)
		if (config.TSDSFE.match(/http:\/\/localhost/)) {
			if (!config.AUTOPLOT.match(/http:\/\/localhost/)) {
				log.logres("Error: stream(): Autoplot image servlet specified by config.AUTOPLOT must be localhost if config.TSDSFE is localhost.", res.opts)
				cb(501,"Server configuration error related to address of Autoplot servlet ("+config.AUTOPLOT+") and address of TSDSFE ("+config.TSDSFE+").",res);
				return;
			}
		}

		cb(0, aurl, res)
		return
	}

	// Form JSON DD
	ddresp = [];
	for (var z = 0;z < resp.length; z++) {
		//ddresp[z] = resp[z].dd;
		ddresp[z] = {};
		ddresp[z].columnIDs = resp[z].dd.id;
		if (resp[z].dd.label) {
			ddresp[z].columnLabels = resp[z].dd.label;
		}
		if (resp[z].dd.units) {
			ddresp[z].columnUnits = resp[z].dd.units;			
		}
		if (resp[z].dd.units) {
			ddresp[z].columnTypes = resp[z].dd.type;			
		}
		if (resp[z].dd.fillvalue) {
			ddresp[z].columnFillValues = resp[z].dd.fillvalue;
		}
		if (resp[z].dd.rendering) {
			ddresp[z].columnRenderings = resp[z].dd.rendering;
		}

		ddresp[z].catalog = resp[z].catalog;
		ddresp[z].dataset = resp[z].dataset;

		if (res.opts.start !== '') {
			ddresp[z].start = start;
		} else {
			ddresp[z].start = resp[z].dd.start;
		}
		if (res.opts.stop !== '') {
			ddresp[z].stop = stop;			
		} else {
			ddresp[z].stop = resp[z].dd.stop;
		}

		//ddresp[z].urltemplate = "";
		//console.log(resp[z].dd)

		if (res.opts.format === "ascii-0") {
			var len = resp[z].dd.timeformat.split(/\s+|,/).length
			if (len == 1) {
				var tmpstr = "1";
			} else {
				var tmpstr = "1-" + len;	
			}

			ddresp[z].columns = "" + (len+1);
			ddresp[z].timeFormat = resp[z].dd.timeformat;
			ddresp[z].timeColumns = tmpstr;
		}
		if (res.opts.format === "ascii-1") {
			ddresp[z].columns = "" + (z+2);
			ddresp[z].timeFormat = "%Y-%m-%DT%H%M%SZ";
			ddresp[z].timeColumns = "1";
		}
		if (res.opts.format === "ascii-2") {
			ddresp[z].columns = "" + (z+7);
			ddresp[z].timeFormat = "%Y %m %d %H %M %S";
			ddresp[z].timeColumns = "1-6";
		}
	}
	res.dd = ddresp

	if (res.opts.return === "dd") {
		cb(200, ddresp, res)
		return
	}

	res = headers(res, resp);

	if (res.opts.return === "metadata") {
		cb(200, res[res.opts.format], res)
		return;
	}
	
	if ((res.opts.return === "data") || (res.opts.return === "redirect")) {				 
		var formatv = res.opts.format.split("-")
		//console.log(formatv)
		if (formatv.length < 2) {
			var format = 1
		} else {
			var format = formatv[1]
		}
		//console.log(format)

		dc = dc
				+"&return=stream"
				+"&lineRegExp=" + (resp[0].dd.lineregex || "")
				+"&streamFilterReadTimeFormat=" + (resp[0].dd.timeformat || "")
				+"&streamFilterReadColumnsDelimiter=" + (resp[0].dd.delim || "")
				+"&streamFilterReadColumns=" + columns
				+"&streamFilterWriteTimeFormat=" + format
				+"&streamFilterWriteComputeFunction=" + res.opts.filter
				+"&streamFilterWriteComputeFunctionWindow=" + res.opts.filterWindow
				+"&streamFilterWriteComputeFunctionExcludes=" + (resp[0].dd.fillvalue || "")
				+"&streamFilterWriteDelimiter=,"
				+"&streamOrder=true"
				+"&streamGzip=false"
				;

		// Remove name=value when value === "".
		dc = dc.replace(/[^=&]+=(&|$)/g,"").replace(/&$/,"");
		if (!res.opts.usedatacache) dc = dc+"&forceUpdate=true&forceWrite=true"

		var tests = require('./servers.js').tests
		if (!tests.respectHeaders) {
			dc = dc + "&respectHeaders=false"
		}
		if (res.opts.return === "redirect") {
			// If more than one resp, this won't work.
			cb(302,dc,res);
			return;
		}
		//console.log(res.opts)
		//console.log(resp)
	
		//console.log(ddresp)	

		cb(0,dc,res)
		return;
	}

	cb(500, "Query parameter return=" + res.opts.return + " not recognized.", res)
}

function headers(res, resp) {

	var header0 = "";
	var delim = ",";
	for (var j = 0;j < res.dd.length; j++) {
		if (j == res.dd.length-1) {delim = ""}
		var header0 = header0 + res.dd[j].columnIDs + " [" + res.dd[j].columnUnits + "]" + delim;
	}
	if (res.opts.format === "ascii-0") {
		var tmpstr = res.dd[0].timeFormat
						.replace(/,/g,"")
						.replace("%Y", " Year").replace("$Y", " Year")
						.replace("%m", " Month").replace("$m", " Month")
						.replace("%d", " Day").replace("$d", " Day")
						.replace("%H", " Hour").replace("$H", " Hour")
						.replace("%M", " Minute").replace("$M", " Minute")
						.replace("%S", " Second").replace("$S", " Second")

		header0 = tmpstr.replace(/^ /,"") + " " + header0 + "\n";
	} 
	if (res.opts.format === "ascii-1" || res.opts.format === "header-1" || res.opts.format === '') {
		header0 = "Time" + "," + header0 + "\n"
	} 
	if (res.opts.format === "ascii-2") {
		header0 = "Year Month Day Hour Minute Second" + " " + header0 + "\n";
	} 
	res["header-0"] = header0;

	//console.log(resp[0])

	var FieldNames = resp[0].dd.id;
	var FieldUnits = resp[0].dd.units;
	var FieldNulls = resp[0].dd.fillvalue;
	var FieldTypes = "double"
	for (var j = 1;j < resp.length; j++) {
		FieldNames = FieldNames + "," + resp[j].dd.id;
		FieldUnits = FieldUnits + "," + resp[j].dd.units;
		FieldTypes = FieldTypes + "," + "double";
		FieldNulls = FieldNulls + "," + resp[j].dd.fillvalue;
	}

	var header1 = "";
	header1 = 
			{
				"ListTitle": resp[0].datasetinfo.label || resp[0].datasetinfo.name,
				"ListID": resp[0].catalog + "/" + resp[0].datasetinfo.id,
				"FirstDate": res.dd[0].start,
				"LastDate": res.dd[0].stop,
				"FieldNames": FieldNames,
				"FieldUnits": FieldUnits,
				"FieldNulls": FieldNulls,
				"FieldTypes": FieldTypes,
		 		"Description": resp[0].cataloginfo["$"]["label"] || resp[0].cataloginfo["$"]["name"] || ""
		 	}
    header1s = ""
	for (key in header1) {
		header1s += "# " + key + ": " + header1[key] + "\n";
	}
	res["header-1"] = header1s + "# " + header0;

	return res;	
}

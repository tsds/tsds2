var fs     = require("fs") ;
var clc    = require('cli-color');
var mkdirp = require("mkdirp");

// Create directories, add absolute paths if needed.
function init(config) {

	// Base log directory
	config.LOGDIR = config.LOGDIR
	if (!config.LOGDIR.match(/^\//)) {
		// If relative path given for CACHEDIR, prepend with __dirname.
		config.LOGDIR   = __dirname+"/log/"
	}
	config.LOGDIRAPP = config.LOGDIR + "application/";
	// Log directory for application
	if (!fs.existsSync(config.LOGDIRAPP)) {
		// Create log directory if not found
		mkdirp.sync(config.LOGDIRAPP)
	}
	// Log directory for requests
	config.LOGDIRRES = config.LOGDIR + "requests/";
	if (!fs.existsSync(config.LOGDIRRES)) {
		// Create log directory if not found
		mkdirp.sync(config.LOGDIRRES)
	}
	return config
}
exports.init = init;

// Log to console with color
function logc(str,color) {
	var msg = clc.xterm(color);
	console.log(msg(str));
}
exports.logc = logc;

// Log request information to file
function logres(message, res) {
	var tmp = arguments.callee.caller.toString().match(/function ([^\(]+)/) || '';
	callfn = 'main';
	if (tmp.length > 1) {
		callfn = tmp[1];
	}
	if (!res) {
		console.error("logres() function requires two arguments.")
	}
	var entry = (new Date()).toISOString() + ","+callfn+"," + message + "\n";
	//console.log(res.config.LOGDIRRES+res._headers[res.config.LOGHEADER])
	fs.appendFile(res.config.LOGDIRRES+res._headers[res.config.LOGHEADER], entry, 
			function (err) {
				if (err) console.log(err);
			})
}
exports.logres = logres;

// Log application information to file
function logapp(message, res) {

	if (!logapp.nwriting) logapp.nwriting = 0;
	if (!logapp.entries) logapp.entries = "";

	logapp.nwriting = logapp.nwriting + 1;

	var entry = (new Date()).toISOString() + "," + message + "\n";

	logapp.entries = logapp.entries + entry;

	// Prevent too many files from being open at the same time.
	if (logapp.nwriting < 10) {

		var tmp = new Date();
		var yyyymmdd = tmp.toISOString().substring(0,10);
		
		// Write to requests.log
		var file = res.config.LOGDIRAPP + "tsdsfe_"+yyyymmdd+".log";

		fs.appendFile(file, logapp.entries, 
			function(err){
				logapp.entries = "";
				logapp.nwriting = logapp.nwriting - 1;
				if (err) console.log(err);
			});
	}
}
exports.logapp = logapp;

var fs      = require('fs')
var request = require("request")
var clc     = require('cli-color')

function ds() {return (new Date()).toISOString() + " [tsdsfe] "}

function stopdeps(dep) {

		var spawn = require('child_process').spawnSync

		depdir = "../autoplot/"

		options = {"cwd": depdir}

		str = spawn('make',['-s','stop'], options)
		if (str.stdout.toString() !== "")
			console.log(ds() + "autoplot stdout: "
							 + str.stdout.toString().replace(/\n$/,""))
		if (str.stderr.toString() !== "") {
			console.log(str.stderr.length)
			console.log(ds() + "autoplot stderr: " + str.stderr)
		}

}
exports.stopdeps = stopdeps

function startdeps(dep, config) {

	var spawn = require('child_process').spawn
	var execSync = require('child_process').execSync

	if (dep === 'autoplot') {

		depdir = "../autoplot/"
		options = {"cwd": depdir}

		var APPORT = config.AUTOPLOT.replace(/.*:([0-9].*?)\/.*/g,'$1')
		if (APPORT.length === config.AUTOPLOT.length) {
			console.error('AUTOPLOT URL in configuration must have a port: '
							+ config.AUTOPLOT)
			return
		}
		console.log(ds() 
				+ "Starting dependency " 
				+ dep + " in " + depdir + " on port " + APPORT)

		startdeps.datacache = spawn('make',['start'], options)
		
		startdeps.datacache.stdout.on('data', function (data) {
			if (data) {
				if (data.toString().match("Already Running"))
					console.log(ds() + "autoplot is already running.")
			}
		})
		startdeps.datacache.stderr.on('data', function (data) {
			//console.log(ds() + "autoplot stderr: " + data)
		})
		startdeps.datacache.on('close', function (code) {
			console.log(ds() + "autoplot exited with code: " + code)
		})	
	}

	if (dep === 'datacache') {

		if (fs.existsSync("../../datacache/")) {
			depdir = "../../datacache/"
		} else {
			depdir = "./node_modules/datacache/"
		}
		options = {"cwd": depdir}

		var DCPORT = config.DATACACHE.replace(/.*:([0-9].*?)\/.*/g,'$1')
		if (DCPORT.length == config.DATACACHE.length) {
			console.error('DATACACHE URL in configuration must have a port: '
							+ config.DATACACHE)
			return
		}

		// If tsdsfe.js was sent SIGKILL, other spawned processes won't be
		// killed; and a SIGKILL event cannot have a listener in node. 
		// The following kills a spawned datacache server processes before 
		// starting again provided the process string of the spawned process
		// matches a specified string.  The --usedby argument is not used
		// by app.js but is used constrain what the process that is killed.
		var pstr = "node app.js --port " + DCPORT + ' --usedby tsdsfe ' + config.PORT
		//console.log(ds() + "Sending SIGINT to any process matching " + pstr)
		var com = "pkill --signal SIGINT --full '" + pstr + "'"
		execSync(com)

		console.log(ds() 
				+ "Starting dependency " 
				+ dep + " in " + depdir + " on port " + DCPORT)

		startdeps.datacache = spawn('node',
									[
										'app.js', 
										'--port',DCPORT,
										'--usedby','tsdsfe '+config.PORT,
										'--debugall',config.argv.debugall,
									],
									options)
		
		startdeps.datacache.stdout.on('data', function (data) {
			if (config.argv.debugall === 'true') {
				if (data.toString().indexOf("istest=true") == -1) {
					//if (data.toString().indexOf("[datacache]") == -1) {
						process.stdout.write(data.toString())
					//}
				}
			}
		})
		startdeps.datacache.stderr.on('data', function (data) {
			if (data)
				console.log(ds() + "datacache error: " + data.toString().replace(/\n$/,""))
		})
		startdeps.datacache.on('close', function (code) {
			console.log(ds() + "datacache exited with code: " + code)
		})	
	}

	if (dep === 'viviz') {
		if (fs.existsSync("../../viviz/")) {
			depdir = "../../viviz/"
		} else {
			depdir = "./node_modules/viviz/"
		}
		options = {"cwd": depdir}

		var VVPORT = config.VIVIZ.replace(/.*:([0-9].*?)\/.*/g,'$1')

		if (VVPORT.length == config.VIVIZ.length) {
			console.error('VIVIZ URL in configuration must have a port: ' + config.VIVIZ)
			return
		}

		// See explanation in datacache section for an explanation of the
		// of the following.
		var pstr = "node viviz.js --port " + VVPORT + ' --usedby tsdsfe ' + config.PORT
		//console.log(ds() + "Sending SIGINT to any process matching " + pstr)
		var com = "pkill --signal SIGINT --full '" + pstr + "'"
		execSync(com)

		console.log(ds() 
				+ "Starting dependency " 
				+ dep + " in " + depdir + " on port " + VVPORT)

		startdeps.viviz = spawn('node', 
							[
								'viviz.js','--port',VVPORT,
								'--usedby','tsdsfe '+config.PORT
							]
							, options)
		
		startdeps.viviz.stdout.on('data', function (data) {
			if (config.argv.debugall === 'true') {
				process.stdout.write(data)
			}
		})
		startdeps.viviz.stderr.on('data', function (data) {
			if (data)
				console.log(ds() + "viviz error: " + data.toString().replace(/\n$/,""));
		})
		startdeps.viviz.on('close', function (code) {
			console.log(ds() + "viviz exited with code: " + code);
		})	
	}
}
exports.startdeps = startdeps

// Check and report on state of dependencies
function checkdeps(config) {

	if (!checkdeps.status) {
		checkdeps.status = {};
		checkdeps.status["VIVIZ"] = {}
		checkdeps.status["VIVIZ"]["state"] = true
		checkdeps.status["VIVIZ"]["message"] = "Connection to ViViz server has failed.  Requests for galleries will fail.";

		checkdeps.status["DATACACHE"] = {}
		checkdeps.status["DATACACHE"]["state"] = true
		checkdeps.status["DATACACHE"]["message"] = "Connection to DataCache server has failed.  Requests for metadata will continue to work, but requests for data and images will fail.";

		checkdeps.status["AUTOPLOT"] = {}
		checkdeps.status["AUTOPLOT"]["state"] = true
		checkdeps.status["AUTOPLOT"]["message"] = "Connection to Autoplot image server has failed.";
	}

	request(config.VIVIZ,
		function (err,depsres,depsbody) {
			if (err) {
				if (checkdeps.started || checkdeps.status["VIVIZ"]["state"]) {
					clc.red(ds() 
						+ "Error when testing ViViz server: "
						+ config.VIVIZ + "\n  " + err)
					clc.red(ds() 
						+ "Next ViViz check in "
						+ config.DEPSCHECKPERIOD
						+ ' ms.  Only success will be reported.')
				}
				checkdeps.status["VIVIZ"]["state"] = false;
				return
			}
			if (depsres.statusCode != 200) {
				if (checkdeps.status["VIVIZ"]["state"]) {
					clc.red(ds()
						+ "Problem with ViViz server: "
						+ config.VIVIZ)
					clc.red(ds() 
						+ "Next ViViz check in "
						+ config.DEPSCHECKPERIOD
						+ ' ms.  Only success will be reported.')
				}
				checkdeps.status["VIVIZ"]["state"] = false;
			} else {
				if (!checkdeps.status["VIVIZ"]["state"]) {
					clc.green(ds() 
						+ "Problem resolved with ViViz server: "
						+ config.VIVIZ)
				}
				checkdeps.status["VIVIZ"]["state"] = true;
			}
		}
	)

	var teststr = "test/data/file1.txt&forceUpdate=true&forceWrite=true&istest=true"
	request(config.DATACACHE 
				+ "?source=" 
				+ config.DATACACHE.replace("/sync","") 
				+ teststr, 
		function (err,depsres,depsbody) {
			if (err) {
				if (checkdeps.started || checkdeps.status["DATACACHE"]["state"]) {
					clc.red(ds() 
						+ "Error when testing DataCache server: "
						+ config.DATACACHE+"\n  " + err)
					clc.red(ds()
						+ "Next DataCache check in "
						+ config.DEPSCHECKPERIOD
						+ ' ms.  Only success will be reported.')
				}
				checkdeps.status["DATACACHE"]["state"] = false
				return
			}
			if (depsres.statusCode != 200) {
				if (checkdeps.status["DATACACHE"]["state"]) {
					clc.red(ds() 
						+ "Problem with DataCache server "
						+ config.DATACACHE+"\n  " + err)
					clc.red(ds()
						+ "Next DataCache check in "
						+ config.DEPSCHECKPERIOD
						+ ' ms.  Only success will be reported.')
				}
				checkdeps.status["DATACACHE"]["state"] = false
			} else {
				if (!checkdeps.status["DATACACHE"]["state"]) {
					clc.green(ds()
						+ "Problem resolved with DataCache server: "
						+ config.DATACACHE)
				}
				checkdeps.status["DATACACHE"]["state"] = true
			}
		}
	)

	request(config.AUTOPLOT + "?url=vap%2Binline:randn(100)", 
		function (err,depsres,depsbody) {
			if (err) {
				if (checkdeps.started || checkdeps.status["AUTOPLOT"]["state"]) {
					clc.red(ds() 
						+ "Error when testing Autoplot server: "
						+ config.AUTOPLOT + "\n  " + err)
					clc.red(ds() 
						+ "Next Autoplot check in "
						+ config.DEPSCHECKPERIOD
						+ ' ms.  Only success will be reported.')
				}
				checkdeps.status["AUTOPLOT"]["state"] = false
				return
			}
			if (checkdeps.started) {
				if (config.TSDSFE.match(/http:\/\/localhost/)) {
					if (!config.AUTOPLOT.match(/http:\/\/localhost/)) {
						clc.yellow(ds() 
							+ "Warning: Image request will not work"
							+ " because Autoplot image servlet specified by "
							+ " config.AUTOPLOT must be localhost if "
							+ " config.TSDSFE is localhost.")
					}
				}
			}
			if (depsres.statusCode != 200) {
				if (checkdeps.status["AUTOPLOT"]["state"]) {
					clc.red(ds()
						+ "Problem with Autoplot server: "
						+ config.AUTOPLOT)
					if (!depsbody) {
					    lclc.red(" Status code: " + depsres.statusCode, 160)
					} else {
						var depsbodyv = depsbody.split("\n");
						for (var i = 1; i < depsbodyv.length; i++) {
							if (depsbodyv[i].match(/Error|org\.virbo/)) {
								clc.red(" " + 
										depsbodyv[i]
										.replace(/<[^>]*>/g,"")
										.replace("Server Error",""))
							}
						}
					}
					clc.red(ds() 
							+ "Next Autoplot check in "
							+ config.DEPSCHECKPERIOD
							+ ' ms.  Only success will be reported.')
				}
				checkdeps.status["AUTOPLOT"]["state"] = false;
			} else {
				if (!checkdeps.status["AUTOPLOT"]["state"]) {
					clc.green(ds() 
						+ "Problem resolved with Autoplot server: "
						+ config.AUTOPLOT)
				}
				checkdeps.status["AUTOPLOT"]["state"] = true;
			}
		}
	)
}
exports.checkdeps = checkdeps

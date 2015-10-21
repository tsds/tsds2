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
			//if (config.argv.debugall === 'true') {
				if (data.toString().indexOf("istest=true") == -1) {
					//if (data.toString().indexOf("[datacache]") == -1) {
						process.stdout.write(data.toString())
					//}
				}
			//}
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

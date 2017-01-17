var request = require("request")
var fs      = require('fs')
var mkdirp  = require('mkdirp')

function ds() {return (new Date()).toISOString() + " [tsdsfe] "}

function tests(config, server) {

	var TESTS =
		{
			"ViViz":
			{
				"check": function (body) {
							if (!body) {
								console.log("!body is true")
								return false
							}
							return true
						},
				"type": "dependency",
				"interval": config.DEPSCHECKPERIOD,
				"url": config.VIVIZ
			},
			"DataCache":
			{
				"check": function (body) {

							if (!body) {
								console.log("!body is true")
								return false
							}
							var len = 32204
							if (body.length == len) {
								return true
							} else {
								console.log("body.length == "+len+" returned false.  body.length = "+body.length)
								return false
							}
						},
				"type": "dependency",
				"interval": config.DEPSCHECKPERIOD,
				"url": config.DATACACHE + "?source=" + config.DATACACHE.replace("/sync","") + "test/data/file1.txt&forceUpdate=true&forceWrite=true&return=stream&istest=true"
			},
			"Autoplot":
			{
				"check": function (body,headers) {

							if (!body) {
								console.log("!body is true")
								return false
							}

							//console.log(headers)
							// Crude and delicate method to extract metadata from PNG.
							//console.log(body.toString().substring(0,1000))
							//console.log(body.toString().match(/plotInfo([\s\S]*) \]}/)[0])

							if (headers["content-type"] === "image/png") {
								return true
							}
							console.log(body)
							return false
						},
				"type": "dependency",
				"interval": config.DEPSCHECKPERIOD,
				"url": config.AUTOPLOT + "?url=vap%2Binline:linspace(0,1,10)"
			},
			"SSCWeb":
			{
				"check": function (body) {
							if (!body) {
								console.log("Response has empty body");
								return false;
							}
							if (body.length == 3960) {
								return true;
							} else {
								console.log("SSCWeb: Expected body.length == 3960.  Got " + body.length)
								return false;								
							}
						},
				"type": "server",
				"interval": 3600000,
				"respectHeaders": false,
				"url": config.TSDSFE + "?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-08-16&stop=2014-08-17&return=data&usedatacache=false&istest=true"
			}
			,
			"CDAWeb":
			{
				"check": function (body) {
							if (!body) {
								console.log("Response has empty body");
								return false;
							}

							if (body.length == 35706) {
								return true;
							} else {
								console.log("CDAWeb: Expected body.length == 35706.  Got " + body.length)
								return false;
							}
						},
				"type": "server",
				"interval": 3600000,
				"respectHeaders": false,
				"url": config.TSDSFE + "?catalog=CDAWeb&dataset=AC_H1_MFI&parameters=Magnitude&start=-P3D&stop=2014-08-13&return=data&usedatacache=false&istest=true"
			},
			"IMAGE/PT1M":
			{
				"check": function (body) {
							if (!body) {
								console.log("Response has empty body");
								return false;
							}
							if (body.length == 142560) {
								return true;
							} else {
								console.log("IMAGE/PT1M: Expected body.length == 142560.  Got " + body.length)
								return false;								
							}
						},
				"type": "server",
				"interval": 60000,
				"url": config.TSDSFE + "?catalog=IMAGE/PT1M&dataset=ABK&parameters=X&start=-P3D&stop=2014-09-30&return=data&usedatacache=false&istest=true"
			}
		}

if (0) {
		junk = {"SuperMAG/PT1M":
			{
				"check": function (body) {
							if (!body) return false
							return body.length == 142560
						},
				"type": "server",
				"interval": 3600000,
				"url": config.TSDSFE + "?catalog=SuperMAG/PT1M&dataset=AAA&parameters=B_N&start=-PT3D&stop=2013-12-31&return=data&usedatacache=false&istest=true"
			}
		}
}

	if (server) {
		return TESTS[server]
	} else {
		return TESTS
	}
}
exports.tests = tests

function checkservers(config, server) {

	TESTS = tests(config)

	if (!checkservers.status) {

		checkservers.status = {};
		var k = 0;
		for (var key in TESTS) {
			if (config.argv.checkdeps && TESTS[key].type === "dependency") {
				console.log(ds() + "Checking dependency " + key + " every " 
								 + TESTS[key].interval/1000 + " seconds.")

				checkservers(config, key)
			}
			if (config.argv.checkservers && TESTS[key].type === "server") {
				console.log(ds() + "Checking server " + key + " every " 
								 + TESTS[key].interval/1000 + " seconds.")
				checkservers(config, key)
			}
			// Stagger initialization of each test by k seconds.
			//setInterval(function() {checkservers(config, key)}, 1000*k)
			//k = k+1
		}
		return
	}

	if (!checkservers.status[server]) {
		var dir = __dirname + "/log/servers/" + server
		mkdirp.sync(dir);

		checkservers.status[server] = {}
		checkservers.status[server]["state"] = true
		checkservers.status[server]["checkperiod"] = TESTS[server]["interval"]
		checkservers.status[server]["testnum"] = 0
		checkservers.status[server]["url"] = TESTS[server]["url"]
		checkservers.status[server]["type"] = TESTS[server]["type"]
		checkservers(config, server)
		setInterval(function() {checkservers(config, server)},
					checkservers.status[server]["checkperiod"])
		return
	}

	checkservers.status[server]["lastcheck"] = (new Date).getTime()
	function logit(stat, size) {
		dt = (new Date()).getTime() - checkservers.status[server]["lastcheck"]
		message = (new Date()).toISOString() + " " + dt + " " + stat + " " + size + "\n"
		//console.log(server + " " + message)
		var dir = __dirname + "/log/servers/" + server
		fs.appendFile(dir + "/" + (new Date()).toISOString().substring(0,10)+".txt", message)
	}

	//console.log(ds() + "Running test: " + TESTS[server]["url"])
	request(TESTS[server]["url"],
		function (err,depsres,depsbody) {
			if (err) {
				if (checkservers.status[server]["testnum"] == 0 || checkservers.status[server]["state"]) {
					console.log(ds() 
						+ "Error when testing " + server + ":\n  "
						+ err)
					console.log(TESTS[server]["url"])
					console.log(ds()
						+ "Next test in "
						+ checkservers.status[server]["checkperiod"]
						+ " ms.")
				}
				checkservers.status[server]["state"] = false;
				checkservers.status[server]["message"] = "Connection to " + server + " server has failed."
				logit(0,-1)
				return
			}

			var ok = TESTS[server]["check"](depsbody, depsres.headers)
			if (depsres.statusCode != 200 || !ok) {
				var msg = ""
				if (depsres.statusCode != "200") {
					msg = "Test request returned status code: "
							+ depsres.statusCode + "; expected 200."
					logit(depsres.statusCode,-1)
				} else if (!ok) {
					msg = "Test on response headers and body returned did not pass."
					var len = -1;
					if (depsres.body) {
						len = depsres.body.length
					}
					logit(depsres.statusCode,len)
				}
				console.log(ds() + "Problem with " + server + ": " + msg)
				console.log("\tTest URL: " + TESTS[server]["url"])
				console.log(ds() 
							+ "Next test on " + server + " in " 
							+ checkservers.status[server]["checkperiod"] 
							+ " ms.")
				//if (checkservers.status[server]["state"]) {
				// If last state was working and this test failed.
				//}
				checkservers.status[server]["state"] = false;
				checkservers.status[server]["message"] = "Connection to " + server + " server has failed."
			} else {
				if (!checkservers.status[server]["state"]) {
					console.log(ds() + "Problem resolved with " + server + ".")
				}
				checkservers.status[server]["state"] = true
				checkservers.status[server]["message"] = "Connection to " + server + " working."
				logit(depsres.statusCode,depsres.body.length)
			}
		}
	)

}
exports.checkservers = checkservers

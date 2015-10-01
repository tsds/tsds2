var request = require("request")

function ds() {return (new Date()).toISOString() + " [tsdsfe] "}

function checkservers(config, server) {

	// [{server: "SSCWeb", url: "", check: function (body) {} }, {server: "IMAGE", url: "", check: function (body) {} }]
	if (!checkservers.status) {
		checkservers.status = {};
		server = "SSCWeb"
		var k = 0;
		//for (var key in SERVERTESTS) {
		//  Stagger initialization of each test by k seconds.
		//	setInterval(function() {checkservers(config, SERVERTEST[key])}, 1000*k)
		//  k = k+1;
		//}
	}

	if (!checkservers.status[server]) {

		checkservers.status[server] = {}
		checkservers.status[server]["state"] = false
		checkservers.status[server]["checkperiod"] = 60000
		checkservers.status[server]["testnum"] = 0
		checkservers(config, server)
		setInterval(function() {checkservers(config, server)}, checkservers.status[server]["checkperiod"])
		return
	}

	checkservers.status[server]["lastcheck"] = (new Date).getTime();

	if (server === "SSCWeb") {

		var testurl = "?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-08-16&stop=2014-08-17&return=data&usedatacache=false"
		request(config.TSDSFE + testurl,
			function (err,depsres,depsbody) {
				if (err) {
					if (checkservers.status["SSCWeb"]["testnum"] == 0 || checkservers.status["SSCWeb"]["state"]) {
						log.logc(ds() 
							+ "Error when testing SSCWeb:\n  "
							+ err,160)
						console.log(config.TSDSFE + testurl, 160)
						console.log(ds()
							+ "Next test in "
							+ checkservers.status["SSCWeb"]["checkperiod"]
							+ " ms.  Only success will be reported.", 160)
					}
					checkservers.status["SSCWeb"]["state"] = false;
					checkservers.status[server]["message"] = "Connection to SSCWeb server has failed."
					return
				}
				if (depsres.statusCode != "200" || depsbody.length != 3960) {
					if (checkservers.status["SSCWeb"]["state"]) {
						var msg = ""
						if (depsres.statusCode != "200") {
							msg = "Test request returned status code: "
									+ depsres.statusCode+"; expected 200."
						}
						if (depsbody.length != 11880) {
							msg = "Test request returned body of length: "
									+ depsbody.length+"; expected 3960."
						}
						console.log(ds() + "Problem with SSCWeb: " + msg, 160)
						console.log(config.TSDSFE + testurl, 160)
						console.log(ds() 
									+ "Next test in " 
									+ checkservers.status["SSCWeb"]["checkperiod"] 
									+ " ms.  Only success will be reported.", 160)
					}
					checkservers.status["SSCWeb"]["state"] = false;
					checkservers.status[server]["message"] = "Connection to SSCWeb server has failed."
				} else {
					if (!checkservers.status["SSCWeb"]["state"]) {
						console.log(ds() + "Problem resolved with SSCWeb.", 10)
					}
					checkservers.status["SSCWeb"]["state"] = true
					checkservers.status[server]["message"] = "Connection to SSCWeb working."
				}
			}
		)
	}
}
exports.checkservers = checkservers

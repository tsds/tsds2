var request = require("request")

function checkservers(config) {

	if (!checkservers.status) {
		checkservers.status = {};
		checkservers.status["SSCWeb"] = {}
		if (!checkservers.status["SSCWeb"]["state"]) {
			checkservers.status["SSCWeb"]["state"] = true
		}
		checkservers.status["SSCWeb"]["message"] = "Connection to SSCWeb server has failed."
		checkservers.status["SSCWeb"]["checkperiod"] = 60000
	}

	setTimeout(checkservers, checkservers.status["SSCWeb"]["checkperiod"])

	checkservers.status["SSCWeb"]["lastcheck"] = (new Date).getTime();

	var testurl = "?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-08-16&stop=2014-08-17&return=data&usedatacache=false"
	request(config.TSDSFE + testurl,
		function (err,depsres,depsbody) {
			if (err) {
				if (startup || checkservers.status["SSCWeb"]["state"]) {
					log.logc((new Date()).toISOString() 
						+ " [tsdsfe] Error when testing SSCWeb:\n  "
						+ err,160)
					log.logc(config.TSDSFE + testurl, 160)
					log.logc((new Date()).toISOString()
						+ " [tsdsfe] Next test in "
						+ checkservers.status["SSCWeb"]["checkperiod"]
						+ " ms.  Only success will be reported.", 160)
				}
				checkservers.status["SSCWeb"]["state"] = false;
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
					log.logc((new Date()).toISOString() 
								+ " [tsdsfe] Problem with SSCWeb: " + msg, 160)
					log.logc(config.TSDSFE + testurl, 160)
					log.logc((new Date()).toISOString() 
								+ " [tsdsfe] Next test in " 
								+ checkservers.status["SSCWeb"]["checkperiod"] 
								+ " ms.  Only success will be reported.", 160)
				}
				checkservers.status["SSCWeb"]["state"] = false;
			} else {
				if (!checkservers.status["SSCWeb"]["state"]) {
					log.logc((new Date()).toISOString() 
								+ " [tsdsfe] Problem resolved with SSCWeb.", 10)
				}
				checkservers.status["SSCWeb"]["state"] = true
			}
		}
	)
}
exports.checkservers = checkservers

var debug = false;
function expandDD(qs, cb) {

	if (typeof(qs) === "object") {
		debug  = qs.debug;
		var qs = qs.queryString;
	}
	if (typeof(qs) === "string") {
		qo = parseQueryString(qs)
	}
	if (!qo["uri"]) {
		throw new Error('uri is required.')
		return
	}

	if (!qo["start"] || !qo["stop"]) {
		if (debug) {
			console.log("Start or stop not given.  Will " 
						+ "attempt to infer from " + qo["uri"]);
		}
		if (qo["uri"].match(/\/$/)) {
			var dirwalk = require('./dirwalk.js').dirwalk;
			console.log("Calling dirwalk with URI: " + qo["uri"]);
			dirwalk(qo["uri"], function (error, list, flat, nested) {
				if (error) console.log(error);
				console.log(list)
				cb(list);
				//flat.sort();
				//findstartstop(first, last, qo, cb)
				//console.log(flat);
			})
			return;
		}
		get()
	} else {
		createcat(qo, cb)
	}

	function get() {
		var request = require("request");
		var opts = { method: 'GET', uri: qo["uri"], gzip: true };
		var first = ""
		var last = ""
		doget()

		function doget() {
			request.get(opts)
				.on('data', function (data) {
					//console.log("Got chunk:\n" + data)
					if (first === "") {
						first = data
					}
					if (last === "") {
						last = data
					}
				})
				.on('error', function (err) {
					if (debug) console.log('Got error.');
					cb(err);
				})
				.on('end', function () {
					findstartstop(first, last, qo, 
						function () {findstartstop(first, last, qo, cb)});
					if (debug) console.log('Got end');
				})
		}
	}

}

function parseQueryString(qs) {
	tmpa = qs.split("&");
	var qo = {};
	for (var i = 0; i < tmpa.length; i++) {
		tmps = tmpa[i];
		kv = tmps.split("=");
		qo[kv[0]] = kv[1];
	}
	qo["querystring"] = qs;
	return qo;
}

function createcat(qo, cb) {

	qo["datasetID"] = qo["datasetID"] || ""
	qo["datasetLabel"] = qo["datasetLabel"] || qo["datasetID"]

	if (qo["start"] && qo["stop"] && qo["uri"]) {
		var start = qo["start"].split(/\n/)
		var stop = qo["stop"].split(/\n/)
		var uri = qo["uri"].split(/\n/)
		var datasetID = qo["datasetID"].split(/\n/)
		var datasetLabel = qo["datasetLabel"].split(/\n/)

		if (start.length == 1 && stop.length == 1 && uri.length == 1 && datasetID.length == 1 && datasetLabel.length == 1) {
			if (debug) console.log(qo);
			cat = singular(qo);
		} else {
			// TODO
		}
	} else {
		throw new Error('uri, start, and stop values are required.')
		return;
	}
	cb("", cat)

	function singular(qo) {

		var dataset = 
			[
				{
					"$": {"id":"","name":"","timecolumns":"","timeformat":"","urltemplate":""},
					"variables":
						[{
							"variable": []
						}]
				}
			]

		var cat = 
		{
			"catalog":
				{
					"$": {
							"xmlns:xlink": "http://www.w3.org/1999/xlink",
							"id": "",
							"name": ""
						},
					"documentation":
						[
							{"$":{"xlink:href":"","xlink:title":""}}
						],
					"timeCoverage":
						[{
							"Start":[""],
							"End":[""]
						}],
					"dataset": dataset
				}
		}

		cat["catalog"]["timeCoverage"][0]["Start"][0] = qo["start"]
		cat["catalog"]["timeCoverage"][0]["End"][0] = qo["stop"]
		delete cat["catalog"]["timeCoverage"][0]["Cadence"]

		if (qo["catalogID"]) {
			cat["catalog"]["$"]["id"] = qo["catalogID"]
		} else {
			cat["catalog"]["$"]["id"] = qo["uri"]
		}
		if (qo["catalogLabel"]) {
			cat["catalog"]["$"]["name"] = qo["catalogLabel"]
		} else {
			cat["catalog"]["$"]["name"] = cat["catalog"]["$"]["id"]
		}

		cat["catalog"]["documentation"][0]["$"]["xlink:title"] = 
				"Catalog derived from string " + qo["querystring"]

		if (qo["datasetID"]) {
			dataset[0]["$"]["id"] = qo["datasetID"]
		} else {
			dataset[0]["$"]["id"] = "1"
		}
		if (qo["datasetLabel"]) {
			dataset[0]["$"]["name"] = qo["datasetLabel"]
		} else {
			dataset[0]["$"]["name"] = dataset[0]["$"]["id"]
		}

		dataset[0]["$"]["urltemplate"] = qo["uri"]

		if (qo["timeColumns"]) {
			dataset[0]["$"]["timecolumns"] = qo["timeColumns"]
		} else {
			dataset[0]["$"]["timecolumns"] = "1"
		}

		if (qo["timeFormat"]) {
			dataset[0]["$"]["timeformat"] = qo["timeFormat"]
		} else {
			dataset[0]["$"]["timeformat"] = "$Y-$m-$dT$H:$M:$S.$(millis)Z"
		}

		var columns = qo["columns"] || "2"
		columns = columns.split(",")
		var units = qo["units"] || ""
		units = units.split(",")
		var columnIDs = qo["columnIDs"] || ""
		columnIDs = columnIDs.split(",")
		var columnLabels = qo["columnLabels"] || ""
		columnLabels = columnLabels.split(",")

		for (var j = 0; j < columns.length; j++) {
			if (units.length != columns.length) {
				units[j] = units[0]					
			}
			if (columnIDs.length != columns.length) {
				columnIDs[j] = columnIDs[0]					
			}
			if (columnLabels.length != columns.length) {
				columnLabels[j] = columnLabels[0]					
			}

			dataset[0]["variables"][0]["variable"][j] = {}
			dataset[0]["variables"][0]["variable"][j]["$"] = {}
			dataset[0]["variables"][0]["variable"][j]["$"]["columns"] = columns[j]
			if (units[j]) {
				dataset[0]["variables"][0]["variable"][j]["$"]["units"] = units[j]
			}
			if (columnIDs[j]) {
				dataset[0]["variables"][0]["variable"][j]["$"]["id"] = columnIDs[j]
			}
			if (columnLabels[j]) {
				dataset[0]["variables"][0]["variable"][j]["$"]["label"] = columnLabels[j]
			}
		}

		return cat
	}
}

function findstartstop(firstc, lastc, qo, cb) {

	if (typeof(qo) === "string") {
		qo = parseQueryString(qo)
	}

	// Expressions are checked in order until a match.
	var checks = [
			{
				"expression": "[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{9}",
				"timeformat": "$Y-$m-$dT$H:$M:$S.$N"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}",
				"timeformat": "$Y-$m-$dT$H:$M:$S.$(micros)"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}",
				"timeformat": "$Y-$m-$dT$H:$M:$S.$(millis)"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}",
				"timeformat": "$Y-$m-$dT$H:$M:$S"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}",
				"timeformat": "$Y-$m-$dT$H:$M"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}",
				"timeformat": "$Y-$m-$dT$H"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{2}\-[0-9]{2}",
				"timeformat": "$Y-$m-$d"
			},
			{
				"expression": "[0-9]{2}\-[0-9]{2}\-[0-9]{4}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.:[0-9]{9}",
				"timeformat": "$d-$m-$YT$H:$M:$S.$N"
			},
			{
				"expression": "[0-9]{2}\-[0-9]{2}\-[0-9]{4}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.:[0-9]{6}",
				"timeformat": "$d-$m-$YT$H:$M:$S.$(micros)"
			},
			{
				"expression": "[0-9]{2}\-[0-9]{2}\-[0-9]{4}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.:[0-9]{3}",
				"timeformat": "$d-$m-$YT$H:$M:$S.$(millis)"
			},
			{
				"expression": "[0-9]{2}\-[0-9]{2}\-[0-9]{4}T[0-9]{2}:[0-9]{2}:[0-9]{2}",
				"timeformat": "$d-$m-$YT$H:$M:$S"
			},
			{
				"expression": "[0-9]{2}\-[0-9]{2}\-[0-9]{4}T[0-9]{2}:[0-9]{2}",
				"timeformat": "$d-$m-$YT$H:$M"
			},
			{
				"expression": "[0-9]{2}\-[0-9]{2}\-[0-9]{4}T[0-9]{2}",
				"timeformat": "$d-$m-$YT$H"
			},
			{
				"expression": "[0-9]{2}\-[0-9]{2}\-[0-9]{4}",
				"timeformat": "$d-$m-$Y"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{3}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.:[0-9]{9}",
				"timeformat": "$Y-$jT$H:$M:$S.$N"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{3}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.:[0-9]{6}",
				"timeformat": "$Y-$jT$H:$M:$S.$(micros)"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{3}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.:[0-9]{3}",
				"timeformat": "$Y-$jT$H:$M:$S.$(millis)"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{3}T[0-9]{2}:[0-9]{2}:[0-9]{2}",
				"timeformat": "$Y-$jT$H:$M:$S"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{3}T[0-9]{2}:[0-9]{2}",
				"timeformat": "$Y-$jT$H:$M"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{3}T[0-9]{2}",
				"timeformat": "$Y-$jT$H"
			},
			{
				"expression": "[0-9]{4}\-[0-9]{3}",
				"timeformat": "$Y-$j",
				"typelist": "1,3,4"
			},
			{
				"expression": "[0-9]{10}",
				"timeformat": "$Y-$m-$d",
				"timeunits": "seconds since 1970-01-01T00:00:00Z",
				"typelist": "1,3,4"
			}
		]


	if (debug) console.log("First chunk:\n" + firstc);
	if (debug) console.log("Last chunk:\n" + lastc);

	for (var i = 0; i < checks.length; i++) {

		if (checks[i].types) {
			types = checks[i].types.split(",");
		} else {
			types = "0,1,2,3,4".split(",");
		}

		for (var type in types) {
			var expression = checks[i].expression
			if (type == "0") {

			} else if (type == "1") {
				expression = expression.replace(/T|:/g," ").replace(/\-\[/g," [");
			} else if (type == "2") {
				expression = expression.replace(/T/," ");
			} else if (type == "3") {
				expression = expression.replace(/T/," ").replace(/:/g,"");
			} else if (type == "4") {
				expression = expression.replace(/T|:/g," ").replace(/\-\[/g,"");				
			} else {
				break;
			}

			if (debug) console.log("Match expression:  " + expression)

			var coli = 0;
			var colf = expression.split(" ").length;

			var firsta = firstc.toString().replace(/^\s+/g, "").split("\n");
			var firstl = firsta[0].split(/\s|,/).slice(coli,colf).join(" ");
			var lasta = lastc.toString().replace(/\s+$/g, "").split("\n");
			var lastl = lasta[lasta.length-1].split(/\s|,/).slice(coli,colf).join(" ");
			if (debug) console.log("First test string: " + firstl);
			if (debug) console.log("Last test string:  " + lastl);

			var firstm = firstl.match(expression);
			if (firstm) {
				if (debug) console.log("First test string matches " + expression);
				qo["start"] = firstl;
				if (firstl[firstl.length - 1] === "Z") {
					qo["timeFormat"] = checks[i].timeformat + "Z";
				} else {
					qo["timeFormat"] = checks[i].timeformat;
				}
				if (checks[i].timeunits) {
					qo["timeUnits"] = checks[i].timeunits;
				}
				if (colf > 1) {
					qo["timeColumns"] = coli + "-" + (colf - 1)
				}
			}

			var lastm = lastl.match(expression);
			if (lastm) {
				if (debug) console.log("Last test string matches  " + expression);
				qo["stop"] = lastl;
				if (lastl[lastl.length - 1] === "Z") {
					qo["timeformat"] = checks[i].timeformat + "Z";
				} else {
					qo["timeformat"] = checks[i].timeformat;
				}
				
			}
			if (firstm && lastm) {
				if (!cb) {
					return qo;
				} else {
					createcat(qo, cb);
					return;
				}
			}
			if (firstm || lastm) {
				if (!cb) {
					throw new Error("Timeformat for first and last lines to not match.");
				} else {
					cb(new Error("Timeformat for first and last lines to not match."));
				}	
			}
		}
	}
	if (!cb) {
		throw new Error("Timeformat for first and last lines to not match.");		
	} else {
		cb(new Error("Could not find match for timeformat."));		
	}
}

if (typeof(exports) !== "undefined" && require) {
	exports.expandDD = expandDD
	exports.findstartstop = findstartstop
}

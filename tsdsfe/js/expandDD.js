var fs = require('fs');
var crypto = require("crypto")

path = "dirwalk/dirwalk.js"
if (fs.existsSync("../../../" + path)) {
	// Development
	var dirwalk = require("../../../" + path).dirwalk
} else {
	// Production
	var dirwalk = require("../node_modules/"+path).dirwalk
}

var debug = false;
function expandDD(qs, cb) {

	if (typeof(qs) === "object") {
		debug  = qs.debug;
		var qs = qs.queryString;
	}

	if (typeof(qs) === "string") {
		qo = parseQueryString(qs);
		qo.queryString = qs;
	}

	if (!qo["uri"]) {
		if (typeof(cb) === "function") {
			cb(new Error('uri is required.'));
		} else {
			throw new Error('uri is required.');
		}
		return;
	}

	if (!qo["start"] || !qo["stop"]) {
		if (debug) {
			console.log("Start or stop not given.  Will " 
						+ "attempt to infer from " + qo["uri"]);
		}
		findstartstop(qo, 
			function (err, qo) {
				if (err) {
					cb(err);
				} else {
					createcat(qo, cb);
				}
			});
	} else {
		createcat(qo, cb);
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
					"$": {"id":"","timecolumns":"","timeformat":"","urltemplate":""},
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
							"id": ""
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

		var id = crypto.createHash("md5").update(qo["queryString"]).digest("hex")
		if (qo["catalogID"]) {
			cat["catalog"]["$"]["id"] = qo["catalogID"];
		} else {
			cat["catalog"]["$"]["id"] = id;
		}
		if (qo["catalogLabel"]) {
			cat["catalog"]["$"]["name"] = qo["catalogLabel"]
		} else {
			//cat["catalog"]["$"]["name"] = cat["catalog"]["$"]["id"]
		}

		cat["catalog"]["documentation"][0]["$"]["xlink:href"] = "http://tsds.org/dd/"
	
		cat["catalog"]["documentation"][0]["$"]["xlink:title"] = 
				"Catalog derived from DD string " + qo["querystring"]

		if (qo["datasetID"]) {
			dataset[0]["$"]["id"] = qo["datasetID"]
		} else {
			dataset[0]["$"]["id"] = "1"
		}
		if (qo["datasetLabel"]) {
			dataset[0]["$"]["name"] = qo["datasetLabel"]
		} else {
			//dataset[0]["$"]["name"] = dataset[0]["$"]["id"]
		}

		dataset[0]["$"]["urltemplate"] = qo["uri"]

		if (qo["timeFormat"]) {
			dataset[0]["$"]["timeformat"] = qo["timeFormat"]
		} else {
			dataset[0]["$"]["timeformat"] = "$Y-$m-$dT$H:$M:$S.$(millis)Z"
		}

		if (qo["timeColumns"]) {
			var len = 1;
			dataset[0]["$"]["timecolumns"] = qo["timeColumns"];
			// TODO: Verify # of time columns matches what is expected
			// based on timeformat.
		} else {
			var len = dataset[0]["$"]["timeformat"].split(" ").length
			if (len == 1) {
				dataset[0]["$"]["timecolumns"] = "1";
			} else {
				dataset[0]["$"]["timecolumns"] = "1-" + len;	
			}
		}

		if (0) {
			if (dataset[0]["$"]["timecolumns"].match(/[0-9]\-[0-9]/)) {
				var tmp = dataset[0]["$"]["timecolumns"].split("-");
				var start = parseInt(tmp[0]);
				var stop  = parseInt(tmp[1]);

			}
		}

		var fillValues = [];
		if (qo["fillValues"].split(",").length == 1) {
			// fillValues apply to all variables.
			dataset[0]["$"]["fillvalue"] = qo["fillValues"];
		} else {
			fillValues = qo["fillValues"].split(",");
		}

		var columns = qo["columns"] || "" + (len + 1)
		columns = columns.split(",")
		var units = qo["units"] || ""
		units = units.split(",")
		if (!qo["columnIDs"]) {
			columnIDs = [];
		} else {
			columnIDs = qo["columnIDs"].split(",")
		}
		var columnLabels = qo["columnLabels"] || ""
		columnLabels = columnLabels.split(",")

		//console.log(columns)
		for (var j = 0; j < columns.length; j++) {
			if (units.length == 1) {
				units[j] = units[0]					
			}
			if (columnLabels.length == 1) {
				columnLabels[j] = columnLabels[0]					
			}
			if (fillValues.length == 1) {
				fillValues[j] = fillValues[0]					
			}

			dataset[0]["variables"][0]["variable"][j] = {}
			dataset[0]["variables"][0]["variable"][j]["$"] = {}
			dataset[0]["variables"][0]["variable"][j]["$"]["columns"] = columns[j]

			var columnstr = "column";
			if (columns[j].match(/[0-9]\-[0-9]/)) {
				columnstr = "columns";
			}

			if (fillValues[j]) {
				dataset[0]["variables"][0]["variable"][j]["$"]["fillvalue"] = fillValues[j]
			}

			if (columnIDs[j]) {
				dataset[0]["variables"][0]["variable"][j]["$"]["id"] = columnIDs[j]
			} else {
				dataset[0]["variables"][0]["variable"][j]["$"]["id"] =  columnstr + columns[j];
			}
			if (units[j]) {
				dataset[0]["variables"][0]["variable"][j]["$"]["units"] = units[j]
			}
			if (columnLabels[j]) {
				dataset[0]["variables"][0]["variable"][j]["$"]["label"] = columnLabels[j]
			} else {
				if (qo["columnIDs"]) {
					dataset[0]["variables"][0]["variable"][j]["$"]["label"] = columnIDs[j]
				} else {
					dataset[0]["variables"][0]["variable"][j]["$"]["label"] = columnstr + columns[j]
				}
			}

		}

		return cat
	}
}

function findstartstop(qo, cb) {

	if (typeof(qo) === "string") {
		qo = parseQueryString(qo);
	}

	if (qo["uri"].match(/\/$/)) {
		console.log("Calling dirwalk with URI: " + qo["uri"]);
		var dopts = {url: qo["uri"], filepattern: "file[0-9]\.dat"}
		function finish (err, q) {
			console.log("Finish called.")
			console.log(q);
			// Add new elements in q to qo when finished has been called 2x.
		}
		dirwalk(dopts, function (error, list, flat, nested) {
			if (error) console.log(error);
			console.log(list)
			getchunks(qo["uri"] + list[0], function (err, first, last) {
				inspectchunks(first, last, function (err, q) {
					finish(err, q)
				})
			})
			getchunks(qo["uri"] + list[list.length-1], function (err, first, last) {
				inspectchunks(first, last, function (err, q) {
					finish(err, q)
				})
			})
		})
		return;
	} else {
		getchunks(qo["uri"], function (err, first, last) {
			inspectchunks(first, last, function (err, q) {
				// Add new elements in q to qo.
				// TODO: Don't over-ride.
				for (var key in q) {
					qo[key] = q[key];
				}
				cb(err, qo)
			})
		});
	}
}

function getchunks(uri, cb) {
	var request = require("request");
	var opts = { method: 'GET', uri: uri, gzip: true };
	var first = ""
	var last = ""
	var err = "";
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
			cb(err, first, last);
			if (debug) console.log('Got end');
		})
}

function inspectchunks(firstc, lastc, cb) {
	var qo = {};
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
	var err = ""
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
					cb(err, qo);
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

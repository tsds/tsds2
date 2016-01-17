var fs = require('fs');
var crypto = require("crypto")

// http://momentjs.com/docs/
var moment = require("moment");

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
		if (debug) console.log("Start and stop time not given.  Will attempt to infer both from " + qo["uri"]);
		if (qo["start"] && !qo["stop"]) {
			if (debug) console.log("Start but not stop time given.  Will attempt to infer stop from " + qo["uri"]);
		}
 		if (!qo["start"] && qo["stop"]) {
			if (debug) console.log("Stop but not start time given.  Will attempt to infer start from " + qo["uri"]);
		}
		findstartstop(qo, 
			function (err, qo) {
				if (err) {cb(err)} else {createcat(qo, cb)}
			});
	} else {
		if (debug) console.log("Both start and stop time given.  Will not attempt to infer either from " + qo["uri"]);
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
			if (debug) console.log("Createcat called with qo = ");
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
		if (qo["fillValues"]) {
			if (qo["fillValues"].split(",").length == 1) {
				// fillValues apply to all variables.
				dataset[0]["$"]["fillvalue"] = qo["fillValues"];
			} else {
				fillValues = qo["fillValues"].split(",");
			}
		}

		var columns = qo["columns"] || "" + (len + 1)
		columns = columns.split(",")
		var columnUnits = qo["columnUnits"] || ""
		columnUnits = columnUnits.split(",")
		if (!qo["columnIDs"]) {
			columnIDs = [];
		} else {
			columnIDs = qo["columnIDs"].split(",")
		}
		var columnLabels = qo["columnLabels"] || ""
		columnLabels = columnLabels.split(",")

		//console.log(columns)
		for (var j = 0; j < columns.length; j++) {
			if (columnUnits.length == 1) {
				columnUnits[j] = columnUnits[0]					
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
			if (columnUnits[j]) {
				dataset[0]["variables"][0]["variable"][j]["$"]["units"] = columnUnits[j]
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

function time2iso(timestamp, timeformat) {

	if (debug) console.log("time2iso(): Called with timeformat = "
							+ timeformat + " and timestamp = " + timestamp);

	var timeformat = timeformat
						.replace("$Y","YYYY")
						.replace("$m","MM")
						.replace("$H","HH")
						.replace("$M","mm")
						.replace("$d",'DD')
						.replace("$S","SS.sss")
						.replace("$j","DDD")
						.replace("$(millis)","SSS");

	if (debug) console.log("time2iso(): timeformat converted to format used by moment.js: " + timeformat);

	var iso = moment(timestamp, timeformat).toISOString();

	if (debug) console.log("time2iso(): Computed ISO8601 timestamp: " + iso);

	return iso;
}

function findstartstop(qo, cb) {

	if (typeof(qo) === "string") {
		qo = parseQueryString(qo);
	}

	var idx = qo["uri"].indexOf("$")
	if (idx > -1) {
		if (debug) console.log("URI contains a template.");
		var base = qo["uri"].substring(0,idx);
		var filepattern = qo["uri"].substring(idx);
		if (debug) console.log("base = " + base);
		if (debug) console.log("filepattern part = " + filepattern);
		filepattern = filepattern
						.replace(/\$Y/g, "[0-9]{4}")
						.replace(/\$m/g, "[0-9]{2}")
						.replace(/\$d/g, "[0-9]{2}")
						.replace(/\$H/g, "[0-9]{2}")
						.replace(/\$M/g, "[0-9]{2}")
						.replace(/\$S/g, "[0-9]{2}")
						.replace(/\./g, "\\.")
						.replace(/\//g, "\\/")
		// See http://stackoverflow.com/a/9310752 for last replace discussion.
		// Above set of replacements does not account for other regex patterns
		// in qo["uri"] that would need to be escaped, e.g., (), {}
		if (debug) console.log("filepattern part after escaping = " + filepattern);
	}

	function finish(q, idx, cb) {

		if (debug) console.log("findstartstop(): Finish called.")

		if (typeof(finish.Nc) == "undefined") {
			finish.Nc = 1;
			finish.qs = [];
		} else {
			finish.Nc = finish.Nc + 1;
		}

		finish.qs[idx] = q;

		if (finish.Nc == 2) {

			if (debug) console.log("findstartstop(): Finish called second time.  Checking query objects and finding min start/max stop time.");
			// TODO: Verify timeformat the same.
			// TODO: Put in try/catch.
			console.log(qo["timeFormat"] || finish.qs[0].timeformat)
			var start1 = time2iso(finish.qs[0].start, qo["timeFormat"] || finish.qs[0].timeformat);
			console.log("start1 = " + start1)
			var start2 = time2iso(finish.qs[1].start, qo["timeFormat"] || finish.qs[1].timeformat);
			console.log("start2 = " + start2)
			var stop1  = time2iso(finish.qs[0].stop,  qo["timeFormat"] || finish.qs[0].timeformat);
			console.log("stop1 = " + stop1)
			var stop2  = time2iso(finish.qs[1].stop,  qo["timeFormat"] || finish.qs[1].timeformat);
			console.log("stop2 = " + stop2)

			var timeformat1 = finish.qs[0].timeformat;
			var timeformat2 = finish.qs[1].timeformat;

			var msg = "First/Last timeformat: " + timeformat1 + "/" + timeformat2;
			console.log(msg);

			msg = "First start/stop: " + start1 + "/" + stop1;
			msg = msg + "\n" + "Second start/stop: " + start2 + "/" + stop2;
			console.log(msg);

			if (timeformat1 !== timeformat2 && !qo["timeFormat"]) {
				var emsg = "timeformats for first/last files do not match. ";
				var emsg = emsg + "first/last timeformats: " + timeformat1 + "/" + timeformat2 + ".";
				if (!cb) {
					throw new Error(emsg);
				} else {
					cb(new Error(emsg));
				}
				return;
			} else {
				var emsg = "Problem with time ordering.\n" + msg;
			}

			var start1u = (new Date(qo["start"])) || start1.getTime();
			var start2u = (new Date(qo["start"])) || start2.getTime();
			var stop1u = (new Date(qo["stop"])) || stop1.getTime();
			var stop2u = (new Date(qo["stop"])) || stop1.getTime();

			// Ordering should be start1u <= stop1u <= start2u <= stop2u
			if (start1u > start2u) {
				// Error
				console.log(emsg);
				var err = new Error(emsg);
			}
			if (stop1u > start2u) {
				// Error
				console.log(emsg);
				var err = new Error(emsg);
			}
			if (stop2u > stop2u) {
				// Error
				console.log(emsg);
				var err = new Error(emsg);
			}

			if (err) {
				console.log(err);
				if (!cb) {
					throw new Error("Timeformat for first and last lines to not match.");
				} else {
					cb(new Error("Timeformat for first and last lines to not match."));
				}
				return;
			}

			if (qo["start"]) {
				if (qo["start"] !== start1) { // TODO: Test should be time equivalence not string equivalence.
					console.log("Warning: Given start (" + qo["start"] + ") does not match determined start (" + start1 + ")");
				}
			} else {
				qo["start"] = start1
			}
			if (qo["stop"]) {
				if (qo["stop"] !== stop2) { // TODO: Test should be time equivalence not string equivalence.
					console.log("Warning: Given stop (" + qo["stop"] + ") does not match determined stop (" + stop2 + ")");
				}
			} else {
				qo["stop"] = stop2
			}
			if (qo["timeformat"]) {
				if (qo["start"] !== timeformat1) { // TODO: Test should be time equivalence not string equivalence.
					console.log("Warning: Given start (" + qo["timeformat"] + ") does not match determined start (" + timeformat1 + ")");
				}
			} else {
				qo["timeformat"] = timeformat1
			}

			if (debug) console.log(qo);
			cb(err, qo);
		}
	}

	if ((idx > -1) || qo["uri"].match(/\/$/)) {

		if (idx > -1) {
			var dopts = {url: base, filepattern: filepattern};
			if (debug) console.log("Calling dirwalk with options: " + JSON.stringify(dopts));
		} else {
			// URI is a top-level directory.
			var dopts = {url: qo["uri"]};
			if (debug) console.log("Calling dirwalk with URI: " + qo["uri"]);
		}

		dirwalk(dopts, function (error, list, flat, nested) {

			if (error) console.log(error);
			if (debug) console.log("Directory walk complete.  Found " + list.length + " matches.");
			if (debug) console.log("Getting " + base + list[0])
			// TODO: Handle case where first and last few files are empty.
			// TODO: Put code below in closure to remove need to hard wire
			// values of 0, 1 (in finish() and list[]), and list.length-1 (in list[]).
			getchunks(base + list[0], 
				function (err, firstc, lastc) {
					if (err) console.log(err);
					//console.log("First chunk\n" + firstc);
					//console.log("Last chunk\n" + lastc);
					if (debug) console.log("Inspecting chunks.")
					inspectchunks(firstc, lastc, function (err, q) {
						if (debug) console.log("Inspection of chunks of " + list[0] + " finished.  Calling finished.")
						if (err) {
							if (!cb) {
								throw new Error(err);
							} else {
								cb(new Error(err));
							}
							return;
						}
						finish(q, 0, cb);
				})
			})

			if (debug) console.log("Getting " + base + list[list.length-1])
			// TODO: Handle case where first and last few files are empty.
			getchunks(base + list[list.length-1], 
				function (err, firstc, lastc) {
					if (err) console.log(err);
					//console.log("First chunk\n" + firstc);
					//console.log("Last chunk\n" + lastc);
					if (debug) console.log("Inspecting chunks.")
					inspectchunks(firstc, lastc, function (err, q) {
					if (debug) console.log("Inspection of chunks of " + list[list.length-1] + " finished.  Calling finished.")
					if (err) {
						if (!cb) {
							throw new Error(err);
						} else {
							cb(new Error(err));
						}
						return;
					}
					finish(q, 1, cb);
				})
			})
		})
	} else {

		// URI is a single file.
		getchunks(qo["uri"], function (err, first, last) {
			inspectchunks(first, last, function (err, q) {
				// Add new elements in q to qo.
				// TODO: Don't over-ride given values and compare input with those inferred.
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
	if (debug) console.log("getchunks(): Requesting " + uri);
	request.get(opts)
		.on('data', function (data) {
			// TODO: Handle case where data returned does not have at least one newline.
			// Would probably need to accumulate entire file into memory
			// and pass that to cb().
			if (first === "") {
				first = data;
			}
			last = data;
		})
		.on('error', function (err) {
			if (debug) console.log('getchunks(): Got error.');
			cb(err);
		})
		.on('end', function () {
			cb(err, first, last);
			if (debug) console.log('getchunks(): Got end');
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

	//if (debug) console.log("First chunk:\n" + firstc);
	//if (debug) console.log("Last chunk:\n" + lastc);
	var err = ""
	var firsta = firstc.toString().replace(/^\s+/g, "").split("\n");
	var lasta = lastc.toString().replace(/\s+$/g, "").split("\n");

	if (debug) console.log("First line as array:" + firsta[0])
	if (debug) console.log("Last line as array: " + lasta[lasta.length-1])

	for (var i = 0; i < checks.length; i++) {

		if (checks[i].types) {
			types = checks[i].types.split(",");
		} else {
			types = "0,1,2,3,4".split(",");
		}

		for (var type in types) {
			var expression = checks[i].expression
			var timeformat = checks[i].timeformat
			if (type == "0") {

			} else if (type == "1") {
				expression = expression.replace(/T|:/g, " ").replace(/\-\[/g," [");
				timeformat = timeformat.replace(/T|:/g, " ").replace(/\-\$/g," $");
			} else if (type == "2") {
				expression = expression.replace(/T/, " ");
				timeformat = timeformat.replace(/T/g, " ");
			} else if (type == "3") {
				expression = expression.replace(/T/," ").replace(/:/g, "");
				timeformat = timeformat.replace(/T/," ").replace(/:/g, "");
			} else if (type == "4") {
				expression = expression.replace(/T|:/g," ").replace(/\-\[/g, " [");				
				timeformat = timeformat.replace(/T|:/g," ").replace(/\-\$/g, " $");
			} else {
				break;
			}

			//console.log("Match expression:  " + expression)

			var coli = 0;
			var colf = expression.split(" ").length;

			var firstl = firsta[0].split(/\s|,/).slice(coli,colf).join(" ");
			var lastl = lasta[lasta.length-1].split(/\s|,/).slice(coli,colf).join(" ");

			//console.log("First test string: " + firstl);
			var firstm = firstl.match(expression);
			if (firstm) {
				if (debug) console.log("First test string matches expression " + expression + "; timeformat = " + timeformat);
				qo["start"] = firstl;
				if (firstl[firstl.length - 1] === "Z") {
					qo["timeformat"] = timeformat + "Z";
				} else {
					qo["timeformat"] = timeformat;
				}
				if (checks[i].timeunits) {
					qo["timeunits"] = checks[i].timeunits;
				}
				if (colf > 1) {
					qo["timecolumns"] = (coli+1) + "-" + colf
				}
			} else {
				//console.log("No match.")
			}

			//if (debug) console.log("Last test string:  " + lastl);
			var lastm = lastl.match(expression);
			if (lastm) {
				if (debug) console.log("Last test string matches expression " + expression + "; timeformat = " + timeformat);
				qo["stop"] = lastl;
				if (lastl[lastl.length - 1] === "Z") {
					qo["timeformat"] = timeformat + "Z";
				} else {
					qo["timeformat"] = timeformat;
				}
			} else {
				//console.log("No match.")
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

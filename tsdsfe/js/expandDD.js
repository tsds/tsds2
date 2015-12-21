function expandDD(qs) {

	if (typeof(qs) === "string") {
		qs = parseQueryString(qs)
	}

	qs["datasetID"] = qs["datasetID"] || ""
	qs["datasetLabel"] = qs["datasetLabel"] || qs["datasetID"]

	if (qs["start"] && qs["stop"] && ["uri"]) {
		var start = qs["start"].split(/\n/)
		var stop = qs["stop"].split(/\n/)
		var uri = qs["uri"].split(/\n/)
		var datasetID = qs["datasetID"].split(/\n/)
		var datasetLabel = qs["datasetLabel"].split(/\n/)

		if (start.length == 1 && stop.length == 1 && uri.length == 1 && datasetID.length == 1 && datasetLabel.length == 1) {
			cat = singular(qs)
		} else {
			// TODO
		}
	} else {
		console.log("uri, start, and stop values are required.")
	}
	return cat

	function parseQueryString(q) {
		tmpa = q.split("&");
		var qs = {}
		for (var i = 0; i < tmpa.length; i++) {
			tmps = tmpa[i];
			kv = tmps.split("=");
			qs[kv[0]] = kv[1];
		}
		qs["querystring"] = q
		return qs
	}

	function singular(qs) {

		var dataset = 
			[
				{
					"$": {"id":"","name":"","timecolumns":"","timeformat":"","urlprocessor":"","urltemplate":""},
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

		cat["catalog"]["timeCoverage"][0]["Start"][0] = qs["start"]
		cat["catalog"]["timeCoverage"][0]["End"][0] = qs["stop"]
		delete cat["catalog"]["timeCoverage"][0]["Cadence"]

		if (qs["catalogID"]) {
			cat["catalog"]["$"]["id"] = qs["catalogID"]
		} else {
			cat["catalog"]["$"]["id"] = qs["uri"]
		}
		if (qs["catalogLabel"]) {
			cat["catalog"]["$"]["name"] = qs["catalogLabel"]
		} else {
			cat["catalog"]["$"]["name"] = cat["catalog"]["$"]["id"]
		}

		cat["catalog"]["documentation"][0]["$"]["xlink:title"] = 
				"Catalog derived from string " + qs["querystring"]

		if (qs["datasetID"]) {
			dataset[0]["$"]["id"] = qs["datasetID"]
		} else {
			dataset[0]["$"]["id"] = "1"
		}
		if (qs["datasetLabel"]) {
			dataset[0]["$"]["name"] = qs["datasetLabel"]
		} else {
			dataset[0]["$"]["name"] = dataset[0]["$"]["id"]
		}

		dataset[0]["$"]["urltemplate"] = qs["uri"]

		if (qs["timeColumns"]) {
			dataset[0]["$"]["timecolumns"] = qs["timeColumns"]
		} else {
			dataset[0]["$"]["timecolumns"] = "1"
		}

		if (qs["timeFormat"]) {
			dataset[0]["$"]["timeformat"] = qs["timeFormat"]
		} else {
			dataset[0]["$"]["timeformat"] = "$Y-$m-$dT$H:$M:$S.$(millis)Z"
		}

		var columns = qs["columns"] || "2"
		columns = columns.split(",")
		var units = qs["units"] || ""
		units = units.split(",")
		var columnIDs = qs["columnIDs"] || ""
		columnIDs = columnIDs.split(",")
		var columnLabels = qs["columnLabels"] || ""
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
			dataset[0]["variables"][0]["variable"][j]["$"]["units"]   = units[j]
			dataset[0]["variables"][0]["variable"][j]["$"]["id"]      = columnIDs[j]
			dataset[0]["variables"][0]["variable"][j]["$"]["label"]   = columnLabels[j]
		}

		return cat
	}

}

if (typeof(exports) !== "undefined" && require) {
	exports.expandDD = expandDD
}

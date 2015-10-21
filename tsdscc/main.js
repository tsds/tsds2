var singular = require('./singular.js').singular
var parseQueryString = require('./parseQueryString.js').parseQueryString

function main(qs) {

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
}

if (typeof(exports) !== "undefined" && require) {
	exports.main = main
}

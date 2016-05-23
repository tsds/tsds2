var request = require("request")
var async = require("async")
var fs = require('fs')
path = ""
var treeify = require("../../treeify/treeify.js").treeify
var json2   = require("../../treeify/lib/json2").json2;

url = "http://localhost:8004/?catalog=^.*"
request(url, function (err, res, body) {
	json = JSON.parse(body);
	var CATALOGS = []
	k = 0;
	for (var i = 0;i < json.length;i++) {
		if (!json[i]["value"].match(/CDAWeb|SSCWeb/)) {
			CATALOGS[k] = json[i]["value"];
			k = k+1;
		}
	}
	async.mapSeries(CATALOGS, getcatalog, function(err, results) {
		var DATASETS = []
		// Flatten into array of datasets
		for (var i = 0;i < results.length;i++) {
			DATASETS = DATASETS.concat(results[i])
		}
		fs.writeFileSync("list-datasets.txt",DATASETS.join("\n"));
		async.mapSeries(DATASETS, getdataset, function(err, results) {
			var PARAMETERS = []
			// Flatten into array of parameters
			for (var i = 0;i < results.length;i++) {
				PARAMETERS = PARAMETERS.concat(results[i])
			}
			fs.writeFileSync("list-parameters.txt",PARAMETERS.join("\n"));
		});
	});
});

var getcatalog = function(catalog,cb) {
	url = "http://localhost:8004/?catalog="+catalog+"&dataset=^.*"
	console.log("Getting " + catalog)
	request(url, function (err, res, body) {
		json = JSON.parse(body);
		var IDS = []
		for (var i = 0;i < json.length;i++) {
			IDS[i] = [catalog,json[i]["value"]];
		}
		console.log("Got " + catalog)
		cb(null,IDS)
	})
}

function getdataset(result,cb) {
	var catalog = result[0];
	var dataset = result[1];
	url = "http://localhost:8004/?catalog="+catalog+"&dataset="+dataset+"&parameters=^.*"
	console.log("Getting " + catalog + "/" + dataset);
	request(url, function (err, res, body) {
		json = JSON.parse(body);
		var IDS = []
		for (var i = 0;i < json.length;i++) {
			IDS[i] = [catalog,dataset,json[i]["value"]];
		}
		console.log("Got " + catalog + "/" + dataset)
		cb(null,IDS)
	})
}
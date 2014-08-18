// Usage:
// Download catalog information files and then create catalogs.
//   node.js SuperMAG.js
// Create catalogs based on previous catalog download (SuperMAG.raw).
//   node.js SuperMAG.js false

var	fs      = require("fs");
var	request = require("request");
var	http    = require("http");
var xml2js  = require('xml2js');
var expand  = require("tsdset").expandtemplate;

// Not sure which one gets used.  Sets limit to number of simultaneous request.
// Server does not max given in header, but most Apache servers allow 100.
http.globalAgent.maxSockets = 50;
var options = {pool: {maxSockets: 50}};

var now  = new Date();
var stop = now.toISOString().substring(0,10);

// TODO: start time should be determined automatically.
topts = {
	type       : "strftime",
	timeRange  : "1980-01-01/"+stop,
	indexRange : null, 
	debug      : false, 
	template   : "http://supermag.jhuapl.edu/archive/cat/$Y/$Y$m$d.xml"
}
urls = expand(topts); // Create a list of URLs

if (process.argv[2] === "true" || process.argv.length == 1) {
	getdata(); // Get data and parse into catalog.
} else {
	createcatalog(); // Just parse data into catalog.
}

// Request xml files (async) from all URLs in array "urls"
// Each URL contains a list of stations that have data available on a given day.
function getdata() {
	// Iterate of URL list.
	for (var i = 0;i<urls.length;i++) {
		// Request each URL and call urldone() when complete.
		request(urls[i], function(error, response, body) {
			if (!error || request.statusCode == 200) {
				console.log("Downloaded "+response.request.uri.href);
				urldone(body,response.request.uri.href);
			} else {
				console.log("Problem downloading "+response.request.uri.href);
				urldone("",response.request.uri.href);
			}
		});
	}
}

// Read in OUT variable written by urldone() and create various catalogs.
function createcatalog() {
	var OUT2 = {};

	console.log("Reading SuperMAG.raw");
	var data = fs.readFileSync(__dirname + "/SuperMAG.raw");
	var data = JSON.parse(data);

	// data has structure {YYYYMMDD: [list of stations with data available on YYYYMMDD],
	// YYYYMMDD: [list of stations with data available on YYYYMMDD],...}

	// Get sorted list of keys (structure was populated async, so it will probably not be in order).
	var datekeys = [];
	for (var k in data) {
		datekeys.push(k);
	}
	datekeys.sort();

	// Find earliest start date for each TLC.
	// OUT2 will have structure {TLC: "", Start: "", End: ""}.
	for (var j=0;j<datekeys.length;j++) {  

		for (i=0;i<data[datekeys[j]].length;i++) {
			var tlc = data[datekeys[j]][i]; // Three-letter code (TLC) corresponding to station name
			if (typeof(OUT2[tlc]) === "undefined") {
				//console.log("Creating object "+tlc)
				OUT2[tlc] = {};
			}

			OUT2[tlc].End = datekeys[j];

			if (!OUT2[tlc].hasOwnProperty('Start')) {
				OUT2[tlc].Start = datekeys[j];
			}
		}

	}

	console.log("Reading SuperMAG-tsds-template.xml")
	var template = fs.readFileSync("SuperMAG-tsds-template.xml");
	var parser = new xml2js.Parser();

	// Create XML and JSON versions of TSDS catalog.
	console.log("Parsing SuperMAG-tsds-template.xml")
	parser.parseString(template, function (err, result) {

		if (err) console.log(err);

		var d = new Date();

		// Note: This is not robust against changes in this documentation node in the catalog.
		result["catalog"].documentation[2]["$"]["xlink:title"] = result["catalog"].documentation[2]["$"]["xlink:title"] + d.toISOString();

		// Dateset node template.
		var dataset = result["catalog"].dataset[0];

		// Create dataset nodes.
		var datasets = [];
		var j = 0;
		for (var k in OUT2) {
			datasets[j] = dataset;
			datasets[j]["$"].name = k;
			datasets[j]["$"].ID = k;
			datasets[j].timeCoverage[0].Start = [OUT2[k].Start];
			datasets[j].timeCoverage[0].End = [OUT2[k].End];
			j = j+1;
		}
		result["catalog"].dataset = datasets;

		// Write JSON version of TSDS catalog.
		console.log("Writing SuperMAG-tsds.json")
		fs.writeFileSync("SuperMAG-tsds.json",JSON.stringify(result));

		// Convert JSON object to XML.
		var builder = new xml2js.Builder();
		var xml = builder.buildObject(result);

		// Write XML version of TSDS catalog.
		console.log("Writing SuperMAG-tsds.xml")
		fs.writeFileSync("SuperMAG-tsds.xml",xml);

	});
}

// Called each time a request has completed.  When all requests complete, write SuperMAG.raw,
// which contains JSON represenation of each xml file downloaded.
function urldone(data,url) {

	// OUT is an object with keys of date and values of an array of stations available on that date.
	var OUT = {};
	
	if (!urldone.N) urldone.N = 0;
	urldone.N = urldone.N + 1;
	

	if (data.length == 0) {
		OUT[id] = [];
		return;
	}
	
	var parser = new xml2js.Parser();
	parser.parseString(data, function (err, result) {
		if (err) {
			console.log("Error parsing "+url);
			OUT[id] = [];
			return;			
		}
		console.log("Parsed "+url)
		var id = url.replace(/.*\/([0-9]{8})\.xml/,"$1");
		//console.log(id)
		OUT[id] = result.cat.st;
		if (urldone.N == urls.length) {
			//console.log(OUT);
			// When all requests are complete, write file containing OUT and call createcatalog() to 
			// convert OUT to various forms of catalogs.
			console.log("Writing SuperMAG.raw");
			fs.writeFileSync("SuperMAG.raw",JSON.stringify(OUT));
			createcatalog();
		}		

	})
}
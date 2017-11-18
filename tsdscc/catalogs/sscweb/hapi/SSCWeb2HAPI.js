var fs      = require('fs');
var os      = require("os");
var request = require("request");
var express = require('express');
var app     = express();
var xml2js  = require('xml2js');

var urlo = "https://sscweb.sci.gsfc.nasa.gov/WS/sscr/2/observatories";
var cfileraw = "SSCWeb.json.raw";
var cfile = "SSCWeb-hapi.json";

catalog = getSatellites();

function getSatellites() {

	var age = 0;
	if (fs.existsSync(cfile)) {
		age = new Date().getTime() - fs.statSync(cfile).mtime;
		age = age/(86400*1000);
		if (age < 1) { // Cache file less than one day old
			console.log("Reading cache file because it is less than one day old.")
			return fs.readFileSync(cfile);
		} else {
			ymd = new Date().toISOString().substring(0,10);
			cfilec = cfile.replace(/\.json/,"-"+ymd+".json");
			fs.copySync(__dirname+"/"+cfile,__dirname+"/old/"+cfilec);
			console.error("Moved " + cfile + " to ./old/" + cfilec); 
		}
	}

	console.error("Getting " + urlo)
	request(urlo, 
		function (error, response, body) {
			if (error) {
				if (fs.existsSync(cfile)) {
					console.log("Could not get "+urlo+". Returning cached metadata.")
					return fs.readFileSync(cfile);
				} else {
					console.log("Could not get "+urlo+" and no cached metadata. Throwing error.")
					// Throw error
				}
			}
			//console.error("Error for " + urlo + e);
			var parser = new xml2js.Parser();
			// TODO: Catch error here.
			console.error("Got " + urlo);
			parser.parseString(body, function (err, jsonraw) {
				//console.error("Writing " + cfileraw);
				//fs.writeFileSync(cfileraw,JSON.stringify(json,null,4));
				//console.error("Wrote " + cfileraw);
				makeHAPI(jsonraw);
			})
	})
}

function makeHAPI(jsonraw) {
	var params = fs.readFileSync("SSCWeb-parameters.txt").toString();
	params = params.split(/\n/);
	//console.log(params)

	var catalog = {}
	catalog["catalog"] = [];
	var obs = jsonraw.ObservatoryResponse.Observatory;
	for (var i = 0; i < obs.length; i++) {
		catalog["catalog"][i] = {};
		catalog["catalog"][i]["id"] = obs[i]["Id"][0];
		catalog["catalog"][i]["title"] = obs[i]["Name"][0];
		catalog["catalog"][i]["info"] = {};
		catalog["catalog"][i]["info"]["startDate"] = obs[i]["StartTime"][0];
		catalog["catalog"][i]["info"]["stopDate"] = obs[i]["EndTime"][0];
		catalog["catalog"][i]["info"]["cadence"] = obs[i]["Resolution"][0];
		catalog["catalog"][i]["info"]["description"] = "Ephemeris data";
		catalog["catalog"][i]["info"]["resourceURL"] = "https://sscweb.sci.gsfc.nasa.gov/";
		catalog["catalog"][i]["info"]["parameters"] = [];
		for (var j = 0;j < params.length;j++) {
			paraminfo = params[j].split("\",");
			if (params[j] === '') {continue} // Skip blank lines
			catalog["catalog"][i]["info"]["parameters"][j] = {};
			catalog["catalog"][i]["info"]["parameters"][j]["name"] = paraminfo[0].replace(/"/g,"");
			catalog["catalog"][i]["info"]["parameters"][j]["description"] = paraminfo[2].replace(/"/g,"");
			catalog["catalog"][i]["info"]["parameters"][j]["units"] = paraminfo[3].replace(/"/g,"");
			catalog["catalog"][i]["info"]["parameters"][j]["fill"] = paraminfo[4].replace(/"/g,"");
			catalog["catalog"][i]["info"]["parameters"][j]["type"] = paraminfo[5].replace(/"/g,"");
			var type = paraminfo[5].replace(/"/g,"");
			if (/f$/.test(type)) {
				catalog["catalog"][i]["info"]["parameters"][j]["type"] = "double";
			}
			if (/d$/.test(type)) {
				catalog["catalog"][i]["info"]["parameters"][j]["type"] = "integer";
			}
			if (/s$/.test(type)) {
				catalog["catalog"][i]["info"]["parameters"][j]["type"] = "string";
				catalog["catalog"][i]["info"]["parameters"][j]["length"] = catalog["catalog"][i]["info"]["parameters"][j]["fill"].length;
			}
		}

	}
	//console.log(JSON.stringify(catalog,null,4));
	console.error("Writing " + cfile)
	fs.writeFile(cfile,JSON.stringify(catalog,null,4))
	console.error("Wrote " + cfile);
	return catalog;
}
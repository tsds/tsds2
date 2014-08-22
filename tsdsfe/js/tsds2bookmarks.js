// node.js
if (typeof(exports) !== "undefined" && require){
	var xml2js  = require('xml2js');
}

function tsds2bookmarks(tsdsjson, callback) {

	// Convert TSDS catalog in JSON to Autoplot bookmark JSON and convert to bookmark XML.

	ds  = 0; // Dataset
	dsv = 0; // Dataset variable

	console.log(tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"][dsv]["$"])

	var catalog = tsdsjson["catalog"]["$"]["name"];

	var ds = 0;
	var dsv = 0;
	var k = 0;
	var bookmarks = [];

	for (var ds = 0; ds < tsdsjson["catalog"]["dataset"].length; ds++) {
		var dataset = tsdsjson["catalog"]["dataset"][ds]["$"]["id"];
		var stop = tsdsjson["catalog"]["dataset"][ds]["timeCoverage"][0]["Start"][0].substring(0,10);
		for (var dsv = 0; dsv < tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"].length; dsv++) {
			var parameters = tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"][dsv]["$"]["id"];
			var url = "http://autoplot.org/git/jyds/tsdsfe.jyds?http://tsds.org/get/?catalog="+catalog+"&dataset="+dataset+"&parameters="+parameters+"&start=-P2D"+"&stop="+stop;
			bookmarks[k] =
							{
								"title": catalog + "/" + dataset + "/" + parameters,
								"description": tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"][dsv]["$"]["label"],
								"uri": url
							}
			var k = k+1;					

		}
	}

	//console.log(bookmarks.length);

	var bookmarkjson = {
						"bookmark-list": 
							{ 
								"$": {"version": "1.1"},
								"bookmark-folder": {
									"title": tsdsjson["catalog"]["$"]["id"],
									"description": tsdsjson["catalog"]["$"]["name"],
									"bookmark-list": {"bookmark": bookmarks}
								}
							}
						}

	//console.log(bookmarkjson)
	var builder = new xml2js.Builder();
	var xml = builder.buildObject(bookmarkjson);

	callback(xml)

}

// node.js
if (typeof(exports) !== "undefined" && require){
	exports.tsds2bookmarks = tsds2bookmarks;
}

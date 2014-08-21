// node.js
if (typeof(exports) !== "undefined" && require){
	var xml2js  = require('xml2js');
}

/*
<bookmark-list version="1.1">
	<bookmark-folder>
		<title>SuperMAG</title>
		<description></description>
		<bookmark-list>
			<bookmark>
				<title>AAA</title>
				<description>AlmaAta Geographic Lat, Long = 76.92,43.25</description>
				<url>http://autoplot.org/data/jyds/supermag.jyds?station=AAA&amp;timeRange=20081231</url>
			</bookmark>
		</bookmark-list>
	</bookmark-folder>
</bookmark-list>
*/

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
		var start = tsdsjson["catalog"]["dataset"][ds]["timeCoverage"][0]["Start"][0].substring(0,10);
		for (var dsv = 0; dsv < tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"].length; dsv++) {
			var parameter = tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"][dsv]["$"]["id"];
			var url = "http://tsds.org/get/?catalog="+catalog+"&dataset="+dataset+"&parameter="+parameter+"&start="+start+"&stop=P2D";
			bookmarks[k] =
							{
								"title": catalog + "/" + dataset + "/" + parameter,
								"description": tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"][dsv]["$"]["label"],
								"url": url
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

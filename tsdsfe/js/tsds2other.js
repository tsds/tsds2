// node.js
if (typeof(exports) !== "undefined" && require){
	var xml2js  = require('xml2js');
	var treeify = require('../../../js/treeify/js/treeify').treeify;

}

function tsds2other(tsdsjson, other, callback) {

	// Convert TSDS catalog in JSON to Autoplot bookmark JSON and then convert to bookmark XML.
	// One bookmark is created per variable.

	var ds  = 0; // Dataset
	var dsv = 0; // Dataset variable
	var dsg = 0; // Dataset group
	var j   = 0; // Increment for each variable

	var catalog = tsdsjson["catalog"]["$"]["name"] || tsdsjson["catalog"]["$"]["id"];

	// 1-D array of bookmarks.
	var bookmarks = [];

	// 1-D array of delimeted IDs.  Delimeters used to determine folder structure of bookmarks file;
	var links = []; 

	// 1-D object look-up object of information used to populate bookmark structure.
	var info = {}; 
	info[catalog] = {};
	info[catalog].title = tsdsjson["catalog"]["$"]["name"];
	info[catalog].description = tsdsjson["catalog"]["$"]["label"] || tsdsjson["catalog"]["$"]["name"] || tsdsjson["catalog"]["$"]["id"] ;

	for (var ds = 0; ds < tsdsjson["catalog"]["dataset"].length; ds++) {
		var dataset = tsdsjson["catalog"]["dataset"][ds]["$"]["id"];

		if (catalog.match("SuperMAG") || catalog.match("SSCWeb")) {
			// Add an extra key in ID to force creation of subdirectories of A-Z below catalog directory.
			var datasetkey = dataset.substring(0,1).toUpperCase();
			info[datasetkey] = {};
			info[datasetkey].title       = datasetkey;
			info[datasetkey].description = tsdsjson["catalog"]["dataset"][ds]["$"]["label"] || tsdsjson["catalog"]["dataset"][ds]["$"]["name"];
		}

		info[dataset] = {};
		info[dataset].title       = tsdsjson["catalog"]["dataset"][ds]["$"]["name"] || tsdsjson["catalog"]["dataset"][ds]["$"]["id"];
		info[dataset].description = tsdsjson["catalog"]["dataset"][ds]["$"]["label"] || tsdsjson["catalog"]["dataset"][ds]["$"]["name"];

		var stop = tsdsjson["catalog"]["dataset"][ds]["timeCoverage"][0]["Start"][0].substring(0,10);

		for (var dsv = 0; dsv < tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"].length; dsv++) {
			var parameters = tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"][dsv]["$"]["id"];
			var url = "http://autoplot.org/git/jyds/tsdsfe.jyds?http://tsds.org/get/?catalog="
							+catalog+"&amp;dataset="+dataset+"&amp;parameters="+parameters+"&amp;start=-P2D"+"&amp;stop="+stop;

			if (catalog.match("SuperMAG")) {
				links[j] = catalog + "." + datasetkey + "." + dataset + "." + dataset + "/" + parameters;
			} else if (catalog.match("SSCWeb")) {
				links[j] = catalog + "." + datasetkey + "." + dataset + ".parameters." + dataset + "/" + parameters;
				info["parameters"] = {};
				info["parameters"].title       = "Parameters";
				info["parameters"].description = "";
			} else {
				links[j] = catalog + "." + dataset + "." + dataset + "/" + parameters;
			}

			info[dataset + "/" + parameters] = {};
			info[dataset + "/" + parameters].title       = parameters;
			info[dataset + "/" + parameters].description = tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"][dsv]["$"]["label"] || tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"][dsv]["$"]["name"] || tsdsjson["catalog"]["dataset"][ds]["variables"][0]["variable"][dsv]["$"]["id"];
			info[dataset + "/" + parameters].uri = url;
			
			j = j+1;

		}

		if (tsdsjson["catalog"]["dataset"][ds]["groups"]) {
			for (var dsg = 0; dsg < tsdsjson["catalog"]["dataset"][ds]["groups"][0]["group"].length; dsg++) {
				var parameters = tsdsjson["catalog"]["dataset"][ds]["groups"][0]["group"][dsg]["$"]["id"];
				var url = "http://autoplot.org/git/jyds/tsdsfe.jyds?http://tsds.org/get/?catalog="
								+catalog+"&amp;dataset="+dataset+"&amp;parameters="+parameters+"&amp;start=-P2D"+"&amp;stop="+stop;

				if (catalog.match("SuperMAG")) {
					links[j] = catalog + "." + datasetkey + "." + dataset + "." + dataset + "/" + parameters;
				} else if (catalog.match("SSCWeb")) {
					links[j] = catalog + "." + datasetkey + "." + dataset + ".groups." + dataset + "/" + parameters;
					info["groups"] = {};
					info["groups"].title       = "Parameter Groups";
					info["groups"].description = "";
				} else {
					links[j] = catalog + "." + dataset + "." + dataset + "/" + parameters;
				}

				info[dataset + "/" + parameters] = {};
				info[dataset + "/" + parameters].title       = parameters;
				info[dataset + "/" + parameters].description = tsdsjson["catalog"]["dataset"][ds]["groups"][0]["group"][dsg]["$"]["label"] || tsdsjson["catalog"]["dataset"][ds]["group"][0]["groups"][dsg]["$"]["name"] || tsdsjson["catalog"]["dataset"][ds]["groups"][0]["group"][dsg]["$"]["id"];
				info[dataset + "/" + parameters].uri = url;
				
				j = j+1;

			}
		}

	}

	if (other === "autoplot-bookmarks") {
		// treeify() creates a structured JSON object based on IDs.
		// json2autoplotbookmarks() converts it to XML.
		json2autoplotbookmarks(treeify(links))

	}

	function json2autoplotbookmarks(obj,level) {

		function isarray(a) {
			if( Object.prototype.toString.call( a ) === '[object Array]' ) {
				return true;
			}
			return false;
		}

		if (!json2autoplotbookmarks.xml) json2autoplotbookmarks.xml = "";
		
		level = level || 0;
		var indent = "  ";
		for(var i=0;i<level;i++){
			indent += "  ";
		}

		var DirOpenRoot = '<bookmark-list version="1.1">';
		var DirCloseRoot = '</bookmark-list>';
		function FolderOpen(key) {
			var str = '<bookmark-folder><title>'+info[key].title+'</title><description>'+info[key].description+'</description><bookmark-list>'
			return str;
		}
		var FolderClose = '</bookmark-list></bookmark-folder>';
		var FileOpen = '<bookmark>'
		var FileClose = '</bookmark>'
		function File(key) {
			return '<title>'+info[key].title+'</title><description>'+info[key].description+'</description><uri>'+info[key].uri+'</uri><description-url></description-url>';
		}

		if (level == 0) {
			json2autoplotbookmarks.xml = json2autoplotbookmarks.xml + DirOpenRoot + "\n";
			json2autoplotbookmarks(obj,1);
			json2autoplotbookmarks.xml = json2autoplotbookmarks.xml + DirCloseRoot + "\n";
			callback(json2autoplotbookmarks.xml)
			return;
		}

		var tmp = "";
		for (var key in obj) {
			if (isarray(obj[key])) {
				json2autoplotbookmarks.xml = json2autoplotbookmarks.xml + indent + FolderOpen(key) + "\n";
				for (var i = 0; i < obj[key].length; i++) {
					json2autoplotbookmarks.xml = json2autoplotbookmarks.xml + indent + indent + FileOpen + "\n";
					json2autoplotbookmarks.xml = json2autoplotbookmarks.xml + indent + indent + indent + File(obj[key][i]) + "\n";
					json2autoplotbookmarks.xml = json2autoplotbookmarks.xml + indent + indent + FileClose + "\n";
				}
				json2autoplotbookmarks.xml = json2autoplotbookmarks.xml + indent + FolderClose + "\n";
			} else {
				json2autoplotbookmarks.xml = json2autoplotbookmarks.xml + indent + FolderOpen(key) + "\n";
				json2autoplotbookmarks(obj[key],level+1);
				json2autoplotbookmarks.xml = json2autoplotbookmarks.xml + indent + FolderClose + "\n";
			}
		}
	}

}

// node.js
if (typeof(exports) !== "undefined" && require){
	exports.tsds2other = tsds2other;
}

var request = require('request');
var fs      = require('fs');

var cats = [];
var stas = {};

var cadence = process.argv[2] || "PT1M";

var k = 0;
if (cadence.match("PT1M")) {
	yo = 2001;
	var urlo = "http://www.intermagnet.org/apps/download/php/ajax/search_catalogue.php?rate=minute&type=variation&format=IAGA2002&from_year=YYYY&from_month=01&from_day=01&to_year=YYYY&to_month=12&to_day=31&region=America,Asia,Europe,Pacific,Africa&latid=NH,NM,E,SM,SH&_=1382398875837";
	var N = parseInt(new Date().toISOString().substring(0,4))-2000;
} else {
	yo = 2009;
	var urlo = "http://www.intermagnet.org/apps/download/php/ajax/search_catalogue.php?rate=second&type=variation&format=IAGA2002&from_year=YYYY&from_month=01&from_day=01&to_year=YYYY&to_month=12&to_day=31&region=America,Asia,Europe,Pacific,Africa&latid=NH,NM,E,SM,SH&_=1382398875837";
	var N = parseInt(new Date().toISOString().substring(0,4))-2008;
}

for (z = yo;z < yo+N;z++) {
	url = urlo.replace(/YYYY/g,""+z);
	get(url);
	console.log("Requesting " + url);
}

function get(url) {
	request.get(url, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	    		console.log("finished request " + k);
			cats[k] = JSON.parse(body);	
	    }
	    k = k+1;
	    if (k == N) {
	    		fs.writeFileSync("INTERMAGNET_"+cadence+".json",JSON.stringify(cats));
	    		callback();
	    	}	    	
	});
}

function callback() {
	var data = fs.readFileSync("INTERMAGNET_"+cadence+".json");
	eval("cats =" + data);
	var urls = [];
	for (j = 0; j<cats.length;j++) {
		for (var key in cats[j]) {
			for (var key2 in cats[j][key]) {
				if (cats[j][key][key2].available) {
					if (typeof(stas[cats[j][key][key2]["obs"]]) === "undefined") {
						stas[cats[j][key][key2]["obs"]] = {};
						stas[cats[j][key][key2]["obs"]]["start"] = cats[j][key][key2]["date"];
					}
					stas[cats[j][key][key2]["obs"]]["stop"] = cats[j][key][key2]["date"];
				}
			}
		}
	}
	var list = [];
	var	z = 0;
	for (var key in stas) {
		list[z] = key + " " + stas[key]["start"] + " " + stas[key]["stop"]; 
		console.log(list[z]);
		z = z+1;
	}
	fs.writeFileSync("INTERMAGNET_"+cadence+".txt",list.join("\n"));
}


var fs = require('fs');
var zlib = require('zlib');

var cadence = process.argv[2] || "PT1M";

var list = fs.readFileSync("INTERMAGNET_"+cadence+".txt").toString();
var lista = list.split("\n");

var listg = [];
for (var i = 0;i<lista.length;i++) {
	//console.log();
	dir = "./data/"+lista[i].split(" ")[0]+"/"+cadence;
	if (fs.existsSync(dir)) {
		files = fs.readdirSync(dir);
		for (var k = 0;k<files.length;k++) {
			if (files[k].match(/vmin\.min\.gz|vsec\.sec\.gz/)) {
				listg[i] = dir+"/"+files[k];
				//console.log("./data/"+lista[i].split(" ")[0]+"/"+files[k]);
				break;
			}
		}
	} else {
		process.stderr.write("Directory " + dir + " does not exist " + lista[i]+"\n");
		//console.log("Directory " + dir + " does not exist " + lista[i]);
	}
}

var listf = [];
listg = listg.filter(function(n){return n}); // Remove undefined elements. 
for (var i = 0;i<listg.length;i++) {
	//console.log("--" + listg[i]);
	gzipBuffer = fs.readFileSync(listg[i]);
	unz(i,listg.length,function () {
		console.log("var list = " + JSON.stringify(listf));
	});
}
function unz(i,N,cb) {
		if (typeof(unz.N) === "undefined") unz.N = 0;
		
		zlib.gunzip(gzipBuffer, function(err, result) {
	    		if (err) return console.error(err);
	    		var file = result.toString().split(/\n|\r\n/);
	    		//console.log(file.slice(0,10));
	    		var coordsys = file.filter(function(line){return line.search(/^ Reported/)!=-1;}).join("").replace(" Reported","");
	    		var source = file.filter(function(line){return line.search(/^ Source of Data/)!=-1;}).join("").replace(" Source of Data","");
	    		var name = file.filter(function(line){return line.search(/^ Station Name/)!=-1;}).join("").replace(" Station Name","");
	    		var lat = file.filter(function(line){return line.search(/^ Geodetic Latitude/)!=-1;}).join("").replace(" Geodetic Latitude","");
	    		var long = file.filter(function(line){return line.search(/^ Geodetic Longitude/)!=-1;}).join("").replace(" Geodetic Longitude","");
	    		var meta = lista[i].replace(/ /g,",") + "," + coordsys + "," + lat + "," + long + "," + source + "," + name;
	    		var line = meta.replace(/\s{2,}|\||^M/g,"");
	    		//console.log(line);
	    		listf[i] = line.replace("'","\'");
	    		unz.N = unz.N+1;
	    		process.stderr.write(unz.N+ "/" + N+"\n");
	    		if (unz.N === N) cb();

		});
}
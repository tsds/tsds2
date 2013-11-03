var request = require('request');
var fs      = require('fs');
var exec    = require('child_process').exec;
var spawn   = require('child_process').spawn;

var cadence = process.argv[3] || "PT1M";
var expandtemplate = require("tsdset").expandtemplate;
var expandISO8601Duration = require("tsdset").expandISO8601Duration;

// Need to urls with and without filename having .gz extension.  Early files were compresses inside
// of the zip.  
if (cadence.match("PT1M")) {
	var urlo = "http://intermagnet.org/data-donnee/download-2-eng.php?rate=minute&type=variation&format=IAGA2002&from_year=$Y&from_month=$m&from_day=$d&to_year=$Y&to_month=$m&to_day=$d&filter_region%5B%5D=America&filter_region%5B%5D=Asia&filter_region%5B%5D=Europe&filter_region%5B%5D=Pacific&filter_region%5B%5D=Africa&filter_lat%5B%5D=NH&filter_lat%5B%5D=NM&filter_lat%5B%5D=E&filter_lat%5B%5D=SM&filter_lat%5B%5D=SH&select_all%5B%5D=TLC&select%5B%5D=TLClc$Y$m$dvmin.min.gz&email=rweigel%40gmu.edu&accept=accept"; 
} else {
	var urlo = "http://intermagnet.org/data-donnee/download-2-eng.php?rate=second&type=variation&format=IAGA2002&from_year=$Y&from_month=$m&from_day=$d&to_year=$Y&to_month=$m&to_day=$d&filter_region%5B%5D=America&filter_region%5B%5D=Asia&filter_region%5B%5D=Europe&filter_region%5B%5D=Pacific&filter_region%5B%5D=Africa&filter_lat%5B%5D=NH&filter_lat%5B%5D=NM&filter_lat%5B%5D=E&filter_lat%5B%5D=SM&filter_lat%5B%5D=SH&select_all%5B%5D=TLC&select%5B%5D=TLClc$Y$m$dvsec.sec&email=rweigel%40gmu.edu&accept=accept"; 
}

var lines = fs.readFileSync("INTERMAGNET_"+cadence+".txt");
var list  = lines.toString().split("\n");

var k = parseInt(process.argv[2])
get(k);

function get(urls,files) {

	if (arguments.length == 1) {
		var urls  = [];
		var files = [];
		TLC       = list[k].split(" ")[0];
		
		var options      = {};
		options.template = urlo.replace(/TLClc/g,TLC.toLowerCase()).replace("TLC",TLC);
		options.check    = false;
		options.side     = "server";
		options.type     = "strftime";
		options.start    = list[k].split(" ")[1];
		options.stop     = list[k].split(" ")[2];
		
		urls = urls.concat(expandtemplate(options));		
		options.template = TLC.toLowerCase()+"$Y$m$dvmin.min.gz";
		files = files.concat(expandtemplate(options));
	}	
	
	if (k == list.length-1) return;

	// The following leads to maximum call stack problems (even after increasing --max-stack-size)
	// if (urls.length == 0) {get(k+1);return;}
	// Instead, do this:
	function getmore() {
		var com = "node update.js " + (k+1);
		console.log("Executing " + com);
		child = exec(com, {maxBuffer:10000*1024},function (error, stdout, stderr) {
			console.log(error);
		})
		child.stdout.on('data', function (data) {
  			console.log(data.replace(/\n$/,""));
		});
	}
	
	if (urls.length == 0) {
		getmore(k);
		return;
	}
	
	if (fs.existsSync("./data/"+files[0]) || fs.existsSync("./data/"+files[0].replace(".gz","")) || fs.existsSync("./data/"+files[0].replace(".gz","")+".x")) {
	 	if (fs.existsSync("./data/"+files[0].replace(".gz","")+".x")) {
			console.log(files.length + " File ./data/" + files[0].replace(".gz","") + ".x exists.  Not attempting re-download.");
	 	} else {
			console.log(files.length + " File ./data/" + files[0] + " exists.  Not re-downloading.");
		}
		urls.shift();
		files.shift();
		get(urls,files);
		return; 
	}
	console.log(files.length + " Requesting: " + urls[0].replace(/%5B%5D/g,"[]").replace(/%40/g,"@"));
	//console.log(files.length + " To     : " + urls[0].split("?")[0]);

	console.log(files.length + " File   : " + files[0]);
//	request.post({url:urls[0].split("?")[0],body:encodeURI(urls[0].split("?")[1].replace(/%5B%5D/g,"[]").replace(/%40/g,"@"))}, function (error, response, body) {

	request.get(urls[0].replace(/%5B%5D/g,"[]").replace(/%40/g,"@"), function (error, response, body) {
		if (error) {
			console.log(error);
			if (urls.length > 0) setTimeout(function () {get(urls,files)},1000);
		}
	    if (!error && response.statusCode == 200) {
	    		var str = body.replace(/\r\n|\n|\r/g,"").replace(/.*(app.*zip).*/g,"$1");
			zipfile = "http://www.intermagnet.org/" + str;			
			fname = zipfile.replace(/.*products\/\/(.*)/,"$1");
			console.log(files.length + " Downloading "+zipfile);
			var dir = "./data/";//+files[0].substring(0,3)+"/";
			child = exec(" mkdir -p " + dir + "; curl " + zipfile + " > "+dir+fname+";cd "+dir+";unzip -o "+fname, function (error, stdout, stderr) {
				f1 = "./data/"+files[0].replace(".gz","");
				f2 = "./data/"+files[0].replace(".gz","") + ".gz";
				if (!fs.existsSync(f1) && !fs.existsSync(f2)) {
					console.log(files.length + " 1. Did not find " + f1);
					console.log(files.length + " 1. Did not find " + f2);
					if (files[0].match(".gz")) {
						urls[0]  = urls[0].replace(/\.gz/g,"");
						files[0] = files[0].replace(".gz","");
						console.log(files.length + " Trying without gz extension in URL.");
						if (urls.length == 0) getmore(k);
						if (urls.length > 0) setTimeout(function () {get(urls,files)},1000);
						return;
					}
				}
	
				f1 = "./data/"+files[0].replace(".gz","");
				f2 = "./data/"+files[0].replace(".gz","") + ".gz";
				if (!fs.existsSync(f1) && !fs.existsSync(f2)) {
					console.log(files.length + " 2. Did not find " + f1);
					console.log(files.length + " 2. Did not find " + f2);
					console.log(files.length + " Fail.  Writing ./data/"+files[0]+".x");
					fs.writeFileSync("./data/"+files[0]+".x","");
				} else {
					console.log(files.length + " Success!!!!!  Done downloading.");
				}
				urls.shift();
				files.shift();
				console.log(files.length + " Files remaining: " + files.length);
				console.log("______________________");

				if (urls.length == 0) getmore(k);
				if (urls.length > 0) setTimeout(function () {get(urls,files)},1000);
			});
	    }
	});
}


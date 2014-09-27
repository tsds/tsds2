// To check each file and each day, set Nd = 1;

var mirrordir = "./data/";
var type      = "v";
var cadence   = process.argv[2] || "PT1M";
var k         = parseInt(process.argv[3]) || 0; // Which magnetometer in list to mirror.

var request = require('request');
var fs      = require('fs');
var exec    = require('child_process').exec;
var spawn   = require('child_process').spawn;

var expandISO8601Duration = require(__dirname + "/../../../tsdset/lib/expandtemplate").expandISO8601Duration;
var expandtemplate = require(__dirname + "/../../../tsdset/lib/expandtemplate").expandtemplate;

var sleepint = 1000; // download file has name dataYYYYMMDDHHMMSS.zip.  This prevents duplicate files.

if (cadence.match("PT1M")) {
	var urlo = "http://intermagnet.org/data-donnee/download-2-eng.php?rate=minute&type=variation&format=IAGA2002&from_year=$Y&from_month=$m&from_day=$d&to_year=$Y&to_month=$m&to_day=$d&filter_region%5B%5D=America&filter_region%5B%5D=Asia&filter_region%5B%5D=Europe&filter_region%5B%5D=Pacific&filter_region%5B%5D=Africa&filter_lat%5B%5D=NH&filter_lat%5B%5D=NM&filter_lat%5B%5D=E&filter_lat%5B%5D=SM&filter_lat%5B%5D=SH&select_all%5B%5D=TLC"; 
	var Nd   = parseInt(process.argv[4]) || 180;
} else {
	var urlo = "http://intermagnet.org/data-donnee/download-2-eng.php?rate=second&type=variation&format=IAGA2002&from_year=$Y&from_month=$m&from_day=$d&to_year=$Y&to_month=$m&to_day=$d&filter_region%5B%5D=America&filter_region%5B%5D=Asia&filter_region%5B%5D=Europe&filter_region%5B%5D=Pacific&filter_region%5B%5D=Africa&filter_lat%5B%5D=NH&filter_lat%5B%5D=NM&filter_lat%5B%5D=E&filter_lat%5B%5D=SM&filter_lat%5B%5D=SH&select_all%5B%5D=TLC"; 
	var Nd   = parseInt(process.argv[4]) || 50;
}

var lines = fs.readFileSync("catalog_"+cadence+".txt");
var list  = lines.toString().split("\n");

if (process.argv[3]) {
	if (process.argv[3].match(/[A-Z]/)) {
		for (var i = 0;i < list.length;i++) {

			if (process.argv[3] === list[i].split(" ")[0]) {
				var km = i;
			}
		}
		var listx = [];
		listx[0] = list[km];
		list = listx;
		k = 0;
	}
}

get(k);

function get(urls,files) {

	if (arguments.length == 1) {
		var urls   = [];
		var filesa = [];
		var filesc = [];
		var files  = [];
		var starts = [];
		var stops  = [];
		
		TLC = list[k].split(" ")[0];

		var options = {};
		if (cadence.match("PT1M")) {
			var tmp = "&select%5B%5D=TLClc$Y$m$d"+type+"min.min.gz";
			options.template = tmp.replace("TLClc",TLC.toLowerCase());
		} else {
			var tmp = "&select%5B%5D=TLClc$Y$m$d"+type+"sec.sec.gz";
			options.template = tmp.replace("TLClc",TLC.toLowerCase());
		}
		
		options.check    = false;
		options.side     = "server";
		options.type     = "strftime";
		options.timeRange = list[k].split(" ")[1] + "/" + list[k].split(" ")[2];
		
		if (new Date(options.stop).getTime() < new Date(options.start).getTime()) {
			options.timeRange = list[k].split(" ")[2] + "/" + list[k].split(" ")[1];
		}
		//console.log(options);
		filesa = expandtemplate(options);

		z = 0;
		for (j = 0;j<filesa.length;j=j+Nd) {
			filesc[z] = "";
			if (filesa[j]) {
				files[z] = filesa[j].replace("&select%5B%5D=","");
				starts[z] = filesa[j].replace(/.*([0-9]{8}).*/,"$1");
			}
			if (filesa[j+Nd-1]) { 
				stops[z] = filesa[j+Nd-1].replace(/.*([0-9]{8}).*/,"$1");
			} else {
				stops[z] = filesa[files.length-1].replace(/.*([0-9]{8}).*/,"$1");
			}
			for (i=j;i<j+Nd;i++) {
				filesc[z] = filesc[z]+filesa[i];
			}
			z = z+1;
		}
		filesc[z-1] = filesc[z-1].replace(/undefined/g,"");
		
		for (var j = 0;j<filesc.length;j++) {
			urls[j] = urlo+filesc[j]+"&email=rweigel%40gmu.edu&accept=accept";

			urls[j] = urls[j]
						.replace("from_year=$Y","from_year="+starts[j].substring(0,4))
						.replace("from_month=$m","from_month="+starts[j].substring(4,6))
						.replace("from_day=$d","from_day="+starts[j].substring(6,8))
						.replace("to_year=$Y","to_year="+stops[j].substring(0,4))
						.replace("to_month=$m","to_month="+stops[j].substring(4,6))
						.replace("to_day=$d","to_day="+stops[j].substring(6,8))
						.replace("TLC",TLC);
		}
	}	

	if (k == list.length) {
		console.log("k == " + list.length+" returning.");
		return;
	}
	// The following leads to maximum call stack problems (even after increasing --max-stack-size)
	// if (urls.length == 0) {get(k+1);return;}
	// Instead, do this:
	function getmore() {
		var com = "node mirror.js " + cadence + " " + (k+1);
		console.log("Executing " + com);
		child = exec(com, {maxBuffer:30000*1024},function (error, stdout, stderr) {
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
	
	var TLC = files[0].substring(0,3).toUpperCase();

	var chk = false;
	if (Nd == 1)
		var chk = fs.existsSync(mirrordir+TLC+"/"+cadence+"/"+files[0].replace(".gz",".x"));
		
	if (chk || fs.existsSync(mirrordir+TLC+"/"+cadence+"/"+files[0]) || fs.existsSync(mirrordir+TLC+"/"+cadence+"/"+files[0].replace(".gz","")) ) {

	 	if (fs.existsSync(mirrordir+TLC+"/"+cadence+"/"+files[0].replace(".gz","")+".x")) {
			if (Nd == 1)
				console.log(files.length + " File ./data/"+TLC+"/"+cadence+"/"+files[0].replace(".gz","") + ".x exists.  Not attempting re-download.");
	 	} else {
			console.log(files.length + " File ./data/"+TLC+"/"+cadence+"/"+files[0] + " exists.  Not re-downloading.");
		}
		urls.shift();
		files.shift();
		get(urls,files);
		return; 
	}
	console.log(TLC + " Request " + files.length + " " + urls[0].replace(/%5B%5D/g,"[]").replace(/%40/g,"@"));
	//console.log(files.length + " File: "+TLC+"/"+cadence+"/"+files[0]);
	
	request.get(urls[0].replace(/%5B%5D/g,"[]").replace(/%40/g,"@"), function (error, response, body) {

		if (error) {
			console.log(error);
			if (urls.length > 0) setTimeout(function () {get(urls,files)},sleepint);
		}
	    if (!error && response.statusCode == 200) {
	    	var str = body.replace(/\r\n|\n|\r/g,"").replace(/.*(app.*zip).*/g,"$1");
			zipfile = "http://www.intermagnet.org/" + str;
			fname = zipfile.replace(/.*products\/\/(.*)/,"$1");

			f1 = mirrordir+TLC+"/"+cadence+"/"+files[0].replace(".gz","");
			f2 = mirrordir+TLC+"/"+cadence+"/"+files[0].replace(".gz","") + ".gz";

			var dir = mirrordir+TLC+"/"+cadence+"/";
			var com = " mkdir -p " + dir + "; curl " + zipfile + " > "+dir+fname+";cd "+dir+";unzip -q -o "+fname+";rm -f "+fname;
			console.log(files.length + " Evaluating "+com);
			child = exec(com, function (error, stdout, stderr) {
				if (error) console.log(error);
				if (stdout) console.log(stdout)
				if (stderr) console.log(stderr)
				if (!fs.existsSync(f1) && !fs.existsSync(f2)) {
					console.log(files.length + " 1. Did not find " + f1);
					console.log(files.length + " 1. Did not find " + f2);
					if (files[0].match(".gz")) {
						urls[0]  = urls[0].replace(/\.gz/g,"");
						files[0] = files[0].replace(".gz","");
						console.log(files.length + " Trying without gz extension in URL.");
						if (urls.length == 0) getmore(k);
						if (urls.length > 0) setTimeout(function () {get(urls,files)},sleepint);
						return;
					}
				}
	
				f1 = mirrordir+TLC+"/"+cadence+"/"+files[0].replace(".gz","");
				f2 = mirrordir+TLC+"/"+cadence+"/"+files[0].replace(".gz","") + ".gz";

				if (!fs.existsSync(f1) && !fs.existsSync(f2)) {
					console.log(files.length + " 2. Did not find " + f1);
					console.log(files.length + " 2. Did not find " + f2);
					console.log(files.length + " Fail.  Writing ./data/"+TLC+"/"+cadence+"/"+files[0]+".x");
					if (Nd == 1)
						fs.writeFileSync(mirrordir+TLC+"/"+cadence+"/"+files[0]+".x","");
				} else {
					console.log(files.length + " Success!!!!!  Done downloading.");
				}
				urls.shift();
				files.shift();
				console.log("______________________");

				if (urls.length == 0) getmore(k);
				if (urls.length > 0) setTimeout(function () {get(urls,files)},sleepint);
			});
	    }
	});

}


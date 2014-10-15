var sampling  = process.argv[2] || "orig_int";
var timerange = "2014-10-01/2014-10-10"; // 1982-10-01 is earliest.

var filestr   = "image"; // Prefix in name of temporary file on server
var mirrordir = "./space.fmi.fi.processed/";
var url       = "http://space.fmi.fi/cgi-bin/imagecgi/image-data.cgi";

var request = require('request');
var fs      = require('fs');
var zlib    = require('zlib');
var mkdirp  = require('mkdirp');

var expandISO8601Duration = require(__dirname + "/../../../tsdset/lib/expandtemplate").expandISO8601Duration;
var expandtemplate = require(__dirname + "/../../../tsdset/lib/expandtemplate").expandtemplate;

var options = {};
options.check    = false;
options.side     = "server";
options.type     = "strftime";
options.timeRange = timerange;
options.template  = "$Y$m$d00.col2.gz";
files = expandtemplate(options);

// Must make request for data files sequentially because, e.g.,
// get(1);get(2) results in error message from server.
get(0);

function get(i) {

	if (i == files.length) {return};

	var form = {
				start: files[i].replace(".col2.gz",""),
				eventlength: "24",
				station: "",
				mystation: "",
				column2: "on",
				sampling: sampling,
				compression: "gz",
				filestr: filestr,
				yourname: "Robert Weigel",
				institute: "GMU",
				email: "rweigel@gmu.edu"
			};

	// Make request for temporary data file to be created.
	request.post( {url: url, form: form},
	 function (error, response, body) {
		console.log("Requesting http://space.fmi.fi/image/plots/"+filestr+files[i]);
		get(i+1);
		if (body.match("Unexpected error")) {
			console.log("---- Problem with request for "+files[i].replace(".col2.gz",""));
			return;
		}
		var r = request
					.get("http://space.fmi.fi/image/plots/"+filestr+files[i])
					.pipe(fs.createWriteStream("space.fmi.fi/"+filestr+files[i]));
			r.on("finish",function () {
				console.log("Wrote space.fmi.fi/"+filestr+files[i])
				splitfile("space.fmi.fi/"+filestr+files[i]);			
			})
	});

}

function splitfile(fname) {
		console.log("Reading "+fname)
		fs.readFile(fname, function (err,data) {
			console.log("Read "+fname);
			//console.log(err)
			zlib.gunzip(data, function(err, result) {
				result = result.toString().split("\n");
				var tmp = result[0].replace(/\sX/g,"_X").replace(/\sY/g,"_Y").replace(/\sZ/g,"_Z").replace(/\s+/g," ").split(" ");
				var tmp3 = result[3].split(" ")[5];
				if (tmp3 === "20") {
					cadence = "PT20S";
				} else if (tmp3 === "10") {
					cadence = "PT10S";	
				} else {
					cadence = "PT1M";
					//console.log("----Error - Unknown cadence.");
					//return;
				}
				for (var i = 6;i<tmp.length-1;i=i+3) {
					//console.log(tmp[i]);
				}
				var nm = (tmp.length-7);
				if (nm % 3 != 0) { 
					console.log("---- Number of data columns is not a multiple of 3.");
					console.log(tmp)
					return;
				}
				for (var j = 0;j<nm/3;j++) {
					var TLC = tmp[6+3*j].replace(/_[A-Z]/,"");
					var fname2 = mirrordir+TLC+"/" + cadence + fname.replace("space.fmi.fi","").replace("00.col2.gz","").replace(filestr,"") + TLC + ".col2";
					if (!fs.existsSync(mirrordir+TLC+"/" + cadence)) {
						mkdirp(mirrordir+TLC+"/" + cadence);
					}
					var data = "";
					for (var i = 2;i < result.length;i++) {
						data = data + result[i].substring(0,20)+result[i].substring(24*(j+1)-1,24*(j+2)-1) + "\n";
					}
					console.log("Writing "+fname2)
					fs.writeFile(fname2,data, function (err) {
						//console.log("Done");
					});
				}
			})
	})
}

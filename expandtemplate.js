//function expandtemplate(template,Start,Stop,type,check) {

template = "http://magweb.cr.usgs.gov/data/magnetometer/BDT/OneMinute/bdt%Y%m%dvmin.min";
Start = "2012-01-01";
Stop = "2012-01-20";
type = "strftime";
check = true;
var debug = true;

var tic = new Date().getTime();
if (type == "strftime") {

	// For including external js, see also http://stackoverflow.com/questions/5625569/include-external-js-file-in-node-js-app
	eval(require('fs').readFileSync('deps/strftime.js', 'utf8'));
	eval(require('fs').readFileSync('deps/date.js', 'utf8'));	 

	files = new Array();

	var START_ms   = new Date(Date.parse(Start));
	var STOP_ms    = new Date(Date.parse(Stop));
	var Ndays      = 1 + Math.round((STOP_ms.valueOf()-START_ms.valueOf())/(1000*24*60*60));
	var START_date = Date.parse(Start);

	var i = 0;
	while (i < Ndays) {
		fname = START_date.strftime(template);
		files[i] = fname;
		START_date.addDays(1);
		i = i + 1;
	}
}

if (type == "sprintf") {
	val(require('fs').readFileSync('deps/sprintf-0.7-beta1.js', 'utf8'));
	
	io = parseInt(Start);
	for (i = io; i < parseInt(Stop) + 1; i++) {
		var tmps = template;
		files[i-io] = [sprintf(tmps,i)];
	}
}
var elapsed = new Date().getTime() - tic;

if (debug) {
	console.log("Generated " + files.length + " URLs");
	console.log("URL list generation time: " + elapsed + " ms (" + Math.round(files.length/elapsed) + " per ms)");
}

if (check) {
	eval(require('fs').readFileSync('deps/node/head.js', 'utf8'));	 
	head(files, function (headers) {
		//console.log(headers);
		//console.log(files);
		info = new Array();
		for (i = 0;i < files.length; i++) {
			info[i]	 = new Array();
			info[i][0] = files[i];
			info[i][5] = '';
			if (headers[i].hasOwnProperty("last-modified"))
				info[i][1] = headers[i]["last-modified"]; 
			if (headers[i].hasOwnProperty("content-length"))
				info[i][2] = headers[i]["content-length"]; 
			if (headers[i].hasOwnProperty("content-type"))
				info[i][3] = headers[i]["content-type"]; 
			if (headers[i].hasOwnProperty("etag"))
				info[i][4] = headers[i]["etag"].replace(/"/g,'');
			if (headers[i].hasOwnProperty("content-md5"))
				info[i][5] = headers[i]["content-md5"].replace(/"/g,'');  
		}
		console.log(info);
	});
} else {
	//console.log(files);				
}
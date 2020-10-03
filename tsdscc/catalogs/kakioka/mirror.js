var request = require('request');
var jsdom   = require("jsdom");
var fs      = require('fs');
var moment  = require('moment');
var unzip   = require('unzip');
var fs      = require( 'fs' );

//var zlib    = require('zlib');

var expandISO8601Duration = require(__dirname + "/node_modules/tsdset/lib/expandtemplate").expandISO8601Duration;
var expandtemplate = require(__dirname + "/node_modules/tsdset/lib/expandtemplate").expandtemplate;

options = {};
options.template = "$Y-$m-$d";
//options.timeRange = "2012-12-14/2015-01-31";
options.timeRange = "1997-01-01/2015-01-31";
options.debug = true;



var sta = "kak";
var type = "Geomagnetic";

var sta = "mem";	
var type = "Geomagnetic";

if (sta.match("kak")) {
    if (type == "Geomagnetic") {
		var id = "1046";
		var Data_num = "1143";
		var Name = "Geomagnetic field";
    } else {
		var id = "1063";
		var Data_num = "2141";
		var Name = "Geoelectric field";
		options.timeRange = "2013-04-29/2015-01-31";
    }
}
if (sta.match("mem")) {
    if (type == "Geomagnetic") {
		// 1-minute
		//var id = "1050";
		//var Data_num = "1243";
		// 1-second
		var id = "2560"
		var Data_num = "1231"
		var Name = "Geomagnetic field";
		options.timeRange = "2003-10-01/2003-10-31";
    } else {
		// 1-minute
		var id = "1067";
		var Data_num = "2241";
		// 1-second
		var id = "2554"
		var Data_num = "1131"
		var Name = "Geoelectric field";
		options.timeRange = "2003-10-01/2003-10-31";
    }
}

var list = expandtemplate(options);

login();

function login() {
	//Cookie = res.headers["set-cookie"][0];
	// Read page with jQuery.
	var options = 	{
						url: "http://www.kakioka-jma.go.jp/obsdata/metadata/en/orders/new/"+id,
						headers: {
							"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36"
							},
						followAllRedirects: true
					};

	console.log('requesting ' + options.url);
	request.get(options, function (err,res,body) {
		if (err) console.log(err);
		console.log(res.headers)
		Cookie = res.headers["set-cookie"][0].split(";")[0];
		console.log('_____________________________________________________________________________');
		console.log("Read cookie from response headers of "+options.url);
		console.log(Cookie)
		login2(body,Cookie);
	});
}

function login2(body,Cookie) {
	jsdom.env(
		body,
		['http://code.jquery.com/jquery-1.6.min.js'],
		function (err, window) {

			//if (err) console.log(err);
			// Extract 
			var $ = window.jQuery;
			//var hidden = $("fieldset input[type*='hidden']");
			//console.log($("li"))
			var tok = $("input[name='authenticity_token']").attr('value')
			console.log('_____________________________________________________________________________');
			console.log("Read authenticity_token from response body.");
			console.log("Token: " + tok);
			//var Data_num = $("order_Data_num").attr('value');

			// Seems that order[Start_date ... does not matter.
			var form = {
							"utf8": "✓",
							"authenticity_token": tok,
							"order[Data_num]": Data_num,
							"order[Name]": Name,
							"order[Station]": "Memambetsu Magnetic Observatory",
							"order[IAGA_code]": "MMB",
							"order[Interval]": "1-second (instantaneous)",
							"order[Type]":" definitive",
							"order[start_line]": "1997-04-01",
							"order[dead_line]": "2019-01-31",
							"order[email]": "rweigel@gmu.edu",
							"order[Research_field]": "solar terrestrial environment,space weather",
							"order[Start_date(1i)]": "2003",
							"order[Start_date(2i)]": "10",
							"order[Start_date(3i)]": "2",
							"order[End_date(1i)]": "2003",
							"order[End_date(2i)]": "10",
							"order[End_date(3i)]": "2",
							"order[Components]": "XYZF",
							"order[Confirm]":"1",
							"commit": "Submit"
						};

			var options = 	{
								url: "http://www.kakioka-jma.go.jp/metadata/en/orders",
								form: form,
								followAllRedirects: true,
								headers: {
									"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.76 Safari/537.36",
									"Cookie": Cookie
								}
							};

			console.log("__________________________________________________________________");
			console.log("POST 1: Requesting create file page.");
			console.log(options);
	        // POST request.
	        request.post(options, function (err,res,body) {
	        	if (err) console.log(err)
					Cookie = res.headers["Cookie"];
					//console.log(Cookie)
	        		var form = 
	        					{
									utf8: "✓",
									authenticity_token: tok,
									START_DATE: list[0],
									END_DATE: list[0],
									DATA_NUM: Data_num,
									commit: "Create file",
				        		}
					var options = 	{
										url: "http://www.kakioka-jma.go.jp/obsdata/metadata/en/orders/makefiles",
										headers: {
												"Accept":"*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
												"Accept-Encoding": "gzip, deflate",
												"Referer":"http://www.kakioka-jma.go.jp/metadata/orders/en/download",
												"Cookie": Cookie,
												"X-CSRF-Token": tok,
												"X-Requested-With": "XMLHttpRequest",
												"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.76 Safari/537.36"											
												},
										form: form,
										followAllRedirects: true
									};

					console.log("__________________________________________________________________");
					console.log("POST 2: Requesting file creation.");
					console.log(options);
			        request.post(options, function (err,res,body) {
			        	if (err || res.headers.status != '200') {
					    console.log("__________________________________________________________________")
					    if (err) {console.log("Error:");console.log(err)}
					    console.log("Headers:")
			        	    console.log(res.headers)
					    console.log("Body:")
					    console.log(res.body)
					    console.log("__________________________________________________________________")
						list.shift();
  				    if (list.length > 0) login();
				    return
					}

					
			    			Cookie = res.headers["set-cookie"][0];
						console.log(Cookie)
						    //console.log(body);
						    //console.log(res);
							
			        		var form = 
			        					{
											"utf8": "✓",
											"authenticity_token": tok,
											"commit": "download"
										}
							var options =
										{
											url: "http://www.kakioka-jma.go.jp/metadata/orders/dlfile?locale=en",
											form: form,
											encoding: null,
											headers: {
												"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
												"Accept-Encoding": "gzip, deflate",
												"Referer":"http://www.kakioka-jma.go.jp/metadata/orders/download?locale=en",
												"Cookie": Cookie,
												"X-CSRF-Token": tok,
												"X-Requested-With": "XMLHttpRequest",
												"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.76 Safari/537.36"											
											}
										};

							setTimeout(function () {
								console.log("__________________________________________________________________");
								console.log("POST 3: Requesting file.");
								console.log(options);
				        		request.post(options, function (err,res,body) {
				        			if (err) console.log(err);
				        			console.log(res)
				        			var regexp = /filename=\"(.*)\"/gi;
									var filename = regexp.exec( res.headers['content-disposition'] )[1];
									console.log(filename);
									//console.log(res.request.body.toString());
									fs.writeFileSync("data/" + filename,body);
									list.shift();
									if (list.length > 0) login();
								})
							},1000)
				        	//console.log(body);
						})
	        });

		});
}

var request = require('request');
var jsdom   = require("jsdom").jsdom;
var fs      = require('fs');

var username = "";
var password = "";
var userid   = "270";
var start    = "2010-09-05";

var options = {"rejectUnauthorized": false,
				url: "https://carisma.ca/component/users/?view=login"};
request.get(options,
		function (err, res, body) {
			console.log(res.headers)
			jsdom.env({
				html: body,
				scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
				done: function(err, window) {
					var $ = window.jQuery;
					var hidden = $("fieldset input[type*='hidden']");
					console.log($(hidden[0]).attr("value"));
					console.log($(hidden[1]).attr("name"));
					console.log($(hidden[1]).attr("value"));
					console.log(res.headers["set-cookie"][0]);
					var form = {'username':username,
								'password':password,
								'return': $(hidden[0]).attr("value")}
					form[$(hidden[1]).attr("name")] = $(hidden[1]).attr("value");
					console.log(form);
					var Cookie = res.headers["set-cookie"][0];
					var options = {"url": "https://carisma.ca/component/users/?task=user.login",
									"rejectUnauthorized": false,
									"form": form,
									"headers": {'Cookie': Cookie}};
					console.log(options);

					request.post(options, function (err,res,body) {
						console.log(err);
						console.log(res.headers)
						var form2 =
							{
								have_user:"1",
								user_id:userid,
								selected_data:"1",
								sites_set:"1",
								instrument_type:"fgm",
								start_date:start,
								no_days:"1",
								sites_req:"all"
							};
						console.log(form2)
						var options2 =
							{
								"url": "https://www.carisma.ca/carisma-data-repository",
								"headers": {'Cookie': Cookie},
								"rejectUnauthorized": false,
								"form": form2
							};
						request.post(options2,
								function (err, res, body) {



									console.log(err);
									console.log(res.headers)
									console.log(body);


									var fname = start+"_to_"+start+"_fgm_all_data.zip";
									var options3 = {
										"rejectUnauthorized": false,
										"url": "https://www.carisma.ca/downloads/"+fname+"?",
										"headers": {"Accept-Encoding": "gzip,deflate,sdch"},
										"method": "HEAD"
									};

									var si = setInterval(checkhead,10000)

									function checkhead() {

										console.log("Doing Head Request.")
										request.get(options3, function (err,res,body) {

											if (res.statusCode != 404) {
												console.log("File found.  Downloading.")
												clearTimeout(si);
												var r = request.get(options3).pipe(fs.createWriteStream(fname));
												r.on("finish",function () {console.log("Wrote " + fname)})
											} else {
												console.log("File not found.  Try again in 10 seconds.")
											}

										})

									}


								});

					})
				}})
		});


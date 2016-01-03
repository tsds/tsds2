var request = require('request');
var cheerio = require('cheerio');

request.debug = true 

var cache = {};

function getcache(key, cb) {
	cb("", cache[key].list, cache[key].flat, cache[key].nested);
}

function writecache(opts, list, flat, nested) {
	console.log(opts.url)
	console.log(opts.key)
	if (opts.url !== opts.key) {
		cache[opts.url] = {};
		cache[opts.url].ready  = false;
		cache[opts.url].list   = list;
		cache[opts.url].flat   = flat;
		cache[opts.url].nested = nested;
		cache[opts.url].ready  = true;
	}
	cache[opts.key] = {};
	cache[opts.key].ready  = false;
	cache[opts.key].list   = list;
	cache[opts.key].flat   = flat;
	cache[opts.key].nested = nested;
	cache[opts.key].ready  = true;
}

function dirwalk(opts, path, cb) {

	if (typeof(opts) === "object") {
		var url          = opts.url.replace(/\/$/,"");
		opts.debug       = opts.debug       || false;
		opts.filepattern = opts.filepattern || "";
		opts.dirpattern  = opts.dirpattern  || "";
	} else {
		var url  = opts;
		var opts = {url: url, debug: false, filepattern: "", dirpattern: ""};
	}
	opts.url = opts.url.replace(/\/$/,"");

	var debug       = opts.debug;
	var filepattern = opts.filepattern;
	var dirpattern  = opts.dirpattern;

	//console.log("+" + opts.url);

	var key = opts.url + opts.filepattern + opts.dirpattern;
	opts.key = key;

	if (typeof(qs) === "string") {
		qo = parseQueryString(qs)
	}

	if (arguments.length == 2) {
		cb = path;
		path = "/";
		if (cache[key]) {
			if (cache[key].ready) { // Needed?
				if (debug) console.log("--Direct cache hit.")
				cb("", cache[key].list, cache[key].flat, cache[key].nested);
				return;
			}
		}
		if (cache[url]) {
			if (cache[url].ready) { // Needed?
				if (debug) console.log("--Indirect cache hit.")
				finish(cache[url].list, cache[url].flat);
				return;			
			}
		}
		if (debug) console.log("--No cache hit.")
		dirwalk[key] = {flat: {}, list: [], Nr: 0, Nc: 0};
	} else {
	 	dirwalk[key].Nr = dirwalk[key].Nr + 1;
		url = url + path;
	}

	if (0) {
		if (debug) console.log("# Requests:  " + dirwalk[key].Nr)
		if (debug) console.log("# Responses: " + dirwalk[key].Nc)
		if (debug) console.log("Difference:  " + (dirwalk[key].Nr - dirwalk[key].Nc))
	}

	if (debug) console.log("Input path: " + path);
	doget(url, path);

	function doget(url, path) {
		var request = require("request");
		var getopts = {method: 'GET', uri: url, gzip: true, pool: {maxSockets: 5}};
		if (debug) console.log("Requesting " + url);
		request.get(getopts, function (error, response, body) {

			if (error) {
				if (debug) console.log(error);
				console.log(url + " " + path);
				dirwalk[key].flat[path] = error;
		    	dirwalk[key].Nc = dirwalk[key].Nc + 1;
				return;
			}

			if (debug) {
				console.log("Response from " 
							+ response.request.uri.href);
			}

			$ = cheerio.load(body);
			links = $('a');
			var href = "";
			$(links).each(function(i, link) {
				href = $(link).attr('href');
				//if (debug) console.log(href)
				if (!href.match(/^\//) && href.match(/\/$/)) {
					newpath = path + href;
					if (debug) {
						console.log("Calling dirwalk with path = " + newpath);
					}
					dirwalk[key].flat[newpath] = [];
					dirwalk(opts, newpath, cb);
				} else if (!href.match(/^\//) && !href.match(/\/$/)) {
					if (!dirwalk[key].flat[path]) {
						dirwalk[key].flat[path] = [];
					}
					if (!dirwalk[key].list) {
						dirwalk[key].list = [];
					}
					if (filepattern === "") {
						dirwalk[key].list.push(path + href);
						dirwalk[key].flat[path].push(href);						
					} else {
						if (href.match(new RegExp(filepattern))) {
							dirwalk[key].list.push(path + href);
							dirwalk[key].flat[path].push(href);
						}					
					}
				}
			})
			if (debug) {
				console.log("Finished processing response from "
								+ response.request.uri.href);
			}
			if (dirwalk[key].Nr == dirwalk[key].Nc) {
				finish(dirwalk[key].list, dirwalk[key].flat);
			}
	    	dirwalk[key].Nc = dirwalk[key].Nc + 1;

		})
	}

	function finish(list, flat) {
		if (debug) console.log("Done.");
		// Convert flat object to tree object
		var nested = {};
		for (flatkey in flat) {
			if (flatkey.match(new RegExp(dirpattern))) {
				stringToObj(flatkey.replace(/^\/|$\//,""), flat[flatkey], nested);
			} else {
				delete flat[flatkey];
			}
		}
		var kr = 0;
		var lo = list.length;
		for (k = 0; k < lo; k++) {
			if (list[kr].match(new RegExp(dirpattern))) {
				kr = kr+1;
			} else {
				list.splice(kr, 1);
			}
		}
		list.sort();
		if (debug) console.log("Callback.")
		writecache(opts, list, flat, nested);
		cb("", list, flat, nested);
	}

	//http://stackoverflow.com/questions/22985676/convert-string-with-dot-notation-to-json
	stringToObj = function(path, value, obj) {
		var parts = path.split("/");
		var part;
		var last = parts.pop();
		while (part = parts.shift()) {
			if (typeof obj[part] != "object") {
				obj[part] = {};
			}
			obj = obj[part];
		}
		obj[last] = value;
	}
}
exports.dirwalk = dirwalk
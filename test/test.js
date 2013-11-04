
// Local server
// Production server
// Both servers using data from original data source 

var N    = 10;
var port = 8004;

var fs      = require("fs");
var sys     = require('sys');
var exec    = require('child_process').exec;
var spawn   = require('child_process').spawn;
var request = require("request");
var	express = require('express');
var http    = require('http');
var url     = require('url');
var zlib    = require('zlib');

eval(fs.readFileSync('./test/tests.js','utf8'));

function s2b(str) {if (str === "true") {return true} else {return false}}
function s2i(str) {return parseInt(str)}

var tn      = s2i(process.argv[2] || "0");							// Start test Number

/*
var sync    = s2b(process.argv[2] || "true");						// Do runs for test sequentially
var all     = s2b(process.argv[4] || "true");						// Run all tests after start number
var n       = s2i(process.argv[5] || "5");							// Number of runs per test
*/
var server  = process.argv[6]     || "http://localhost:"+port+"/";	// DataCache server to test

var Ntests = 2;
var alltests = true;

function gettests(m) {

	var xtests = [];

	//console.log("Creating urls for test "+m)
	for (var z = 0;z<tests.length;z++) {
		xtests[z] = {};
		xtests[z].test = tests[z].test || "";
		if (m == 0) {
			xtests[z].url = server + "?usecache=false&" + tests[z].url;
		}
		if (m == 1) {
			xtests[z].url = server + "?" + tests[z].url;
		}
		if (typeof(tests[z].test) === "undefined") {
			xtests[z].test = function (data) {len=data.length;ret=len>0;eval(tests[0].log);return ret};
			xtests[z].log  = 'console.log("    Should be > 0: " + len);console.log("    Result: " + ret)';
		}
	}
	return xtests;
}
runtest(0,tn);

function diff(f1,f2) {
		child = exec('diff ' + f1 + ' ' + f2, function (error, stdout, stderr) {
			if (stdout.length > 0) {
				console.log("Writing to stdout");
				console.error("difference between " + f1 + " and " + f2 + ":");
				console.error(stdout);
			}
		});
}

function command(jj,m) {
	var xtests = gettests(m);
	var com = "";
	var fname = "test/output/out." + jj + "." + m;
	if (xtests[jj].url.match("stop") && !xtests[jj].url.match("urilist")) {
		com = 'curl -s -g "' + xtests[jj].url + '" | gunzip > ' + fname;
		//com = 'curl -s -g "' + xtests[jj].url + '"  > ' + fname;
	} else {
		com = 'curl -s -g "' + xtests[jj].url + '"  > ' + fname;
	}
	return com + " ; head "+fname;
}



function runtest(jj,m) {
	if (jj == 0) {runtest.fails = [];runtest.f=0;runtest.sum = 0;}
	var xtests = gettests(m);
	var xcom = command(jj,m);

	console.log("Executing "+xcom)
	
	var fname = "test/output/out." + jj + "." + m;
	child = exec(xcom, function (error, stdout, stderr) {
    	console.log("Reading "+fname);
    	data = fs.readFileSync(fname);
	    console.log("Request "+jj+" completed.  Running test\n    "+xtests[jj].test);

	    ret = xtests[jj].test(data);
    	console.log(stdout)
    	
		if (ret) {
			console.log("Test "+jj+" passed.\n")
			runtest.sum = runtest.sum+1;
		} else {
			runtest.fails[runtest.f] = {};
			runtest.fails[runtest.f].url  = xtests[jj].url; 
			runtest.fails[runtest.f].test = xtests[jj].test.toString();
			runtest.fails[runtest.f].N    = jj;

			runtest.f = runtest.f+1;

			console.log("Test "+jj+" failed.\n")
		}

    	if (jj < xtests.length-1) {
			runtest(jj+1,m);
		} else {
			console.log(runtest.sum + "/" + tests.length + " tests passed.");
			if (runtest.fails.length > 0) {
				console.log("\nFailures:");
			}
			for (kk=0;kk<runtest.fails.length;kk++) {
				console.log("\nTest " + runtest.fails[kk].N)
				console.log(runtest.fails[kk].url)
				console.log(runtest.fails[kk].test)
			}
			if (m+1 < Ntests && alltests) {runtest(0,m+1);}			
		}
	});
}
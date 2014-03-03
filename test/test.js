// Local server
// Production server
// Both servers using data from original data source 

var N    = 10;
var port = 8004;

var fs       = require("fs");
var sys      = require('sys');
var exec     = require('child_process').exec;
var spawn    = require('child_process').spawn;
var request  = require("request");
var	express  = require('express');
var http     = require('http');
var url      = require('url');
var zlib     = require('zlib');
var execSync = require("exec-sync");

eval(fs.readFileSync('./test/tests.js','utf8'));

function s2b(str) {if (str === "true") {return true} else {return false}}
function s2i(str) {return parseInt(str)}

var tn       = s2i(process.argv[2] || "1");							// Start test Number
var alltests = s2b(process.argv[3] || "true");;

/*
var sync    = s2b(process.argv[2] || "true");						// Do runs for test sequentially
var all     = s2b(process.argv[4] || "true");						// Run all tests after start number
var n       = s2i(process.argv[5] || "5");							// Number of runs per test
*/
var server  = process.argv[6]     || "http://localhost:"+port+"/";	// DataCache server to test

var Ntests   = 2;

//var Ntests   = 1;
//var alltests = false;

runtest(tn,1);

function gettests(m) {

	var xtests = [];

	//console.log("Creating urls for test "+m)
	for (var z = 0;z<tests.length;z++) {
		xtests[z] = {};
		xtests[z].test = tests[z].test || "";
		if (m == 1) {
			xtests[z].url = server + "?usecache=false&" + tests[z].url;
		}
		if (m == 2) {
			xtests[z].url = server + "?" + tests[z].url;
		}
	}
	return xtests;
}

function diff(f1,f2) {
		var result = execSync('diff ' + f1 + ' ' + f2);
		if (result.length > 0) {
			console.log("Difference between " + f1 + " and " + f2 + ":");
			console.log(result);
			return false;
		} else {
			return true;
		}
}

function command(jj,m) {
	var xtests = gettests(m);
	var com = "";
	var fname = "test/output/out." + jj + "." + m;
	if (xtests[jj].url.match("stop") && !xtests[jj].url.match("urilist")) {
		//com = 'curl -s -g "' + xtests[jj].url + '" | gunzip > ' + fname;
		com = 'curl -s -g "' + xtests[jj].url + '" > ' + fname;
	} else {
		com = 'curl -s -g "' + xtests[jj].url + '"  > ' + fname;
	}
	return com + " ; head "+fname;
}

function runtest(jj,m) {
	if (typeof(runtest.fails) === "undefined") {
		runtest.fails = [];runtest.f=0;runtest.sum = 0;
	}
	var xtests = gettests(m);
	var xcom = command(jj,m);

	console.log("\nTest "+jj)
	console.log("Executing "+xcom)
	
	var fname = "test/output/out." + jj + "." + m;
	child = exec(xcom, function (error, stdout, stderr) {
    	console.log("Reading "+fname);
    	data = fs.readFileSync(fname);
    	if (xtests[jj].test) {
    	    console.log("Request "+jj+" completed.  Running test.");
    		ret = xtests[jj].test(data);
    	} else {
    	    console.log("Request "+jj+" completed.  Comparing output.");
    		ret = diff("test/output0/out." + jj + ".0","test/output/out." + jj + "." + m);
    	}
		if (ret == true) {
			runtest.sum = runtest.sum+1;
			console.log("PASS.\n");
		} else {
			runtest.fails[runtest.f] = {};
			runtest.fails[runtest.f].url  = xtests[jj].url; 
			runtest.fails[runtest.f].test = xtests[jj].test.toString();
			runtest.fails[runtest.f].N    = jj;
			runtest.f = runtest.f+1;
			console.log("FAIL.\n");
		}

    	if (jj < xtests.length-1 && alltests)  {
			runtest(jj+1,m);
		} else {
			console.log("")
			if (alltests) console.log(runtest.sum + "/" + tests.length + " tests passed.");
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
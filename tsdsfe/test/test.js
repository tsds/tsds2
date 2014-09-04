
// Run all tests:
//		nodejs test/test.js --testfile=test/failing-tests.js
//		nodejs test/test.js --testfile=test/data-tests.js
//		nodejs test/test.js --testfile=test/metadata-tests.js
// Run one test:
//		nodejs test/test.js --start=27 --alltests=false
// Run all tests including and after test 3:
//		nodejs test/test.js --start=3

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
var argv     = require('minimist')(process.argv.slice(2));
var clc      = require('cli-color');

function logc(str,color) {var msg = clc.xterm(color); console.log(msg(str));};
function s2b(str) {if (str === "true") {return true} else {return false}}
function s2i(str) {return parseInt(str)}

var tn       = argv.start || 0;				// Start test Number
var alltests = s2b(argv.alltests || "true");
var Ntests   = argv.ntests;
var port     = argv.port || 8004;
var testfile = argv.testfile || './test/failing-tests.js';
eval(fs.readFileSync(testfile,'utf8'));

// DataCache server to use
var server  = "http://localhost:"+port+"/";	


console.log("--------------------------------------------------------")
console.log("--------------------------------------------------------")

runtest(tn,1);

function gettests(m) {

	var xtests = [];

	//console.log("Creating urls for test "+m)

	for (var z = 0;z<tests.length;z++) {
		xtests[z] = {};
		xtests[z].test = tests[z].test || "";
		xtests[z].note = tests[z].note || "";

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
	if (jj == 0 || typeof(runtest.fails) === "undefined") {
		runtest.fails = [];
		runtest.f     = 0;
		runtest.sum   = 0;
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
			logc("PASS.\n",10);
		} else {
			runtest.fails[runtest.f]      = {};
			runtest.fails[runtest.f].url  = xtests[jj].url; 
			runtest.fails[runtest.f].test = xtests[jj].test.toString();
			runtest.fails[runtest.f].N    = jj;


			if (xtests[jj].note.length > 0) {
				runtest.fails[runtest.f].note  = xtests[jj].note; 
				console.log(xtests[jj].note);
			}

			runtest.f = runtest.f+1;
			logc("FAIL.\n",9);
		}
	
	    if (jj < xtests.length-1)  {
			runtest(jj+1,m);
		} else {
			console.log("")
			if (alltests) {
				if (runtest.sum == tests.length) {
					logc((runtest.sum)+ "/" + tests.length + " tests passed.",10);
				} else {
					logc((runtest.sum)+ "/" + tests.length + " tests passed.",9);
				}
			}
			
			if (0) {
				if (runtest.fails.length > 0) {
					console.log("\nFailures:");
				}
				for (kk=0;kk<runtest.fails.length;kk++) {
					console.log("\nTest " + runtest.fails[kk].N);
					console.log(runtest.fails[kk].url);
					//console.log(runtest.fails[kk].test);
					if (runtest.fails[kk].note) {
						console.log(runtest.fails[kk].note);
					}
				}
			}

			if (m < 2) {
				//console.log("--------------------------------------------------------")
				//runtest(0,m+1);
			} else {
				if (runtest.fails.length > 0) {
					process.exit(1);
				} else {
					process.exit(0);
				}
			}			
		}
	});
}
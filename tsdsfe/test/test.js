// Run all tests:
//		node test/test.js --testfile test/metadata-tests.js
//		node test/test.js --testfile test/data-tests.js
//		node test/test.js --testfile test/failing-tests.js
//
// Run one test:
//		node test/test.js --testfile test/metadata-tests.js --start 4 --onetest true
// Run all tests starting at test #4:
//		node test/test.js --start 4

var fs       = require("fs");
var sys      = require('sys');
var exec     = require('child_process').exec;
var execSync = require('child_process').execSync;
//var execSync = require("exec-sync");
var spawn    = require('child_process').spawn;
var request  = require("request");
var express  = require('express');
var http     = require('http');
var url      = require('url');
var zlib     = require('zlib');
var clc      = require('cli-color');
var argv     = require('yargs')
				.default
				({
					'port': 8004,
					'start': "0",
					'onetest': "false",
					'N': "1",
					'testfile': "./test/failing-tests.js",
				})
				.argv

function logc(str,color) {var msg = clc.xterm(color); console.log(msg(str));};
function s2b(str) {if (str === "true") {return true} else {return false}}
function s2i(str) {return parseInt(str)}

var port     = argv.port;
var start    = s2i(argv.start); // Start test Number
var onetest  = s2b(argv.onetest);
var Ntests   = s2i(argv.N);
var testfile = argv.testfile;
eval(fs.readFileSync(testfile,'utf8'));

// TSDS server to use
var server  = "http://localhost:"+port+"/";	

console.log("--------------------------------------------------------")
console.log("--------------------------------------------------------")

var m = 1;
runtest(0,m);

function gettests(m) {

	var xtests = [];

	//console.log("Creating urls for test "+m)
	if (onetest) {
		testsr = tests.slice(start,start+1);
	} else {
		testsr = tests.slice(start);
	}

	for (var z = 0;z<testsr.length;z++) {
		xtests[z] = {};
		xtests[z].test = testsr[z].test || "";
		xtests[z].note = testsr[z].note || "";
				
		if (m == 1) {
			xtests[z].url = server + "?usedatacache=false&useimagecache=false&usemetadatacache=false&" + testsr[z].url;
		}
		if (m == 2) {
			xtests[z].url = server + "?" + testsr[z].url;
		}
		xtests[z].url = xtests[z].url.replace("__SERVER__",server)

	}

	return xtests;
}

function diff(f1,f2) {
		var result = execSync('diff ' + f1 + ' ' + f2 + ' | head -5');
		if (result.length > 0) {
			console.log("First 5 lines of output of diff of " + f1 + " and " + f2 + ":");
			console.log(result);
			return false;
		} else {
			return true;
		}
}

function command(jj,m) {
	var xtests = gettests(m);
	var com = "";
	var fname = "test/output/out." + (jj+start) + "." + m;

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

	console.log("\nTest "+(jj+start));
	console.log("Executing "+xcom)
	
	var fname = "test/output/out." + (jj+start) + "." + m;
	child = exec(xcom, function (error, stdout, stderr) {
	    	console.log("Reading "+fname);
	    	data = fs.readFileSync(fname);
	    	if (xtests[jj].test) {
	    	    console.log("Request "+(jj+start)+" completed.  Running test.");
	    		ret = xtests[jj].test(data);
	    	} else {
	    	    console.log("Request "+jj+" completed.  Comparing output.");
	    		ret = diff("test/output0/out." + (jj+start) + ".0","test/output/out." + (jj+start) + "." + m);
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
			if (!onetest) {
				if (runtest.sum == xtests.length) {
					logc((runtest.sum)+ "/" + xtests.length + " tests passed.",10);
				} else {
					logc((runtest.sum)+ "/" + xtests.length + " tests passed.",9);
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
var expandDD   = require('./expandDD.js').expandDD
var fs         = require('fs');
var moment     = require('moment')
var express    = require('express');
var app        = express();
var serveIndex = require('serve-index')

app.use('/test', serveIndex('test/', {'icons': true}))
app.use("/test", express.static(__dirname + "/test"));

var PORT = 3001;
app.listen(PORT);

var debug  = true; // Debug expandDD
var debugt = true; // Show more logging for tests.

var single = false; // Run only test number tn
var tn     = 0;

if (debug) {
	console.log("-----------------------------------------------");
	console.log("Running tests with sequential = true in 500 ms.");
	console.log("-----------------------------------------------");
}

// Wait for server to start.
setTimeout(runtests, 500);

eval(fs.readFileSync('tests.js','utf8'));

function runtests() {
	if (single) {
		runtest(tn);
	} else {
		runtest(0);
	}
}

function runtest(tn) {
	if (debug) console.log("\n")
	if (debugt) console.log("----------------------------")
	if (debugt) console.log("Test " + tn + ": Calling expandDD with query string: " + tests[tn].url);
	if (debugt) console.log("Encoded query string: " + encodeURIComponent(tests[tn].url));

	if (debug) console.log("")
	expandDD({queryString: tests[tn].url, debug: debug}, function (err, cat) {
		var status = tests[tn].test(err, cat);
		finish(tn, status);
	})
}

function finish(tn, status) {
	if (typeof(finish.Np) == "undefined") {
		finish.Np = 0; // Number of passed tests.
	}
	if (status) {
		console.log("Test " + tn + ": PASS");
		finish.Np = finish.Np + 1;
	} else {
		console.log("Test " + tn + ": FAIL");
	}
	if (debug) console.log("----------------------------")
	if (!single && tn + 1 < tests.length) {
		runtest(tn+1);
	} else {
		if (finish.Np == tests.length) {
			if (debugt) console.log("\n" + finish.Np + "/" + finish.Np + " tests passed.  Exiting with code 0.")
			process.exit(0);
		} else {
			if (debugt) console.log("\n" + finish.Np + "/" + tests.length + " tests passed.  Exiting with code 1.")
			process.exit(1);
		}
	}
}
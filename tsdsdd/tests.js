// TODO: Test things besides timeFormat and start/stop.

var BASE = "http://localhost:"+PORT+"/";

var tests = []
i = 0

// Single file with no start/stop given.  They are derived by inspecting file.
tests[i] = {}
tests[i].url = "uri="+BASE+"test/data/2015-11-20.txt&columns=2"
tests[i].test = function (err, data) {
	var testv0 = data["catalog"]["dataset"][0]["timeCoverage"][0]["Start"][0]
	var testv1 = data["catalog"]["dataset"][0]["timeCoverage"][0]["End"][0]
	var test0 = "2015-11-20T00:00:01.985Z"
	var test1 = "2015-11-20T23:59:03.880Z"
	if (debugt) console.log("Test:   Response Start/End values should be " + test0 + "/" + test1 + ".\nFound " + testv0 + "/" + testv1 + ".")	
	if (testv0 === test0 && testv1 === test1) {
		return true
	} else {
		return false
	}
}

// File specified by template and start/stop given. Values should pass through
// Even though start file does not exist (no inspection of files is done if start/stop
// both given).
i = i + 1;
tests[i] = {}
tests[i].url = "uri="+BASE+"test/data/$Y-$m-$d.txt&start=-P10D&stop=P0D&columns=2"
tests[i].test = function (err, data) {
	// TODO: Test columnIDs, etc.
	var testv0 = data["catalog"]["dataset"][0]["timeCoverage"][0]["Start"][0]
	var testv1 = data["catalog"]["dataset"][0]["timeCoverage"][0]["End"][0]
	var test0 = "-P10D"
	var test1 = "P0D"
	if (debugt) console.log("Test:   Response Start/End values should be " + test0 + "/" + test1 + ".  Found " + testv0 + "/" + testv1 + ".")	
	if (testv0 === test0 && testv1 === test1) {
		return true
	} else {
		return false
	}
}

// Start is before stop.
i = i + 1;
tests[i] = {}
tests[i].url = "uri="+BASE+"test/data/$Y$m$d.dat&start=2012-01-01&stop=2001-01-06"
tests[i].test = function (err, data) {
	if (debugt) console.log("Test:   Start is before stop.  Should result in error message.")
	if (err) {
		return true
	} else {
		return false
	}
}

// Timeformat derived from file and start/stop correct.
i = i + 1;
tests[i] = {}
tests[i].url = "uri="+BASE+"test/data/file1.dat&columns=2&start=2001-01-01&stop=2001-01-03"
tests[i].test = function (err, data) {
	var testv0 = data["catalog"]["dataset"][0]["timeCoverage"][0]["Start"][0]
	var testv1 = data["catalog"]["dataset"][0]["timeCoverage"][0]["End"][0]
	var test0 = "2001-01-01"
	var test1 = "2001-01-03"
	var timeformat = data["catalog"]["dataset"][0]["$"]["timeformat"];
	var timeformat_test = "$Y-$m-$dT$H:$M:$S.$(millis)Z";
	if (debugt) {
		console.log("Test:   Response Start/End values should be " + test0 + "/" + test1);
		console.log("Test:   Found " + testv0 + "/" + testv1 + ".")	
		console.log("Test:   Response timeFormat should be " + timeformat_test);
		console.log("Test:   Found " + timeformat + ".")
	}
	if (testv0 === test0 && timeformat == timeformat_test) {
		return true
	} else {
		return false
	}
}

// Timeformat derived from file and start/stop incorrect.  No error.
i = i + 1;
tests[i] = {}
tests[i].url = "uri="+BASE+"test/data/file1.dat&columns=2&start=2001-01-01&stop=2001-01-02"
tests[i].test = function (err, data) {
	var testv0 = data["catalog"]["dataset"][0]["timeCoverage"][0]["Start"][0]
	var testv1 = data["catalog"]["dataset"][0]["timeCoverage"][0]["End"][0]
	var test0 = "2001-01-01"
	var test1 = "2001-01-02"
	if (debugt) console.log("Test:   Response Start/End values should be " + test0 + "/" + test1 + ".");
	if (debugt) console.log("Test:   Found " + testv0 + "/" + testv1 + ".")	
	if (testv0 === test0 && testv1 === test1) {
		return true
	} else {
		return false
	}
}

// Should be error.  No start or stop and timeFormat changes.
i = i + 1;
tests[i] = {}
tests[i].url = "uri="+BASE+"test/data/Geotail/mag/$Y/geotailmagP$Y$m.dat&timeFormat=$d $m $Y $H $M $S.$(millis)"
tests[i].test = function (err, data) {
	if (debugt) console.log("Test:   No start or stop and timeFormat changes. Should be error.")
	if (debugt) console.log(err)
	if (err) {
		return true
	} else {
		return false
	}
}

// stop only (success because timeFormat correct before stop)
i = i + 1;
tests[i] = {}
tests[i].url = "uri="+BASE+"test/data/Geotail/mag/$Y/geotailmagP$Y$m.dat&stop=2007-05-31T23:59:00.000Z&timeFormat=$Y $m $d $H $M $S.$(millis)",
tests[i].test = function (err, data) {
	if (err) {
		if (debugt) console.log(err)
		return false
	} else {
		return true
	}
	var testv0 = data["catalog"]["dataset"][0]["timeCoverage"][0]["Start"][0]
	var testv1 = data["catalog"]["dataset"][0]["timeCoverage"][0]["End"][0]
	var test0 = "1993-10-01T04:00:00.000Z"
	var test1 = "2007-05-31T23:59:00.000Z"
	if (debugt) console.log("Test:   Response Start/End values should be " + test0 + "/" + test1 + ".  Found " + testv0 + "/" + testv1 + ".")	
	if (testv0 === test0 && test1 === testv1) {
		return true
	} else {
		return false
	}
}

// start only (success because timeFormat correct after start)
i = i + 1;
tests[i] = {}
tests[i].url = tests[i-1].url.replace("stop=2007-05-31T23:59:00.000Z","start=2007-06-01").replace("$Y $m $d $H $M $S.$(millis)","$d $m $Y $H $M $S")
tests[i].test = function (err, data) {
	var testv0 = data["catalog"]["dataset"][0]["timeCoverage"][0]["Start"][0]
	var testv1 = data["catalog"]["dataset"][0]["timeCoverage"][0]["End"][0]
	var test0 = "2007-06-01"
	var test1 = "2015-01-01T04:59:00.000Z"
	if (debugt) console.log("Test  : Response Start/End values should be " + test0 + "/" + test1 + ".  Found " + testv0 + "/" + testv1 + ".")	
	if (testv0 === test0 && test1 === testv1) {
		return true
	} else {
		return false
	}
}
var os      = require("os");
var tests = [];
i = 0;

tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-07-14&return=image&format=png&type=timeseries&style=0";
tests[i].test = function (data) {
	var len = data.length;
	console.log("File should > 1e4 bytes.  Found: " + len );
	if (len > 1e4) {
		return true;
	} else {
		return false;
	}
};

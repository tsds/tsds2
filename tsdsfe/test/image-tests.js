var tests = [];
i = 0;

tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-07-14&return=image&format=png&type=timeseries&style=0";
tests[i].test = function (data) {
	var len = data.length;
	console.log("File should > 3e3 bytes.  Found: " + len )
	if (len > 3e3) {
		return true;
	} else {
		return false;
	}
}

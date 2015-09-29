var tests = [];
i = 0;

i = i+1;
tests[i] = {};
tests[i].url = "catalog=CARISMA/FGM/PT1S&dataset=ANNA&parameters=X&start=-P2D&stop=2014-09-30";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 172801 newlines.  Found: " + len );
	if (len == 172801) {return true;} else {return false}
};
tests[i].note = ''

tests[i] = {};
tests[i].url = "catalog=USGS/Mag/RT/PT1S&dataset=BDT&parameters=H&start=-P2D&stop=P0D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 172801 newlines.  Found: " + len );
	if (len == 172801) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=INTERMAGNET/PT1S&dataset=AAE&parameters=X&start=-P2D&stop=2012-11-30";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 172801 newlines.  Found: " + len );
	if (len == 172801) {return true;} else {return false}
};
tests[i].note = ''

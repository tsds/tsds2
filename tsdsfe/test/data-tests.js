var tests = [];
i = 0;

tests[i] = {};
tests[i].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 577 newlines.  Found: " + len);
	if (len == 577) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=USGS/Mag/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 newlines.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=USGS/Mag/RT/PT1S&dataset=BDT&parameters=H&start=-P2D&stop=P0D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 172801 newlines.  Found: " + len );
	if (len == 172801) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=Kyoto/Dst/RT/PT1H&dataset=Dst&parameters=Dst&start=-P3D&stop=P0D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 73 newlines.  Found: " + len );
	if (len == 73) {return true;} else {return false}
};
tests[i].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

i = i+1;
tests[i] = {};
tests[i].url = "catalog=Kyoto/Dst/RT/PT1H&dataset=Dst&parameters=Dst&start=-P3D&stop=P0D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 73 newlines.  Found: " + len );
	if (len == 73) {return true;} else {return false}
};
tests[i].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-07-10&stop=2014-07-14";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 481 newlines.  Found: " + len );
	if (len == 481) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SuperMAG/PT1M&dataset=BLC&parameters=B_N&start=-P3D&stop=1990-01-10";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 newlines.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};
tests[i].note = ''

i = i+1;
tests[i] = {};
tests[i].url = "catalog=IMAGE/PT1M&dataset=ABK&parameters=X&start=-P3D&stop=2014-09-30";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 newlines.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};
tests[i].note = ''

i = i+1;
tests[i] = {};
tests[i].url = "catalog=IMAGE/PT20S&dataset=ALT&parameters=X&start=-P2D&stop=1991-08-31";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 8641 newlines.  Found: " + len );
	if (len == 8641) {return true;} else {return false}
};
tests[i].note = ''

i = i+1;
tests[i] = {};
tests[i].url = "catalog=IMAGE/PT10S&dataset=ABK&parameters=X&start=-P2D&stop=2014-09-30";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17281 newlines.  Found: " + len );
	if (len == 17281) {return true;} else {return false}
};
tests[i].note = ''

i = i+1;
tests[i] = {};
tests[i].url = "catalog=CARISMA/FGM/PT1S&dataset=ANNA&parameters=X&start=-P2D&stop=2014-09-30";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 172801 newlines.  Found: " + len );
	if (len == 172801) {return true;} else {return false}
};
tests[i].note = ''

i = i+1;
tests[i] = {};
tests[i].url = "catalog=INTERMAGNET/PT1M&dataset=AAA&parameters=X&start=-P3D&stop=2012-12-31";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 newlines.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
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

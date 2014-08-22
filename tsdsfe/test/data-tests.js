var tests = [];

tests[0] = {};
tests[0].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D";
tests[0].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 577 rows.  Found: " + len);
	if (len == 577) {return true;} else {return false}
};

tests[1] = {};
tests[1].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&outformat=0";
tests[1].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 577 rows.  Found: " + len );
	if (len == 577) {return true;} else {return false}
};

// If outformat > 0, subsetting is done within granule.
tests[2] = {};
tests[2].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&outformat=1";
tests[2].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 577 rows.  Found: " + len );
	if (len == 577) {return true;} else {return false}
};

// If outformat > 0, subsetting is done within granule.
tests[3] = {};
tests[3].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&outformat=2";
tests[3].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 577 rows.  Found: " + len );
	if (len == 577) {return true;} else {return false}
};

tests[4] = {};
tests[4].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D";
tests[4].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 rows.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};

tests[5] = {};
tests[5].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=0";
tests[5].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 rows.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};

tests[6] = {};
tests[6].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=1";
tests[6].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 rows.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};

tests[7] = {};
tests[7].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=2";
tests[7].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 rows.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};

tests[8] = {};
tests[8].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D";
tests[8].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 rows.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};

tests[9] = {};
tests[9].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=0";
tests[9].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 rows.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};

tests[10] = {};
tests[10].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=1";
tests[10].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 rows.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};

tests[11] = {};
tests[11].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=2";
tests[11].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 rows.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};

tests[12] = {};
tests[12].url = "catalog=Kyoto/RT/Dst/PT1H&dataset=Dst&parameters=Dst&start=-P3D&stop=P0D";
tests[12].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 73 rows.  Found: " + len );
	if (len == 73) {return true;} else {return false}
};
tests[12].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

tests[13] = {};
tests[13].url = "catalog=Kyoto/RT/Dst/PT1H&dataset=Dst&parameters=Dst&start=-P3D&stop=P0D&outformat=1";
tests[13].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 73 rows.  Found: " + len );
	if (len == 73) {return true;} else {return false}
};
tests[13].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

tests[14] = {};
tests[14].url = "catalog=SWPC/AK&dataset=AK&parameters=PlanetaryK&start=-P10D&stop=-P2D";
tests[14].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 59 or 65 newlines.  Found: " + len );
	if (len == 59 || len == 65) {return true;} else {return false}
};
tests[14].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

tests[15] = {};
tests[15].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=PlanetaryK&start=-P2D&stop=P1D";
tests[15].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 rows.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};
tests[15].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

tests[16] = {};
tests[16].url = "catalog=SWPC/AK;SWPC/AK/2DayFile&dataset=AK;AK&parameters=PlanetaryK;PlanetaryK&start=-P10D;-P2D&stop=-P2D;P1D";
tests[16].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have more than 74 rows.  Found: " + len );
	if (len > 74) {return true;} else {return false}
};
tests[16].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

tests[17] = {};
tests[17].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-07-10&stop=2014-07-14&outformat=0";
tests[17].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 481 rows.  Found: " + len );
	if (len == 481) {return true;} else {return false}
};
tests[17].note = ''

tests[18] = {};
tests[18].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-07-10&stop=2014-07-14&outformat=1";
tests[18].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 481 rows.  Found: " + len );
	if (len == 481) {return true;} else {return false}
};
tests[18].note = ''

tests[19] = {};
tests[19].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-07-10&stop=2014-07-14&outformat=2";
tests[19].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 481 rows.  Found: " + len );
	if (len == 481) {return true;} else {return false}
};
tests[19].note = ''

tests[20] = {};
tests[20].url = "catalog=SuperMAG/PT1M&dataset=BLC&parameters=B_N&start=-P3D&stop=1990-01-10&outformat=1";
tests[20].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 rows.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};
tests[20].note = ''

tests[21] = {};
tests[21].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-07-14&return=png";
tests[21].test = function (data) {
	var len = data.length;
	console.log("File should > 1e4 bytes.  Found: " + len );
	if (len > 1e4) {return true;} else {return false}
};
tests[21].note = 'This test may fail if testing from localhost.'

// This only tests if script is returned.
// TODO: Call command line MATLAB.
tests[22] = {};
tests[22].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-07-14&return=idl";
tests[22].test = function (data) {
	var len = data.length;console.log("File should > 500 bytes.  Found: " + len );
	if (len > 500) {return true;} else {return false}
};
tests[22].note = ''

tests[23] = {};
tests[23].url = "catalog=SSCWeb;SSCWeb&dataset=ace;ace&parameters=X_TOD;Y_TOD&start=1998-01-01;1998-01-04&stop=1998-01-04;1998-01-08";
tests[23].note = 'This test may fail if testing from localhost.'

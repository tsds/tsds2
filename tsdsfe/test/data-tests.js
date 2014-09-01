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
tests[i].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&outformat=0";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 577 newlines.  Found: " + len );
	if (len == 577) {return true;} else {return false}
};

// If outformat > 0, subsetting is done within granule.
i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&outformat=1";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 577 newlines.  Found: " + len );
	if (len == 577) {return true;} else {return false}
};

// If outformat > 0, subsetting is done within granule.
i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&outformat=2";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 577 newlines.  Found: " + len );
	if (len == 577) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 newlines.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=0";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 newlines.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=1";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 newlines.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=2";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 newlines.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=USGS/RT/PT1S&dataset=BDT&parameters=H&start=-P2D&stop=P0D&outformat=1";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 172801 newlines.  Found: " + len );
	if (len == 172801) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 newlines.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=0";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 newlines.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=1";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 newlines.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=2";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 newlines.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=Kyoto/RT/Dst/PT1H&dataset=Dst&parameters=Dst&start=-P3D&stop=P0D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 73 newlines.  Found: " + len );
	if (len == 73) {return true;} else {return false}
};
tests[i].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

i = i+1;
tests[i] = {};
tests[i].url = "catalog=Kyoto/RT/Dst/PT1H&dataset=Dst&parameters=Dst&start=-P3D&stop=P0D&outformat=1";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 73 newlines.  Found: " + len );
	if (len == 73) {return true;} else {return false}
};
tests[i].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/AK&dataset=AK&parameters=PlanetaryK&start=-P10D&stop=-P2D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should more than 57 newlines.  Found: " + len );
	if (len > 57) {return true;} else {return false}
};
tests[i].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=PlanetaryK&start=-P2D&stop=P1D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 17 newlines.  Found: " + len );
	if (len == 17) {return true;} else {return false}
};
tests[i].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-07-10&stop=2014-07-14&outformat=0";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 481 newlines.  Found: " + len );
	if (len == 481) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-07-10&stop=2014-07-14&outformat=1";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 481 newlines.  Found: " + len );
	if (len == 481) {return true;} else {return false}
};
tests[i].note = ''

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=2014-07-10&stop=2014-07-14&outformat=2";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 481 newlines.  Found: " + len );
	if (len == 481) {return true;} else {return false}
};
tests[i].note = ''

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SuperMAG/PT1M&dataset=BLC&parameters=B_N&start=-P3D&stop=1990-01-10&outformat=1";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have 4321 newlines.  Found: " + len );
	if (len == 4321) {return true;} else {return false}
};
tests[i].note = ''


// This only tests if script is returned.
// TODO: Call command line MATLAB.
i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-07-14&return=idl";
tests[i].test = function (data) {
	var len = data.length;console.log("File should > 500 bytes.  Found: " + len );
	if (len > 500) {return true;} else {return false}
};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/AK;SWPC/AK/2DayFile&dataset=AK;AK&parameters=PlanetaryK;PlanetaryK&start=-P10D;-P2D&stop=-P2D;P1D";
tests[i].test = function (data) {
	var len = data.toString().split("\n").length;
	console.log("File should have more than 73 newlines.  Found: " + len );
	if (len > 73) {return true;} else {return false}
};
tests[i].note = 'This test sometimes fails at end of month because files will contain no data or will not be available.'

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb;SSCWeb&dataset=ace&parameters=X_TOD&start=1998-01-01&stop=1998-01-04T01:00:00Z";

if (0) {
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-07-14&return=png";
tests[i].test = function (data) {
	var len = data.length;
	console.log("File should > 1e4 bytes.  Found: " + len );
	if (len > 1e4) {return true;} else {return false}
};
tests[i].note = 'This test may fail if testing from localhost.'
}
//tests[i] = {};
//tests[i].url = "catalog=SSCWeb;SSCWeb&dataset=ace;ace&parameters=X_TOD;Y_TOD&start=1998-01-01;1998-01-04&stop=1998-01-04;1998-01-08";
//tests[i].note = 'This test may fail if testing from localhost.'

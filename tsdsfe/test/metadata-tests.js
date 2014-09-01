var tests = [];

tests[0] = {};
tests[0].url = "catalog=^.*"
tests[0].test = function (data) {eval("data = 'data.toString()'");eval(tests[0].log);if (data.length > 0) {return true;} else {return false} };
tests[0].log  = 'console.log("Catalog list should have at least one catalog. Found: "+ data.length);';

tests[1] = {};
tests[1].url = "catalog=^SWPC.*&dataset=^.*";
tests[1].test = function (data) {eval("data = 'data.toString()'");eval(tests[1].log);if (data.length > 0) {return true;} else {return false} };
tests[1].log  = 'console.log("Dataset list should have at least one dataset. Found: "+ data.length);';

// TODO: Add
// http://tsds.org/get/?catalog=^USGS.*
// Return should be 3 catalogs.

// TODO: Add
// http://tsds.org/get/?catalog=SSCWeb&dataset=^a.*
// response array should have at least 12 objects.

tests[2] = {};
tests[2].url = "catalog=^SWPC.*&dataset=AK";

tests[3] = {};
tests[3].url = "catalog=^SWPC.*&dataset=AK&parameters=^.*";
tests[3].test = function (data) {eval("data = 'data.toString()'");eval(tests[3].log);if (data.length > 0) {return true;} else {return false} };
tests[3].log  = 'console.log("Dataset list should have at least one dataset. Found: "+ data.length);';

tests[4] = {};
tests[4].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=^.*";

tests[5] = {};
tests[5].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=^.*";
tests[5].test = function (data) {eval("data = 'data.toString()'");eval(tests[5].log);if (data.length > 0) {return true;} else {return false} };
tests[5].log  = 'console.log("Dataset list should have at least one dataset. Found: "+ data.length);';

tests[6] = {};
tests[6].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0";
tests[6].test = function (data) {eval("data = 'data.toString()'");eval(tests[6].log);if (data.length > 0) {return true;} else {return false} };
tests[6].log  = 'console.log("Dataset list should have at least one dataset. Found: "+ data.length);';

// Will be 2 not 3 if this happens to be run at 00:00:00.000 
tests[7] = {};
tests[7].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&return=urilistflat";
tests[7].test = function (data) {var len = data.toString().split("\n").length;eval(tests[7].log);if (len == 3) {return true;} else {return false} };
tests[7].log  = 'console.log("File should have 3 rows.  Found: " + len );';

tests[8] = {};
tests[8].url = "catalog=SSCWeb&return=tsds";
tests[8].test = function (data) {
					var len = data.toString().split("\n").length;
					var N = 12158;
					console.log("File should have more than "+N+" rows.  Found: " + len );
					if (len > N) {
						return true;
					} 
					else {
						return false
					}
				};

tests[9] = {};
tests[9].url = "catalog=SSCWeb&return=tsds&outformat=json";
tests[9].test = function (data) {
					var len = data.length;
					var N = 2451662;
					console.log("File should have more than "+N+" characters.  Found: " + len );
					if (len > N) {
						return true;
					} 
					else {
						return false
					}
				};

tests[10] = {};
tests[10].url = "catalog=SSCWeb&return=autoplot-bookmarks";
tests[10].test = function (data) {
					var len = data.toString().split("\n").length;
					var N = 12158;
					console.log("File should have more than "+N+" rows.  Found: " + len );
					if (len > N) {
						return true;
					} 
					else {
						return false
					}
				};

tests[11] = {};
tests[11].url = "catalog=SSCWeb&return=autoplot-bookmarks&outformat=json";
tests[11].test = function (data) {
					var len = data.length;
					var N = 2082927;
					console.log("File should have more than "+N+" characters.  Found: " + len );
					if (len > N) {
						return true;
					} 
					else {
						return false
					}
				};


if (0) {
// When stop date has time component, extra file is returned.
tests[9] = {};
tests[9].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P0D1H&return=urilistflat";
tests[9].test = function (data) {
					var len = data.toString().split("\n").length;
					tests[9].log  = console.log("List should have 4 URLs.  Found: " + len );;
					if (len == 4) {
						return true;
					} else {
						return false;
					}
				};

// When stop date has time component, extra file is returned.
tests[10] = {};
tests[10].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&return=urilistflat";
tests[10].test = function (data) {
					var len = data.toString().split("\n").length;
					tests[10].log  = console.log("List should have 2 URLs.  Found: " + len );;
					if (len == 2) {
						return true;
					} else {
						return false;
					}
				};
}
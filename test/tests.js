var tests = [];

tests[0] = {};
tests[0].url = "catalog=^.*"
tests[0].test = function (data) {eval("data = 'data.toString()'");eval(tests[0].log);if (data.length > 0) {return true;} else {return false} };
tests[0].log  = 'console.log("Catalog list should have at least one catalog. Found: "+ data.length);';

tests[1] = {};
tests[1].url = "catalog=^SWPC.*&dataset=^.*";
tests[1].test = function (data) {eval("data = 'data.toString()'");eval(tests[1].log);if (data.length > 0) {return true;} else {return false} };
tests[1].log  = 'console.log("Dataset list should have at least one dataset. Found: "+ data.length);';

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
tests[8].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D";
tests[8].test = function (data) {var len = data.toString().split("\n").length;eval(tests[8].log);if (len == 577) {return true;} else {return false} };
tests[8].log  = 'console.log("File should have 577 rows.  Found: " + len );';

tests[9] = {};
tests[9].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&outformat=0";
tests[9].test = function (data) {var len = data.toString().split("\n").length;eval(tests[9].log);if (len == 577) {return true;} else {return false} };
tests[9].log  = 'console.log("File should have 577 rows.  Found: " + len );';

// If outformat > 0, subsetting is done within granule.
tests[10] = {};
tests[10].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&outformat=1";
tests[10].test = function (data) {var len = data.toString().split("\n").length;eval(tests[10].log);if (len == 577) {return true;} else {return false} };
tests[10].log  = 'console.log("File should have 577 rows.  Found: " + len );';

// If outformat > 0, subsetting is done within granule.
tests[11] = {};
tests[11].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&outformat=2";
tests[11].test = function (data) {var len = data.toString().split("\n").length;eval(tests[11].log);if (len == 577) {return true;} else {return false} };
tests[11].log  = 'console.log("File should have 577 rows.  Found: " + len );';

tests[12] = {};
tests[12].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D";
tests[12].test = function (data) {var len = data.toString().split("\n").length;eval(tests[12].log);if (len == 4321) {return true;} else {return false} };
tests[12].log  = 'console.log("File should have 4321 rows.  Found: " + len );';

tests[13] = {};
tests[13].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=0";
tests[13].test = function (data) {var len = data.toString().split("\n").length;eval(tests[13].log);if (len == 4321) {return true;} else {return false} };
tests[13].log  = 'console.log("File should have 4321 rows.  Found: " + len );';

tests[14] = {};
tests[14].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=1";
tests[14].test = function (data) {var len = data.toString().split("\n").length;eval(tests[14].log);if (len == 4321) {return true;} else {return false} };
tests[14].log  = 'console.log("File should have 4321 rows.  Found: " + len );';

tests[15] = {};
tests[15].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=2";
tests[15].test = function (data) {var len = data.toString().split("\n").length;eval(tests[15].log);if (len == 4321) {return true;} else {return false} };
tests[15].log  = 'console.log("File should have 4321 rows.  Found: " + len );';

tests[16] = {};
tests[16].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D";
tests[16].test = function (data) {var len = data.toString().split("\n").length;eval(tests[16].log);if (len == 17) {return true;} else {return false} };
tests[16].log  = 'console.log("File should have 17 rows.  Found: " + len );';

tests[17] = {};
tests[17].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=0";
tests[17].test = function (data) {var len = data.toString().split("\n").length;eval(tests[17].log);if (len == 17) {return true;} else {return false} };
tests[17].log  = 'console.log("File should have 17 rows.  Found: " + len );';

tests[18] = {};
tests[18].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=1";
tests[18].test = function (data) {var len = data.toString().split("\n").length;eval(tests[18].log);if (len == 17) {return true;} else {return false} };
tests[18].log  = 'console.log("File should have 17 rows.  Found: " + len );';

tests[19] = {};
tests[19].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=2";
tests[19].test = function (data) {var len = data.toString().split("\n").length;eval(tests[19].log);if (len == 17) {return true;} else {return false} };
tests[19].log  = 'console.log("File should have 17 rows.  Found: " + len );';

tests[20] = {};
tests[20].url = "catalog=SWPC/AK;SWPC/AK/2DayFile&dataset=AK;AK&parameters=PlanetaryK;PlanetaryK&start=-P10D;-P2D&stop=-P2D;P1D";
tests[20].test = function (data) {var len = data.toString().split("\n").length;eval(tests[20].log);if (len == 73) {return true;} else {return false} };
tests[20].log  = 'console.log("File should have 73 rows.  Found: " + len );';

tests[21] = {};
tests[21].url = "catalog=SWPC/AK;SWPC/AK/2DayFile&dataset=AK;AK&parameters=PlanetaryA;PlanetaryA&start=-P10D;-P2D&stop=-P2D;P1D";
tests[21].test = function (data) {var len = data.toString().split("\n").length;eval(tests[21].log);if (len == 73) {return true;} else {return false} };
tests[21].log  = 'console.log("File should have 73 rows.  Found: " + len );';

tests[22] = {};
tests[22].url = "catalog=Kyoto/RT/Dst/PT1H&dataset=Dst&parameters=Dst&start=-P3D&stop=P0D";
tests[22].test = function (data) {var len = data.toString().split("\n").length;eval(tests[22].log);if (len == 73) {return true;} else {return false} };
tests[22].log  = 'console.log("File should have 73 rows.  Found: " + len );';

tests[23] = {};
tests[23].url = "catalog=Kyoto/RT/Dst/PT1H&dataset=Dst&parameters=Dst&start=-P3D&stop=P0D&outformat=1";
tests[23].test = function (data) {var len = data.toString().split("\n").length;eval(tests[22].log);if (len == 73) {return true;} else {return false} };
tests[23].log  = 'console.log("File should have 73 rows.  Found: " + len );';

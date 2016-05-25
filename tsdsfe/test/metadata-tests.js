// TODO: Add
// http://tsds.org/get/?catalog=SSCWeb&dataset=^a.*
// response array should have at least 12 objects.

var tests = [];

var i = 0;
tests[i] = {};
tests[i].url = "catalog=^.*"
tests[i].test = function (data) {
					eval("data = 'data.toString()'");
					console.log("Catalog list should have at least one catalog. Found: "+ data.length);
					if (data.length > 0) {
						return true;
					} else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=^SSCW.*&dataset=^.*";
tests[i].test = function (data) {
					eval("data = 'data.toString()'");
					console.log("Dataset list should have at least one dataset. Found: "+ data.length);
					if (data.length > 0) {
						return true;
					} else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=^SSC.*&dataset=ace";
tests[i].test = function (data) {
					var json = JSON.parse(data);
					console.log("Response array should have more than 0 elements.  Found "+json.length);
					if (json.length > 0) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=^SSC.*&dataset=ace&parameters=^.*";
tests[i].test = function (data) {
					eval("data = 'data.toString()'");
					console.log("Dataset list should have at least one dataset. Found: "+ data.length);
					if (data.length > 0) {
						return true;
					} else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=^.*";
tests[i].test = function (data) {
					eval("data = 'data.toString()'");
					console.log("Dataset list should have at least one dataset. Found: "+ data.length);
					if (data.length > 0) {
						return true;
					} else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD";
tests[i].test = function (data) {
					eval("data = 'data.toString()'");
					console.log("Dataset list should have at least one dataset. Found: "+ data.length)
					if (data.length > 0) {
						return true;
					} else {
						return false;
					}
				};


i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&return=tsds";
tests[i].test = function (data) {
					var len = data.toString().split("\n").length;
					var N = 12158;
					console.log("File should have more than "+N+" rows.  Found: " + len );
					if (len > N) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&return=tsds&format=json";
tests[i].test = function (data) {
					var len = data.length;
					var N = 2451662;
					console.log("File should have more than "+N+" characters.  Found: " + len );
					if (len > N) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&return=autoplot-bookmarks";
tests[i].test = function (data) {
					var len = data.toString().split("\n").length;
					var N = 12158;
					console.log("File should have more than "+N+" rows.  Found: " + len );
					if (len > N) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&return=autoplot-bookmarks&format=json";
tests[i].test = function (data) {
					var len = data.length;
					var N = 2082927;
					console.log("File should have more than "+N+" characters.  Found: " + len );
					if (len > N) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace;wind&parameters=X_TOD";
tests[i].test = function (data) {
					datao = JSON.parse(data)
					len = datao.length
					console.log("Response array should have 2 elements.")
					if (len == 2) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace;wind&parameters=X_TOD;Y_TOD";
tests[i].test = function (data) {
					datao = JSON.parse(data)
					//console.log(datao)
					var chk = (datao[0][0].dd.id === "X_TOD") && (datao[1][0].dd.id === "Y_TOD")
					
					console.log("Response objects should correct dd IDs.")

					if (chk) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=IMAGE/PT1M&dataset=ABK&parameters=X,Y&start=-P3D&stop=2014-09-30&return=data&format=ascii-1&style=header-0";
tests[i].test = function (data) {

					dataa = data.toString().split("\n")
					var chk = (dataa[0] == "Time,X [nT],Y [nT]")
					console.log("Header should be Time,X[nT],Y[nT]")
					if (chk) {
						return true;
					} 
					else {
						console.log(dataa[0])
						return false;
					}
				};

if (0) {
// Will be 2 not 3 if this happens to be run at 00:00:00.000 
i = i+1;
tests[i] = {};
tests[i].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-P3D&stop=-P1D&return=urilist&format=ascii";
tests[i].test = function (data) {
					var len = data.toString().split("\n").length;
					console.log("File should have 3 rows.  Found: " + len );
					if (len == 3) {
						return true;
					} else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=USGS/Dst/RT/PT1H&dataset=Dst&parameters=DST_RT";
tests[i].test = function (data) {
					var json = JSON.parse(data);
					console.log("Response array should have more than 0 elements.  Found "+json.length);
					if (json.length > 0) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=USGS/Dst/RT/PT1M&dataset=Dst&parameters=DST_RT";
tests[i].test = function (data) {
					var json = JSON.parse(data);
					console.log("Response array should have more than 0 elements.  Found "+json.length);
					if (json.length > 0) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=^USGS.*";
tests[i].test = function (data) {
					var json = JSON.parse(data);
					console.log("Response array should have more than 3 elements.  Found "+json.length);
					if (json.length > 3) {
						return true;
					} 
					else {
						return false;
					}
				};

i = i+1;
tests[i] = {};
tests[i].url = "catalog=Kyoto/Dst/RT/PT1H&dataset=Dst&parameters=Dst";
tests[i].test = function (data) {
					var json = JSON.parse(data);
					console.log("Response array should have more than 0 elements.  Found "+json.length);
					if (json.length > 0) {
						return true;
					} 
					else {
						return false;
					}
				};

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

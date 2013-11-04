var tests = [];
var j     = 0;;

tests[j] = {};
tests[j].url = "catalog=^.*"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=^SWPC.*&dataset=^.*";
tests[j].test = function (data) {return JSON.parse(data).length > 3};
tests[j].log  = 'console.log("    Should be > 3: " + len);console.log("    Result: " + ret)';

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=^SWPC.*&dataset=AK"
tests[j].test = function (data) {len = JSON.parse(data).length;ret=len>1;eval(tests[0].log);return ret};
tests[j].log  = 'console.log("    Should be > 1: " + len);console.log("    Result: " + ret)';


j = j+1;;
tests[j] = {};
tests[j].url = "catalog=^SWPC.*&dataset=AK&parameters=^.*"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=^.*"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=^.*"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-PT3D&stop=-PT1D&return=urilistflat"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-PT3D&stop=-PT1D"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-PT3D&stop=-PT1D&outformat=0"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-PT3D&stop=-PT1D&outformat=1"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/Particle/PT1M&dataset=Gp_particles&parameters=E_gt_4.0&start=-PT3D&stop=-PT1D&outformat=2"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/XRay/PT1M&dataset=Gp_xr&parameters=Short&start=2013-08-24&stop=2013-08-25&outformat=0"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/XRay/PT1M&dataset=Gp_xr&parameters=Short&start=2013-08-24&stop=2013-08-25&outformat=1"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/GOES/Primary/XRay/PT1M&dataset=Gp_xr&parameters=Short&start=2013-08-24&stop=2013-08-25&outformat=2"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=0"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=1"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=USGS/RT/PT1M&dataset=BDT&parameters=H&start=-P3D&stop=P0D&outformat=2"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=0"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=1"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=2"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P10D&stop=-P9D"
tests[j].test = function (data) {ret = data.length == 0;eval(tests[j].log);return ret};
tests[j].log  = 'console.log("    Should be zero: " + data.length);console.log("    Result: " + data.length)';
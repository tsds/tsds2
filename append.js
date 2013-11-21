TODO: In TSDSFE, report approximate cadence by checking first result.  This result should also be used
as a check on if service is working.

TODO: How to handle requests for start before available start time?  Same for stop.

TODO: Deal with timerange before existing timerange?

Given parameter,start/stop,dt with parameter a scalar time series,

* If request for parameter,start/stop,dt with timerange in existing range of
parameter_start_stop_dt.bin, subset it and send data.

* If not, request timeRange=start/stop&streamFilterStreamFunction=regrid(start/stop,dt) and
write parameter_start_stop_dt.bin + tsml.

* If another request for parameter,start/stop,dt with timerange in existing range,
streamsubset of existing file (and write cache of subset?).

* If another request with timerange that ends after existing range,
timeRange=stop/stopnew&streamFilterStreamFunction=regrid(start/stopnew,dt)
and then concatenate and rename existing bin file

var http = require('http');
var fs   = require('fs');

http.get("parameter_start_stop_ppd.bin", 
  function (res) {
    var stream = fs.createWriteStream("parameter_start_stop_ppd.bin",{ flags: 'a', encoding: null, mode: 0666 });
    res.pipe(stream);
    // touch parameter_start_stop_ppd.bin.lck
    // mv parameter_start_stop_ppd.bin parameter_start_stopnew_ppd.bin
    // rm parameter_start_stop_ppd.bin.lck
});

 
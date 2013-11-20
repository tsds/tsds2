TODO: In TSDSFE, report approximate cadence.
TODO: How to handle requests for start before available start time?  Same for stop.

Given parameter,start/stop,ppd with parameter a scalar time series,

If request for parameter,start/stop,ppd with timerange in existing range of
parameter_start_stop_ppd.bin, subset it and send data.

If not, request timeRange=start/stop&streamFilterStreamFunction=regrid(ppd) and
write parameter_start_stop_ppd.bin + tsml. Constraint is that ppd must be an integer,
which constrains dt.

If another request for parameter,start/stop,ppd with timerange in existing range,
streamsubset of existing file (and write cache of subset?).

If another request with timerange that ends after existing range,
timeRange=stop/stopnew&streamFilterStreamFunction=regrid(ppd)
and then concatenate and rename existing bin file

TODO: Deal with timerange before existing timerange?

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

 
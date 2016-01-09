var expandDD = require('./expandDD.js').expandDD
var findstartstop = require('./expandDD.js').findstartstop

var q = "uri=http://localhost:8004/test/data/file1.dat&columns=2&start=2001-01-01&stop=2001-01-03"
var q = "uri=http://localhost:8004/test/data/file1.dat&columns=2"
var q = "uri=http://localhost:8004/test/data/2015-11-20.txt&columns=2"
//var q = "uri=http://localhost:8004/test/data/one.dat&columns=2"
//var q = "uri=http://localhost:8004/test/data/&columns=2,3"
var q = "uri=http://localhost:8004/test/data/$Y$m$d.dat&start=2012-01-01&stop=2001-01-06"

var q = "uri=http://vmo.igpp.ucla.edu/data1/Weygand/PropagatedSolarWindGSE/weimer/Wind/TAP/V3/$Y/windTAP$Y$m.dat"
		+ "&start=1995-01-01"
		+ "&stop=2014-09-01"
		  "&timeFormat=$d $m $Y $H $M $S"

var q = q + "&columns=7,8,9,10"
		  + "&columnIDs=nxangle,nyangle,nzangle,Propagation flag"
		  + "&catalogLabel=Weygand SW Propagation Data Set"
		  + "&datasetID=spase://VMO/NumericalData/Weygand/Wind/TAP/Propagated.3DP/GSE/PT60S"
		  + "&fillValues=1e34"

var q = "uri=http://vmo.igpp.ucla.edu/data1/Weygand/PropagatedSolarWindGSE/weimer/Wind/TAP/V3/$Y/windTAP$Y$m.dat&start=1995-01-01&stop=2014-09-01&timeFormat=$d $m $Y $H $M $S"
		+"&columns=7,8,9,10,11"
		+"&columnIDs=nxangle,nyangle,nzangle,Propagation flag"
		+"&catalogLabel=Weigand SW Propagation Data Set"
		+"&datasetID=spase://VMO/NumericalData/Weygand/Wind/TAP/Propagated.3DP/GSE/PT60S"
		+"&fillValues=1e34"

var q = "uri=http://vmo.igpp.ucla.edu/data1/Weygand/PropagatedSolarWindGSE/weimer/Wind/TAP/V3/$Y/windTAP$Y$m.dat&start=1995-01-01&stop=2014-09-01&timeFormat=$d $m $Y $H $M $S"
		+"&columns=7,8,9,10"
		+"&columnIDs=nxangle,nyangle,nzangle,Propagation flag"
		+"&catalogLabel=Weigand SW Propagation Data Set"
		+"&datasetID=Weygand/Wind/TAP/Propagated.3DP/GSE/PT60S"
		+"&fillValues=1e34,1e34,1e34"

if (0) {
	console.log('\n----\n');
	chunks = [["2012-01-01T00:00 3.8 2.9 1.0 x x x 1 2 3 A","2012-01-02T00:00 3.8 2.9 1.0 x x x 1 2 3 A"]]
	console.log('Calling findstartstop with chunks:');
	console.log(chunks);
	qo = findstartstop(chunks[0][0], chunks[0][1], q)
	console.log('Output:');
	console.log(qo)
}

if (1) {
	console.log('\n----\n');
	console.log('Calling expandDD with query string: ' + q);
	expandDD({queryString: q, debug: false}, function (err, cat) {
		console.log('Output: ');
		if (err) {
			console.log(err);
		}
		if (!err) {
			console.log(JSON.stringify(cat, null, 4));
		}
		console.log('\n----\n');
		process.exit(0);
	})
}

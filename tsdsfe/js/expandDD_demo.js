var expandDD = require('./expandDD.js').expandDD
var findstartstop = require('./expandDD.js').findstartstop

var q = "uri=http://localhost:8004/test/data/file1.dat&columns=2&start=2001-01-01&stop=2001-01-03"
var q = "uri=http://localhost:8004/test/data/file1.dat&columns=2"
var q = "uri=http://localhost:8004/test/data/2015-11-20.txt&columns=2"
var q = "uri=http://localhost:8004/test/data/one.dat&columns=2"
var q = "uri=http://localhost:8004/test/data/&columns=2,3"

//var q = "uri=http://localhost:8004/test/data/$Y$m$d.dat&start=2012-01-01&stop=2001-01-06"

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
	})
}

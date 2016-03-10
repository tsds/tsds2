//https://github.com/mafintosh/protocol-buffers
var protobuf = require('protocol-buffers')
var fs = require('fs')
// pass a proto file as a buffer/string or pass a parsed protobuf-schema object
var messages = protobuf(fs.readFileSync('TimeSeries.proto'))

// Using http://tsds.org/dd nomenclature.

var buf = messages.TimeSeries.encode({
  TimeBase: "seconds since 2015-01-01",
  ColumnUnits: ['nT','nT','nT'],
  ColumnLabels: ['B_x','B_y','B_z'],
  ColumnLabelValues: ['','',''],
  ColumnFillValues: ['-1e31','-1e31','99999'],
  Time: [1,10,21],
  Data: [1,2,3,10,11,12,21,22,23]
})

console.log(buf) // should print a buffer

var obj = messages.TimeSeries.decode(buf)
console.log(obj) // should print an object similar to above
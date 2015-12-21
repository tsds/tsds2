var expandDD = require('./expandDD.js').expandDD

var q = "uri=$Y$m$d.dat&start=2001-01-01&stop=2001-01-03"
var q = "uri=$Y$m$d.dat&start=2001-01-01&stop=2001-01-03&columns=2,3"

cat = expandDD(q)

console.log(JSON.stringify(cat, null, 4))

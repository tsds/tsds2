var tests = []
i = 0

tests[i] = {}
tests[i].url = "dd=" 
	+ encodeURIComponent("uri=__SERVER__test/data/2015-11-20.txt&start=2015-11-20&stop=2015-11-21&columns=2,3")
	+ "&dataset=1&parameters=col2&start=2015-11-20&stop=2015-11-21"
tests[i].test = function (data) {
	var len0 = 41964
	var len = data.length
	console.log("Response should have length " + len0 + ".  Found "+len)
	if (len == len0) {
		return true
	} else {
		console.log(data)
		return false
	}
}

i = i + 1
tests[i] = {}
tests[i].url = "dd=" 
	+ encodeURIComponent("uri=__SERVER__test/data/2015-11-20.txt&start=2015-11-20&stop=2015-11-21&columns=2,3")
	+ "&return=tsds&format=json"
tests[i].test = function (data) {
	dataj = JSON.parse(data)
	var testv = dataj["catalog"]["timeCoverage"][0]["Start"][0]
	var testv0 = "2015-11-20"
	console.log("Response Start value should be " + testv0 + ".  Found " + testv + ".")	
	if (testv === testv0) {
		return true
	} else {
		return false
	}
}

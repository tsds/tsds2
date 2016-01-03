var tests = []
i = 0

tests[i] = {}
tests[i].url = "dd=" 
	+ encodeURIComponent("uri=__SERVER__test/data/2015-11-20.txt&columns=2,3")
	+ "&return=tsds&format=json"
tests[i].test = function (data) {
	dataj = JSON.parse(data)
	var testv0 = dataj["catalog"]["timeCoverage"][0]["Start"][0]
	var testv1 = dataj["catalog"]["timeCoverage"][0]["End"][1]
	var test0 = "2015-11-20T00:00:01.985Z"
	var test1 = "2015-11-20T23:59:03.880Z"
	console.log("Response Start/End values should be " + testv0 + "/" + testv0 + ".  Found " + test0 + "/" + test1 + ".")	
	if (testv0 === test0) {
		return true
	} else {
		return false
	}
}

i = i + 1
tests[i] = {}
tests[i].url = "dd=" 
	+ encodeURIComponent("uri=__SERVER__test/data/2015-11-20.txt&start=2015-11-20&stop=2015-11-21&columns=2,3")
	+ "&dataset=1&parameters=col2&start=2015-11-20&stop=2015-11-21"
tests[i].test = function (data) {
	var len0 = 41964
	var len = data.length
	console.log("Response should have length " + len0 + ".  Found " + len);
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
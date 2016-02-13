var tests = []
i = 0

tests[i] = {}
tests[i].url = "dd=" 
	+ encodeURIComponent("uri=__SERVER__test/data/2015-11-20.txt&columns=2,3")
	+ "&return=tsds&format=json"
tests[i].test = function (data) {
	dataj = JSON.parse(data)
	var testv0 = dataj["catalog"]["dataset"][0]["timeCoverage"][0]["Start"][0]
	var testv1 = dataj["catalog"]["dataset"][0]["timeCoverage"][0]["End"][0]
	var test0 = "2015-11-20T00:00:01.985Z"
	var test1 = "2015-11-20T23:59:03.880Z"
	console.log("Response Start/End values should be " + testv0 + "/" + testv0 + ".  Found " + test0 + "/" + test1 + ".")	
	if (testv0 === test0 && testv1 === test1) {
		return true
	} else {
		return false
	}
}
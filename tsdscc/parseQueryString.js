function parseQueryString(q) {
	tmpa = q.split("&");
	var qs = {}
	for (var i = 0; i < tmpa.length; i++) {
		tmps = tmpa[i];
		kv = tmps.split("=");
		qs[kv[0]] = kv[1];
	}
	qs["querystring"] = q
	return qs
}
if (typeof(exports) !== "undefined" && require) {
	exports.parseQueryString = parseQueryString        
}

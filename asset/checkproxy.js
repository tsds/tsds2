function checkproxy(testurl, proxy, report) {

	console.log("checkproxy.js: Trying unproxied AJAX HEAD request to " + testurl);
	$(report).text("checkproxy.js: Trying unproxied AJAX HEAD request to " + testurl);
 
 	console.log(report);
	$.ajax({
		type: 'HEAD',
		async: false,
		timeout: 300,
		url: testurl, 
		success: function () {needproxy = false;console.log("checkproxy.js: AJAX HEAD request to " + testurl + " worked.");},
		error: function () {needproxy = true;console.log("checkproxy.js: AJAX HEAD request " + testurl + " failed.");}
	});
	
	if (needproxy) {
		console.log("checkproxy.js: Trying proxied AJAX HEAD request to " + Proxy + testurl);
		$.ajax({
				type: 'HEAD',
				async: false,
				timeout: 300,
				url: proxy + testurl, 
				success: function () {noproxy = false;console.log("checkproxy.js: Proxy available.");},
				error: function () {noproxy = true;console.log("checkproxy.js: Proxy not available.");}
		});
	}
		
	if (needproxy && noproxy) {
		$(report).text("checkproxy.js: Request to " + testurl + " failed. Either that page is not available or a proxy is needed.");
		$(report).append(" See <a href='http://tsds.org/tsdsgen#Full_functionality'>http://tsds.org/tsdsgen</a> for more information.");
		return false;
	}
	if (!needproxy) {
		proxy = "";
	}
	return proxy;
}

function checkproxy(testurl, proxy, report) {

	console.log("checkproxy.js: Trying unproxied AJAX HEAD request to " + testurl);
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
		$(report).append("checkproxy.js: Proxy needed and proxy not found.  When this program is not run on a web server (e.g., URL starts with file://), either a proxy server is needed or you must run your browser with security disabled so that AJAX HEAD requests to URLs such as " + testurl + " can be made.  See http://tsds.org/tsdsgen#Local for more information.");
		return false;
	}
	if (!needproxy) {
		proxy = "";
	}
	return proxy;
}

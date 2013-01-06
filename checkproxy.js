function checkproxy(testurl, proxy, report) {

	console.log("Trying HEAD request to " + testurl);
	$.ajax({
		type: 'HEAD',
		async: false,
		timeout: 300,
		url: testurl, 
		success: function () {needproxy = false;console.log("AJAX HEAD request to first URL worked.");},
		error: function () {needproxy = true;console.log("AJAX HEAD request to first URL failed.");}
	});
	
	if (needproxy) {
		console.log("Trying HEAD request to " + Proxy + testurl);
		$.ajax({
				type: 'GET',
				async: false,
				timeout: 300,
				url: proxy + testurl, 
				success: function () {noproxy = false;console.log("Proxy available.");},
				error: function () {noproxy = true;console.log("Proxy not available.");}
		});
	}
		
	if (needproxy && noproxy) {
		$(report).append("Check not possible.  When this program is not run on a web server (e.g., URL starts with file://), either a proxy server is needed or you must run your browser with security disabled so that AJAX HEAD requests to URLs such as " + testurl + " can be made.  See http://tsds.org/tsdsgen#Local for more information.");
		return false;
	}
	if (!needproxy) {
		proxy = "";
	}
	return proxy;
}

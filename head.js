function head(urls, proxy, status, report) {

	ASYNC = true;
	if (arguments.length < 3) {
		ASYNC = false;
	}
	
	if (arguments.length > 1)
		proxy = proxy + "?" + url;
	}

	for (var i = 0;i < urls.length;i++) {
		urlsv[i]  = new Array();
		urlsi[i] = new Array();	
		function closure(i) {			
			$.ajax({
				type: 'HEAD',
				url: proxy + urls[i], 
				error: function () {
								z = z+1;
								urlsi[i] = urlss[i];
								status(z,Nvalid);
								if (z == Nurls) {report(Nvalid);}
							}, 
				success: function (data, textStatus, jqXHR) {
								z = z+1;
								Nvalid = Nvalid + 1;
								if (jqXHR.getResponseHeader('Content-Length') > 0) {
									urlsv[i] = urlsi[i];
								} else {
									urlsi[i] = urlsv[i];
								}
								status(z,Nvalid);
								if (z == Nurls) {report(Nvalid);}
							}
					});
				}
				closure(i);				
			}				
		}
	}
}
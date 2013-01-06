function guessstartstop() {
	
	urlblocks = $('#urls').val().replace('\n$','').split('\n\n');
	
	Start = "";
	Stop = "";
	nl = "";
	
	if ($('#startdates').val() === "") {
		if ($('#startmin').val() === "") {
			guessstartstop();
		} else {
			Startx = $('#startmin').val();
			Stopx = $('#stopmax').val();
			//console.log(urlblocks.length);
			for (i = 0; i < $('#templateexpanded').val().split("\n").length; i++) {
				if (i > 0) nl = "\n";
				Start = Start + nl + Startx;
				Stop = Stop + nl + Stopx;	
			}
			$('#startdates').val(Start);
			$('#stopdates').val(Stop);

		}
		return;
	}

	for (i = 0; i < urlblocks.length; i++) {
		urls = urlblocks[i].split('\n');
		template = $('#Template').val();

		// Need to determine this based on template (%Y -> +2, %m->+0, %D->+0);
		N = template.length + 2+0+0;

		// Will only handle two types of times
		timere = new RegExp(/.*([0-9]{4}-[0-9]{2}-[0-9]{2}).*/);
		timerep = new RegExp(/([0-9]{4})-([0-9]{2})-([0-9]{2})/);
		timeord = '$1-$2-$3';

		timere = new RegExp(/.*([0-9]{8}).*/);
		timerep = new RegExp(/([0-9]{4})([0-9]{2})([0-9]{2})/);
		timeord = '$1-$2-$3';
		if (urls[0].match(timere)) {
			first = urls[0].replace(timere,'$1');
			first = first.replace(timerep,timeord);
			first = new Date(first); 

			last = urls[urls.length-1].replace(timere,'$1');
			last = last.replace(timerep,timeord);
			last = new Date(last);
		}
		
		if (i > 0)
			nl = "\n";
		Start = Start + nl + first.strftime('%Y-%m-%d');
		Stop = Stop + nl + last.strftime('%Y-%m-%d');	
	}
	
	if (Start.length) {
		note = "(Determined based on URL list.)";
	} else {
		note = "(Was not able to determine exact start and stop dates for each valid URL.)";
	}
	$('#guessstartnote').text(note).show();
	$('#guessstopnote').text(note).show();

	$('#startdates').val(Start);
	$('#stopdates').val(Stop);

}

function expandtemplate(el) {
		
	if (arguments.length == 1 && (typeof el === "object")) {
		expandtemplate.tmpstr = $(el).prev().val();
		tmpstr = expandtemplate.tmpstr;
		
		expandtemplate.Dataset = new Array();
		expandtemplate.Dataset = $('#Dataset').val().split("\n");
		Dataset = expandtemplate.Dataset;

		var TemplateExpanded = "";
		function expand(dataset,callback) {
			TemplateExpanded = TemplateExpanded + expandtemplate(dataset) + "\n";
		}


		function finish() {
						
			ta = $(el).nextAll('textarea').eq(0);
			ta.val(TemplateExpanded.replace(/\]\n\[/g,"],\n[").replace(/}\n{/g,"},\n{"));	
			toc = new Date();
			Nurls = (TemplateExpanded.match(/o/g)||[]).length;
			console.log("Generation of " + N + " URLs completed in " + (toc-tic) + " ms") ;
			tic = new Date();
			$('#checkdataurls_results').text("Placing URLs below");
			N = TemplateExpanded.length/1000000;
			if (N > 3) {
				//$('#checkdataurls_results').text("");
				//$('#checkdataurls_span').show();
				alert('Generation of ' + Nurls + ' URLs completed.  \n\nURLs are ' + Math.round(N*10)/10 + ' MB.  Rendering in browser could take up to '  + Math.round(N) + ' seconds.');
			}			
				$('#urls').show();
				toc = new Date();
				console.log("Placement of URLs in DOM (" + N + " MB)" + " completed in " + (toc-tic) + " ms") ;
				if (N < 1) 
					$('#urls').scrollLeft(1000);
		}

		var START_ms   = new Date(Date.parse($('#startmin').val()));
		var STOP_ms    = new Date(Date.parse($('#stopmax').val()));
		var Ndays      = 1 + Math.round((STOP_ms.valueOf()-START_ms.valueOf())/(1000*24*60*60));

		if (1) {
			tic = new Date();
			Dataset.forEach(expand);
			finish();			
		}

		// An attempt at parallelization of URL generation.
		// Is much slower.
		if (0) {
			function finish2(TemplateExpanded) {
				ta = $(el).nextAll('textarea').eq(0);
				ta.val(TemplateExpanded.replace(/\]\n\[/g,"],\n[").replace(/}\n{/g,"},\n{"));	
				N = (TemplateExpanded.match(/o/g)||[]).length;
				toc = new Date();
				console.log("Generation of " + N + " URLs completed at " + (toc-tic) + " ms") ;
				$('#urls').show();
				N = TemplateExpanded.length/1000000;
				console.log("Placement of URLs in DOM (" + N + " MB)" + " completed at " + (toc-tic) + " ms") ;
				$('#urls').scrollLeft(1000);
			}
			function expand2(dataset) {	
				TemplateExpanded2 = expandtemplate(dataset) + "\n";
				finish2(TemplateExpanded2);
			}
			
			tic = new Date();
			async.forEach(Dataset, expand2, function (err) {
				// Seems to never be called?
				console.log('Done');
				toc = new Date();
				console.log(toc-tic);
			});
		}
	} else {
		tmpstr = expandtemplate.tmpstr;
		Dataset = el;
	}

	if (tmpstr instanceof Object) {
		tmpobj = {};
		for (var attr in tmpstr) {
			console.log(attr);
			tmpobj[expandtemplate(Dataset)] = expandtemplate(tmpstr[attr]);
		}
		return tmpobj;
	}

	if (!tmpstr) {return "";}
	tmpstr = expandtemplate.tmpstr;

	//console.log("Expanding " + Dataset);
	//console.log("with template " + tmpstr);
	// Expand wildcards
	var N = tmpstr.match(/\$/g).length;
	sDataset = Dataset.split(",");
	for (var i=0;i < N; i++) {
		tmpstr = tmpstr.replace(/\$([0-9])/,"'+sDataset[$1-1]+'");
	}
	tmpstr = "'" + tmpstr + "'";
	tmpstr = eval(tmpstr);

	if (!tmpstr.match("%")) {
		return tmpstr;
	}
	
	// Expand times
	var START_ms   = new Date(Date.parse($('#startmin').val()));
	var STOP_ms    = new Date(Date.parse($('#stopmax').val()));
	var Ndays      = 1 + Math.round((STOP_ms.valueOf()-START_ms.valueOf())/(1000*24*60*60));
	var START_date = Date.parse(Start);

	var i = 0;
	urls = "";
	aurls = "";
	nl = "";
	//tic = new Date();
	while (i < Ndays) {
		fname = START_date.strftime(tmpstr);
		if (i > 0) {nl="\n";}
		urls = urls + nl + fname;
		//var aurlx = AutoplotServlet + encodeURIComponent("vap+dat:"+fname+"?skipLines=25&time=field0&timeFormat=$Y-$m-$d+$H:$M:$S&column=field3&plot.title=field3");
		//aurls = aurls + nl + aurlx;
		START_date.addDays(1);
		i = i + 1;
	}
	//toc = new Date();
	//console.log("Done.  Took " + (toc-tic) + " ms");


	//$('#aurls').append(aurls+"\n\n");
	//$('#aurls').scrollLeft(1000);
	
	return urls + "\n";
	
}

function catalog(DataSet	) {

	// THREDDS Catalog
	var template0 = '<dataset name="$1"><access serviceName="tss" urlPath="$2"/><access serviceName="ncml" urlPath="$2"/><timeCoverage><Start>$Start</Start><End>$Stop</End></timeCoverage></dataset>';
	var template = '';
	for (i=0;i < Dataset.length;i++) {
		template = template +
					template0.
						replace("$1",Dataset[i][0]).
						replace(/\$2/g,Dataset[i][1]).
						replace("$Start",Start).
						replace("$Stop",Stop);
	}
	template = '<catalog xmlns="http://www.unidata.ucar.edu/namespaces/thredds/InvCatalog/v1.0" xmlns:xlink="http://www.w3.org/1999/xlink" name="$CatalogName">' + template + '</catalog>'
	template = template.replace("$CatalogName",$('#CatalogName').val());
	$('#catalog').val('');
	$('#catalog').val(template);
}

function links() {
	//console.log($('#urls').val().split("\n\n")[0]);
	linkblocks = $('#urls').val().split("\n\n");
	//console.log(linkblocks);
	$("#tryurls").html("");
	for (i = 0;i < linkblocks.length-1;i++) {
		var url = "http://datacache.org/dc/syncsubmit?source="+encodeURI(linkblocks[i]);
		//console.log("url length: " + url.length);
		$("#tryurls").append("<a id='" +i + "' href='"+url+"'>"+i+"</a> ");
	}
	$("#links").show();		
}

function detectchange() {			
		
		var newval = "";
		$('.enter').each(function () {newval = newval + $(this).val()});
		if (detectchange.lastval && newval != detectchange.lastval) {
			console.log("Change detected:");// + detectchange.lastval + " | " + newval);
			$('input[type=button].try').click();
		} else {
			console.log("No change detected");
		}
		detectchange.lastval = newval;	
}

function ajaxReport(el) {
	// TODO: Remove bad URLs and call guessstartstop() when done.


	el = '#' + $(el).attr('id');
	$(el+'_span').show();
	$(el+'_results').text('... ');
	console.log("Checking " + DataCache);
	
	// TODO: Have ajaxHEAD modify urlsv and urlsi.
	urls = $($('#urls')).val().split("\n\n").filter(function(element){return element.length});
	
	// See if AJAX GET requests needs Proxy.  If so, return Proxy.  Otherwise, return "".
	var noproxy = true;
	var needproxy = true;	
	testurl = urls[0].split(/\n/g).filter(function(element){return element.length})[0];
	Proxy = checkproxy(testurl, DataCache, el+'_results');
	
	if (Proxy) {
		_DataCache = DataCache + "%2Fsource=";
	} else {
		_DataCache = DataCache + "?source=";
	} 
	
	$.ajax({
		type: 'HEAD',
		async: false,
		timeout: 300,
		url: _DataCache, 
		success: function () {
				console.log("AJAX HEAD request to DataCache worked.");
				},
		error: function () {
				console.log("AJAX HEAD request to DataCache failed.");
				$(el + "_results").text('Connection to DataCache server ' + _DataCache.replace(/\?.*/,'')	 + ' failed. Cannot continue.');
			}
	});

	data = encodeURI($($(el).nextAll('textarea')[0]).val());
	
	function status(Nvalid,Nchecked) {
		var msg = $(el+'_results').text().replace("... ","");
		var msg = Nvalid + "/" + Nchecked + ", ";
		$(el+'_results').append(msg);
	}
		
	function report() {	
		$(el+'_results').append("Done.");
		$('#urlsvalid').show();
		$('#urlsinvalid').show();
		$('#urlsv').val(urlsv.filter(function(element){return element.length}).join('\n\n').replace(/,/g,'\n'));
		$('#urlsi').val(urlsi.filter(function(element){return element.length}).join('\n\n').replace(/,/g,'\n'));
	}
	
	z = 0;
	for (var i = 0;i < urls.length;i++) {
		if (urls[i]) {
			function closure(i) {
				$.ajax({
					type: 'GET',
					url: Proxy + _DataCache + encodeURI(urls[i]), 
					success: function (data, textStatus, jqXHR) {
						z = z+1;
						urlsv[i] = new Array();
						urlsi[i] = new Array();
						var Nvalid = 0;
						for (var j = 0;j < data.length;j++) {
							if (data[j].dataLength > 0) {
								Nvalid = Nvalid + 1;	
								urlsv[i][j] = urls[i].split("\n")[j];
							} else {
								urlsi[i][j] = urls[i].split("\n")[j];
							}
						}						
						status(Nvalid,data.length)
						if (z == urls.length) {report();}
					}});
			}
			closure(i);
			//console.log("Checking URL block " + (i+1) + "/" + urls.length);
		}
	}
}

function ajaxHEAD(el) {
	
	// TODO: Remove bad URLs and call guessstartstop() when done.

	el = '#' + $(el).attr('id');
	
	$(el+'_span').show();
	$(el+'_results').text('... ');

	urls = $($('#urls')).val().split("\n\n").filter(function(element){return element.length});
	urlsv = new Array();  // Valid urls
	urlsi = new Array(); // Invalid urls

	// See if AJAX HEAD requests needs Proxy.  If so, return Proxy.  Otherwise, return "".
	var noproxy = true;
	var needproxy = true;	
	testurl = urls[0].split(/\n/g).filter(function(element){return element.length})[0];
	Proxy = checkproxy(testurl, Proxy, el+'_results');
	if (Proxy === false) return;
	
	// Count total number of URLs
	Nurls = 0;
	for (var i = 0;i < urls.length;i++) {	
		urlss = urls[i].split(/\n/g).filter(function(element){return element.length});
		Nurls = Nurls + urlss.length;
	}

	// Do HEAD request on each URL
	function report(Nvalid) {
		$(el+'_results').text(Nvalid + "/" + Nurls + " are valid. Done.");
		$(el+'_span').next('span').show();
	}
	function status(z, Nvalid) {
		$(el+'_results').text(Nvalid + "/" + z + " checked are valid. " + (Nurls-z) + " checks left.");
	}

	var z = 0;
	var k = 0;
	var Nvalid = 0;
	for (var i = 0;i < urls.length;i++) {
		if (urls[i]) {
			urlss = urls[i].split(/\n/g).filter(function(element){return element.length});
			for (var j = 0;j < urlss.length;j++) {
				k = k + 1;
				urlsv[i]  = new Array();
				urlsi[i] = new Array();	
				function closurehead(i,j,k) {			
					$.ajax({
						type: 'HEAD',
						url: Proxy + urlss[j], 
						error: function () {
									z = z+1;
									urlsi[i][j] = urlss[j];
									if (z % 100) {status(z,Nvalid);}
									if (z == Nurls) {report(Nvalid);}
								}, 
						success: function (data, textStatus, jqXHR) {
								z = z+1;
								Nvalid = Nvalid + 1;
								if (jqXHR.getResponseHeader('Content-Length') > 0) {
									urlsv[i][j] = urlss[j];
								} else {
									urlsi[i][j] = urlss[j];
								}
								if (z % 100) {status(z,Nvalid);}
								if (z == Nurls) {report(Nvalid);}
							}
					});
				}
				closurehead(i,j,k);				
			}				
		}
	}
	return;	
}
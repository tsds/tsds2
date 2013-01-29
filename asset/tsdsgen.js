function expandtemplate(el) {
		
	if (arguments.length == 1 && (typeof el === "object")) {
		expandtemplate.tmpstr = $(el).prev().val();
		tmpstr = expandtemplate.tmpstr;
		console.log(tmpstr);
		
		tmp = $('#Dataset').val();
		DatasetIn = tmp.split(":");
		console.log(parseInt(DatasetIn[0]));
		console.log(parseInt(DatasetIn[1]));
		if (typeof(parseInt(DatasetIn[1])) == "number" && !isNaN(DatasetIn[1])) {
			expandtemplate.Dataset = new Array();
			console.log("tsdsgen: Dataset is an integer.")
			for (i = parseInt(DatasetIn[0]);i < parseInt(DatasetIn[1]); i++) {
				expandtemplate.Dataset[i-parseInt(DatasetIn[0])] = i;
			}
			console.log(Dataset);
			$('#Dataset').val(expandtemplate.Dataset.join("\n"));
		} else {
			expandtemplate.Dataset = $('#Dataset').val().split("\n");
		}
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
	
	console.log(Dataset)
	tmpstr = expandtemplate.tmpstr;

	console.log("Expanding template " + tmpstr);
	console.log("with dataset array 	" + Dataset);
	// Expand wildcards
	var wcs = tmpstr.match(/\$/g);
	var N   = 0;
	if (wcs != null) {
		N = wcs.length;
	}
	if (typeof(Dataset) !== "number") {
		sDataset = Dataset.split(",");
		for (var i=0;i < N; i++) {
			tmpstr = tmpstr.replace(/\$([0-9])/,"'+sDataset[$1-1]+'");
		}
		tmpstr = "'" + tmpstr + "'";
		tmpstr = eval(tmpstr);
	} else {
		tmpstr = tmpstr.replace(/\$([0-9])/,Dataset);
	}

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
		START_date.addDays(1);
		i = i + 1;
	}
	//toc = new Date();
	//console.log("Done.  Took " + (toc-tic) + " ms");

	//$('#aurls').append(aurls+"\n\n");
	//$('#aurls').scrollLeft(1000);
	
	return urls + "\n";
	
}

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

function links() {
	linkblocks = $('#urls').val().split("\n\n");
	$("#tryurls").html("");
	for (i = 0;i < linkblocks.length-1;i++) {
		var url = "http://datacache.org/dc/syncsubmit?source="+encodeURI(linkblocks[i]);
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

function stats(i,j,N) {
	L[i] = L[i]+1;
	$("#s"+i).text(" " + L[i] + "/" + N);
}

function report(el,Nvalid) {
	$(el+'_results').text(Nvalid + "/" + Nurls + " are valid. Done.");
	$('#urlsvalid').show();
	$('#urlsinvalid').show();
	$('#urlsv').val(urlsv.filter(function(element){return element.length}).join('\n\n').replace(/,/g,'\n'));
	$('#urlsi').val(urlsi.filter(function(element){return element.length}).join('\n\n').replace(/,/g,'\n'));
}

function ajaxReport(el,type) {

	el = '#' + $(el).attr('id');
	$(el+'_span').show();
	
	urls = new Array();
	if ($("#urlsv").val() !== "") { 
		// If GET or HEAD check has been run, this textarea will have been populated.
		urls = $($('#urlsv')).val().split("\n\n").filter(function(element){return element.length});	
		data = encodeURI($("#urlsv").val());
	} else {
		urls = $($('#urls')).val().split("\n\n").filter(function(element){return element.length});			
		data = encodeURI($("#urls").val());
	}
	
	if (urls.length == 0) {return}

	if (type === "report") {
	
		// See if AJAX GET needs Proxy.
		testurl = urls[0].split(/\n/g).filter(function(element){return element.length})[0];
		Proxy = checkproxy(DataCache, DataCache, el+'_results');
		if (Proxy === false) return;
		
		if (Proxy === "") {
			_DataCache = DataCache + "?source=";
		} else {
			_DataCache = Proxy + DataCache + "%2Fsource=";
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

		$(el+'_span').show();
		el = el + "_iframe";
		// Insert DataCache report URL into iframe.
		console.log(_DataCache.replace("sync","report") + data);
		$(el).attr("src",_DataCache.replace("sync","report") + data);
	}
	
	if (type === "plot") {
		$(el+'_span').show();
		DataSet = $('#Dataset').val().split("\n");

		var timeFormat = $('#LineTemplate').val().replace(/(%.*\s).*/g,'');
		timeFormat = timeFormat.replace(/ \$/g,"+$").replace(/ $/,'');
		console.log(timeFormat);

		// For now these are set in presets.  Need to compute based on given
		// information.
		//var skipLines = $('#skipLines').val();
		//var column    = $('#column').val();
		
		var urlss = new Array();
		L = new Array();
		el = el + "_results";
		for (var i = 0; i < urls.length; i++) {
			L[i] = 0;
			urlss[i] = urls[i].split(/\n/g).filter(function(element){return element.length});
			$(el).append("<div style='font-size:60%'>"+DataSet[i].split(",")[0]+"<span id='s"+i+"'></span></div>");
			$(el).append("<div style='overflow-x:scroll;white-space: nowrap;' id='"+i+"'/>");
			for (j = 0; j < urlss[i].length; j++) { 
				var apu  = "vap+dat:"+urlss[i][j]+"?skipLines="+skipLines+"&time=field0&timeFormat="+timeFormat+"&column="+column;
				var aurl =  AutoplotServlet + plotoptions + "&url=" + encodeURIComponent(apu);			
				var ld   = "onload='stats(" + i + "," + j + "," + urlss[i].length + ")'";
				$(el + " #"+i).append('<img ' + ld + ' src="' + aurl + '"/>');
				$(el + " #"+i + " img").click(function () {
					console.log("Plot was clicked");
				});
			}
		}	
	}
}

function ajaxRequest(el,type) {
	
	function urlarrays() {
		
		var Nurls = 0; 			  // Total number of urls
		var urlss = new Array();  // All urls
		var urlsv = new Array();  // Valid urls
		var urlsi = new Array();  // Invalid urls

		for (var i = 0;i < urls.length;i++) {	
			urlsv[i] = new Array();
			urlsi[i] = new Array();
			urlss[i] = new Array();
			urlss[i] = urls[i].split(/\n/g).filter(function(element){return element.length});
			Nurls    = Nurls + urlss[i].length;
		}
		return [urlss,urlsv,urlsi,Nurls]
	}

	function status(z, Nvalid) {
		$(el+'_results').text(Nvalid + "/" + z + " checked are valid. " + (Nurls-z) + " checks left.");
	}

	function closurehead(i,j) {			
		// Do HEAD or GET request on urlss[i][j].
		$.ajax({
			type: type,
			url: Proxy + urlss[i][j], 
			error: function () {
						z = z + 1;
						urlsi[i][j] = urlss[i][j];
						if (z % 100) {status(z,Nvalid);}
						if (z == Nurls) {report(Nvalid);}
					}, 
			success: function (data, textStatus, jqXHR) {
					z = z + 1;
					Nvalid = Nvalid + 1;
					if (jqXHR.getResponseHeader('Content-Length') > 0) {
						urlsv[i][j] = urlss[i][j];
					} else {
						urlsi[i][j] = urlss[i][j];
					}
					if (z % 100) {status(z,Nvalid);}
					if (z == Nurls) {report(el,Nvalid);}
				}

		});
	}
	
	el = '#' + $(el).attr('id');	
	$(el+'_span').show();

	urls = $($('#urls')).val().split("\n\n").filter(function(element){return element.length});

	// See if AJAX HEAD requests needs Proxy.  If so, return Proxy.  Otherwise, return "".
	testurl = urls[0].split(/\n/g).filter(function(element){return element.length})[0];
	Proxy   = checkproxy(testurl, Proxy, el+'_results');
	console.log("here");
	if (Proxy === false) return;

	U     = urlarrays(); // urls in blocks of datasets.
	urlss = U[0];
	urlsv = U[1];
	urlsi = U[2];
	Nurls = U[3];

	var z = 0;
	var Nvalid = 0;
	for (var i = 0;i < urlss.length;i++) {
		for (var j = 0;j < urlss[i].length;j++) {
			closurehead(i,j);				
		}				
	}
}

function dlscript(language) {
	//$('#checkdataurls').click();
	if ($('#urlsv').text().length == 0) {
		var urls = $('#urls').val().split('\n').filter(function(element){return element.length});		
	} else {
		var urls = $('#urlv').val().split('\n').filter(function(element){return element.length});		
	}
	var dlurls = new Array();
	//console.log(urls);
	//urls.length
	script = "prefix = '';\nfiles={...\n";

	for (var i = 0;i < 10; i++) {
		dlurls[i] = DataCache + "?return=data&source=" + encodeURI(urls[i]);
		script = script + "'" + encodeURI(urls[i]) + "',...\n";
	}
	script = script + "}";
	$('#script').val(script).parent().show();
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

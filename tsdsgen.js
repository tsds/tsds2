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

function expandtemplate(el,tmpstr,Dataset) {
	
	if (arguments.length == 1) {
		Dataset = $('#Dataset').val().split("\n");
		tmpstr = $(el).prev().val();
		for (i = 0; i < Dataset.length;i++) {
			TemplateExpanded = expandtemplate(el,tmpstr,Dataset[i]);
		}
		return TemplateExpanded;
	}

	if (tmpstr instanceof Object) {
		tmpobj = {};
		for (var attr in tmpstr) {
			tmpobj[expandtemplate(el,attr,Dataset)] = expandtemplate(el,tmpstr[attr],Dataset);
		}
		return tmpobj;
	}

	if (!tmpstr) {return "";}
	
	// Expand wildcards
	var N = tmpstr.match(/\$/g).length;
	sDataset = Dataset.split(",");
	for (var i=0;i < N; i++) {
		tmpstr = tmpstr.replace(/\$([0-9])/,"'+sDataset[$1-1]+'");
	}
	tmpstr = "'" + tmpstr + "'";
	tmpstr = eval(tmpstr);
	$(el).nextAll('textarea').eq(0).val($(el).nextAll('textarea').eq(0).val()+tmpstr+"\n");

	if (!tmpstr.match("%")) {
		return tmpstr;
	}
	
	//console.log(tmpstr);
	// Expand times
	var START_ms   = new Date(Date.parse($('#startmin').val()));
	var STOP_ms    = new Date(Date.parse($('#stopmax').val()));
	var Ndays      = 1 + Math.round((STOP_ms.valueOf()-START_ms.valueOf())/(1000*24*60*60));
	var START_date = Date.parse(Start);

	var i = 0;
	urls = "";
	aurls = "";
	nl = "";
	while (i < Ndays) {
		fname = START_date.strftime(tmpstr);
		if (i > 0) {nl="\n";}
		urls = urls + nl + fname;
		var aurlx = AutoplotServlet + encodeURIComponent("vap+dat:"+fname+"?skipLines=25&time=field0&timeFormat=$Y-$m-$d+$H:$M:$S&column=field3&plot.title=field3");
		aurls = aurls + nl + aurlx;
		START_date.addDays(1);
		i = i + 1;
	}
	$('#urls').val($('#urls').val()+urls+"\n\n");
	$('#urls').scrollLeft(1000);

	$('#aurls').val($('#aurls').val()+aurls+"\n\n");
	$('#aurls').scrollLeft(1000);
	
	// Catalog
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

	return urls;
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

function tryajax(el) {

	data = encodeURI($($(el).nextAll('textarea')[0]).val());
	$('#checkdataurls_span').show();
	$('#checkdataurls_span #results').text('... ');
	urls = $($('#urls')).val().split("\n\n");
	urlsv = new Array();  // Valid urls
	urlsiv = new Array(); // Invalid urls
	var noproxy = true;
	var needproxy = false;
	$.ajax({
			type: 'GET',
			async: false,
			url: DataCache, 
			success: function (data) {console.log("Don't need a proxy");},
			error: function () {needproxy=true;$('#checkdataurls_span #results').text('Cannot connect to ' + DataCache + ' directly.  Will try proxy if available. ');}
	});
	$.ajax({
			type: 'GET',
			async: false,
			url: Proxy, 
			success: function (data) {noproxy=false;console.log("Proxy seems to be available.");},
			error: function () {if (needproxy) {$('#checkdataurls_span #results').append("Proxy " + Proxy + " not available. ");}}
	});
	if (needproxy && noproxy) {
		$('#checkdataurls_span #results').append("Cannot proceed.  When this program is not run on a web server (e.g., URL starts with file://), either a proxy server is needed or you must run your browser with security disabled so requests to " + DataCache + " can be made.  See http://tsds.org/tsdsgen#Local for more information.");
		return;
	}
	if (needproxy) {
		_DataCache = DataCache + "%2Fsource=";
	} else {
		Proxy = "";
		_DataCache = DataCache + "?source=";
	} 
	
	Nurls = urls.split(/\n/g).filter(function(element){return element.length}).length;
	
	var z = 0;
	var k = 0;
	for (var i = 0;i < urls.length;i++) {
		if (urls[i]) {
			urlss = urls[i].split(/\n/g).filter(function(element){return element.length});
			for (var j = 0;j < urlss.length;j++) {
				k = k + 1;
				//console.log(urlss[j]);
				urlsv[i] = new Array();
				urlsiv[i] = new Array();	
				function closurehead(i,j,k) {			
					$.ajax({
						type: 'HEAD',
						url: Proxy + urlss[j], 
						success: function (data, textStatus, jqXHR) {
								z = z+1;
								if (jqXHR.getResponseHeader('Content-Length') > 0) {
									urlsv[i][j] = urlss[j];
								} else {
									urlsiv[i][j] = urlss[j];
								}
								// console.log("z = " + z + ", k = " + k);
								if (z == Nurls) {
									$('#checkdataurls_span #results').append("Done.");
								}
							}
					});
				}
				closurehead(i,j,k);				
			}				
		}
	}
	return;
	
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
						urlsiv[i] = new Array();
						var Nvalid = 0;
						for (var j = 0;j < data.length;j++) {
							if (data[j].dataLength > 0) {
								Nvalid = Nvalid + 1;	
								urlsv[i][j] = urls[i].split("\n")[j];
							} else {
								urlsiv[i][j] = urls[i].split("\n")[j];
							}
						}
						
						var msg = $('#checkdataurls_span #results').text();
						var msg = Nvalid + "/" + data.length + ", ";
						$('#checkdataurls_span #results').append(msg);

						if (z == urls.length - 1) { // Last one
							$('#checkdataurls_span #results').append("Done.");
							$('#urlsvalid').show();
							$('#urlsinvalid').show();
							$('#urlsv').val(urlsv.filter(function(element){return element.length}).join('\n\n').replace(/,/g,'\n'));
							$('#urlsiv').val(urlsiv.filter(function(element){return element.length}).join('\n\n').replace(/,/g,'\n'));
						}
					}});
			}
			closure(i);
			console.log("Checking URL block " + (i+1) + "/" + urls.length);
		}
	}
}
function testconnection(imgurl,freq,id) {
		var imgurl = imgurl || "http://viviz.org/gallery/css/transparent.gif";
		var freq   = freq   || 2000;
		var id     = id     || "connectionerror";
		
		function tryconnection() {
			d = new Date();
			$("<img id='testconnection'>")
			.load(function () {
				//console.log('Connection OK.  Last state ' + testconnection.connected);
				testconnection.connected = true;
				$("#"+id).html("");
				//console.log('Connection OK.');
				$('#testconnection').empty();
			})
			.error(function(){
				//console.log('Connection bad.  Last state ' + testconnection.connected);
				testconnection.connected = false;
				$("#"+id).html("Check internet connection.")
				//console.log('Connection bad.');
			})
			.attr('src',imgurl+'?'+d.getTime())
			.appendTo('testconnection');
		}
		
		if (testconnection.connectioncheck)
			clearInterval(testconnection.connectioncheck);

		var connectioncheck = setInterval(function(){
			tryconnection();
		},freq);
}

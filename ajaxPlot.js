function ajaxPlot(el) {
	el = '#' + $(el).attr('id');
	$.scrollTo(el)
	$(el+'_span').show();
	
	urls = $($('#aurls')).val().split("\n").filter(function(element){return element.length});	
	Nurls = urls.length;

	Nurls = 100;
	console.log(Nurls);

	//$(el+'_results').append("Done.");
	//$(el+'_results').text("Working on plot " + (i+1) + " of " + Nurls + '. ');

	function setplots() {
		var Npb = 10;
		var Nblocks = Math.floor(Nurls/Npb);
		setblock(0);
		function cleardiv() {
			$(el+'_plots').html('');
		}
		function setblock(block) {
			console.log('Block ' + block);
			if (block == Nblocks) {return;}
			for (var i = block*Npb;i < Npb*(block+1);i++) {
				//console.log("i = " + i);
				callback = function () {};
				if ((i > 0) && (i % Math.floor(Npb/2))==0) {
					callback = setblock(block+1); cleardiv();
				};
				setplot(i, callback);
			}
		}
		function setplot(j,callback) {
			if (j == 0) {
				requested = new Array();
				setplot.requested = requested;
			}
			console.log("Requesting image " + j);
			if ((setplot.requested.length > j) && (setplot.requested[j])) {console.log('Image ' + j + ' was already requested');return;}
			setplot.requested[j] = true;
			
	    		$(el+'_plots')
				.prepend($("<img/>")
	    			.load( function () {console.log("Image " + j + " loaded"); callback} )
	    			.error( function () {console.log("Image " + j + " load failed"); callback} )
	    			.attr("src", urls[j].replace('url=','column=100%+20em,100%-6em&height=100&width='+$('#plotdataurls_span').width()+'&url=')));
		}
	}
	setplots();
}
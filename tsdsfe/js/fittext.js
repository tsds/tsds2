function fittext(id, text, shrink, idref) {

	$("#"+id).html(text.replace("{{SHRINK}}", shrink))
			 .css("white-space", "nowrap");

	var wr = $("#"+idref).width();
	var wa = $("#"+id).width();

	if (wa > wr) {
		//console.log("--Refer. width = " + wr);
		//console.log("--Actual width = " + wa);

		// Fraction to remove. 
		// 0.9 to account for nonuniformity of charcter width.
		r  = 0.9*wr/wa;
		l  = shrink.length;
		nr = l-r*l;
		shrink = shrink.substr(0,Math.floor(l/2-nr/2)) 
					+ " ... "
					+ shrink.substr(Math.ceil(l/2+nr/2),l);
		$("#"+id).html(text.replace("{{SHRINK}}", shrink));
		wa = $("#"+id).width();
		console.log("--Refer. width = " + wr);
		console.log("--Actual width = " + wa);
	}
}
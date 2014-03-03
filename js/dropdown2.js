function dropdown2(ids, names, funs, after, i, selected, callback) {

	if (arguments.length < 5) {i = 0;};
	if (arguments.length < 6) {selected = "";};

	if (i == ids.length) {return;}
	
	function settoggle(i) {
		$("#"+ids[i]+"list").unbind('click');
		console.log("dropdown2: Setting click event on "+ids[i]+"list");
		$("#"+ids[i]+"list").
			click(function (){$("#"+ids[i]).attr('value','').css('color','black').autocomplete('search').focus();});
	}
		
	function ac(i,list) {
		
		$("#"+ids[i]).autocomplete({
			source: list,
			close: function(event,ui) {
				//settoggle(ids[i]);
				id = $(this).attr('id')
				if ($(this).attr('value') == "")
					$("#"+id).attr('value','-'+names[i]+'-').css('color','black');
			},
			blur: function(event) {
				// Never triggers.
				console.log("Blur event triggered on "+ id + " with value " + ui.item.value);
				event.preventDefault();
				},
			//search: function (event) {funs[i].onselect();},
			change: function(event,ui) {
				console.log("dropdown2: Change event triggered on " + id);
				id = $(this).attr('id');
				var i = parseInt($(this).parent().parent().attr("id").replace(/[a-z]/gi,""));
				
				// Blur event above never triggers.
				$('input[id=' + id + ']').unbind('blur');
				$('input[id=' + id + ']').blur(function () {
					id = $(this).attr('id')
					console.log("dropdown2: Blur event triggered on "+id);
					var val = $('input[id=' + id + ']').parent().parent().attr('value');
					var vallast = $('input[id=' + id + ']').parent().parent().attr('valuelast');
					console.log("value: " + val)
					console.log("valuelast: " + vallast);
					if (typeof(val) === "undefined" && typeof(vallast) === "undefined") {
						console.log("val and valuelast are undefined. Closing "+id);
						$('input[id=' + id + ']').autocomplete("close");//._trigger("change");
						return;
					}
					if (val === vallast) {
						console.log("Val and valuelast identical. Selecting "+val);
						$('input[id=' + id + ']').val(val).data("autocomplete")._trigger("select",event,{item:val});
						$('input[id=' + id + ']').autocomplete("close");
					} else {
						console.log("Val and valuelast are different.  Closing and triggering select.")
						$('input[id=' + id + ']').autocomplete("close");
						//console.log("blur() is setting vallast to " + val)
						//$('input[id=' + id + ']').parent().parent().attr('valuelast',val)
						//console.log("dropdown2: blur() is selecting "+val)
						$('input[id=' + id + ']').val(val).data("autocomplete")._trigger("select",event,{item:val});
					}
					
				});
				if (ui.item == null) {
					ui.item = {};
					console.log("ui.item == null.  Setting it to "+$('input[id=' + id + ']').parent().parent().attr('value'))
					ui.item.value = $('input[id=' + id + ']').parent().parent().attr('value');
					return;
				}
				
				// This is to deal with the fact that change() is called on a blur event.
				if (ui.item.value !== ui.item.valuelast) {
					console.log("           and value has changed.  Removing all following drop-downs.");
					for (j = i+1; j < ids.length; j++) {
						$(after + (j)).html('');
						$(after + (j)).attr('value','')
						$(after + (j)).attr('valuelast','')
					}
				} else {
					console.log("           and value has not changed.  Not removing " + after+(i+1));
				}

			},			
			select: function(event,ui) {
						id = $(this).attr('id');
						var i = parseInt($(this).parent().parent().attr("id").replace(/[a-z]/gi,""));
						console.log("dropdown2: Select event triggered on " + id);

						if (typeof(ui.item) === "undefined") {
							console.log("dropdown2: ui.item is undefined.  Setting valuelast to " + $('input[id=' + id + ']').parent().parent().attr('valuelast'))
							var vallast = $('input[id=' + id + ']').parent().parent().attr('valuelast');
							return;
						}
						val = ui.item.value || event.target.value;
						
						var vallast = $('input[id=' + id + ']').parent().parent().attr('value');

						console.log("ui.item.value : " + val)
						console.log("valuelast: " + vallast)
						

						console.log("dropdown2: select() is setting value to " + val);
						$(after+i).attr('name',id).attr('value',val);
						
						if (typeof(vallast) === "undefined") {
							console.log("dropdown2: select() is setting valuelast to " + val);
							$(after+i).attr('name',id).attr('valuelast',val);
						}

						if (location.hash === "") {
							var qs = {};
						} else {
							
							var qs = $.parseQueryString();
						}
						console.log("dropdown2: Query string: " + JSON.stringify(qs))

						qs[$("#dropdowns" + (i)).attr('name')] = $("#dropdowns"+i).val();
						
						console.log("dropdown2: Setting hashchange.byurledit to false");
						$(window).hashchange.byurledit = false;

						location.hash = decodeURIComponent($.param(qs));

						if (val) {
							ui.item.valuelast = ui.item.value;
						}

						if (val === vallast) {
							console.log("New value is same as old.  Taking no action.");
							$('input[id=' + id + ']').autocomplete("close");
						} else {
							console.log("dropdown2: Removing all span elements after " + id);
							//$('input[id=' + id + ']').parent().parent().nextAll("span").remove();
							$("input[id='"+id+"']").parent().parent().nextAll("span").hide().html('').attr('value','').attr('valuelast','');
							funs[i].onselect();
							dropdown2(ids, names, funs, after, i+1, val, callback);
							$(after+(i+1)).show();
						}
						//console.log("dropdown2: Calling blur().")
						//$('input[id=' + id + ']').blur().unbind('blur');						
			},
			minLength: 0
		}).click(function () {
			if (!$(this).attr('value'))
				$(this).attr('value','').css('color','black').autocomplete('search');
		});
	}

	console.log("dropdown2: Creating dropdown with id = " + ids[i]);

	$(after+(i))
		.append('<span class="ui-widget" style="display:table;width:100%;border:1px solid black;"></span>');
	$(after + (i) + " .ui-widget")
		.append('<span class="dropdown2" style="width:2px;display:table-cell"></span>')
		.append('<input id="'+ids[i]+'" class="dropdown2"  title="Enter text to search list" style="width:100%;display:table-cell;color:black;font-weight:bold;text-align:center;" value="-'+names[i]+'-"/>')
		.append('<span class="dropdown2" style="width:5px;display:table-cell"></span>')
		.append('<label id="'+ids[i]+'list" class="dropdown2" title="Show full list" style="width:1em;display:table-cell;cursor:pointer">&#9660;</label>');
	
	// Append is syncronous, so this won't happen before element is in DOM.
	// Allow entries not in list.
	$(after + (i) + ' input[id=' + ids[i] + ']').live('input',function () {
		$(this).parent().parent().attr('value',$(this).attr('value'));
	});
	
	console.log("Calling ac().")
	// If only one item, select it.
	console.log("dropdowns2: Calling " + funs[i].toString().substring(9,20));
	var list = funs[i](i,selected);
	ac(i,list);
	settoggle(i);
	$('input[id=' + ids[i] + ']').keypress(function(e) {
		  	console.log( "dropdowns2: Handler for .keypress() called." );
		    var val = $(this).parent().parent().attr('value');
		    if(e.keyCode == 13)
		    {
		    	console.log("dropdowns2: Triggering keyCode " + e.keyCode)
		    	$('input[id=' + ids[i] + ']').val(val).data("autocomplete")._trigger("change",event,{item:val});
		    	$('input[id=' + ids[i] + ']').blur();
		    }
	});

	//console.log(list);
	
	if (list.length == 1) {
		console.log("dropdowns2: Triggering select on "+ids[i]);
		$('input[id=' + ids[i] + ']').val(list[0].value).data("autocomplete")._trigger("select",event,{item:list[0].value});
	}
	if (callback) {
		console.log("dropdowns2: Evaluating callback");
		callback(ids[i],i);
	}

}
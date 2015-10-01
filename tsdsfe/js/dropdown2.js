function dropdown2(ids, names, funs, after, i, selected, callback) {

	if (arguments.length < 5) {i = 0;};
	if (arguments.length < 6) {selected = "";};

	if (i == ids.length) {return}
	if (funs[i].show) {
		if (!funs[i].show()) {
			return
		}
	}
	function settoggle(i) {
		$("#"+ids[i]+"list").unbind('click');
		console.log("dropdown.settoggle(): Setting click event on "+ids[i]+"list element.");
		$("#"+ids[i]+"list").
			click(function (){
				// Note that search event is not defined.
				console.log("dropdown.settoggle.click(): Removing text from "+ids[i]+"list entry area and binding AJAX search event.");
				$("#"+ids[i]).attr('vallast',$("#"+ids[i]).attr('value')).attr('value','').css('color','black').autocomplete('search').focus();
			});
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
				console.log("dropdown.ac.blur(): Blur event triggered on "+ id + " with value " + ui.item.value);
				event.preventDefault();
				},
			//search: function (event) {funs[i].onselect();},
			change: function(event,ui) {
				id = $(this).attr('id');
				console.log("dropdown.ac.change(): "+id+" change event triggered.");

				var i = parseInt($(this).parent().parent().attr("id").replace(/[a-z]/gi,""));
				
				// Blur event above never triggers.
				$('input[id=' + id + ']').unbind('blur');
				console.log("dropdown.ac.change(): Binding blur event on " + id);
				$('input[id=' + id + ']').blur(function () {
					id = $(this).attr('id')
					console.log("dropdown.ac.change(): Blur event triggered on "+id);
					var val = $('input[id=' + id + ']').parent().parent().attr('value');
					var vallast = $('input[id=' + id + ']').parent().parent().attr('valuelast');
					console.log("dropdown.ac.change(): value = " + val)
					console.log("dropdown.ac.change(): valuelast = " + vallast);
					if (typeof(val) === "undefined" && typeof(vallast) === "undefined") {
						console.log("dropdown(): val and valuelast are undefined. Closing "+id);
						$('input[id=' + id + ']').autocomplete("close");//._trigger("change");
						return;
					}
					if ((val === vallast)) {
						console.log("dropdown.ac.change(): val and valuelast for " + id + " are identical. Selecting "+val+".");
						$('input[id=' + id + ']').val(val).data("autocomplete")._trigger("select",event,{item:val});
						$('input[id=' + id + ']').autocomplete("close");
					} else {
						console.log("dropdown.ac.change(): val and valuelast are different.  Closing and triggering select.")
						$('input[id=' + id + ']').autocomplete("close");
						//console.log("blur() is setting vallast to " + val)
						//$('input[id=' + id + ']').parent().parent().attr('valuelast',val)
						//console.log("dropdown2: blur() is selecting "+val)
						$('input[id=' + id + ']').val(val).data("autocomplete")._trigger("select",event,{item:val});
					}
					
				});

				var vallast = $('input[id=' + id + ']').parent().parent().attr('valuelast');
				if (vallast === "") {
					//$(after+i).attr('name',id).attr('valuelast',val);
				}
				if (ui.item == null) {
					ui.item = {};
					//return;
					console.log("dropdown.ac.change(): ui.item == null.  Setting it to "+$('input[id=' + id + ']').parent().parent().attr('value')+" and triggering select.")
					ui.item.value = $('input[id=' + id + ']').parent().parent().attr('value');
					$('input[id=' + id + ']').val(ui.item.value).data("autocomplete")._trigger("select",event,{item:ui.item.value});
					
					return;
				}
				
				// This is to deal with the fact that change() is called on a blur event.
				if (ui.item.value !== ui.item.valuelast) {
					console.log("dropdown.ac.change(): " + id + " value has changed.  Removing all following drop-downs.");
					for (j = i+1; j < ids.length; j++) {
						$(after + (j)).html('');
						$(after + (j)).attr('value','')
						$(after + (j)).attr('valuelast','')
					}
				} else {
					// This happens after a selection is made and then user clicks outside of drop-down list.
					console.log("dropdown.ac.change(): " + id + " value has not changed.  Not removing " + after+(i+1));
				}

			},			
			select: function(event,ui) {
						id = $(this).attr('id');
						var i = parseInt($(this).parent().parent().attr("id").replace(/[a-z]/gi,""));
						var p = $(this).parent().parent();
						console.log("dropdown(): Select event triggered on " + id);

						if (typeof(ui.item) === "undefined") {
							console.log("dropdown2: ui.item is undefined.  Setting valuelast to " + $('input[id=' + id + ']').parent().parent().attr('valuelast'))
							var vallast = $('input[id=' + id + ']').parent().parent().attr('valuelast');

							if (typeof(vallast) === "undefined") {
								console.log("dropdown(): ui.item and valuelast are undefined. Closing "+id);
								$('input[id=' + id + ']').autocomplete("close");//._trigger("change");
							}
							return;
						}

						val = ui.item.value || event.target.value;
						
						var vallast = $(p).attr('valuelast');

						console.log("dropdown.ac.select(): ui.item.value = " + val)
						console.log("dropdown.ac.select(): valuelast = " + vallast)
						
						console.log("dropdown.ac.select(): Setting value to " + val);
						$(p).attr('name',id).attr('value',val);
						
						if (typeof(vallast) === "undefined") {
							console.log("dropdown.ac.select(): Setting valuelast to " + val);
							$(after+i).attr('name',id).attr('valuelast',val);
						}
						$(p).attr('name',id).attr('valuelast',val);

						if (location.hash === "") {
							var qs = {};
						} else {
							var qs = $.parseQueryString();
						}
						console.log("dropdown.ac.select(): Query string before reading drop-down: " + JSON.stringify(qs))
						console.log($(p))
						if ($(p).val()) {
							qs[$(p).attr('name')] = $(p).val();
						}
						
						console.log("dropdown.ac.select(): Query string after reading drop-down: " + JSON.stringify(qs))

						console.log("dropdown.ac.select(): Setting hashchange.byurledit to false");
						$(window).hashchange.byurledit = false;

						console.log("dropdown.ac.select(): Setting hash using query string.");
						location.hash = decodeURIComponent($.param(qs));
						// /return
						if (val) {
							ui.item.valuelast = ui.item.value;
						}

						if ((val === vallast)) {
							console.log("dropdown.ac.select(): New value is same as old.  Taking no action.");
							$('input[id=' + id + ']').autocomplete("close");
						} else {
							console.log("dropdown.ac.select(): Clearing values in all drop-downs after " + id);
							$("input[id='"+id+"']").parent().parent().nextAll("span").hide().html('').attr('value','').attr('valuelast','');

							console.log("---")
							//var qs = $.parseQueryString();
							console.log(qs);
							qs = {};
							for (j = 0;j < i+1;j++) {
								qs[$(after+j).attr('name')] = $(after+j).val();
							}
							console.log(qs)
							location.hash = decodeURIComponent($.param(qs));
							console.log(after)

							if (funs[i].onselect) {
								funs[i].onselect();
							}

							dropdown2(ids, names, funs, after, i+1, val, callback);
							if (i+1 == funs.length) return
							if (funs[i+1].show) {
								if (!funs[i+1].show()) {
									return
								} else {
									$(after+(i+1)).show()
								}
							} else {
								$(after+(i+1)).show()
							}
						}
						//console.log("dropdown2: Calling blur().")
						//$('input[id=' + id + ']').blur().unbind('blur');						
			},
			minLength: 0
		}).click(function () {
			//alert('clicked')
			if (!$(this).attr('value'))
				$(this).attr('value','').css('color','black').autocomplete('search');
		});
	}

	console.log("dropdown(): Creating dropdown with id = " + ids[i]);

	$(after+(i))
		.append('<span class="ui-widget" style="display:table;width:100%;border:1px solid black;"></span>');
	$(after + (i) + " .ui-widget")
		.append('<span class="dropdown2" style="width:2px;display:table-cell"></span>')
		.append('<input id="'+ids[i]+'" class="dropdown2"  title="Enter text to search list" style="width:100%;display:table-cell;color:black;font-weight:bold;text-align:center;" value="-'+names[i]+'-"/>')
		.append('<span class="dropdown2" style="width:5px;display:table-cell"></span>')
		.append('<label id="'+ids[i]+'list" class="dropdown2" title="Show full list" style="width:1em;display:table-cell;cursor:pointer">&#9660;</label>');
	

	// Append is synchronous, so this won't happen before element is in DOM.
	// Allow entries not in list.
	$(after + (i) + ' input[id=' + ids[i] + ']').live('input',function () {
		$(this).parent().parent().attr('value',$(this).attr('value'));
	});
	
	console.log("dropdown(): Calling " + funs[i].toString().substring(9,20) + " with i = "+i);
	var list = funs[i](i,selected);

	console.log("dropdown(): Calling dropdown.ac().");
	ac(i,list);
	settoggle(i);

	$('input[id=' + ids[i] + ']').keypress(function(e) {
		  	console.log( "dropdown(): Handler for .keypress() called." );
		    var val = $(this).parent().parent().attr('value');
		    if(e.keyCode == 13) {
		    	console.log("dropdown(): Triggering keyCode " + e.keyCode)
		    	$('input[id=' + ids[i] + ']').val(val).data("autocomplete")._trigger("change",event,{item:val});
		    	$('input[id=' + ids[i] + ']').blur();
		    }
		    if (e.keyCode == 9) { // TAB
		    	console.log('TAB')
		    	//e.preventDefault();
		    	//$('input[id=' + ids[i+1] + ']').click();
		    }
	});

	//console.log(list);
	
	// If only one item, select it.
	if (list.length == 1) {
		console.log("dropdown(): Triggering select on "+ids[i]);
		$('input[id=' + ids[i] + ']').val(list[0].value).data("autocomplete")._trigger("select",event,{item:list[0].value});
	} else {
		// Select first item with attribute selected=true.
		for (var k=0;k<list.length;k++) {
			if (list[k].selected) {
				console.log("dropdown(): Triggering select on "+ids[i]);
				$('input[id=' + ids[i] + ']').val(list[k].value).data("autocomplete")._trigger("select",event,{item:list[k].value});
			}
		}
	}
	if (callback) {
		console.log("dropdown(): Evaluating callback");
		callback(ids[i],i);
	}

}
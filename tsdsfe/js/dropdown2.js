function dropdown2(ids, names, funs, after, i, callback) {

	if (arguments.length < 5) {i = 0;};

	if (i == ids.length) {
		console.log("dropdown(): Last drop-down already set.  Returning.");
		return;
	}

	function settoggle(i) {
		$("#"+ids[i]+"list").unbind('click');
		console.log("dropdown.settoggle(): Setting click event on "+ids[i]+"list element.");
		$("#"+ids[i]+"list").
			click(function (){
				// Note that search event is not defined.
				console.log("dropdown.settoggle.click(): Removing text from "+ids[i]+"list entry area and binding AJAX search event.");
				$("#"+ids[i]).attr('vallast', 
					$("#"+ids[i]).attr('value'))
						.attr('value','').css('color','black')
						.autocomplete('search')
						.focus();
			});
	}
		
	function ac(i, list) {
		
		$("#"+ids[i])
			.autocomplete({
				source: list,
				minLength: 0,
				close: function(event,ui) {
					// If no value is set, use the default definition.
					id = $(this).attr('id')
					if ($(this).attr('value') == "") {
						$("#"+id)
							.attr('value', '-' + names[i] + '-')
							.css('color','black');
					}
				},
				blur: function(event) {
					// Never triggers.
					console.log("dropdown.ac.blur(): " + id 
							+ " + blur event triggered with value " 
							+ ui.item.value);
					event.preventDefault();
				},
				//search: function (event) {funs[i].onselect();},
				change: function(event, ui) {
					id = $(this).attr('id');
					console.log("dropdown.ac.change(): Change event triggered on drop-down with id = " + id);

					var i = parseInt($(this)
								.parent().parent()
								.attr("id").replace(/[a-z]/gi,""));
					
					// Blur event above never triggers, so create event here manually.
					$('input[id=' + id + ']').unbind('blur');
					console.log("dropdown.ac.change(): Binding blur event on " + id);
					$('input[id=' + id + ']').blur(function () {
						id = $(this).attr('id')
						console.log("dropdown.ac.change(): Blur event triggered on " + id);
						var val = $('input[id=' + id + ']')
										.parent().parent().attr('value');
						var vallast = $('input[id=' + id + ']')
										.parent().parent().attr('valuelast');
						console.log("dropdown.ac.change(): value = " + val)
						console.log("dropdown.ac.change(): valuelast = " + vallast);

						if (typeof(val) === "undefined" && typeof(vallast) === "undefined") {
							console.log("dropdown().ac.change(): Both val and valuelast are undefined. Closing " + id);
							$('input[id=' + id + ']').autocomplete("close");
							return;
						}
						if (val === vallast) {
							console.log("dropdown.ac.change(): val and valuelast for "
											+ id  + " are identical. Setting value to "
											+ val + " and triggering select and close.");
							$('input[id=' + id + ']')
										.val(val)
										//.data("autocomplete")
										//._trigger("select", event, {item:val})
										.autocomplete("close");
						} else {
							console.log("dropdown.ac.change(): val and valuelast are different.  " +
										" Closing, setting value to " + val + " and then triggering select.");
							$('input[id=' + id + ']')
										.autocomplete("close")
										.val(val)
										.data("autocomplete")
										._trigger("select",event,{item:val});
						}	
					});

					var vallast = $('input[id=' + id + ']')
						.parent().parent().attr('valuelast');
					console.log("dropdown.ac.change(): valast = " + vallast);
					if (vallast === "") {
						//$(after+i).attr('name',id).attr('valuelast',val);
					}

					if (ui.item == null) {
						ui.item = {};
						console.log("dropdown.ac.change(): ui.item == null."
							+ " Setting it to "
							+ $('input[id=' + id + ']')
									.parent().parent()
									.attr('value')
							+ " and triggering select.")
						ui.item.value = $('input[id=' + id + ']')
											.parent().parent().attr('value');
						$('input[id=' + id + ']').val(ui.item.value)
							.data("autocomplete")
							._trigger("select",event,{item:ui.item.value});
						
						return;
					}
					
					// This is to deal with the fact that change()
					// is called on a blur event.
					if (ui.item.value !== ui.item.valuelast) {
						console.log("dropdown.ac.change(): " + id 
							+ " value has changed.  Removing all following drop-downs.");
						for (j = i+1; j < ids.length; j++) {
							$(after + (j)).html('');
							$(after + (j)).attr('value','')
							$(after + (j)).attr('valuelast','')
						}
					} else {
						// This happens after a selection is made and then user
						// clicks outside of drop-down list.  Not a true change event.
						// console.log(event)
						console.log("dropdown.ac.change(): " 
							+ id 
							+ " value has not changed.  Not removing drop-down with id = " + id + ".");
					}
				},			
				select: 
					function(event, ui) {

						id = $(this).attr('id');

						console.log("dropdown.ac.select(): Select event triggered on drop-down with id = " + id);

						var i = parseInt($(this).parent().parent()
												.attr("id")
												.replace(/[a-z]/gi,""));

						var p = $(this).parent().parent();

						if (typeof(ui.item) === "undefined") {
							console.log("dropdown2.ac.select(): ui.item is undefined. "
								+ "Setting valuelast to " 
								+ $('input[id=' + id + ']').parent().parent().attr('valuelast'));
							var vallast = $('input[id=' + id + ']')
											.parent().parent().attr('valuelast');

							if (typeof(vallast) === "undefined") {
								console.log("dropdown.ac.select(): ui.item and valuelast are undefined. Closing " + id);
								$('input[id=' + id + ']').autocomplete("close");
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
							console.log("dropdown.ac.select(): Getting query object from hash.");
							var qs = $.parseQueryString();
						}

						if ($(p).val()) {
							console.log("dropdown.ac.select(): Setting query object value for " + $(p).attr('name') + " to " + $(p).val());
							qs[$(p).attr('name')] = $(p).val();
						}
						
						console.log("dropdown.ac.select(): Setting hashchange.byurledit to false.");
						$(window).hashchange.byurledit = false;

						console.log("dropdown.ac.select(): Setting hash using modified query object.");
						location.hash = decodeURIComponent($.param(qs));

						if (val) {
							console.log("dropdown.ac.select(): Setting"
										+ " ui.item.valuelast to ui.item.value.");
							ui.item.valuelast = ui.item.value;
						}

						if ((val === vallast)) {
							console.log("dropdown.ac.select(): New value was "
											+ "same as old.  Closing drop-down"
											+ " and taking no action.");
							$('input[id=' + id + ']').autocomplete("close");
						} else {
							if (funs[i].clearfollowing) {
								if (funs[i].clearfollowing() == false) {
									console.log("dropdown.ac.select(): Not clearing values in all drop-downs after " + id + ".");
									return;
								}
							}

							console.log("dropdown.ac.select(): New value is not same as old."
											+ " Clearing values in all drop-downs after " + id + ".");
							

							$("input[id='"+id+"']")
								.parent().parent()
								.nextAll("span")
								.hide().html('')
								.attr('value','')
								.attr('valuelast','');

							console.log("dropdown.ac.select(): Getting drop-down "
											+ "values on all remaing drop-downs.");
							qs = {};
							for (j = 0;j < i+1;j++) {
								if ($(after+j).val()) {
									qs[$(after+j).attr('name')] = $(after+j).val();
								}
							}
							console.log("dropdown.ac.select(): Setting hash based on"
											+ " values on all remaing drop-downs.");
							location.hash = decodeURIComponent($.param(qs));

							// Trigger onselect callback for dropdown.
							var err;
							if (funs[i].onselect) {
								console.log("dropdown.ac.select(): Triggering "
												+ "onselect callback for current drop-down.");
								var err = funs[i].onselect();
							}

							if (typeof(err) === "string") {
								console.log("dropdown.ac.select(): Not setting next drop-down due to error.");								
							} else {
								console.log("dropdown.ac.select(): Setting next drop-down.");
								dropdown2(ids, names, funs, after, i+1);
							}

						}
					}
			})
	}

	console.log("dropdown(): Creating dropdown with id = " + ids[i]);

	var list = funs[i]();

	if (typeof(list) === "string") {
		console.log("dropdown(): Drop-down has string value (error). Aborting.");
		return;
	}

	$(after+(i)).empty();
	$(after+(i)).parent().parent().attr("valuelast","");
	$(after+(i))
		.append('<span class="ui-widget" style="display:table;width:100%;border:1px solid black;"></span>');
	$(after + (i) + " .ui-widget")
		.append('<span class="dropdown2" style="width:2px;display:table-cell"></span>')
		.append('<input id="'+ids[i]+'" class="dropdown2"  title="Select ' + names[i] + ' option or enter text to narrow list." style="width:100%;display:table-cell;color:black;font-weight:bold;text-align:center;" value="-'+names[i]+'-"/>')
		.append('<span class="dropdown2" style="width:5px;display:table-cell"></span>')
		.append('<label id="'+ids[i]+'list" class="dropdown2" title="Show full list" style="width:1em;display:table-cell;cursor:pointer">&#9660;</label>');

	console.log("dropdown(): Calling " 
					+ funs[i].toString().split("{")[0].trim() 
					+ " to get drop-down list entries.");


	if (!list) {
		console.log("dropdown(): Drop-down has no values.  Setting next drop-down.");
		dropdown2(ids, names, funs, after, i+1);
		return;
	}

	if (list.length == 0) {
		console.log("dropdown(): Drop-down has no values.  Setting next drop-down.");
		dropdown2(ids, names, funs, after, i+1);
		return;
	}

	console.log("dropdown(): Calling dropdown.ac().");
	ac(i, list);

	console.log("dropdown(): Calling dropdown.settoggle().");
	settoggle(i);

	// Allow entries not in list.
	// Append is synchronous, so this won't happen before element is in DOM.
	// TODO: Each drop-down should have a function validate() that checks if
	// manually entry is valid.
	$(after + (i) + ' input[id=' + ids[i] + ']')
		.live('input',
			function () {
				$(this).parent().parent().attr('value', $(this).attr('value'));
			});

	$('input[id=' + ids[i] + ']').keypress(function(e) {
		  	console.log( "dropdown(): Handler for .keypress() called." );
		    var val = $(this).parent().parent().attr('value');
		    if(e.keyCode == 13) {
		    	console.log("dropdown(): Triggering keyCode " + e.keyCode)
		    	$('input[id=' + ids[i] + ']').val(val).data("autocomplete")._trigger("change",event,{item:val});
		    	$('input[id=' + ids[i] + ']').blur();
		    }
		    if (e.keyCode == 9) { // TAB
		    	console.log("dropdown(): TAB Pressed.")
		    	//e.preventDefault();
		    	//$('input[id=' + ids[i+1] + ']').click();
		    }
	});

	if (list.length > 0) {
		console.log("dropdown.ac.select(): Drop-down has values.  Triggering show on it.");
		$(after+(i)).show();
	} 
	
	// If only one item, select it.
	if (list.length == 1) {
		console.log("dropdown(): Triggering select on " 
					+ ids[i] + " because it has only one item.");
		$('input[id=' + ids[i] + ']')
			.val(list[0].value).data("autocomplete")
			._trigger("select", event, {item:list[0].value});
	}

	if (list.length > 1 ) {
		// Select first item with attribute selected=true.
		for (var k = 0;k < list.length; k++) {
			if (list[k].selected) {
				console.log("dropdown(): Triggering select on " + ids[i] + " because it has selected=true.");
				$('input[id=' + ids[i] + ']')
					.val(list[k].value).data("autocomplete")
					._trigger("select", event, {item:list[k].value});
				break;
			}
		}
	}
}
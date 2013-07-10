function createcatalog() { 
			jQuery.xml2str = function(xmlData) {if (window.ActiveXObject) {return xmlData.xml} else {return (new XMLSerializer()).serializeToString(xmlData)}}

			function append(from,to) {
				$($.parseXML($.xml2str(from[0]))).find('variable').appendTo(to);
			}

	Datasets = $('#Datasets').val().split("\n");
	var DatasetTemplates = [];
	for (var k=0;k<Datasets.length;k++) {
		DatasetTemplates[k] = expanddollar($("#URLTemplate").val(),Datasets[k].split(","));
	}
	//console.log(DatasetTemplates);
	
			$('#catalogdiv').show();
			var tmp = $.tmpl($('#tsdstemplate').html(),{
				CatalogName:$('#CatalogName').val(),
				CatalogID:$('#CatalogName').val(),
				IOSP:$('#IOSP').val()
				})[0];
			$('#tsdscatalog').val(tmp.wholeText);
			
			var catalog = $($.parseXML($('#threddstemplate').val())).find('catalog');
			var catalog0 = $($.parseXML($('#threddstemplate').val())).find('catalog');
			catalog.find('catalog').attr('name',$('#CatalogName').val());
			
			catalog.find('documentation').attr("xlink:title",$('#CatalogDescription').val());
			catalog.find('documentation').attr("xlink:href",$('#CatalogDescriptionURL').val());
			catalog.attr('id',$('#CatalogID').val());
			catalog.find('service').attr('base','http://tsds.org/tsds/'+$('#CatalogID').val())
			catalog.find('dataset').remove();

			//console.log($.xml2str(catalog[0]))

			//var catalog = $(catalog0[0]).find('catalog');
			//var catalog0 = $(catalog0[0]).find('catalog');
			var dataset = $(catalog0[0]).find('dataset');
			var variables = $(catalog0[0]).find('variables');
			var variable = $(catalog0[0]).find('variable');
			var groups = $(catalog0[0]).find('groups');
			var group = $(catalog0[0]).find('group');	
			//console.log($.xml2str(dataset[0]));
			catalog.empty();
			var StartDates = $('#StartDates').val().split(',')
			var StopDates = $('#StopDates').val().split(',')
			var Datasets   = $('#Datasets').val().split(/\n/g);

			for (j = 0; j< Datasets.length; j++) {
			//for (j = 0; j<2; j++) {
				var Dataset = Datasets[j].split(',');
	
				dataset.attr('id',Dataset[0]).attr('name',Dataset[0]);
				dataset.attr('template',DatasetTemplates[j]);
				dataset.find('access').attr('urlPath',Dataset[0]);
				dataset.find('Start').text(StartDates[0]);
				dataset.find('End').text(StopDates[0]);
				//dataset.find('variables').remove();
				//dataset.find('groups').remove();

				var DataIDs    = $('#DataIDs').val().split(/,/g);
				var DataNames  = $('#DataNames').val().split(/,/g);
				var DataLabels = $('#DataLabels').val().split(/,/g);
				var DataFillValues = $('#DataFillValues').val().split(/,/g);
				var DataColumns = $('#DataColumns').val().replace(/\(|\)|\[|\]/g,"").split(/,/g);
				var DataRenderings = $('#DataRenderings').val().split(/,/g);
				var DataUnits  = $('#DataUnits').val().split(/,/g);
				var DataValues = $('#DataValues').val().split(/,/g);

				for (i = 0;i < DataIDs.length;i++) {
					DataIDs[i] = DataIDs[i].replace(/\$([0-9])/,"'+Dataset[$1-1]+'");
					DataNames[i] = DataNames[i].replace(/\$([0-9])/,"'+Dataset[$1-1]+'");
				}

				var DataGroups       = $("#DataColumns").val().match(/\((.*?)\)/g);
				var DataGroupElementValues = $("#DataValues").val().match(/\((.*?)\)/g);
				var DataGroupElements = $("#DataIDs").val().match(/\((.*?)\)/g);

				var DataGroupIDs     = $("#DataGroupIDs").val().split(/,/g);
				var DataGroupNames   = $("#DataGroupNames").val().split(/,/g);
				var DataGroupLabels  = $("#DataGroupLabels").val().split(/,/g);

				if (DataGroups) {
					for (i = 0;i < DataGroups.length;i++) {
						
						ID = DataGroupIDs[i].replace(/\$([0-9])/,"'+Dataset[$1-1]+'");
						ID = eval("'" + ID + "'");
						group.attr('id',ID);
						if (DataGroupElementValues)	
							group.attr('values',DataGroupElementValues[i].replace(/\(|\)|\[|\]/g,""));
	
						name = DataGroupNames[i].replace(/\$([0-9])/,"'+Dataset[$1-1]+'");
						name = eval("'" + name + "'");
						group.attr('name',name);
						if (DataGroups[i].match(/\)/)) {
							group.attr('type','vector');
						} else {
							group.attr('type','spectrogram');
						}
						var elements = DataGroupElements[i].replace(/\(|\)|\[|\]/g,"");
						elements = elements.replace(/\$([0-9])/g,"'+Dataset[$1-1]+'");
						elements = eval("'" + elements + "'");
	
						group.attr('elements',elements);
						//$(groups).append(group[0].outerHTML);
						//$($.parseXML($.xml2str(group[0]))).find('group').appendTo(groups);
						//append(group,groups)

						//$(groups).append(group[0]);
					}
				}
				//console.log($.xml2str(variables[0]))
				variables.empty();
				
				for (i = 0;i < DataIDs.length;i++) {
	
					ID = DataIDs[i].replace(/\$([0-9])/,"'+Dataset[$1-1]+'");
					ID = eval("'" + ID + "'");
					ID = ID.replace(/\(|\)|\[|\]/g,"");
	
					name = DataNames[i].replace(/\$([0-9])/,"'+Dataset[$1-1]+'");
					name = eval("'" + name + "'");
					name = name.replace(/\(|\)|\[|\]/g,"");

					label = DataLabels[i].replace(/\$([0-9])/,"'+Dataset[$1-1]+'");
					label = eval("'" + name + "'");
					label = label.replace(/\(|\)|\[|\]/g,"");
					
					fillvalue = DataFillValues[i];

					rendering = DataRenderings[i];
					columns = DataColumns[i];
					
					unit = DataUnits[i].replace(/\$([0-9])/,"'+Dataset[$1-1]+'");
					unit = eval("'" + unit + "'");
					variable.attr('id',ID).attr('name',ID).attr('name',name).attr('label',label).attr('units',unit).attr('type','scalar').attr('fillvalue',fillvalue).attr('rendering',rendering).attr('columns',columns);
					//append(variable,variables)
					$($.parseXML($.xml2str(variable[0]))).find('variable').appendTo(variables);
					//console.log($.xml2str(variable[0]))
				}
				//console.log(variables)
				//console.log(variables[0].outerHTML);
				//console.log($.xml2str(variables[0]))
				if (DataGroups) {append(groups,dataset);}

				//$($.parseXML($.xml2str(variables[0]))).find('variables').appendTo(dataset);
				//append(variables,dataset)
				$($.parseXML($.xml2str(dataset[0]))).find('dataset').appendTo(catalog);
			}
			//console.log($.xml2str(catalog0[0]));
			//catalog.empty();
			$($.parseXML($.xml2str(dataset[0]))).find('dataset').appendTo(catalog);
			//append(dataset,catalog);
			console.log($.xml2str(catalog[0]));
			//console.log(dataset)
			//console.log(catalog[0])
			//console.log(catalog[0].outerHTML);
			//console.log($.xml2str(catalog[0]));
			return $.xml2str(catalog[0])
}

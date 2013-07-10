function setpresets(preset) {

				$('#CatalogName').val(preset.CatalogName);
				$('#CatalogID').val(preset.CatalogID);

				if (preset.CatalogDescription == "") {
					$('#CatalogDescription').val(preset.CatalogName);
				} else {
					$('#CatalogDescription').val(preset.CatalogDescription);
				}
				$('#CatalogDescriptionURL').val(preset.CatalogDescriptionURL);

				$('#DatasetDescription').val(preset.DatasetDescription);
				$('#DatasetDescriptionURL').val(preset.DatasetDescriptionURL);
				
				// TODO: If only one value duplicate.
				$('#StartDates').val(preset.StartDates[0]);
				$('#StopDates').val(preset.StopDates[0]);
	
				//$('#Datasets').text("");
				var tmp = JSON.stringify(preset.Datasets).replace(/\],\[/g,"\n").replace("[[","").replace("]]","").replace(/\"/g,"");
				$('#Datasets').text(tmp);
				//alert(tmp);
				
				
				$('#URLTemplateExpander').val(preset.URLTemplateExpander);
				$('#URLTemplate').val(preset.URLTemplate);
	
				$('#PlotColumns').val(preset.PlotColumns);
	
				$('#TimeColumns').val(preset.TimeColumns);
				$('#TimeFormat').val(preset.TimeFormat);
				$('#TimeUnits').val(preset.TimeUnits);
				$('#TimeLabels').val(preset.TimeLabels);
				
				$('#DataColumns').val(preset.DataColumns);
				$('#DataIDs').val(preset.DataIDs);
				$('#DataNames').val(preset.DataNames);
				$('#DataLabels').val(preset.DataLabels);
				$('#DataValues').val(preset.DataValues);
				$('#DataTypes').val(preset.DataTypes);
				$('#DataUnits').val(preset.DataUnits);
				$('#DataRenderings').val(preset.DataRenderings);
				$('#DataFillValues').val(preset.DataFillValues);
	
				$('#DataGroupIDs').val(preset.DataGroupIDs);
				$('#DataGroupNames').val(preset.DataGroupNames);
				$('#DataGroupLabels').val(preset.DataGroupLabels);
				//$('#DataGroupTypes').val(preset.JSON.stringify(DataGroupTypes));
				
				$('#SkipLines').val(preset.SkipLines);
				$('#LineRegEx').val(preset.LineRegEx);
	
				//$('#LineTemplate').val(preset.LineTemplate);
				$('#LineRegEx').val(preset.LineRegEx);
				$('#CommentCharacter').val(preset.CommentCharacter);
				$('#DataDelimiter').val(preset.DataDelimiter);
				$('#DataLineFormat').val(preset.DataLineFormat);
				
				$('#IOSP').val(preset.IOSP);
}

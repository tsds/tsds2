id="USGS/RT/Dst/PT1H";
Presets[id] = {};

// For Autoplot, for now.
Presets[id].PlotColumns = 7;

Presets[id].CatalogName = "Real Time Dst from USGS; 1-hour cadence.";
Presets[id].CatalogID   = id;

Presets[id].Datasets = [["Dst,Real-time Dst"]];

						 
Presets[id].URLTemplate = "http://magweb.cr.usgs.gov/data/indices/beta/Dst_hour/usgs$Y$m$ddst4.hour";

Presets[id].CatalogDescription = "Catalog derived from inspection of"
Presets[id].CatalogDescriptionURL = "http://magweb.cr.usgs.gov/data/indices/beta/Dst_hour/";

Presets[id].StartDates       = ["2013-01-03"];
Presets[id].StopDates        = ["2013-08-13"];

Presets[id].DatasetName        = "$2";
Presets[id].DatasetID          = "$1";
Presets[id].DatasetDescription = "Real-time Dst estimate from USGS; 1-hour cadence."; 
Presets[id].DatasetDescriptionURL = "http://geomag.usgs.gov/products/";

Presets[id].TimeColumns      = "1,2";
Presets[id].TimeFormat       = "$Y-$m-$d,$H:$M:$S.$(millis)";
Presets[id].TimeUnits        = "Gregorian,UT";
Presets[id].TimeLabels       = "Date,Time";

Presets[id].DataColumns      = "3,4"
Presets[id].DataLabels       = "DOY,DST_RT";
Presets[id].DataNames        = "Day of Year, Real-time Dst";
Presets[id].DataIDs          = Presets[id].DataLabels.replace("(|)","").replace(" ","");

Presets[id].DataValues       = "";
Presets[id].DataTypes        = "";
Presets[id].DataUnits        = ",nT";
Presets[id].DataRenderings   = "";
Presets[id].DataFillValues   = ""

Presets[id].DataGroupIDs     = ""
Presets[id].DataGroupNames   = ""
Presets[id].DataGroupLabels  = ""

Presets[id].SkipLines        = "0";
Presets[id].LineRegex        = "^[0-9]";
Presets[id].CommentCharacter = "";
Presets[id].DataDelimiter    = "\\s";
Presets[id].DataLineFormat   = "";

Presets[id].DataReader       = "lasp.tss.iosp.ColumnarAsciiReader";
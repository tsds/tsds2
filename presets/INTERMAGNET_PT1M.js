id="INTERMAGNET/PT1M";
Presets[id] = {};

// console.log(list);
// For Autoplot, for now.
Presets[id].PlotColumns = 7;

Presets[id].CatalogName = "INTERMAGNET 1-minute magnetometer data";
Presets[id].CatalogID   = id;

var starts = "";
var stops  = "";
var c = "";
Presets[id].Datasets = [];
for (var i = 0;i< list.length;i++) {
//for (var i = 0;i<29;i++) {
	list2 = list[i].split(",").splice(3);
	Presets[id].Datasets[i] = [list[i].split(",")[0]+","+list[i].split(",")[0].toLowerCase()].concat(list2);
	if (i > 0) c=",";
	console.log(Presets[id].Datasets[i])
	starts = starts + c + list[i].split(",")[1];
	stops = stops + c + list[i].split(",")[2];
}

Presets[id].StartDates = [starts];
Presets[id].StopDates  = [stops];
Presets[id].Cadence    = ["PT1M"];
						 
Presets[id].URLTemplate = "http://mag.gmu.edu/mirror/www.intermagnet.org/$1/PT1M/$2$Y$m$dvmin.min";

Presets[id].CatalogDescription = "http://tsds.org/catalogs/intermagnet/"
Presets[id].CatalogDescriptionURL = "http://tsds.org/catalogs/intermagnet/";

Presets[id].DatasetName        = "$1";
Presets[id].DatasetID          = "$1";
Presets[id].DatasetDescription = "";
Presets[id].DatasetDescriptionURL = "";

Presets[id].TimeColumns      = "1,2";
Presets[id].TimeFormat       = "$Y-$m-$d,$H:$M:$S.$(millis)";
Presets[id].TimeUnits        = "Gregorian,UT";
Presets[id].TimeLabels       = "Date,Time";

Presets[id].DataColumns      = "3,(4,5,6),7";
Presets[id].DataIDs          = "DOY,(H,D,Z),F";
Presets[id].DataNames        = "Day of Year,($6 H,$6 D,$6 Z),$6 F";
Presets[id].DataLabels       = "DOY,($1H,$1D,$1Z),$1F";
Presets[id].DataValues       = "";
Presets[id].DataTypes        = "d,f,f,f,f";
Presets[id].DataUnits        = "Gregorian,nT,nT,nT,nT";
Presets[id].DataRenderings   = "%j,%.2f,%.2f,%.2f,%.2f";
Presets[id].DataFillValues   = ",99999.00,99999.00,99999.00,99999.00";

Presets[id].DataGroupIDs     = "HDZ"
Presets[id].DataGroupNames   = "HDZ components"
Presets[id].DataGroupLabels  = ""

Presets[id].SkipLines        = "";
Presets[id].LineRegex        = "^[0-9]";
Presets[id].CommentCharacter = "";
Presets[id].DataDelimiter    = "\\s";
Presets[id].DataLineFormat   = "";

Presets[id].DataReader       = "lasp.tss.iosp.ColumnarAsciiReader";
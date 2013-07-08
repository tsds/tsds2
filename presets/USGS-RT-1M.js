id="USGS-RT-1M";
Presets[id] = {};

// For Autoplot, for now.
Presets[id].PlotColumns = 4;

Presets[id].URLTemplate        = "http://magweb.cr.usgs.gov/data/magnetometer/$1/OneMinute/$5%Y%m%dvmin.min";

Presets[id].CatalogName        = "USGS Real Time 1-Minute Magnetometer Measurements";
Presets[id].CatalogID          = "USGS/MAG/1M";
Presets[id].CatalogDescription = ""; // Could be a URL or [{title:"",description:""}] or {title:"",description:""}
Presets[id].CatalogDescriptionURL = "";

Presets[id].StartDates       = ["2012-10-01"];
Presets[id].StopDates        = ["2012-10-03"];

Presets[id].Datasets         = [
						  ["BDT","BDT one-minute","BDT1m","bdtvmin","bdt","Boulder Test"],                           
						  ["BOU","BOU one-minute","BOU1m","bouvmin","bou","Boulder"],
						  ["BRT","BRT one-minute","BRT1m","brtvmin","brt","Barrow Test"],
						  ["BRW","BRW one-minute","BRW1m","brwvmin","brw","Barrow"],
						  ["BSL","BSL one-minute","BSL1m","bslvmin","bsl","Stennis Space Center"],
						  ["CMO","CMO one-minute","CMO1m","cmovmin","cmo","College"],
						  ["DED","DED one-minute","DED1m","dedvmin","ded","Deadhorse"],
						  ["FRD","FRD one-minute","FRD1m","frdvmin","frd","Fredericksburg"],
						  ["FRN","FRN one-minute","FRN1m","frnvmin","frn","Fresno"],
						  ["GUA","GUA one-minute","GUA1m","guavmin","gua","Guam"],
						  ["HON","HON one-minute","HON1m","honvmin","hon","Honolulu"],
						  ["KGI","KGI one-minute","KGI1m","kgivmin","kgi","King Sejong Island"],
						  ["NEW","NEW one-minute","NEW1m","newvmin","new","Newport"],
						  ["SHU","SHU one-minute","SHU1m","shuvmin","shu","Shumagin"],
						  ["SIT","SIT one-minute","SIT1m","sitvmin","sit","Sitka"],
						  ["SJG","SJG one-minute","SJG1m","sjgvmin","sjg","San Juan"],
						  ["TUC","TUC one-minute","TUC1m","tucvmin","tuc","Tucson"],
						 ];

Presets[id].DatasetName        = "$2";
Presets[id].DatasetID          = "$1";
Presets[id].DatasetDescription = ""; // Could be a URL or [{title:"",description:""}] or {title:"",description:""}

Presets[id].TimeColumns      = "1,2";
Presets[id].TimeFormat       = "$Y-$m-$d,$H:$M:$S";
Presets[id].TimeUnits        = "Gregorian,UT";
Presets[id].TimeLabels       = "Date,Time";

Presets[id].DataColumns      = "3,(4,5,6),7";
Presets[id].DataIDs          = "DOY,(H,D,Z),F";
Presets[id].DataNames        = "Day of Year,($6 H,$6 D,$6 Z),$6 F";
Presets[id].DataLabels       = "DOY,($1H,$1D,$1Z),$1F";
Presets[id].DataValues       = "";
Presets[id].DataTypes        = "d,f,f,f,f";
//Presets[id].DataTypes      = "d,(f),f";
Presets[id].DataUnits        = "Gregorian,nT,nT,nT,nT";
//Presets[id].DataUnits        = "Gregorian,(nT),nT";
Presets[id].DataRenderings   = "%j,%.2f,%.2f,%.2f,%.2f";
//Presets[id].DataRenderings   = "%j,(%.2f),%.2f";
Presets[id].DataFillValues   = ",99999.00,99999.00,99999.00,99999.00";

Presets[id].DataGroupIDs     = "$1_HDZ"
Presets[id].DataGroupNames   = "Magnetic Field Vector"
Presets[id].DataGroupLabels  = ""

Presets[id].SkipLines        = "25";
Presets[id].LineRegEx        = "^[0-9]";
Presets[id].CommentCharacter = "^#";
Presets[id].DataDelimiter    = "\\s";
Presets[id].DataLineFormat   = "";

Presets[id].IOSP             = "lasp.tss.iosp.ColumnarAsciiReader";

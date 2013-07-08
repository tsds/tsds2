id="USGS-RT-1M-FRD";
Presets[id] = {};

Presets[id].PlotColumns = 4;

Presets[id].URLTemplate        = "http://magweb.cr.usgs.gov/data/magnetometer/FRD/OneMinute/frd%Y%m%dvmin.min";
//Presets[id].URLTemplate        = "http://magweb.cr.usgs.gov/data/magnetometer/$1/OneSecond/$5%Y%m%dvsec.sec";

Presets[id].CatalogName        = "USGS Real Time 1-Minute Magnetometer Measurements";
Presets[id].CatalogID          = "USGS/MAG/1M";
Presets[id].CatalogDescription = ""; // Could be a URL or [{title:"",description:""}] or {title:"",description:""}
Presets[id].CatalogDescriptionURL = "http://magweb.cr.usgs.gov/data/magnetometer/";

Presets[id].StartDates       = ["2012-04-01"];
Presets[id].StopDates        = ["2012-04-03"];

Presets[id].Datasets         = [
						  ["FRD"],
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
Presets[id].DataNames        = "Day of Year,(FRD H,FRD D,FRD Z),FRD F";
Presets[id].DataLabels       = "DOY,(H,D,Z),F";
Presets[id].DataValues       = "'',(0.1,0.2,0.3),''";
Presets[id].DataTypes        = "d,f,f,f,f";
//Presets[id].DataTypes      = "d,(f),f";
Presets[id].DataUnits        = "Gregorian,nT,nT,nT,nT";
//Presets[id].DataUnits        = "Gregorian,(nT),nT";
Presets[id].DataRenderings   = "%j,%.2f,%.2f,%.2f,%.2f";
//Presets[id].DataRenderings   = "%j,(%.2f),%.2f";
Presets[id].DataFillValues   = ",99999.00,99999.00,99999.00,99999.00";

Presets[id].DataGroupIDs     = "FRD_HDZ"
Presets[id].DataGroupNames   = "Magnetic Field Vector"
Presets[id].DataGroupLabels  = ""

Presets[id].SkipLines        = "25";
Presets[id].LineRegEx        = "^[0-9]";
Presets[id].CommentCharacter = "^#";
Presets[id].DataDelimiter    = "\\s";
Presets[id].DataLineFormat   = "";

Presets[id].IOSP             = "lasp.tss.iosp.ColumnarAsciiReader";

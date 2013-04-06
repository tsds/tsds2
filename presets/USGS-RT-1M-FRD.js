// For Autoplot, for now.
PlotColumns = 4;

//var URLTemplate        = "http://magweb.cr.usgs.gov/data/magnetometer/$1/OneMinute/$5%Y%m%dvmin.min";
var URLTemplate        = "http://magweb.cr.usgs.gov/data/magnetometer/$1/OneSecond/$5%Y%m%dvsec.sec";

var CatalogName        = "USGS Real Time 1-Minute Magnetometer Measurements";
var CatalogID          = "USGS/MAG/1M";
var CatalogDescription = ""; // Could be a URL or [{title:"",description:""}] or {title:"",description:""}
var CatalogDescriptionURL = "http://magweb.cr.usgs.gov/data/magnetometer/";

var StartDates       = ["2012-04-01"];
var StopDates        = ["2012-04-03"];

var Datasets         = [
						  ["FRD","FRD one-minute","FRD1m","frdvmin","frd","Fredericksburg"],
						 ];

var DatasetName        = "$2";
var DatasetID          = "$1";
var DatasetDescription = ""; // Could be a URL or [{title:"",description:""}] or {title:"",description:""}

var TimeColumns      = "1,2";
var TimeFormat       = "$Y-$m-$d,$H:$M:$S";
var TimeUnits        = "Gregorian,UT";
var TimeLabels       = "Date,Time";

var DataColumns      = "3,(4,5,6),7";
var DataIDs          = "DOY,(H,D,Z),F";
var DataNames        = "Day of Year,($6 H,$6 D,$6 Z),$6 F";
var DataLabels       = "DOY,($1H,$1D,$1Z),$1F";
var DataValues       = "'',(0.1,0.2,0.3),''";
var DataTypes        = "d,f,f,f,f";
//var DataTypes      = "d,(f),f";
var DataUnits        = "Gregorian,nT,nT,nT,nT";
//var DataUnits        = "Gregorian,(nT),nT";
var DataRenderings   = "%j,%.2f,%.2f,%.2f,%.2f";
//var DataRenderings   = "%j,(%.2f),%.2f";
var DataFillValues   = ",99999.00,99999.00,99999.00,99999.00";

var DataGroupIDs     = "$1_HDZ"
var DataGroupNames   = "Magnetic Field Vector"
var DataGroupLabels  = ""

var SkipLines        = "25";
var LineRegEx        = "^[0-9]";
var CommentCharacter = "^#";
var DataDelimiter    = "\\s";
var DataLineFormat   = "";

var IOSP             = "lasp.tss.iosp.ColumnarAsciiReader";

var AutoplotServlet = "http://aurora.gmu.edu:8080/AutoplotServlet-20121220/SimpleServlet?url=";
//var DataCache       = "http://datacache.org/dc/sync%3Fsource=";
var DataCache       = "http://datacache.org/dc/sync?source=";
//var Proxy           = "http://localhost:8002/proxy?url=";
var Proxy = "";

var Start   = '2012-10-01';
var Stop    = '2012-10-31';
var Start   = '2012-11-01';
var Stop    = '2012-11-30';

var Cadence = '';
	
var CatalogDescription = {Name:"USGS Real Time 1-Minute Magnetometer Measurements", ID:"USGS/MAG/1M",Description:""};
var CatalogDescription = {Name:"USGS Real Time 1-Second Magnetometer Measurements", ID:"USGS/MAG/1S",Description:""};

var DatasetDescription = [
						  ["BDT one-minute","","BDT1m","bdtvmin","BDT","bdt","Boulder Test"],                           
						  ["BOU one-minute","","BOU1m","bouvmin","BOU","bou","Boulder"],
						  ["BRT test one-minute","","BRT1m","brtvmin","BRT","brt","Barrow Test"],
						  ["BRW one-minute","","BRW1m","brwvmin","BRW","brw","Barrow"],
						  ["BSL one-minute","","BSL1m","bslvmin","BSL","bsl","Stennis Space Center"],
						  ["CMO one-minute","","CMO1m","cmovmin","CMO","cmo","College"],
						  ["DED one-minute","","DED1m","dedvmin","DED","ded","Deadhorse"],
						  ["FRD one-minute","","FRD1m","frdvmin","FRD","frd","Fredericksburg"],
						  ["FRN one-minute","","FRN1m","frnvmin","FRN","frn","Fresno"],
						  ["GUA one-minute","","GUA1m","guavmin","GUA","gua","Guam"],
						  ["HON one-minute","","HON1m","honvmin","HON","hon","Honolulu"],
						  ["KGI one-minute","","KGI1m","kgivmin","KGI","kgi","King Sejong Island"],
						  ["NEW one-minute","","NEW1m","newvmin","NEW","new","Newport"],
						  ["SHU one-minute","","SHU1m","shuvmin","SHU","shu","Shumagin"],
						  ["SIT one-minute","","SIT1m","sitvmin","SIT","sit","Sitka"],
						  ["SJG one-minute","","SJG1m","sjgvmin","SJG","sjg","San Juan"],
						  ["TUC one-minute","","TUC1m","tucvmin","TUC","tuc","Tucson"],
						 ];

var Template           = "http://magweb.cr.usgs.gov/data/magnetometer/$5/OneMinute/$6%Y%m%dvmin.min";
var Template           = "http://magweb.cr.usgs.gov/data/magnetometer/$5/OneSecond/$6%Y%m%dvsec.sec";

var ColumnLabels       = ["DATE","TIME","DOY","$5H","$5D","$5Z","$5F"];
var ColumnLongnames    = ["Date","Time","$7 H","$7 D","$7 Z","$7 F"];
var ColumnUnits        = ["Gregorian","UTC","nT","nT","nT","nT"];
var ColumnGroupings    = ["Time","Time","$5_HDZ","$5_HDZ","$5_HDZ","$5_F"];
var LineTemplate       = "%Y-%m=%d %h:%M:%s.%ss %j %.2f %.2f %.2f %.2f";
var LineRegex          = "^[0-9][0-9][0-9][0-9]";
var ColumnGroupnames   = {"Time":"Date and Time","$5_XYZ":"Flux-gate Magnetometer Data","$5_F":"Proton Magnetometer Data"};
var ColumnGrouptypes   = {"Time":"Time","$5_XYZ":"Vector","$5_F":"Scalar"};

var Start   = '2012-10-01';
var Stop    = '2012-10-10';
var Cadence = '';
	
var CatalogDescription = ["USGS Real Time Magnetometer Measurements", "", "USGS/MAG/1M",""];
var DatasetDescription = [
						  ["BDT one-minute","","BDT1m","bdtvmin","BDT","bdt","Boulder Test"],                           ["BOU one-minute","","BOU1m","bouvmin","BOU","bou","Boulder"],
						  ["BRT test one-minute","","BRT1m","brtvmin","BRT","brt","Barrow Test"],
						  ["BRW one-minute","","BRW1m","brwvmin","BRW","brw","Barrow"],
						  ["BSL one-minute","","BSL1m","bslvmin","BSL","bsl","Stennis Space Center"],
						  ["CMO one-minute","","CMO1m","cmovmin","CMO","cmo","College"],
						  ["DED one-minute","","DED1m","dedvmin","DED","ded","Deadhorse"],
						  ["FRD one-minute","","FRD1m","frdvmin","FRD","frd","Fredericksburg"],
						 ];

var Template           = "http://magweb.cr.usgs.gov/data/magnetometer/$5/OneMinute/$6%Y%m%dvmin.min";
var ColumnLabels       = ["DATE","TIME","DOY","$5H","$5D","$5Z","$5F"];
var ColumnLongname     = ["$7 H","$7 D","$7 Z","$7 F"];
var ColumnGroupings    = ["$5_HDZ","$5_HDZ","$5_HDZ","$5_F"];
var LineTemplate       = "%Y-%m=%d %h:%M:%s.%ss %j %.2f %.2f %.2f %.2f";
var LineRegex          = "^[0-9][0-9][0-9][0-9]";
var ColumnGroupnames   = {"$5_XYZ":"Flux-gate Magnetometer Data","$5_F":"Proton Magnetometer Data"};
var ColumnGrouptypes   = {"$5_XYZ":"Vector","$5_F":"Scalar"};

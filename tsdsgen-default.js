var Start   = '2012-10-01';
var Stop    = '2012-10-10';
var Cadence = '';
	
var CatalogDescription = {Name:"USGS Real Time Magnetometer Measurements", ID:"USGS/MAG/1M",Description:""};
var DatasetDescription = [
						  ["BDT one-minute","","BDT1m","bdtvmin","BDT","bdt","Boulder Test"],                           
						  ["BOU one-minute","","BOU1m","bouvmin","BOU","bou","Boulder"],
						  ["BRT test one-minute","","BRT1m","brtvmin","BRT","brt","Barrow Test"],
						  ["BRW one-minute","","BRW1m","brwvmin","BRW","brw","Barrow"],
						  ["BSL one-minute","","BSL1m","bslvmin","BSL","bsl","Stennis Space Center"],
						  ["CMO one-minute","","CMO1m","cmovmin","CMO","cmo","College"],
						  ["DED one-minute","","DED1m","dedvmin","DED","ded","Deadhorse"],
						  ["FRD one-minute","","FRD1m","frdvmin","FRD","frd","Fredericksburg"],
						 ];

var Template           = "http://magweb.cr.usgs.gov/data/magnetometer/$5/OneMinute/$6%Y%m%dvmin.min";
var ColumnLabels       = ["DATE","TIME","DOY","$5H","$5D","$5Z","$5F"];
var ColumnLongnames    = ["Date","Time","$7 H","$7 D","$7 Z","$7 F"];
var ColumnUnits        = ["Gregorian","UTC","nT","nT","nT","nT"];
var ColumnGroupings    = ["Time","Time","$5_HDZ","$5_HDZ","$5_HDZ","$5_F"];
var LineTemplate       = "%Y-%m=%d %h:%M:%s.%ss %j %.2f %.2f %.2f %.2f";
var LineRegex          = "^[0-9][0-9][0-9][0-9]";
var ColumnGroupnames   = {"Time":"Date and Time","$5_XYZ":"Flux-gate Magnetometer Data","$5_F":"Proton Magnetometer Data"};
var ColumnGrouptypes   = {"Time":"Time","$5_XYZ":"Vector","$5_F":"Scalar"};

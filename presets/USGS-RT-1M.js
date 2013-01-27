// For Autoplot
var skipLines = "25";
var column    = "field3"

var Start   = '2012-10-01';
var Stop    = '2012-10-31';
	
var CatalogDescription = {Name:"USGS Real Time 1-Minute Magnetometer Measurements", ID:"USGS/MAG/1M",Description:""};

var Template           = "http://magweb.cr.usgs.gov/data/magnetometer/$5/OneMinute/$6%Y%m%dvmin.min";

var DatasetDescription = [
						  ["1","BDT one-minute","BDT1m","bdtvmin","BDT","bdt","Boulder Test"],                           
						  ["2","BOU one-minute","BOU1m","bouvmin","BOU","bou","Boulder"],
						  ["3","BRT test one-minute","BRT1m","brtvmin","BRT","brt","Barrow Test"],
						  ["4","BRW one-minute","BRW1m","brwvmin","BRW","brw","Barrow"],
						  ["5","BSL one-minute","BSL1m","bslvmin","BSL","bsl","Stennis Space Center"],
						  ["6","CMO one-minute","CMO1m","cmovmin","CMO","cmo","College"],
						  ["7","DED one-minute","DED1m","dedvmin","DED","ded","Deadhorse"],
						  ["8","FRD one-minute","FRD1m","frdvmin","FRD","frd","Fredericksburg"],
						  ["9","FRN one-minute","FRN1m","frnvmin","FRN","frn","Fresno"],
						  ["10","GUA one-minute","GUA1m","guavmin","GUA","gua","Guam"],
						  ["11","HON one-minute","HON1m","honvmin","HON","hon","Honolulu"],
						  ["12","KGI one-minute","KGI1m","kgivmin","KGI","kgi","King Sejong Island"],
						  ["13","NEW one-minute","NEW1m","newvmin","NEW","new","Newport"],
						  ["14","SHU one-minute","SHU1m","shuvmin","SHU","shu","Shumagin"],
						  ["15","SIT one-minute","SIT1m","sitvmin","SIT","sit","Sitka"],
						  ["16","SJG one-minute","SJG1m","sjgvmin","SJG","sjg","San Juan"],
						  ["17","TUC one-minute","TUC1m","tucvmin","TUC","tuc","Tucson"],
						 ];

var ColumnLabels       = ["DATE","TIME","DOY","$5H","$5D","$5Z","$5F"];
var ColumnLongnames    = ["Date","Time","Day of Year","$7 H","$7 D","$7 Z","$7 F"];
var ColumnUnits        = ["Gregorian","UTC","Gregorian","nT","nT","nT","nT"];
var ColumnGroupings    = ["Time","Time","Time","$5_HDZ","$5_HDZ","$5_HDZ","$5_F"];
var LineTemplate       = "$Y-$m-$d $H:$M:$S %j %.2f %.2f %.2f %.2f";
var LineRegex          = "^[0-9][0-9][0-9][0-9]";
var ColumnGroupnames   = {"Time":"Date and Time","$5_XYZ":"Flux-gate Magnetometer Data","$5_F":"Proton Magnetometer Data"};
var ColumnGrouptypes   = {"Time":"Time","$5_XYZ":"Vector","$5_F":"Scalar"};

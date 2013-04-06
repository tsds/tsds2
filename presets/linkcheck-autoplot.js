// For Autoplot, for now.
PlotColumns = 7;

var CatalogName = "Link Checks for autoplot.org";
var CatalogID   = "weigel/lc/autoplot";

var Datasets 		   = [
						  ["1","http://autoplot.org/AutoplotServlet/SimpleServlet?url=http://www.sarahandjeremy.net/..."],                           
						  ["2","http://autoplot.org/cache/AutoplotServlet/SimpleServlet?url=http://www.sarahandjeremy.net/..."],
						  ["3","http://autoplot.org/"],
						  ["4","http://autoplot.org/help"],
						  ["5","http://autoplot.org/help#Installation"],
						  ["6","http://autoplot.org/cookbook"],
						  ["7","http://autoplot.org/gallery"],
						  ["8","http://autoplot.org/gallery"],
						  ["9","http://autoplot.org/developer"],
						  ["10","http://autoplot.org/jnlp.cgi"],
						  ["11","http://autoplot.org/data/"],
						  ["12","http://autoplot.org/bookmarks/"],
						  ["13","http://autoplot.org/autoplot.jnlp"],
						  ["14","http://autoplot.org/autoplot.jnlp?version=hudson"],
						  ["15","http://autoplot.org/autoplot.jnlp?version=latest"],
						  ["16","http://autoplot.org/hudson/"],
						 ];


var URLTemplate        = "http://aurora.gmu.edu/log/linkcheck/data/mag/autoplot/$1/%Y%m%d.log";

var CatalogName = "Link Checks for autoplot.org";
var CatalogID   = "weigel/lc/autoplot";

var CatalogDescription = ""; // Could be a URL or [{title:"",description:""}] or {title:"",description:""}
var CatalogDescriptionURL = "";

var StartDates       = ["2012-12-01"];
var StopDates        = ["2012-12-31"];

var Datasets         = [
						  ["1","http://autoplot.org/AutoplotServlet/SimpleServlet?url=http://www.sarahandjeremy.net/..."],                           
						  ["2","http://autoplot.org/cache/AutoplotServlet/SimpleServlet?url=http://www.sarahandjeremy.net/..."],
						  ["3","http://autoplot.org/"],
						  ["4","http://autoplot.org/help"],
						  ["5","http://autoplot.org/help#Installation"],
						  ["6","http://autoplot.org/cookbook"],
						  ["7","http://autoplot.org/gallery"],
						  ["8","http://autoplot.org/gallery"],
						  ["9","http://autoplot.org/developer"],
						  ["10","http://autoplot.org/jnlp.cgi"],
						  ["11","http://autoplot.org/data/"],
						  ["12","http://autoplot.org/bookmarks/"],
						  ["13","http://autoplot.org/autoplot.jnlp"],
						  ["14","http://autoplot.org/autoplot.jnlp?version=hudson"],
						  ["15","http://autoplot.org/autoplot.jnlp?version=latest"],
						  ["16","http://autoplot.org/hudson/"],
						 ];

var DatasetName        = "$2";
var DatasetID          = "$1";
var DatasetDescription = ""; // Could be a URL or [{title:"",description:""}] or {title:"",description:""}

var TimeColumns      = "1,2,3,4,5,6";
var TimeFormat       = "$Y $m $d $H $M $S";
var TimeUnits        = "Year, Month, Day, Hour, Minute, Second";
var TimeLabels       = "";

var ColumnLabels       = ["Year","Month","Day","Hour","Min","Sec","Response time","Response size"];
var ColumnLongnames    = ColumnLabels;
var ColumnUnits        = ["Year","Month","Day","h","m","s","ms","byte"];
var ColumnGroupings    = [];

var DataColumns      = "7,8";
var DataIDs          = "ResponseTime,ResponseSize";
var DataNames        = "Response Time,ResponseSize";
var DataLabels       = "Response Time,ResponseSize";
var DataValues       = "'',(0.1,0.2,0.3),''";
var DataTypes        = "d,d";
//var DataTypes      = "d,(f),f";
var DataUnits        = "ms,byte";
//var DataUnits        = "Gregorian,(nT),nT";
var DataRenderings   = "%d,%d";
//var DataRenderings   = "%j,(%.2f),%.2f";
var DataFillValues   = "99999,99999";

var DataGroupIDs     = ""
var DataGroupNames   = ""
var DataGroupLabels  = ""

var SkipLines        = "0";
var LineRegEx        = "^[0-9]";
var CommentCharacter = "";
var DataDelimiter    = "\\s";
var DataLineFormat   = "";

var IOSP             = "lasp.tss.iosp.ColumnarAsciiReader";

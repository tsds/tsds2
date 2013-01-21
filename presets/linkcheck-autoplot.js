// For Autoplot
var skipLines = "0";
var column = "field6"

var Start   = '2012-10-01';
var Stop    = '2012-10-02';

var Cadence = '';
	
var CatalogDescription = {Name:"Link Checks for autoplot.org", ID:"weigel/lc/autoplot",Description:""};

var Template           = "http://aurora.gmu.edu/log/linkcheck/data/mag/autoplot/$1/%Y%m%d.log";

var DatasetDescription = "1:16";
var xDatasetDescription = [
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

var ColumnLabels       = ["Year","Month","Day","Hour","Min","Sec","Response time","Response size"];
var ColumnLongnames    = ColumnLabels;
var ColumnUnits        = ["Year","Month","Day","h","m","s","ms","byte"];
var ColumnGroupings    = [];
var LineTemplate       = "$Y $m $d $H $M $S %d %d";
var LineRegex          = "^[0-9][0-9][0-9][0-9]";
var ColumnGroupnames   = {};
var ColumnGroupnames   = {};
var ColumnGrouptypes   = {};

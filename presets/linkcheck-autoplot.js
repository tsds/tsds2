id="Linkcheck-Autoplot";
Presets[id] = {};

// For Autoplot, for now.
Presets[id].PlotColumns = 7;

Presets[id].CatalogName = "Link Checks for autoplot.org";
Presets[id].CatalogID   = "weigel/lc/autoplot";

Presets[id].Datasets = [
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


Presets[id].URLTemplate = "http://mag.gmu.edu/linkcheck/mag/autoplot/$1/%Y%m%d.log";

Presets[id].CatalogName = "Link Checks for autoplot.org";
Presets[id].CatalogID   = "weigel/lc/autoplot";

Presets[id].CatalogDescription = ""; // Could be a URL or [{title:"",description:""}] or {title:"",description:""}
Presets[id].CatalogDescriptionURL = "";

Presets[id].StartDates       = ["2012-12-01"];
Presets[id].StopDates        = ["2012-12-31"];

Presets[id].Datasets         = [
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

Presets[id].DatasetName        = "$2";
Presets[id].DatasetID          = "$1";
Presets[id].DatasetDescription = ""; // Could be a URL or [{title:"",description:""}] or {title:"",description:""}

Presets[id].TimeColumns      = "1,2,3,4,5,6";
Presets[id].TimeFormat       = "$Y $m $d $H $M $S";
Presets[id].TimeUnits        = "Year, Month, Day, Hour, Minute, Second";
Presets[id].TimeLabels       = "";

Presets[id].ColumnLabels       = ["Year","Month","Day","Hour","Min","Sec","Response time","Response size"];
Presets[id].ColumnLongnames    = Presets[id].ColumnLabels;
Presets[id].ColumnUnits        = ["Year","Month","Day","h","m","s","ms","byte"];
Presets[id].ColumnGroupings    = [];

Presets[id].DataColumns      = "7,8";
Presets[id].DataIDs          = "ResponseTime,ResponseSize";
Presets[id].DataNames        = "Response Time,ResponseSize";
Presets[id].DataLabels       = "Response Time,ResponseSize";
Presets[id].DataValues       = "'',(0.1,0.2,0.3),''";
Presets[id].DataTypes        = "d,d";
//Presets[id].DataTypes      = "d,(f),f";
Presets[id].DataUnits        = "ms,byte";
//Presets[id].DataUnits        = "Gregorian,(nT),nT";
Presets[id].DataRenderings   = "%d,%d";
//Presets[id].DataRenderings   = "%j,(%.2f),%.2f";
Presets[id].DataFillValues   = "99999,99999";

Presets[id].DataGroupIDs     = ""
Presets[id].DataGroupNames   = ""
Presets[id].DataGroupLabels  = ""

Presets[id].SkipLines        = "0";
Presets[id].LineRegEx        = "^[0-9]";
Presets[id].CommentCharacter = "";
Presets[id].DataDelimiter    = "\\s";
Presets[id].DataLineFormat   = "";

Presets[id].IOSP             = "lasp.tss.iosp.ColumnarAsciiReader";

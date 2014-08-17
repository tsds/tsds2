exports.config = function config() {

	var out = {};


	// Location of back-end data DataCache program
	out["DC"] = "http://localhost:7999/sync/";

	// How long to wait for DataCache to return a response.
	out["TIMEOUT"] = 1000*60*15;

	// Location of Autoplot Servlet that creates preview plots
	out["AUTOPLOT"] = "http://autoplot.org/plot/SimpleServlet";

	// Autoplot script that create preview plot
	out["JYDS"] = "http://autoplot.org/git/jyds/tsdsfe.jyds";

	// Port
	out["PORT"] = 8004;

	// Location to access data that will appear in MATLAB/IDL/Python scripts.
	// Typical Apache setting to have server located at http://server/get
	// ProxyPass /get http://localhost:port retry=1
	// ProxyPassReverse /get http://localhost:port
	// and 	"TSDSFE": "http://tsds.org/get/",
	out["TSDSFE"] = "http://localhost:"+out["PORT"]+"/";
	
	// Location of the master catalog.  May be a URL or directory.
	// If leading /, path is treated as absolute.
	// Otherwise it is relative to directory of tsdsfe.js.
	out["CATALOG"] = out["TSDSFE"] + "catalogs/all.thredds";

	// If XMLBASE !== "", xml:base attribute in all.thredds will be replaced with XMLBASE.
	// all.thredds may be located on any server provided that relative paths are given for
	// catalogRef attribute xlink:href, which points to a TSML file for each catalogRef.
	out["XMLBASE"] = out["TSDSFE"] + "catalogs/";

	// File system location to store cached metadata.  If leading /, path is treated as absolute.
	// Otherwise it is relative to directory of tsdsfe.js.
	out ["CACHEDIR"] = "cache/";

	return out;
}


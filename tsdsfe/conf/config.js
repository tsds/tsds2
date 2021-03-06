exports.config = function config() {

	var out = {};

	out["APPNAME"] = "tsdsfe";

	// How often to check dependencies (ms)
	out["DEPSCHECKPERIOD"] = 2000;

	// How often to check dependencies (ms)
	out["SERVERCHECKPERIOD"] = 10000;

	// Port to run TSDSFE on.
	out["PORT"] = 8004;

	// Location of back-end data DataCache program
	out["DATACACHE"] = "http://localhost:7999/sync/";

	// How long to wait for DataCache to return a response in milliseconds.
	out["TIMEOUT"] = 1000*60*15;

	// Location of Autoplot Servlet that creates preview plots
	out["AUTOPLOT"] = "http://localhost:8001/AutoplotServlet/SimpleServlet";

	out["VIVIZ"] = "http://localhost:8002/";

	// Possibly public URL for redirects.
	out["VIVIZEXTERNAL"] = "http://localhost:8002/";

	out["PNGQUANT"] = "deps/bin/pngquant"

	out["CONVERT"]  = "/usr/local/bin/convert"

	// Default Apache server has this set at 100
	out["maxSockets"] = 100;

	out["TSDSFE"] = "http://localhost:" +out["PORT"];

        // Public URL from which scripts and Autoplot request data.
	// Typical Apache setting to serve data from http://server/tsdsfe:
	//
	// ProxyPass /tsds http://localhost:port retry=1
	// ProxyPassReverse /tsds http://localhost:port
	//
	// and
	//
	// out["TSDSFEXTERNAL"] = "http://server/tsds/"
    out["TSDSFEEXTERNAL"] = "http://localhost:" +out["PORT"];

	// Autoplot script that creates preview plot.  If TSDSFE["AUTOPLOT"] is not
        // a localhost server, the servelet must have the server in out["JYDS"]
        // below in its whitelist.
	out["JYDS"] = out["TSDSFE"] + "/scripts/tsdsfe.jyds";

	out["JYDSEXTERNAL"] = out["TSDSFEEXTERNAL"] + "/scripts/tsdsfe.jyds";	

	// Location of the master catalog.  May be a URL or directory.
	// If leading /, path is treated as absolute.
	// Otherwise it is relative to directory of tsdsfe.js.
	out["CATALOG"] = out["TSDSFE"] + "/catalogs/all.thredds";

	out["CATALOGLIST"] = out["TSDSFE"] + "/catalogs/all.thredds";

	// Location to find top-level catalogs and bookmark files.  May be a URL or an absolute path.
	// When ?catalog=CATALOG&return={tsds-catalog,autoplot-bookmark} is requested,
	// TSDSCC + CATALOG + "/" + CATALOG-{tsds-catalog,autoplot-bookmark}.EXT is passed through.
	// By default, EXT is xml but may be changed for tsds-catalog via outformat=json.
	out["TSDSCC"] = "http://tsds.github.io/tsds2/tsdscc/catalogs/";

	// If XMLBASE !== "", xml:base attribute in all.thredds will be replaced with XMLBASE.
	// all.thredds may be located on any server provided that relative paths are given for
	// catalogRef attribute xlink:href, which points to a TSML file for each catalogRef.
	out["XMLBASE"] = out["TSDSFEEXTERNAL"] + "/catalogs/";

	// File system location to store cached metadata.  If leading /, path is treated as absolute.
	// Otherwise it is relative to directory of tsdsfe.js.
	out["CACHEDIR"] = "cache/";

	// File system location to store logs.  If leading /, path is treated as absolute.
	// Otherwise it is relative to directory of tsdsfe.js.
	out["LOGDIR"] = "log/";

	// urltemplate.replace("mirror:http://",out["MIRROR"]) is executed before
	// DataCache is called.
	out["MIRROR"] = "http://mag.gmu.edu/mirror/";

	out["LOGHEADER"] = "x-tsdsfe-log";

	return out;
}


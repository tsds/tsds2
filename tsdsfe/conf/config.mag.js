exports.config = function config() {

	var out = {};

	// Port
	out["PORT"] = 8004;

	// Location of back-end data DataCache program
	out["DC"] = "http://localhost:7999/sync/";

	// Location of Autoplot Servlet that creates preview plots
	out["AUTOPLOT"] = "http://localhost:8001/AutoplotServlet/SimpleServlet";

	// Autoplot script that creates preview plot
	out["JYDS"] = "http://localhost:"+out["PORT"]+"/scripts/tsdsfe.jyds";

	out["VIVIZ"] = "http://tsds.org/gallery/";

	// How long to wait for DataCache to return a response.
	out["TIMEOUT"] = 1000*60*15;

	// Location to access data that will appear in MATLAB/IDL/Python scripts.
	// Typical Apache setting to serve data from http://server/tsds:
	//
	// ProxyPass /tsds http://localhost:port retry=1
	// ProxyPassReverse /tsds http://localhost:port
	//
	// and
	//
	// out["TSDSFE"] = "http://server/tsds/"
	//
	// Note that if this default setting is used, options for
	// return={png,pdf,svg,matlab,idl} will probably not work.
	// For images, the Autoplot servlet will told to request data
	// from a localhost TSDSDFE server.  and not this server.  The
	// IDL and MATLAB scripts will attempt to access data from a
	// localhost TSDSFE server.

	out["TSDSFE"] = "http://tsds.org/get/";

	// Location of the master catalog.  May be a URL or directory.
	// If leading /, path is treated as absolute.
	// Otherwise it is relative to directory of tsdsfe.js.
	out["CATALOG"] = out["TSDSFE"] + "catalogs/all.thredds";

	// Location to find top-level catalogs and bookmark files.  May be a URL or an absolute path.
	// When ?catalog=CATALOG&return={tsds-catalog,autoplot-bookmark} is requested,
	// TSDSCC + CATALOG + "/" + CATALOG-{tsds-catalog,autoplot-bookmark}.EXT is passed through.
	// By default, EXT is xml but may be changed for tsds-catalog via outformat=json.
	out["TSDSCC"] = "http://tsds.github.io/tsds2/tsdscc/catalogs/";

	// If XMLBASE !== "", xml:base attribute in all.thredds will be replaced with XMLBASE.
	// all.thredds may be located on any server provided that relative paths are given for
	// catalogRef attribute xlink:href, which points to a TSML file for each catalogRef.
	out["XMLBASE"] = out["TSDSFE"] + "catalogs/";

	// File system location to store cached metadata.  If leading /, path is treated as absolute.
	// Otherwise it is relative to directory of tsdsfe.js.
	out["CACHEDIR"] = "cache/";

	out["MIRROR"] = "http://mag.gmu.edu/mirror/"

	return out;
}


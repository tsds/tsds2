exports.config = function config() {

	var out = require(__dirname + "/config.js").config()

    out["TSDSFEEXTERNAL"] = "http://tsds.org/get/"
	out["JYDSEXTERNAL"] = out["TSDSFEEXTERNAL"] + "scripts/tsdsfe.jyds";
	out["VIVIZEXTERNAL"] = "http://tsds.org/gallery/"
	out["XMLBASE"] = out["TSDSFE"] + "/catalogs/";

	out["CONVERT"] = "/usr/bin/convert"

	return out
}


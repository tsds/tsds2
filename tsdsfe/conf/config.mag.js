exports.config = function config() {

	var out = require(__dirname + "/config.js").config()

	out["TSDSFE"] = "http://tsds.org/get/"
	out["VIVIZEXTERNAL"] = "http://tsds.org/gallery/"

	return out
}


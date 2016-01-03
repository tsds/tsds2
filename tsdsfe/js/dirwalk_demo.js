var dirwalk = require('./dirwalk.js').dirwalk

// Test dirpattern.
if (0) {
	var opts = {url: "http://mag.gmu.edu/tmp/", dirpattern: "/a/a1/", debug: false};
	dirwalk(opts, function (error, list, flat, nested) {
		if (error) console.log(error);
		console.log("list:")
		console.log(list);
		console.log("flat object:")
		console.log(flat);
		console.log("nested object:")
		console.log(nested);
		process.exit(1);
	})
}

// Test filepattern.
if (1) {
	var opts = {url: "http://mag.gmu.edu/tmp/", filepattern: "C=D", debug: false};
	dirwalk(opts, function (error, list, flat, nested) {
		if (error) console.log(error);
		console.log("list:")
		console.log(list);
		console.log("flat object:")
		console.log(flat);
		console.log("nested object:")
		console.log(nested);
		process.exit(1);
	})
}

// Test cache.
if (0) {
	var opts = {url: "http://mag.gmu.edu/tmp/", debug: false};
	dirwalk(opts, function (error, list, flat, nested) {
		dirwalk(opts, function (error, list, flat, nested) {
			opts.dirpattern = "/a/a1/";
			dirwalk(opts, function (error, list, flat, nested) {
				console.log(list)
				process.exit(1);
			})
		})
	})
}

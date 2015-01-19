var tests = [];
i = 0;

tests[i] = {};
tests[i].url = "catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-07-14&return=idl";
tests[i].test = function (data) {
	var len = data.length;console.log("File should > 500 bytes.  Found: " + len );
	if (len > 500) {return true;} else {return false}
};

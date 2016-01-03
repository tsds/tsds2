// See also https://www.npmjs.com/package/lockfile
var fs     = require("fs");
var cache  = require("./filelock.js");
var crypto = require("crypto");

var N = 10;
var Nt = 0;

var fname = "filelock_demo.txt";
var data  = "1";
var debug = false;

var datalen = data.length;
var datamd5 = md5(data);

if (1) {
	for (i = 0; i < N; i++) {
		writefile2b({fileName: fname, id: i + "w", debug: debug}, data);
		readfile2b({fileName: fname, id: i + "r", debug: debug});
	}
}

if (0) {
	for (i = 0; i < 10; i++) {
		writefile1b({fileName: fname, id: i + "w", debug: true}, data);
		readfile1b({fileName: fname, id: i + "r", debug: true});
	}
}

function checkread(err, data, id) {
	Nt = Nt + 1;
	if (typeof(id) === "undefined") {id = "";}
	if (err) {
		console.log("FAIL");
		console.log(id + " Error:");
		console.log(err);
		process.exit(1);
		//return false;
	}
	if (debug) console.log(id + " Read " + data.toString().length + " bytes. " + "MD5 " + md5(data.toString()))
	if (datalen !== data.toString().length) {
		console.log("FAIL");
		console.log(id + " Length of read file is incorrect.");
		process.exit(1);
		//return false;
	}
	if (datamd5 !== md5(data.toString())) {
		console.log("FAIL");
		console.log(id + " MD5 of read file is incorrect.");
		process.exit(1);
		//return false;
	}
	if (Nt == N) {
		console.log("PASS");
		process.exit(0);
	}
	//return true;
}

function md5(str) {
	if (!str) return "";
	return crypto.createHash("md5").update(str).digest("hex");
}

// No write unlock callback, pass fname as input.
function readfile1a(fname, data) {
	cache.readLockFile(fname, 
		function (success) {
			if (!success) return; // Do nothing if write lock failed.
			fs.readFile(fname, function (err, data) {
				checkread(err, data);
				cache.readUnlockFile(fname);
			})
	})
}

// No write unlock callback, pass object as input.
function readfile1b(o) {
	cache.readLockFile(o,
		function (success) {
			if (!success) return; // Do nothing if write lock failed.
			fs.readFile(o.fileName, function (err, data) {
				checkread(err, data, o.id);
				cache.readUnlockFile(o.fileName);
			})
	})
}

// Write unlock callback, pass fname as input.
function readfile2a(fname, data) {
	cache.readLockFile(fname, readfile2a,
		function (success) {
			if (!success) return; // Do nothing if write lock failed.
			fs.readFile(fname, function (err, data) {
				if (debug) console.log(" Read " + o.fileName);
				checkread(err, data);
				cache.readUnlockFile(fname);
			})
	})
}

// Write unlock callback, pass object as input.
function readfile2b(o) {
	cache.readLockFile(o, readfile2b,
		function (success) {
			if (!success) {
				if (debug) console.log(o.id + " " + "File lock failed.  Will retry.");
				return;
			}
			fs.readFile(o.fileName, function (err, data) {
				if (debug) console.log(o.id + " Read " + o.fileName);
				checkread(err, data, o.id);
				cache.readUnlockFile(o);
			})
	})
}

// No write unlock callback, pass fname as input.
function writefile1a(fname, data) {
	cache.writeLockFile(fname, data,
		function (success, fname, data) {
			if (!success) {
				if (debug) console.log("File lock failed.  Not writing file.");
				return;
			}
			fs.writeFile(fname, data, function (err) {
				if (debug) console.log(" Wrote " + fname);
				cache.writeUnlockFile(fname);
			})
	})
}

// No write unlock callback, pass object as input.
function writefile1b(o, data) {
	cache.writeLockFile(o, data,
		function (success, o, data) {
			if (!success) {
				if (debug) console.log(o.id + " " + "File lock failed.  Not writing file.");
				return;
			}
			fs.writeFile(o.fileName, data, function (err) {
				if (debug) console.log(o.id + " " + "Wrote " + o.fileName);
				cache.writeUnlockFile(o);
			})
	})
}

// Write unlock callback, pass fname as input.
function writefile2a(fname, data) {
	cache.writeLockFile(fname, data, writefile2a,
		function (success, fname, data) {
			if (!success) {
				if (debug) console.log("File lock failed.  Will retry.");
				return;
			}
			fs.writeFile(fname, data, function (err) {
				if (debug) console.log(" Wrote " + fname);
				cache.writeUnlockFile(fname);
		})
	})
}

// Write unlock callback, pass object as input.
function writefile2b(o, data) {
	cache.writeLockFile(o, data, writefile2b, 
		function (success, o, data) {
			if (!success) {
				if (debug) console.log(o.id + " " + "File lock failed.  Will retry.");
				return;
			}
			fs.writeFile(o.fileName, data, function (err) {
				if (debug) console.log(o.id + " Wrote " + o.fileName);
				cache.writeUnlockFile(o);
		})
	})
}
var writeCache = {};
function fileCacheInit() {
	if (writeCache.initialized) {return;}
	writeCache.fileReadLocks = {}; // # of read locks
	writeCache.fileWriteLock = {}; // true if writing
	// Queue of callbacks executed when fileWriteLock == false.
	writeCache.fileWriteQueue = {}; 
	writeCache.initialized = true;
}
exports.fileCacheInit = fileCacheInit

function parseoptions(o) {

	if (typeof(o) === "object") {
		if (typeof(o.debug) === "undefined") {
			o.debug = false;
		}
		if (typeof(o.id) === "undefined") {
			o.id = "";
		}
		o.fileName_s = o.fileName.replace(__dirname + "/", "");
	} else {
		var fileName = o;
		o = {};
		o.debug = false;
		o.fileName = fileName;
		o.id = "";
		o.fileName_s = o.fileName.replace(__dirname + "/", "");
	}
	return o;
}

function processqueue(oin) {

	var o = parseoptions(oin);

	if (writeCache.fileWriteQueue[o.fileName]) {
		var oin, data, writecb;
		//while (!writeCache.fileWriteLock[o.fileName] && writeCache.fileWriteQueue[o.fileName].datum.length > 0) {			
		if (!writeCache.fileWriteLock[o.fileName] && writeCache.fileWriteQueue[o.fileName].datum.length > 0) {
			oin = writeCache.fileWriteQueue[o.fileName].o.shift();
			data = writeCache.fileWriteQueue[o.fileName].datum.shift();
			writecb = writeCache.fileWriteQueue[o.fileName].callbacks.shift();
			if (o.debug) console.log(o.id + " Evaluating callback for " + o.fileName_s + ".");
			if (writeCache.fileWriteLock[o.fileName]) {
				throw Error(o.id + " Lock status changed. This should never happen.");
			}
			writecb(oin, data);
		}
		if (writeCache.fileWriteQueue[o.fileName].datum.length == 0) {
			delete writeCache.fileWriteQueue[o.fileName];
		}
	} else {
		if (o.debug) console.log(o.id + " No write queue found for " + o.fileName_s + ".");
	}
}

function queue(oin, data, writecb) {

	var o = parseoptions(oin);

	if (arguments.length == 2) {
		writecb = data
		data = ""
	}

	if (o.debug) console.log(o.id + " Queuing " + o.fileName_s + ".");
	if (!writeCache.fileWriteQueue[o.fileName]) {
		writeCache.fileWriteQueue[o.fileName] = {};
	}

	if (!writeCache.fileWriteQueue[o.fileName].callbacks) {
		writeCache.fileWriteQueue[o.fileName].o = [];
		writeCache.fileWriteQueue[o.fileName].callbacks = [];
		writeCache.fileWriteQueue[o.fileName].datum = [];
	}
	writeCache.fileWriteQueue[o.fileName].o.push(oin);
	writeCache.fileWriteQueue[o.fileName].callbacks.push(writecb);
	writeCache.fileWriteQueue[o.fileName].datum.push(data);
	if (o.debug) console.log(o.id + " Done queuing " + o.fileName_s + ". Queue length: " + writeCache.fileWriteQueue[o.fileName].callbacks.length);
}

function writeLockFile(oin, data, writecb, cb) {

	//console.log("Input:")
	//console.log(oin)

	var o = parseoptions(oin);

	fileCacheInit();

	if (writeCache.fileWriteLock[o.fileName] || writeCache.fileReadLocks[o.fileName] > 0) {
		if (o.debug) console.log(o.id + " Could not write lock " + o.fileName_s + ".");
		if (arguments.length == 2) {
			data(false, oin);
		}
		if (arguments.length == 3) {
			writecb(false, oin, data);
		}
		if (arguments.length == 4) {
			queue(oin, data, writecb);
			cb(false, oin, data);
		}
	} else {
		if (o.debug) console.log(o.id + " Write locking " + o.fileName_s + ".");
		writeCache.fileWriteLock[o.fileName] = true;
		if (arguments.length == 2) {
			data(true, oin);
		}
		if (arguments.length == 3) {
			writecb(true, oin, data);
		}
		if (arguments.length == 4) {
			cb(true, oin, data);
		}
	}
}
exports.writeLockFile = writeLockFile

function writeUnlockFile(oin, cb) {

	var o = parseoptions(oin);

	if (typeof(writeCache.fileReadLocks[o.fileName]) === "undefined") {
		// Error.  Must have not yet called readLock or writeLock yet.
	}

	if (o.debug) console.log(o.id + " Write unlocking " + o.fileName_s + ".");
	writeCache.fileWriteLock[o.fileName] = false;
	processqueue(oin);

	if (cb) {
		cb()
	}
}
exports.writeUnlockFile = writeUnlockFile

function readLockFile(oin, writecb, cb) {

	var o = parseoptions(oin);

	fileCacheInit();

	if (!writeCache.fileReadLocks[o.fileName]) {
		writeCache.fileReadLocks[o.fileName] = 0;
	}

	if (writeCache.fileWriteLock[o.fileName]) {	
		if (o.debug) console.log(o.id + " Could not read lock " + o.fileName_s + ".");
		if (arguments.length == 2) {
			writecb(false);
		}
		if (arguments.length == 3) {
			queue(oin, writecb);
			cb(false);
		}
	} else {
		var a = writeCache.fileReadLocks[o.fileName] 
		if (o.debug) console.log(o.id + " Incr. # of read locks from " + a + " to " + (a+1) + ".");
		writeCache.fileReadLocks[o.fileName] = writeCache.fileReadLocks[o.fileName] + 1
		if (arguments.length == 2) {
			writecb(true);
		}
		if (arguments.length == 3) {
			cb(true);
		}
	}
}
exports.readLockFile = readLockFile

function readUnlockFile(oin, cb) {

	var o = parseoptions(oin);

	if (typeof(writeCache.fileReadLocks[o.fileName]) === "undefined") {
		// Error.  Must have not yet called readLock or writeLock yet.
	}

	var a = writeCache.fileReadLocks[o.fileName];
	if (o.debug) console.log(o.id + " Decr. # of read locks from " + a + " to " + (a-1) + ".");
	writeCache.fileReadLocks[o.fileName] = writeCache.fileReadLocks[o.fileName] - 1;

	if (writeCache.fileReadLocks[o.fileName] == 0) {
		processqueue(oin);
	}

	if (cb) {
		cb();
	}
}
exports.readUnlockFile = readUnlockFile;
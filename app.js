var request = require("request"),
	xml2js = require('xml2js'),
	parser = new xml2js.Parser(),
	express = require('express'),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io"),
	sio = io.listen(server),
	crypto = require("crypto"),
	fs = require("fs"),
	hogan = require("hogan.js"),
	moment = require("moment");

// get port number from command line option
var port = process.argv[2] || 8000;

// middleware
app.use(express.bodyParser());

app.use("/deps", express.static(__dirname + "/deps"));

// set default content-type to "text"
app.use(function(req, res, next){
	res.contentType("text");
	next();
})

app.get('/', function(req, res){
	res.contentType("html");
	fs.readFile(__dirname+"/index.html", "utf8", function(err, data){
		res.send(data);
	})
})

app.post("/", function(req, res){
	res.send(req.body);
	console.log(req);
});

server.listen(port);

function parseOptions(req){
	var options = {};
	
	options.forceUpdate = req.body.forceUpdate || req.query.update==="true";
	options.acceptGzip  = req.body.acceptGzip || req.acceptGzip;
	options.type        = req.query.type || "response"; // valid values: "data", "response", "json"
	options.includeData = req.query.includeData || req.body.includeData || "false";
	options.includeMeta = req.query.includeMeta || req.body.includeMeta || "false";
	options.plugin      = req.query.plugin || req.body.plugin || false;
	options.dir         = req.query.dir || req.body.dir || "/cache/";
	if(options.dir){
		if(options.dir[0]!=='/'){
			options.dir = '/'+options.dir;
		}
		if(options.dir[options.dir.length-1]!=='/'){
			options.dir = options.dir+'/';
		}
	}
	//console.log("###", options);
	return options;
}

function parseSource(req){
    var source = req.body.source || req.query.source;

    if (!source) 
	return "";

    source = source
	.trim()
	.replace("\r", "")
	.split(/[\r\n]+/)
	.filter(function(line){
		return line.trim()!="";
	    });

	return source;
}
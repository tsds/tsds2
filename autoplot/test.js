var exec  = require('child_process').exec
var sys   = require('sys');
var fs    = require("fs");
var os    = require("os");
var Ncpus = os.cpus().length;

//console.log("Ncpus = " + os.cpus().length);

datafile = 'vap+bin:file:/Users/robertweigel/Desktop/autoplot/data/a.bin';
//datafile = 'vap+cdf:file:/Users/robertweigel/Desktop/autoplot/data/autoplot.cdf?BGSM';
//datafile = 'vap+cdf:http://localhost:9000/autoplot.cdf?BGSM';

var argv = require('yargs')
                .default({ Nservers : 10, Nrequests : 1, method: "nailgun"})
                .argv


var Nservers  = argv["Nservers"];
var Nrequests = argv["Nrequests"];
var method    = argv["method"];

if (method.match(/launch/)) {

	for (var i =0;i< Nservers;i++) {

		if (method === "launchnailgun") {

		    var ng = "deps/nailgun-0.7.1/ng ng-stop --nailgun-port 7000; sleep 1; java -Djava.awt.headless=true -Djava.library.path=." +
		                " -cp ./deps/autoplot.jar:./deps/nailgun-0.7.1/nailgun-0.7.1.jar:." +
		                " com.martiansoftware.nailgun.NGServer 7000 &";
		    com = ng.replace(/7000/g,"700"+(i % Nservers));
			console.log(com);
			var child = exec(com,
			  function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				return;
			});
		}

		if (method === "launchjetty") {
		    com0 = "cd deps; cp -r jetty-distribution-8.1.16.v20140903/ jetty-6000;"
		    //var jet = com0 + "cd jetty-8000; java -jar start.jar STOP.PORT=8000 STOP.KEY=8000 jetty.port=8000 --stop; sleep 1; java -jar start.jar STOP.PORT=8000 STOP.KEY=8000 jetty.port=8000; curl http://localhost:8000/AutoplotServlet/SimpleServlet > /dev/null &";
			var jet = com0 + "cd jetty-6000; java -jar start.jar jetty.port=6000;";
		    com = jet.replace(/6000/g,"600"+(i % Nservers));

			console.log(com);
			var child = exec(com,
			  function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				return;
			});
		}

	}

	return;
} else {
	run();
}

function run () {

    if (method === "nailgun") {
	    xcom = 'deps/nailgun-0.7.1/ng --nailgun-port 7000' + 
	            ' org.virbo.autoplot.AutoplotServer '+
	            ' -u "'+datafile+'" -f png -o /tmp/BGSM.png';
    }
	if (method == "jetty") {
	    xcom = 'curl -s "http://localhost:6000/AutoplotServlet/SimpleServlet?url='+
	            encodeURIComponent(datafile) + '" > /tmp/BGSM.png;'
    }
    
	var Nd = 0;
	to = new Date().getTime();
	for (var i =0;i< Nrequests;i++) {
		com = xcom.replace("BGSM.png","BGSM-"+i+".png");
		com = com.replace("6000","600"+(i % Nservers));
		com = com.replace("7000","700"+(i % Nservers));
		//console.log(com);
		//continue;
		child = exec(com,
		  function (error, stdout, stderr) {
		  	Nd = Nd+1;
	  		tf = new Date().getTime();
		  	if (Nd == Nrequests) {
                var Nbad = 0;
            	for (var i =0;i< Nrequests;i++) {
                    var stats = fs.statSync("/tmp/BGSM-"+i+".png");
                    var size = stats["size"];
                    if ((i > 0) && (size != sizelast)) {
                        console.error("File /tmp/BGSM-"+i+".png differs from last.");
                        Nbad = Nbad + 1;
                    }
                    sizelast = size;
                }
		  		console.log("Ncpus = " + Ncpus + " Nservers = " + Nservers +
		  		             " Nruns = " + Nrequests + " Nbad = " + Nbad +
		  		             " Method = " + method + " SizeLast = " + sizelast +
		  		             " Time = "+(tf-to)+" ms");
		  	}
		    //console.log('stdout: ' + stdout);
		    //console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		    }
		});
	}
}
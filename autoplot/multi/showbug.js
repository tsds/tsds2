var exec  = require('child_process').exec
var sys   = require('sys');
var fs    = require("fs");

//datafile = 'vap+cdf:file:/home/weigel/git/tsds2/autoplot/data/autoplot.cdf?BGSM';
//datafile = 'vap+cdf:http://localhost:9000/autoplot.cdf?BGSM';
datafile = 'vap+cdf:http://autoplot.org/data/autoplot.cdf?BGSM';
datafile = 'vap+inline:rand(300)'  // loop will add 0,1,2,3,... in each step

var Nrequests = parseInt(process.argv[2]);
var Nservers = 1;

run();

function run () {

	xcom = 'nailgun/ng --nailgun-port 7000 org.virbo.autoplot.AutoplotServer -u "'+datafile+'" -f png -o /tmp/BGSM.png';

	var Nd = 0;
	to = new Date().getTime();
	for (var i =0;i< Nrequests;i++) {
		com = xcom.replace("BGSM.png","BGSM-"+i+".png");
		if (datafile.match("inline")) {
			com = com.replace(datafile,datafile+"+"+i);
		}
		console.log("Executing "+com);
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
		  		console.log("Nservers = " + Nservers +
		  		             " Nrequests = " + Nrequests + " Nbad = " + Nbad +
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
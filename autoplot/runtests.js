var exec  = require('child_process').exec
var sys   = require('sys');
var fs    = require("fs");
var os    = require("os");

var argv      = require('yargs').default({Nrequests: 10, method: "nailgun"}).argv;
var method    = argv["method"];
var id        = argv["id"];
var Nrequests = argv["Nrequests"];

var com = [];
var k = 0;
for (var j = 1;j < Nrequests; j++ ) {
    for (var i = 1;i < 11; i++ ) {
        com[k] = "node test.js --Nservers=" + i + " --Nrequests=" + j + " --method="+method;
        k = k+1;
        com[k] = "node test.js --Nservers=" + i + " --Nrequests=" + j + " --method="+method;
        k = k+1;
    }
}

run(com);

function run(com) {
    //console.log(com[0]);
    var child = exec(com[0],
      function (error, stdout, stderr) {
        console.log(stdout.replace(/\n$/,""));
        if (stderr) console.log('stderr: ' + stderr);
        fs.appendFileSync("data/run_"+method+"_"+id+".txt",stdout);
        com.shift();
        if (com.length == 0) {
            return;  
        } else {
            run(com);
        }
    });
}
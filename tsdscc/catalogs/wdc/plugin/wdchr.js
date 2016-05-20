var fs = require('fs');

data = fs.readFileSync('ykc2012.wdc').toString();
//data = fs.readFileSync('len1977.wdc').toString();
//data = fs.readFileSync('psm1883.wdc').toString();
dataa = data.split("\n");
N = dataa.length;
var Data = {};
for (var i = 0;i < N;i++) {
	if (dataa[i] === "") {
		break;
	}
	year    = dataa[i].substring(3,5);
	month   = dataa[i].substring(5,7).replace(/ ([0-9])/,'0$1')
	element = dataa[i][7].toUpperCase();
	day     = dataa[i].substring(8,10).replace(/ ([0-9])/,'0$1'); // In case " 1" listed instead of "01"
	QorD    = dataa[i][14]; // Quiet (1) or Disturbed (2)
	yrbase  = data[15];
	if (QorD === "Q") {
		QorD = 1;
	}
	if (QorD === "D") {
		QorD = 2;
	}
	if (QorD === "") {
		QorD = "9999";
	}
	tabularbase = 100*parseInt(dataa[i].substring(16,20))
    if (yrbase === "0") {
    	yrbase = "20";
    } else if (yrbase === "8") {
    	yrbase = "18"
    } else {
    	yrbase = "19";
    }
    hrvals = dataa[i].substring(20,116);
	for (var j = 0; j < 24;j++) {
	  hr = "" + j;
	  if (j < 10) {hr = "0" + j}
	  var tmps = hrvals.substring(4*j,4*(j+1))
	  if (tmps !== "9999") {
	  	val = tabularbase + parseInt(tmps);
	  } else {
	  	val = 999999;
	  }
	  time = yrbase + year + "-" + month + "-" + day + "T" + hr + ":00:00.000"
	  line =  time + " " + val;
		if (typeof(Data[time]) === "undefined") {
			Data[time] = {};
		}
	  //console.log(line)
      Data[time][element] = val;
	}
}
line = ""
for (key in Data) {
	line += key + " "
	for (var param in Data[key]) {
		line += (Data[key][param] || 999999) + " "
	}
	line += "\n"
}
console.log(line)

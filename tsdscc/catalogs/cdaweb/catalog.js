var xml2js  = require('xml2js');
var fs      = require('fs');
var request = require("request");

if (0) {
	var parseString = require('xml2js').parseString;
	var xml = "<root><doc id='1'>Hello xml2js!</doc><doc id='2'>Hello xml2js!</doc></root>"
	parseString(xml, function (err, result) {
	    console.dir(result);
	    console.log(result.root)
	var builder = new xml2js.Builder();
	var xml = builder.buildObject(result);
	console.log(xml)
	});
return;

}

key = "AC_H0_MFI";
var Nx = 0;
var json = {};
json.DatasetDescription = [];

var N = 0;
var baseurl = "http://cdaweb.gsfc.nasa.gov/WS/cdasr/1/dataviews/sp_phys/datasets/";

var testing = false;

json2tsml();
return;

reqobj = {uri: baseurl,headers: {'Accept':'application/json'}};
request(reqobj, function (err,res,body) {
	jsonAll = JSON.parse(body);

	Nall = jsonAll.DatasetDescription.length;

	var k = 0;
	json.DatasetDescription = [];
	for (var j = 0;j < Nall;j++) {
		if (jsonAll.DatasetDescription[j].Id.match(/^AC_/)) {
			json.DatasetDescription[k] = jsonAll.DatasetDescription[j];
			k = k+1;
		}
	}
	
	console.log(json)
	getvariables.N = json.DatasetDescription.length;
	if (testing) {
		getvariables.N = 2;
	}
	getvariables.Ndone = 0;

	getvariables(0); 
});

function createtsml() {

	//console.log(json)
	var root = {};
	root.catalog = {};
	root.catalog["$"] = {};
	root.catalog["$"]["xmlns:xlink"] = "http://www.w3.org/1999/xlink";
	root.catalog["$"]["id"]          = "CDAWeb";
	root.catalog["$"]["name"]        = "CDAWeb data";

	root.catalog["documentation"] = [];
	root.catalog["documentation"][0] = {};
	root.catalog["documentation"][0]["$"] = {};
	root.catalog["documentation"][0]["$"]["xlink:href"] = "http://cdaweb.gsfc.nasa.gov/";
	root.catalog["documentation"][0]["$"]["xlink:title"] = "CDAWeb web page";
	
	root.catalog["documentation"][1] = {};
	root.catalog["documentation"][1]["$"] = {};
	root.catalog["documentation"][1]["$"]["xlink:href"] = "http://github.com/tsds/tsds2/tsdscc/catalogs/cdaweb";
	root.catalog["documentation"][1]["$"]["xlink:title"] = "Catalog generation software";

	root.catalog["documentation"][2] = {};
	root.catalog["documentation"][2]["$"] = {};
	root.catalog["documentation"][2]["$"]["xlink:href"] = "/";
	root.catalog["documentation"][2]["$"]["xlink:title"] = "Catalog generation date: "+(new Date()).toISOString();

	root.catalog["dataset"] = [];

	for (var i = 0;i < json.DatasetDescription.length;i++) {

		if (!json.DatasetDescription[i].Id.match("AC_H0_MFI")) {continue;}

		console.log(json.DatasetDescription[i]);
		root.catalog["dataset"][i] = {};
		root.catalog["dataset"][i]["$"] = {};
		root.catalog["dataset"][i]["$"]["id"] = json.DatasetDescription[i].Id;
		root.catalog["dataset"][i]["$"]["name"] = "";
		root.catalog["dataset"][i]["$"]["label"] = json.DatasetDescription[i].Label;
		root.catalog["dataset"][i]["$"]["timecolumns"] = "1,2";
		root.catalog["dataset"][i]["$"]["timeformat"] = "$d-$m-$Y $H:$M:$S";
		root.catalog["dataset"][i]["$"]["lineregex"] = "^[0-9][0-9]";

		root.catalog["dataset"][i]["documentation"] = [];
		root.catalog["dataset"][i]["documentation"][0] = {};
		root.catalog["dataset"][i]["documentation"][0]["$"] = {};
		root.catalog["dataset"][i]["documentation"][0]["$"]["xlink:href"] = json.DatasetDescription[i].Notes;
		root.catalog["dataset"][i]["documentation"][0]["$"]["xlink:title"] = "Dataset Information from CDAWeb";
		root.catalog["dataset"][i]["documentation"][0]["_"] = "Dataset Information from CDAWeb";

		root.catalog["dataset"][i]["documentation"][1] = {};
		root.catalog["dataset"][i]["documentation"][1]["$"] = {};
		root.catalog["dataset"][i]["documentation"][1]["$"]["xlink:href"] = json.DatasetDescription[i].DatasetLink[0].Url;
		root.catalog["dataset"][i]["documentation"][1]["$"]["xlink:title"] = json.DatasetDescription[i].DatasetLink[0].Title;
		root.catalog["dataset"][i]["documentation"][1]["_"] = json.DatasetDescription[i].DatasetLink[0].Text;

		root.catalog["dataset"][i]["documentation"][2] = {};
		var head = json.DatasetDescription[i].VariableDescription[0].Header.split("\n");

		var head2="\n#              ************************************\n#              *****    GLOBAL ATTRIBUTES    ******\n#              ************************************\n#\n";
		for (var h=0;h<head.length;h++) {
			if (head[h].match(/^#\s\s\s\s\s[A-Z]/)) {
				head2 = head2+head[h]+"\n";
			}
		}

		root.catalog["dataset"][i]["documentation"][2] = {};
		root.catalog["dataset"][i]["documentation"][2]["_"] = head2;

		root.catalog["dataset"][i]["timeCoverage"] = {};
		root.catalog["dataset"][i]["timeCoverage"]["Start"] = json.DatasetDescription[i].TimeInterval.Start;
		root.catalog["dataset"][i]["timeCoverage"]["End"] = json.DatasetDescription[i].TimeInterval.End;
		
		//root.catalog["dataset"][i]["timeCoverage"]["Cadence"] = parseInt(json.DatasetDescription[i].TimeInterval.Cadence);

		for (var j = 0;j < json.DatasetDescription[i].VariableDescription.length;j++) {
			//console.log(json.DatasetDescription[i].VariableDescription[j]);
			//console.log(json.DatasetDescription[i].VariableDescription[j].VariableInfo.split("\n"));

		    var metaJson = json.DatasetDescription[i].VariableDescription[j].VariableInfo.split(/\r?\n/)
				.map(function(d){
					return d.split(/\s\s+/);
				});

			for (var k=0;k<metaJson.length;k++) {
				if (metaJson[k][0].match(/^dd\-mm\-yyyy/)) {
					if (metaJson[k].length == 2) {
							console.log("Scalar");						
							json.DatasetDescription[i].VariableDescription[j].Ids = metaJson[k-2].slice(1);
							json.DatasetDescription[i].VariableDescription[j].Labels = metaJson[k-1].slice(1);
							json.DatasetDescription[i].VariableDescription[j].Units = metaJson[k].slice(1);
							json.DatasetDescription[i].VariableDescription[j].Type = "scalar";
					}
					if (metaJson[k].length == 4) {
						json.DatasetDescription[i].VariableDescription[j].Ids = metaJson[k-2].slice(1);
						json.DatasetDescription[i].VariableDescription[j].Labels = metaJson[k-1].slice(1);
						json.DatasetDescription[i].VariableDescription[j].Units = metaJson[k].slice(1);
						sameunits = true;
						units = metaJson[k][1];
						for (var m=2;m < metaJson[k].length;m++) {
							if (metaJson[k][m] != units) {
								sameunits = false;
							}
						}
						if (sameunits) {
							console.log("Vector with same units");
							json.DatasetDescription[i].VariableDescription[j].Type = "vector";
							// Vector with same units
						}
					}
				}
			}
			json.DatasetDescription[i].VariableDescription[j].Header = '';
			console.log(json.DatasetDescription[i].VariableDescription[j])
		}

        if (0) {
			root.catalog["dataset"][i]["groups"] = {};
			root.catalog["dataset"][i]["groups"]["group"] = [];
			root.catalog["dataset"][i]["groups"]["group"][i] = {};
			root.catalog["dataset"][i]["groups"]["group"][i]["$"] = {};
			root.catalog["dataset"][i]["groups"]["group"][i]["$"]["id"] = "";
			root.catalog["dataset"][i]["groups"]["group"][i]["$"]["name"] = "";
			root.catalog["dataset"][i]["groups"]["group"][i]["$"]["type"] = "vector";

		}

		root.catalog["dataset"][i]["variables"] = {};
		root.catalog["dataset"][i]["variables"]["variable"] = [];

		for (var j = 0;j < json.DatasetDescription[i].VariableDescription.length;j++) {
			//console.log(json.DatasetDescription[i].VariableDescription[j]);
			root.catalog["dataset"][i]["variables"]["variable"][j] = {};
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"] = {};
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["id"] = json.DatasetDescription[i].VariableDescription[j].Name;
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["name"] = json.DatasetDescription[i].VariableDescription[j].ShortDescription;
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["label"] = json.DatasetDescription[i].VariableDescription[j].LongDescription;
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["units"] = json.DatasetDescription[i].VariableDescription[j].Units;
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["type"] = json.DatasetDescription[i].VariableDescription[j].Type;
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["fillvalue"] = "";
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["rendering"] = "";
			if (json.DatasetDescription[i].VariableDescription[j].Type == "scalar") {
				root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["columns"] = "3";
			}
			if (json.DatasetDescription[i].VariableDescription[j].Type == "vector") {
				root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["columns"] = "3,4,5";
			}

			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["urltemplate"] = "http://cdaweb.gsfc.nasa.gov/WS/cdasr/1/dataviews/sp_phys/datasets/"
																+json.DatasetDescription[i].Id
																+"/data/$Y$m$dT000000Z,$Y$m${d;offset=1}T000000Z/"
																+json.DatasetDescription[i].VariableDescription[j].Name
																+"?format=text";

		}


	}
	// Convert JSON object to XML.
	var builder = new xml2js.Builder();
	var xml = builder.buildObject(root);
	fs.writeFileSync("CDAWeb-tsml.xml",xml);
	console.log("Wrote CDAWeb-tsml.xml");
}

function json2tsml() {
	
	var files = fs.readdirSync("./json");
	console.log(files[0]);

	var k = 0;

	for (var i = 0;i<files.length;i++) {

		var data = fs.readFileSync("./json/"+files[i]);
		jsonx = JSON.parse(data);

		if (!files[i].match("AC_H0_MFI")) {continue;}

		json.DatasetDescription[k] = jsonx;
		//console.log(json)

		k = k+1;
	}
	createtsml();
	return;
}

function savejson(json,i) {
	//console.log(json);
	if (arguments.length == 2) {
		var fname = "json/"+json.DatasetDescription[i].Id+".json";
		console.log("Writing "+fname);
		fs.writeFileSync(fname,JSON.stringify(json.DatasetDescription[i],null,"\t"));
		console.log("Done.");
	} else {
		var fname = "CDAWeb.json";
		console.log("Writing "+fname);
		fs.writeFileSync(fname,JSON.stringify(json,null,"\t"));
		console.log("Done.");
		json2tsml();	

	}
}

function getvariables(i) {

	var url = baseurl+json.DatasetDescription[i].Id+"/variables";
	reqobj = {uri: url, headers: {'Accept':'application/json'}};

	console.log(i + "/" + getvariables.N + " Requesting\n\t"+url);
	request(reqobj, function (err,res,body) {
		console.log(i + "/" + getvariables.N + " Received\n\t"+url);

		if (err) console.log(err);
		getvariables.Ndone = getvariables.Ndone+1;

		jsonv = JSON.parse(body);

		if (!getfileinfo.N) {
			getfileinfo.N = [];	
			getfileinfo.Ndone = [];	
		}
		if (!jsonv.VariableDescription) {
			console.log("Problem with "+url);
			console.log(jsonv);
			getvariables(i+1);
			return;
		}
		getfileinfo.N[i] = jsonv.VariableDescription.length;
		if (testing) {
			//getfileinfo.N[i] = 2;
		}
		getfileinfo.Ndone[i] = 0;

		json.DatasetDescription[i].VariableDescription = jsonv.VariableDescription;
		getvariableinfo(i,0);
		//for (var j=0;j<getfileinfo.N[i];j++) {
		//	setTimeout(function () {
		
		//	},j*10);
		//}
	});
}

function getvariableinfo(i,j,Nh) {

	if (arguments.length < 3) {
		Nh = 1;
	}

	//var End = new Date(new Date(json.DatasetDescription[i].TimeInterval.Start).getTime() + 24*60*60*1000).toISOString();
	//var End = new Date(new Date(json.DatasetDescription[i].TimeInterval.Start).getTime() + Nh*60*1000).toISOString();
	var End = new Date(new Date(json.DatasetDescription[i].TimeInterval.Start).getTime() + Nh*60*60*1000).toISOString()
	var url = baseurl 
				+ json.DatasetDescription[i].Id
				+"/data/"
				+json.DatasetDescription[i].TimeInterval.Start.replace(/[0-9][0-9][0-9]Z/,"Z").replace(/\:|-|\./g,"")
				+","
				+End.replace(/[0-9][0-9][0-9]Z/,"Z").replace(/\:|-|\./g,"")
				+"/"
				+encodeURIComponent(json.DatasetDescription[i].VariableDescription[j].Name)
				+"?format=text";

	reqobj = {uri: url, headers: {'Accept':'application/json'}};

	console.log("Requesting\n\t"+url);
	request(reqobj, function (err,res,body) {
		console.log("Received\n\t"+url);

		if (!body.match("Internal Server Error") && !body.match("Bad Request") && !body.match("No data available") && !body.match("Not Found")) {
			jsonf = JSON.parse(body);
			if (!jsonf.FileDescription) {
				console.log(jsonf)
				if (j < getfileinfo.N[i].length) {
					getvariableinfo(i,j+1);
				} else {
					getvariables(i+1);
				}
			} else {
				getfileinfo(i,j,jsonf.FileDescription[0].Name,Nh);				
			}
			//getvariableinfo(i,j+1);
		} else {
			console.log("Error with " + reqobj.uri);
			if (j < getfileinfo.N[i].length) {
				getvariableinfo(i,j+1);
			} else {
				getvariables(i+1);
			}
		}
	});
}

function getfileinfo(i,j,url,Nh) {
	console.log("Requesting\n\t"+url);

	request(url, function (err,res,body) {
		if (err) console.log(err)
		console.log("Received\n\t"+url);

		if (body.match("WARNING: Increase time period selected for listing.")) {
			console.log("Trying again with longer time range.");
			getvariableinfo(i,j,Math.pow(2,Nh));
			return;
		}

		lines = body.split("\n");
		var metadata = "";
		var varinfo = "";
		var dt = {};
		tlast = -1;
		for (var k = 0;k<lines.length;k++) {
			if (lines[k].match(/Warning/)) {
				console.log(lines[k]);
			}
			if (lines[k].match(/^\#/)) {
				metadata = metadata+lines[k]+"\n";
			}
			if (lines[k].match(/^dd/)) {
				varinfo = lines[k-3] + "\n" + lines[k-2] + "\n" + lines[k-1] + "\n" + lines[k] + "\n" + lines[k+1];
			}
			if (lines[k].match(/^[0-9][0-9]/)) {
				//console.log(varinfo);
				//console.log(lines[k]);
				ls = lines[k].split(/\s+/);
				ta = ls[1].split(/:|\./g);
				t = 60*60*1000*parseInt(ta[0]) + 60*1000*parseInt(ta[1]) + 1000*parseInt(ta[2]) + parseInt(ta[3]);
				if (tlast > 0) {
					dt[t-tlast] = true;
					//console.log(dt[t]);
				}
				tlast = t;
			}
		}
		if (Object.keys(dt).length == 1) {
			//console.log(Object.keys(dt))
		}
		//console.log(metadata)
		//console.log(varinfo)
		//console.log(Object.keys(dt))
		json.DatasetDescription[i].VariableDescription[j].Header = metadata;
		json.DatasetDescription[i].VariableDescription[j].VariableInfo = varinfo;
		json.DatasetDescription[i].VariableDescription[j].Cadence = Object.keys(dt).join(",");

		getfileinfo.Ndone[i] = getfileinfo.Ndone[i]+1;

		if (0) { // Too many concurrent requests.
			var done = true;
			for (var z=0;z<getfileinfo.Ndone.length;z++) {
				if (getfileinfo.Ndone[z] != getfileinfo.N[z]) {
					done = false;
				}
			}
		}

		if ( (getfileinfo.Ndone[i] == getfileinfo.N[i]) ) {
			if ((getvariables.Ndone == getvariables.N) || (i == getvariables.N-1)) {
				savejson(json,i);
				//savejson(json);
			} else {
				savejson(json,i);
				getvariables(i+1);
			}
		} else {
			getvariableinfo(i,j+1);
		}

	});
}
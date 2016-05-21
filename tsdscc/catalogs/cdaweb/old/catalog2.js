var xml2js  = require('xml2js');
var fs      = require('fs');
var request = require("request");

//var keyre = /^AC_|^OMNI_/;
var keyre = /^OMNI_/;
var keyre = /^OMNI2_H0_MRG1HR/;
var keyre = /^AC_H0_MFI/;

var Nx = 0;
var json = {};
json.DatasetDescription = [];

var N = 0;
var baseurl = "http://cdaweb.gsfc.nasa.gov/WS/cdasr/1/dataviews/sp_phys/datasets/";

var testing = false;

//json2tsml();
//return;

reqobj = {uri: baseurl,headers: {'Accept':'application/json'}};
console.log("Requesting: "+ baseurl)
// Get list of datasets
request(reqobj, function (err,res,body) {
	jsonAll = JSON.parse(body);

	Nall = jsonAll.DatasetDescription.length;

	var k = 0;
	json.DatasetDescription = [];
	// Get list of matching datasets
	for (var j = 0;j < Nall;j++) {
		if (keyre) {
			if (jsonAll.DatasetDescription[j].Id.match(keyre)) {
				json.DatasetDescription[k] = jsonAll.DatasetDescription[j];
				k = k+1;
			} 
		} else {
			json.DatasetDescription[k] = jsonAll.DatasetDescription[j];
			k = k+1;				
		}
	}
	
	getvariables.N = json.DatasetDescription.length;
	if (testing) {
		getvariables.N = 2;
	}
	getvariables.Ndone = 0;

	// Get variables in first dataset
	getvariables(0); 
});

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
		//console.log(json)

		// Get variable info for dataset i
		getvariableinfo(i,0);
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

    var Start = json.DatasetDescription[i].TimeInterval.Start
    var DatasetId = json.DatasetDescription[i].Id
    var VariableName = json.DatasetDescription[i].VariableDescription[j].Name
	var postdata = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://cdaweb.gsfc.nasa.gov/schema"><CdfRequest><TimeInterval><Star\
t>2009-08-17T00:00:00.000Z</Start><End>2009-08-17T00:00:01.000Z</End></TimeInterval><DatasetRequest><DatasetId>AC_OR_SSC</DatasetId><VariableName>XYZ_GSE</Var\
iableName></DatasetRequest><CdfVersion>3</CdfVersion><CdfFormat>CDFML</CdfFormat></CdfRequest></DataRequest>';

	if (1) {
	var postdata = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://cdaweb.gsfc.nasa.gov/schema"><CdfRequest><TimeInterval><Star\
t>'+Start+'</Start><End>'+End+'</End></TimeInterval><DatasetRequest><DatasetId>'+DatasetId+'</DatasetId><VariableName>'+VariableName+'</Var\
iableName></DatasetRequest><CdfVersion>3</CdfVersion><CdfFormat>CDFML</CdfFormat></CdfRequest></DataRequest>';
	}

	uri = 'http://cdaweb.gsfc.nasa.gov/WS/cdasr/1/dataviews/sp_phys/datasets/';
	reqobj = {uri: uri, method: "POST", body: postdata, headers: {'Content-Type':'application/xml','Accept':'application/json'}};
	console.log("Posting request for " + DatasetId + "/" + VariableName + " over " + Start + "/" + End + " to\n\t"+uri);

	//reqobj = {uri: url, headers: {'Accept':'application/json'}};

	//console.log("Requesting\n\t"+url);

	request(reqobj, function (err,res,body) {
		//console.log("Received\n\t"+url);
		console.log("Received\n\t"+uri);
		//console.log(body)
		jsonf = JSON.parse(body);
		//console.log(jsonf)
		//if (!body.match("Internal Server Error") && !body.match("Bad Request") && !body.match("No data available") && !body.match("Not Found")) {
		if (jsonf["FileDescription"]) {
			if (!jsonf.FileDescription) {
				if (j < getfileinfo.N[i].length) {
					getvariableinfo(i,j+1);
				} else {
					getvariables(i+1);
				}
			} else {
				getfileinfo2(i,j,jsonf.FileDescription[0].Name,Nh);
				//getfileinfo2(i,j,jsonf.FileDescription[0].Name,Nh);				
			}
			//getvariableinfo(i,j+1);
		} else {
			console.log("Trying again with longer time range.");
			getvariableinfo(i,j,2*Nh);
			return;
			console.log("Error with " + reqobj.uri);
			if (j < getfileinfo.N[i].length) {
				getvariableinfo(i,j+1);
			} else {
				getvariables(i+1);
			}
		}
	});
}

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

		if (keyre) {
			if (!json.DatasetDescription[i].Id.match(keyre)) {continue;}
		}

		console.log("createtsml(): Working on dataset " + json.DatasetDescription[i].Id);
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
		if (json.DatasetDescription[i].Notes) {
			root.catalog["dataset"][i]["documentation"][0]["$"]["xlink:href"] = json.DatasetDescription[i].Notes;
			root.catalog["dataset"][i]["documentation"][0]["$"]["xlink:title"] = "Dataset Information from CDAWeb";
			root.catalog["dataset"][i]["documentation"][0]["_"] = "Dataset Information from CDAWeb";
		} else {
			root.catalog["dataset"][i]["documentation"][0]["$"]["xlink:href"] = "http://cdaweb.gsfc.nasa.gov/misc/Notes.html#"+json.DatasetDescription[i].Id;
			root.catalog["dataset"][i]["documentation"][0]["$"]["xlink:title"] = "Dataset Information from CDAWeb";
			root.catalog["dataset"][i]["documentation"][0]["_"] = "Dataset Information from CDAWeb";			
		}

		if (json.DatasetDescription[i].DatasetLink) {
			root.catalog["dataset"][i]["documentation"][1] = {};
			root.catalog["dataset"][i]["documentation"][1]["$"] = {};
			root.catalog["dataset"][i]["documentation"][1]["$"]["xlink:href"] = json.DatasetDescription[i].DatasetLink[0].Url;
			root.catalog["dataset"][i]["documentation"][1]["$"]["xlink:title"] = json.DatasetDescription[i].DatasetLink[0].Title;
			root.catalog["dataset"][i]["documentation"][1]["_"] = json.DatasetDescription[i].DatasetLink[0].Text;
			dn = 2;
		} else {
			dn = 1;
		}

		root.catalog["dataset"][i]["documentation"][dn] = {};
		var head = json.DatasetDescription[i].VariableDescription[0].Header.split("\n");

		var head2="\n#              ************************************\n#              *****    GLOBAL ATTRIBUTES    ******\n#              ************************************\n#\n";
		for (var h=0;h<head.length;h++) {
			if (head[h].match(/^#\s\s\s\s\s[A-Z]/)) {
				head2 = head2+head[h]+"\n";
			}
		}

		root.catalog["dataset"][i]["documentation"][dn] = {};
		root.catalog["dataset"][i]["documentation"][dn]["_"] = head2;

		root.catalog["dataset"][i]["timeCoverage"] = {};
		root.catalog["dataset"][i]["timeCoverage"]["Start"] = json.DatasetDescription[i].TimeInterval.Start;
		root.catalog["dataset"][i]["timeCoverage"]["End"] = json.DatasetDescription[i].TimeInterval.End;
		
		//root.catalog["dataset"][i]["timeCoverage"]["Cadence"] = parseInt(json.DatasetDescription[i].TimeInterval.Cadence);

		for (var j = 0;j < json.DatasetDescription[i].VariableDescription.length;j++) {
			//console.log(json.DatasetDescription[i].VariableDescription[j]);
			//console.log(json.DatasetDescription[i].VariableDescription[j].VariableInfo.split("\n"));

		    var metaJson = json.DatasetDescription[i].VariableDescription[j].VariableInfo.split(/\r?\n/)
				.map(function(d){
					return d.split(/\s+/);
				});

			console.log("createtsml(): Header for " + json.DatasetDescription[i].VariableDescription[j].Name + ":");
			console.log(metaJson);
			for (var k=0;k<metaJson.length;k++) {
				if (metaJson[k][0].match(/^EPOCH|^UT/)) { // Note, THEMIS ground magnetometer data use UT.

					if (metaJson[k].length == 2) {
							console.log("createtsml(): " + json.DatasetDescription[i].VariableDescription[j].Name + " is a scalar");
							json.DatasetDescription[i].VariableDescription[j].Ids = metaJson[k].slice(1);
							json.DatasetDescription[i].VariableDescription[j].Labels = metaJson[k].slice(1);
							json.DatasetDescription[i].VariableDescription[j].Units = metaJson[k+1].slice(2);
							json.DatasetDescription[i].VariableDescription[j].Type = "scalar";
					}
					if (metaJson[k].length > 2) {
						if (metaJson[k+1].slice(1)[0].match(/@_/)) {
							json.DatasetDescription[i].VariableDescription[j].Ids = metaJson[k].slice(1);
							json.DatasetDescription[i].VariableDescription[j].Labels = metaJson[k+1].slice(1);
							json.DatasetDescription[i].VariableDescription[j].Units = metaJson[k+2].slice(2);
							console.log(json.DatasetDescription[i].VariableDescription[j].Labels)
							console.log("createtsml(): " + json.DatasetDescription[i].VariableDescription[j].Name + " is a vector");
							json.DatasetDescription[i].VariableDescription[j].Type = "vector";
						} else {
							json.DatasetDescription[i].VariableDescription[j].Ids = metaJson[k].slice(1);
							json.DatasetDescription[i].VariableDescription[j].Labels = metaJson[k].slice(1);
							json.DatasetDescription[i].VariableDescription[j].Units = metaJson[k+1].slice(2);
							console.log("createtsml(): " + json.DatasetDescription[i].VariableDescription[j].Name + " are scalars");
							json.DatasetDescription[i].VariableDescription[j].Type = "scalars";
						}
					}
				}
			}
			json.DatasetDescription[i].VariableDescription[j].Header = '';
			//console.log(json.DatasetDescription[i].VariableDescription[j])
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
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["fillvalue"] = "-1.00000E+31";
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["rendering"] = "";
			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["columnLabels"] = json.DatasetDescription[i].VariableDescription[j].Labels;
			if (json.DatasetDescription[i].VariableDescription[j].Type == "scalar") {
				root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["columns"] = "3";
			}
			if (json.DatasetDescription[i].VariableDescription[j].Type == "vector") {
				root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["columns"] = "3,4,5";
			}
			if (json.DatasetDescription[i].VariableDescription[j].Type == "scalars") {
				root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["columns"] = "3-"+(json.DatasetDescription[i].VariableDescription[j].Labels.length+2);
			}

			root.catalog["dataset"][i]["variables"]["variable"][j]["$"]["urltemplate"] = "http://cdaweb.gsfc.nasa.gov/WS/cdasr/1/dataviews/sp_phys/datasets/"
																+json.DatasetDescription[i].Id
																+"/data/$Y$m$dT000000Z,$Y$m${d;offset=1}T000000Z/"
																+json.DatasetDescription[i].VariableDescription[j].Name
																+"?format=text";

			console.log(root.catalog["dataset"][i]["variables"]["variable"][j])

		}


		var builder = new xml2js.Builder();
		var xml = builder.buildObject(root);

	}
	// Convert JSON object to XML.
	var builder = new xml2js.Builder();
	var xml = builder.buildObject(root);
	fs.writeFileSync("CDAWeb-tsml.xml",xml);
	console.log("createtsml(): Wrote CDAWeb-tsml.xml");
}

function json2tsml() {
	
	var files = fs.readdirSync("./json");
	console.log("json2tsml(): Reading " + files[0]);

	var k = 0;

	for (var i = 0;i<files.length;i++) {

		var data = fs.readFileSync("./json/"+files[i]);
		jsonx = JSON.parse(data);

		if (keyre) {
			if (!files[i].match(keyre)) {continue;}
		}

		json.DatasetDescription[k] = jsonx;

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

function getfileinfo2(i,j,url,Nh) {
	console.log("Requesting\n\t"+url);

	request(url, function (err,res,body) {
		if (err) console.log(err)
		console.log("Received\n\t"+url);

		if (body.match("WARNING: Increase time period selected for listing.")) {
			console.log("Trying again with longer time range.");
			getvariableinfo(i,j,Math.pow(2,Nh));
			return;
		}

		//console.log(body)
		var parser = new xml2js.Parser();
		parser.parseString(body, function (err, resjson) {
			//console.log(JSON.stringify(json["CDF"]["cdfVariables"][0]["variable"],null,4))

			//console.log(resjson["CDF"]["cdfVariables"][0]["variable"][1]["cdfVAttributes"][0]["attribute"][6]["entry"][0]["_"])
			console.log(resjson["CDF"]["cdfVariables"][0]["variable"][1]["cdfVarData"][0]["record"][0]["$"])

			var attributes = resjson["CDF"]["cdfVariables"][0]["variable"][1]["cdfVAttributes"][0]["attribute"]
			console.log(attributes)
			for (var a = 0;a < attributes.length;a++) {
				var name = attributes[a]["$"]["name"];
				var val = attributes[a]["entry"][0]["_"];
				//console.log(attributes[a]["entry"])
				console.log("name = " + name + "; value = " + val)
			}

			json.DatasetDescription[i].VariableDescription[j].Header = resjson;
			json.DatasetDescription[i].VariableDescription[j].VariableInfo = resjson;
			json.DatasetDescription[i].VariableDescription[j].Cadence = "";

			getfileinfo.Ndone[i] = getfileinfo.Ndone[i]+1;

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
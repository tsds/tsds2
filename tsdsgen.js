var console = {};
console.log = function (str) {println("tsdsgen.js: " + objToString(str));}

var imports = ["tsdsgen-default.js","deps/date.js","deps/strftime.js","config.json"];
for (i = 0;i < imports.length;i++) {
	console.log("Reading and evaluating " + imports[i]);
	// The "" + casts object to right of it to string.
	if (imports[i].match(/json$/)) {
		eval(imports[i].replace(/\.json$/,"") + "=" + new java.util.Scanner( new java.io.File(imports[i]) ).useDelimiter("\\A").next().toString());
	} else {
		eval("" + new java.util.Scanner( new java.io.File(imports[i]) ).useDelimiter("\\A").next().toString());	
	}
}

console.log(config.myopts.password)

importPackage(java.util);
a = ['Homer', 'Bart', 'Marge', 'Maggie', 'Lisa'];
var listString = Arrays.asList(a);
console.log(a);

a = [1.0,2.0,3.0];
var listDouble = Arrays.asList(a);
console.log(a);

var listObject = {
    list2 : Arrays.asList(['Moe', 'Barney', 'Ned']),
    getList2 : function() {
       return listObject.list2;
    }
 };  
console.log(listObject);

function objToString (obj) {
	if (typeof obj == "string")
		return obj;
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += '            ' + p + ': ' + obj[p] + '\n';
        }
    }
    return "\n" + str.replace(/\n$/,'');
}

function expandtemplate(tmpstr) {
	
	if (tmpstr instanceof Array) {
		// Create a copy of array
		var tmparr = tmpstr.slice(0);
		for (var i=0;i < tmparr.length; i++) {
			tmparr[i] = expandtemplate(tmparr[i]);	
			//console.log(tmparr[i]);
		}
		//console.log(tmparr);
		return tmparr;
	}

	if (tmpstr instanceof Object) {
		tmpobj = {};
		for (var attr in tmpstr) {
			tmpobj[expandtemplate(attr)] = expandtemplate(tmpstr[attr]);
		}
		//console.log(tmpobj)
		return tmpobj;
	}

	if (!tmpstr.match(/\$/)) {
		return tmpstr;
	}
	var N = tmpstr.match(/\$/g).length;
	for (var i=0;i < N; i++) {
		tmpstr = tmpstr.replace(/\$([0-9])/,"'+DatasetDescription[0][$1-1]+'");
		//console.log(tmpstr);
	}
	tmpstr = "'" + tmpstr + "'";
	tmpstr = eval(tmpstr);
	return tmpstr;
}

var TemplateExpanded = expandtemplate(Template);
console.log(TemplateExpanded);

var ColumnLongnameExpanded = expandtemplate(ColumnLongname);
console.log(ColumnLongnameExpanded);

ColumnGroupingsExpanded = expandtemplate(ColumnGroupings);
console.log(ColumnGroupingsExpanded);

ColumnGroupnamesExpanded = expandtemplate(ColumnGroupnames);
console.log(ColumnGroupnamesExpanded);

var START_ms   = new Date(Date.parse(Start));
console.log(Date.CultureInfo);
var STOP_ms    = new Date(Date.parse(Stop));
var Ndays      = 1 + Math.round((STOP_ms.valueOf()-START_ms.valueOf())/(1000*24*60*60));
var START_date = Date.parse(Start);

var i = 0;
var urls = new Array();
console.log(Ndays);

while (i < Ndays) {
	fname = START_date.strftime(TemplateExpanded);
	urls[i] = fname;
	START_date.addDays(1);
	i = i + 1;
	console.log(fname);
}
console.log(urls);
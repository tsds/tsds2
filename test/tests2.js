var tests = [];
var j     = 0;;

tests[j] = {};
tests[j].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D"

j = j+1;;
tests[j] = {};
tests[j].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P2D&stop=P1D&outformat=0"

	j = j+1;;
	tests[j] = {};
	tests[j].url = "catalog=SWPC/AK/2DayFile&dataset=AK&parameters=BoulderK&start=-P10D&stop=-P9D"
	tests[j].test = function (data) {ret = data.length == 0;eval(tests[j].log);return ret};
	tests[j].log  = 'console.log("    Should be zero: " + len);console.log("    Result: " + len)';

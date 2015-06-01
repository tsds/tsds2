var tests = [];
i = 0;

tests[i] = {};
tests[i].url = "catalog=SSCWeb;SSCWeb&dataset=ace&parameters=X_TOD&start=1998-01-01&stop=1998-01-04T01:00:00Z";

// Test of bad timerange
// http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&timerange=2005-01-01
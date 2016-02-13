function examplelist() {
	// Used to populate Examples drop-down.
	var list = 
	[
		{
			label:"IMAGE/PT1M/ABK",
		 	value:"catalog=IMAGE/PT1M&dataset=ABK&parameters=X&start=-P3D&stop=2014-09-30&return=image&format=png&type=timeseries&style=0"
		 },
		{
			label:"SSCWeb/active/X_TOD",
			value:"catalog=SSCWeb&dataset=active&parameters=X_TOD&start=-P3D&stop=1991-10-04&return=image&format=png&type=timeseries&style=0"
		},
		{
			label:"SuperMAG/AAA/B_N",
			value:"catalog=SuperMAG/PT1M&dataset=AAA&parameters=B_N&start=-PT3D&stop=2013-12-31&return=image&format=png&type=timeseries&style=0"
		},
		{
			label:"Catalog based on DD (Simple)",
			value:"uri=http://localhost:8004/test/data/2015-11-20.txt&columns=2"
		},
		{
			label:"Catalog based on DD (Weygand)",
			value:"uri=http://vmo.igpp.ucla.edu/data1/Weygand/PropagatedSolarWindGSM/weimer/Geotail/mag/$Y/geotailmagP$Y$m.dat&timeFormat&start=2007-06-01&timeFormat=$d $m $Y $H $M $S.$(millis)"
		},
		{
			label:"Catalog based on DD (Weygand Enhanced)",
			value:"uri=http://vmo.igpp.ucla.edu/data1/Weygand/PropagatedSolarWindGSM/weimer/Geotail/mag/$Y/geotailmagP$Y$m.dat&timeFormat&start=2007-06-01&timeFormat=$d $m $Y $H $M $S.$(millis)&columns=7,8,9,10,11,12&columnIDs=Bx-GSM,By-GSM,Bz-GSM,x-GSM,y-GSM,z-GSM&columnUnits=nT,nT,nT,Re,Re,Re&columnFills=1e34&catalogLabel=Weigand SW Propagation Data Set&datasetID=Weygand/PropagatedSolarWind"
		}
	]
	return list;
}

//list[6] = {label:"ISIS-2",value:"ISIS-2",url:"catalog=NSSDC/ISIS-2&dataset=CEP&parameters=L_value&start=1971-04-14&stop=1971-04-16"};
//list[7] = {label:"TSX-5",value:"TSX-5",url:"catalog=ViRBO/TSX-5/EPHX&dataset=ephx&parameters=PitchAngle&start=2000-08-15&stop=2000-08-17"};
//list[5] = {label:"ISIS-1",value:"ISIS-1",url:"catalog=NSSDC/ISIS-1&dataset=CEP&start=1969-01-30&stop=1969-02-19&parameters=Altitude"};

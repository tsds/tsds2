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
			label:"Catalog based on DD",
			value:"uri=http://vmo.igpp.ucla.edu/data1/Weygand/PropagatedSolarWindGSE/weimer/Wind/TAP/V3/$Y/windTAP$Y$m.dat&start=1995-01-01&stop=2014-09-01&timeFormat=$d $m $Y $H $M $S&columns=7,8,9,10,11&columnIDs=nxangle,nyangle,nzangle,Propagation flag&catalogLabel=Weigand SW Propagation Data Set&datasetID=spase://VMO/NumericalData/Weygand/Wind/TAP/Propagated.3DP/GSE/PT60S&fillValues=1e34"
		},
		{
			label:"Catalog based on DD",
			value:"uri=http://vmo.igpp.ucla.edu/data1/Weygand/PropagatedSolarWindGSE/weimer/Wind/TAP/V3/$Y/windTAP$Y$m.dat&start=1995-01-01&stop=2014-09-01&timeFormat=$d $m $Y $H $M $S&columns=7,8,9,10,11&columnIDs=nxangle,nyangle,nzangle,Propagation flag&catalogLabel=Weigand SW Propagation Data Set&datasetID=spase://VMO/NumericalData/Weygand/Wind/TAP/Propagated.3DP/GSE/PT60S&fillValues=1e34"
		}
	]
	return list;
}
//list[6] = {label:"ISIS-2",value:"ISIS-2",url:"catalog=NSSDC/ISIS-2&dataset=CEP&parameters=L_value&start=1971-04-14&stop=1971-04-16"};
//list[7] = {label:"TSX-5",value:"TSX-5",url:"catalog=ViRBO/TSX-5/EPHX&dataset=ephx&parameters=PitchAngle&start=2000-08-15&stop=2000-08-17"};
//list[5] = {label:"ISIS-1",value:"ISIS-1",url:"catalog=NSSDC/ISIS-1&dataset=CEP&start=1969-01-30&stop=1969-02-19&parameters=Altitude"};

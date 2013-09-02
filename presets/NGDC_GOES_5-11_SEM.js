
ids=["NGDC/GOES5/SEM/XRS","NGDC/GOES5/SEM/EPS","NGDC/GOES5/SEM/MAG","NGDC/GOES5/SEM/HEPAD"];

for (k = 5;k<12;k++) {
for (j = 0;j<ids.length;j++) {
	if (j == 3 && k < 8) break;
	id = ids[j].replace("5",k);
	Presets[id] = {};
	
	// For Autoplot, for now.
	Presets[id].PlotColumns = 7;
	
	Presets[id].CatalogName = "";
	Presets[id].CatalogID   = id;
	
	Presets[id].CatalogDescription = "GOES SEM Metadata"
	Presets[id].CatalogDescriptionURL = "http://www.ngdc.noaa.gov/goes/sem/getMetadata";
		

	if (j == 0) {
		Presets[id].Datasets         = [["xrs_1m,X-rays; two channels; one minute averages."]];
		//,["xrs_2s,X-rays; two channels; two second averages."]
		Presets[id].StartDates       = ["2011-11-01"];
		Presets[id].StopDates        = ["2011-11-05"];
		
		Presets[id].DatasetName        = "$2";
		Presets[id].DatasetID          = "$1";
		Presets[id].DatasetDescription = "Measurements from the X-Ray Sensor (XRS) instrument on GOES "+k+".";
		
		Presets[id].DatasetDescriptionURL = "http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes"+k+"/"+Presets[id].Datasets[0][0].split(",")[0]+".csv";
		Presets[id].URLTemplate      = "http://www.ngdc.noaa.gov/goes/sem/getData/goes"+k+"/"+Presets[id].Datasets[0][0].split(",")[0]+".csv?fromDate=$Y$m$d&toDate=$Y$m$d&file=true";

		Presets[id].DataColumns      = "3,4"
		Presets[id].DataNames        = "X-ray (0.05 - 0.4 nm) irradiance,X-ray (0.1 - 0.8 nm) irradiance";
		Presets[id].DataLabels       = "X-ray short wavelength channel irradiance (0.5 - 0.4 nm),X-ray long wavelength channel irradiance (0.1-0.8 nm).";
		Presets[id].DataIDs          = "xs,xl";
		
		//http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes5/xrs_1m.csv
		//xs,X-ray short wavelength channel irradiance (0.5 - 0.4 nm),X-ray (0.05 - 0.4 nm) irradiance,XS fx,XS(0.05-0.4 nm),log,W/m^2,E10.4,1.0E-10,0.001,0.0,0.0,-99999.0
		//xl,X-ray long wavelength channel irradiance (0.1-0.8 nm),X-ray (0.1 - 0.8 nm) irradiance,XL fx,XL(0.1-0.8 nm),log,W/m^2,E10.4,1.0E-10,0.001,0.0,0.0,-99999.0
		
		//http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes5/xrs_5m.csv
		//xs,X-ray short wavelength channel irradiance (0.5 - 0.4 nm),X-ray (0.05 - 0.4 nm) irradiance,XS fx,XS(0.05-0.4 nm),log,W/m^2,E10.4,1.0E-10,0.001,0.0,0.0,-99999.0
		//xl,X-ray long wavelength channel irradiance (0.1-0.8 nm),X-ray (0.1 - 0.8 nm) irradiance,XL fx,XL(0.1-0.8 nm),log,W/m^2,E10.4,1.0E-10,0.001,0.0,0.0,-99999.0
		
		Presets[id].DataValues       = "";
		Presets[id].DataTypes        = "";
		Presets[id].DataUnits        = "W/m^2,W/m^2";
		Presets[id].DataRenderings   = "";
		Presets[id].DataFillValues   = "-99999.0,-99999.0";

	}
	if (j == 1) {
		Presets[id].Datasets         = [["eps_1m, Energetic particle sensor; electrons; protons; alpha-particles; one minute averages."]];	
		//["eps_5m, Energetic particle sensor; electrons; protons; alpha-particles; one minute averages."]
		Presets[id].StartDates       = ["2011-11-01"];
		Presets[id].StopDates        = ["2011-11-05"];
		
		Presets[id].DatasetName        = "$2";
		Presets[id].DatasetID          = "$1";
		Presets[id].DatasetDescription = "Measurements from the Energetic Particle Sensor (EPS) instrument on GOES" + k+".";

		Presets[id].DatasetDescriptionURL = "http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes"+k+"/"+Presets[id].Datasets[0][0].split(",")[0]+".csv";
		Presets[id].URLTemplate      = "http://www.ngdc.noaa.gov/goes/sem/getData/goes"+k+"/"+Presets[id].Datasets[0][0].split(",")[0]+".csv?fromDate=$Y$m$d&toDate=$Y$m$d&file=true";
		Presets[id].DataColumns      = "3,4,5,6,7,8,9,10";
		Presets[id].DataNames        = "";
		
		Presets[id].DataIDs          = "e2_flux_i,p1_flux,p2_flux,p3_flux,p4_flux,p5_flux,p6_flux,p7_flux"
		Presets[id].DataNames        = "E2(>2.0 MeV)i,P1(0.6-4.2 MeV),P2(4.2-8.7 MeV),P3(8.7-14.5 MeV),P4(15-44 MeV),P5(39-82 MeV),P6(84-200 MeV),P7(110-500 MeV)";
		Presets[id].DataLabels       = "E2 Electron integral flux > 2.0 MeV unreliable during ion storms.,P1 Proton channel 0.6 - 4.2 MeV,P2 Proton channel 4.2 - 8.7 MeV,P3 Proton channel 8.7 - 14.5 MeV,P4 Proton channel 15.0 - 44.0 MeV,P5 Proton channel 39.0 - 82.0 MeV,P6 Proton channel 84.0 - 200 MeV,P7 Proton channel 110.0 - 500.0 MeV";
		Presets[id].DataUnits        = "e/(cm^2 s sr),p/(cm^2 s sr MeV),p/(cm^2 s sr MeV),p/(cm^2 s sr MeV),p/(cm^2 s sr MeV),p/(cm^2 s sr MeV),p/(cm^2 s sr MeV),p/(cm^2 s sr MeV)"
		Presets[id].DataRenderings   = "E10.4,E10.4,E10.4,E10.4,E10.4,E10.4,E10.4,E10.4";
		Presets[id].DataFillValues   = "-99999.0,-99999.0,-99999.0,-99999.0,-99999.0,-99999.0,-99999.0,-99999.0";		

		//http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes5/eps_1m.csv
		//e2_flux_i,E2 Electron integral flux > 2.0 MeV unreliable during ion storms.,Electrons > 2.0 MeV,E2 fx i,E2(>2.0 MeV)i,log,e/(cm^2 s sr),E10.4,0.01,1000000.0,0.0,0.0,-99999.0
		//p1_flux,P1 Proton channel 0.6 - 4.2 MeV,Protons 0.6 - 4.2 MeV,P1 fx,P1(0.6-4.2 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p2_flux,P2 Proton channel 4.2 - 8.7 MeV,Protons 4.2 - 8.7 MeV,P2 fx,P2(4.2-8.7 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p3_flux,P3 Proton channel 8.7 - 14.5 MeV,Protons 8.7 - 14.5 MeV,P3 fx,P3(8.7-14.5 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p4_flux,P4 Proton channel 15.0 - 44.0 MeV,Protons 15.0 - 44.0 MeV,P4 fx,P4(15-44 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p5_flux,P5 Proton channel 39.0 - 82.0 MeV ,Protons 39.0 - 82.0 MeV ,P5 fx,P5(39-82 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p6_flux,P6 Proton channel 84.0 - 200 MeV ,Protons 84.0 - 200 MeV ,P6 fx,P6(84-200 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p7_flux,P7 Proton channel 110.0 - 500.0 MeV,Protons 110.0 - 500.0 MeV,P7 fx,P7(110-500 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
				
		// TODO:
		//http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes5/eps_5m.csv
		//e2_flux_ic,E2 Electron integral flux > 2.0 MeV corrected unreliable during ion storms.,Electrons > 2.0 MeV corrected.,E2 fx ic,E2(>2.0 MeV)ic,log,e/(cm^2 s sr),E10.4,0.01,1000000.0,0.0,0.0,-99999.0
		//p1_flux,P1 Proton channel 0.6 - 4.2 MeV,Protons 0.6 - 4.2 MeV,P1 fx,P1(0.6-4.2 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p2_flux,P2 Proton channel 4.2 - 8.7 MeV,Protons 4.2 - 8.7 MeV,P2 fx,P2(4.2-8.7 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p3_flux,P3 Proton channel 8.7 - 14.5 MeV,Protons 8.7 - 14.5 MeV,P3 fx,P3(8.7-14.5 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p4_flux,P4 Proton channel 15.0 - 44.0 MeV,Protons 15.0 - 44.0 MeV,P4 fx,P4(15-44 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p5_flux,P5 Proton channel 39.0 - 82.0 MeV ,Protons 39.0 - 82.0 MeV ,P5 fx,P5(39-82 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p6_flux,P6 Proton channel 84.0 - 200 MeV ,Protons 84.0 - 200 MeV ,P6 fx,P6(84-200 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p7_flux,P7 Proton channel 110.0 - 500.0 MeV,Protons 110.0 - 500.0 MeV,P7 fx,P7(110-500 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p1_flux_c,P1 Proton channel 0.6 - 4.2 MeV corrected.,Protons 0.6 - 4.2 MeV corrected.,P1 fx c,P1(0.6-4.2 MeV)c,log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p2_flux_c,P2 Proton channel 4.2 - 8.7 MeV corrected.,Protons 4.2 - 8.7 MeV corrected.,P2 fx c,P2(4.2-8.7 MeV)c,log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p3_flux_c,P3 Proton channel 8.7 - 14.5 MeV corrected.,Protons 8.7 - 14.5 MeV corrected.,P3 fx c,P3(8.7-14.5 MeV)c,log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p4_flux_c,P4 Proton channel 15.0 - 44.0 MeV corrected.,Protons 15.0 - 44.0 MeV corrected.,P4 fx c,P4(15-44 MeV)c,log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p5_flux_c,P5 Proton channel 39.0 - 82.0 MeV corrected. ,Protons 39.0 - 82.0 MeV corrected. ,P5 fx c,P5(39-82 MeV)c,log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p6_flux_c,P6 Proton channel 84.0 - 200 MeV corrected. ,Protons 84.0 - 200 MeV corrected. ,P6 fx c,P6(84-200 MeV)c,log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p7_flux_c,P7 Proton channel 110.0 - 500.0 MeV corrected.,Protons 110.0 - 500.0 MeV corrected.,P7 fx c,P7(110-500 MeV)c,log,p/(cm^2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p1_flux_ic,P1 Proton integral > 1 MeV corrected.  ,Protons > 1 MeV corrected.  ,P1 fx ic,P1(> 1 MeV)ic,log,p/(cm^2 s sr),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p2_flux_ic,P2 Proton integral > 5 MeV corrected.  ,Protons > 5 MeV corrected.  ,P2 fx ic,P2(> 5 MeV)ic,log,p/(cm^2 s sr),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p3_flux_ic,P3 Proton ingegral > 10 MeV corrected.,Protons > 10 MeV corrected.,P3 fx ic,P3(> 10 MeV)ic,log,p/(cm^2 s sr),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p4_flux_ic,P4 Proton ingegral > 30 MeV corrected.,Protons > 30 MeV corrected.,P4 fx ic,P4(> 30 MeV)ic,log,p/(cm^2 s sr),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p5_flux_ic,P5 Proton ingegral > 50 MeV corrected.,Protons > 50 MeV corrected.,P5 fx ic,P5(> 50 MeV)ic,log,p/(cm^2 s sr),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p6_flux_ic,P6 Proton ingegral > 60 MeV corrected.,Protons > 60 MeV corrected.,P6 fx ic,P6(> 60 MeV)ic,log,p/(cm^2 s sr),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//p7_flux_ic,P7 Proton ingegral > 100 MeV corrected.,Protons > 100 MeV corrected.,P7 fx ic,P7(> 100 MeV)ic,log,p/(cm^2 s sr),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//a1_flux,A1 Alpha-particles 3.8 - 9.9 MeV.,Alpha-particles 3.8 - 9.9 MeV.,A1 fx,A1(3.8-9.9 MeV),log,a/(cm2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//a2_flux,A2 Alpha-particles 9.9 - 21.3 MeV.,Alpha-particles 9.9 - 21.3 MeV.,A2 fx,A2(9.9-21.3  MeV),log,a/(cm2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//a3_flux,A3 Alpha-particles 21.3 - 61. MeV.,Alpha-particles 21.3 - 61. MeV.,A3 fx,A3(21.3-61. MeV),log,a/(cm2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//a4_flux,A4 Alpha-particles 60.0 - 180 MeV.,Alpha-particles 60.0 - 180 MeV.,A4 fx,A4(60-180 MeV),log,a/(cm2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//a5_flux,A5 Alpha-particles 160.0 - 260 MeV.,Alpha-particles 160.0 - 260 MeV.,A5 fx,A5(160-260 MeV),log,a/(cm2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0
		//a6_flux,A6 Alpha-particles 330.0 - 500 MeV.,Alpha-particles 330.0 - 500 MeV.,A6 fx,A6(330-500 MeV),log,a/(cm2 s sr MeV),E10.4,1.0E-4,100000.0,0.0,0.0,-99999.0

		Presets[id].DataValues       = "";
		Presets[id].DataTypes        = "";
	}
	if (j == 2) {
		Presets[id].Datasets         = [["magneto_1m, Magnetic field vector; one minute averages."]];	
		//["magneto_5m, Magnetic field vector; five minute averages."]
		Presets[id].StartDates       = ["2011-11-01"];
		Presets[id].StopDates        = ["2011-11-05"];
		
		Presets[id].DatasetName        = "$2";
		Presets[id].DatasetID          = "$1";

		Presets[id].DatasetDescription = "Measurements from the magnetometer on GOES "+k+".";

		Presets[id].DatasetDescriptionURL = "http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes"+k+"/"+Presets[id].Datasets[0][0].split(",")[0]+".csv";
		Presets[id].URLTemplate      = "http://www.ngdc.noaa.gov/goes/sem/getData/goes"+k+"/"+Presets[id].Datasets[0][0].split(",")[0]+".csv?fromDate=$Y$m$d&toDate=$Y$m$d&file=true";
		Presets[id].DataColumns      = "3,4,5,6"
		Presets[id].DataNames        = "Hp flux (Northward),He flux (Earthward),Hn flux (East),Ht flux";
		Presets[id].DataLabels       = "Magnetic field component in the direction perpendicular to orbit plane positive Northward.,Magnetic field component in the Earthward direction perpendicular to HP,He flux (Earthward).,Magnetic field component in the Eastward direction perpendicular to HP and HE; GOES-5 and later.,Total magnetic field.";
		Presets[id].DataIDs          = "hp,he,hn,ht";

		//http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes5/magneto_1m.csv
		//hp,Magnetic field component in the direction perpendicular to orbit plane positive Northward. ,Hp flux (Northward),Hp fx,Hp ,lin,nT,F7.2,-200.0,200.0,-512.0,512.0,-99999.0
		//he,Magnetic field component in the Earthward direction perpendicular to HP,He flux (Earthward),He fx,He ,lin,nT,F7.2,-200.0,200.0,-512.0,512.0,-99999.0
		//hn,Magnetic field component in the Eastward direction perpendicular to HP and HE; GOES-5 and later.,Hn flux (East),Hn fx E,Hn (East),lin,nT,F7.2,-200.0,200.0,-512.0,512.0,-99999.0
		//ht,Total magnetic field.,Ht flux,Ht fx,Ht ,lin,nT,F7.2,-50.0,200.0,-512.0,512.0,-99999.0
		
		//http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes5/magneto_5m.csv
		//hp,Magnetic field component in the direction perpendicular to orbit plane positive Northward. ,Hp flux (Northward),Hp fx,Hp ,lin,nT,F7.2,-200.0,200.0,-512.0,512.0,-99999.0
		//he,Magnetic field component in the Earthward direction perpendicular to HP,He flux (Earthward),He fx,He ,lin,nT,F7.2,-200.0,200.0,-512.0,512.0,-99999.0
		//hn,Magnetic field component in the Eastward direction perpendicular to HP and HE; GOES-5 and later.,Hn flux (East),Hn fx E,Hn (East),lin,nT,F7.2,-200.0,200.0,-512.0,512.0,-99999.0
		//ht,Total magnetic field.,Ht flux,Ht fx,Ht ,lin,nT,F7.2,-50.0,200.0,-512.0,512.0,-99999.0
				
		Presets[id].DataValues       = "";
		Presets[id].DataTypes        = "";
		Presets[id].DataUnits        = "nT,nT,nT,nT";
		Presets[id].DataRenderings   = "F7.2,F7.2,F7.2,F7.2";
		Presets[id].DataFillValues   = "-99999,-99999,-99999,-99999";
	}
	// GOES 8+
	if (j == 3) {
		Presets[id].Datasets         = [["hepad_5m,High Energetic Proton; Alpaha and Electrons Detector; five minute averages."]];	
		Presets[id].StartDates       = ["2011-11-01"];
		Presets[id].StopDates        = ["2011-11-05"];
		
		Presets[id].DatasetName        = "$2";
		Presets[id].DatasetID          = "$1";
		Presets[id].DatasetDescription = "Measurements from the High Energy Proton Alpha detector (HEPAD) instrument on GOES "+k+".";

		Presets[id].DatasetDescriptionURL = "http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes"+k+"/"+Presets[id].Datasets[0][0].split(",")[0]+".csv";
		Presets[id].URLTemplate      = "http://www.ngdc.noaa.gov/goes/sem/getData/goes"+k+"/"+Presets[id].Datasets[0][0].split(",")[0]+".csv?fromDate=$Y$m$d&toDate=$Y$m$d&file=true";
		Presets[id].DataColumns      = "3,4,5,6,7,8"
		Presets[id].DataNames        = "P8(350-420 MeV),P9(420-510 MeV),P10( 510-700 MeV)i,P11(> 700 MeV),A7(2560-3400 MeV/Nucleon),A8(> 3400 MeV/Nucleon)i";
		Presets[id].DataLabels       = "P8 Proton channel 350.0 - 420.0 MeV,Protons 350.0 - 420.0 MeV,P9 Proton channel 420.0 - 510.0 MeV,Protons 420.0 - 510.0 MeV,P10 Proton channel 510.0 - 700.0 MeV,Protons 510.0 - 700.0 MeV,P11 Proton integral > 700.0 MeV,Protons > 700.0 MeV,Alpha-Particles  2560 - 3400 MeV/Nucleon,A8 Alpha-Particles  > 3400 MeV/Nucleon";
		Presets[id].DataIDs          = "p8_flux,p9_flux,p10_flux,p11_flux_i,a7_flux,a8_flux_i,A7(2560-3400 MeV/Nucleon),A8(> 3400 MeV/Nucleon)i";
			
		//http://www.ngdc.noaa.gov/goes/sem/getMetadata/goes8/hepad_5m.csv
		//p8_flux,P8 Proton channel 350.0 - 420.0 MeV,Protons 350.0 - 420.0 MeV,P8 fx,P8(350-420 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-6,1000.0,0.0,0.0,-99999.0
		//p9_flux,P9 Proton channel 420.0 - 510.0 MeV,Protons 420.0 - 510.0 MeV,P9 fx,P9(420-510 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-6,1000.0,0.0,0.0,-99999.0
		//p10_flux,P10 Proton channel 510.0 - 700.0 MeV,Protons 510.0 - 700.0 MeV,P10 fx,P10( 510-700 MeV),log,p/(cm^2 s sr MeV),E10.4,1.0E-6,1000.0,0.0,0.0,-99999.0
		//p11_flux_i,P11 Proton integral > 700.0 MeV,Protons > 700.0 MeV,P11 fx i,P11(> 700 MeV)i,log,p/(cm^2 s sr),E10.4,1.0E-6,1000.0,0.0,0.0,-99999.0
		//a7_flux,A7 Alpha-Particles  2560 - 3400 MeV/Nucleon ? ,Alpha-Particles  2560 - 3400 MeV/Nucleon ,A7 fx,A7(2560-3400 MeV/Nucleon),log,a/(cm^2 s sr MeV,E10.4,1.0E-6,1000.0,0.0,0.0,-99999.0
		//a8_flux_i,A8 Alpha-Particles  > 3400 MeV/Nucleon ?,Alpha-Particles  > 3400 MeV/Nucleon ,A8 fx i,A8(> 3400 MeV/Nucleon)i,log,a/(cm2 s sr),E10.4,1.0E-6,1000.0,0.0,0.0,-99999.0

		Presets[id].DataValues       = "";
		Presets[id].DataTypes        = "";
		Presets[id].DataUnits        = "p/(cm^2 s sr MeV,p/(cm^2 s sr MeV,p/(cm^2 s sr MeV,p/(cm^2 s sr MeV,p/(cm^2 s sr MeV,a/(cm2 s sr)";
		Presets[id].DataRenderings   = "E10.4,E10.4,E10.4,E10.4,E10.4,E10.4";
		Presets[id].DataFillValues   = "-99999,-99999,-99999,-99999,-99999,-99999";
	}
							 
	
	Presets[id].TimeColumns      = "1,2";
	Presets[id].TimeFormat       = "$Y-$m-$d,$H:$M:$S.$(millis)";
	Presets[id].TimeUnits        = "Gregorian,Universal Time";
	Presets[id].TimeLabels       = "";
	
	Presets[id].DataGroupIDs     = ""
	Presets[id].DataGroupNames   = ""
	Presets[id].DataGroupLabels  = ""
	
	Presets[id].SkipLines        = "0";
	Presets[id].LineRegex        = "^[0-9]";
	Presets[id].CommentCharacter = "";
	Presets[id].DataDelimiter    = ",";
	Presets[id].DataLineFormat   = "";
	
	Presets[id].DataReader       = "lasp.tss.iosp.ColumnarAsciiReader";
}
}
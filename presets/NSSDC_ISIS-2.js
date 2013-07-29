id="NSSDC/ISIS-2";
Presets[id] = {};

// For Autoplot, for now.
Presets[id].PlotColumns = 7;

Presets[id].CatalogName = "";
Presets[id].CatalogID   = id;

Presets[id].Datasets = ["ISIS-2, Data from the Cylindrical Electrostatic Probe (CEP) experiment on the ISIS-2 satellite."];

				 
Presets[id].URLTemplate = "ftp://spdf.gsfc.nasa.gov/pub/data/isis/plasma_cep/isis2/$Y_$m_isis2_cep.asc";
Presets[id].CatalogDescription = ""
Presets[id].CatalogDescriptionURL = "";

Presets[id].StartDates       = ["1971-04-14"];
Presets[id].StopDates        = ["1973-03-03"];

Presets[id].DatasetName        = "$2";
Presets[id].DatasetID          = "$1";
Presets[id].DatasetDescription = "ftp://spdf.gsfc.nasa.gov/pub/data/isis/plasma_cep/isis2/00README.TXT";

Presets[id].TimeColumns      = "1,2,3,4,5";
Presets[id].TimeFormat       = "%Y %j %H %M %s";
Presets[id].TimeUnits        = "";
Presets[id].TimeLabels       = "Year, day of year, hour, minute, second";
     

Presets[id].ColumnLabels       = ""; 
Presets[id].ColumnLongnames    = Presets[id].ColumnLabels;
Presets[id].ColumnUnits        = [",deg,deg,deg,deg,km,deg,deg,nT,,,,,,,,,K,cm-3,mV"];
Presets[id].ColumnUnits        = [",hr,hr,deg,deg,deg,deg,,,km,deg,deg,deg,,,,,,K,cm-3,mV,,"] 
Presets[id].ColumnGroupings    = [];

Presets[id].DataColumns      = "5-29"
Presets[id].DataLabels       = ["Magnetic local time, Geodetic Latitude, Geodedic Longitude, Geomag. Latitude, Geomag. Longitude, Invariant latitude, L value, Altitude, Magnetic inclination, Dip latitude, Solar zenith angle, velocity angle, Magnetic field angle, Sun angle, Ap indices, Kp indices, Daily F10.7, Sunspot number, Electron temperature, Electron density, confidence value (Te), Satellite potential, Probe (0-bottom, 1-top), Orbit number"];
Presets[id].DataNames        = Presets[id].DataLabels;
Presets[id].DataIDs          = Presets[id].DataLabels.replace("(|)","").replace(" ","");

Presets[id].DataValues       = "";
Presets[id].DataTypes        = "";
Presets[id].DataUnits        = "";
Presets[id].DataRenderings   = "";
Presets[id].DataFillValues   = ["99.9, 999, 999, 999, 999, 9999, 999, 999.9, 99, 99.99, 9, 999, 999, 99, 999, 999, 99999, 9999, 1.0e+35, 9999"];

Presets[id].DataGroupIDs     = ""
Presets[id].DataGroupNames   = ""
Presets[id].DataGroupLabels  = ""

Presets[id].SkipLines        = "0";
Presets[id].LineRegEx        = "^\s[0-9]";
Presets[id].CommentCharacter = "";
Presets[id].DataDelimiter    = "\\s";
Presets[id].DataLineFormat   = "";

Presets[id].IOSP             = "lasp.tss.iosp.ColumnarAsciiReader";

id="NSSDC/ISIS-1";
Presets[id] = {};

// For Autoplot, for now.
Presets[id].PlotColumns = 7;

Presets[id].CatalogName = "";
Presets[id].CatalogID   = id;

Presets[id].Datasets = ["ISIS-1, 0.5-sec. resolution magnetic field vectors from NASA's MAGSAT spacecraft (300-600 km altitude, 90 deg inclination)"];
						 
Presets[id].URLTemplate           = "ftp://spdf.gsfc.nasa.gov/pub/data/isis/plasma_cep/isis1/isis1_ne_te.asc";
Presets[id].CatalogDescription    = "Catalog derived by inspection of FTP directory."
Presets[id].CatalogDescriptionURL = "ftp://spdf.gsfc.nasa.gov/pub/data/isis/plasma_cep/isis1/";

Presets[id].StartDates       = ["1969-01-30"];
Presets[id].StopDates        = ["1971-06-01"];

Presets[id].DatasetName        = "$2";
Presets[id].DatasetID          = "$1";
Presets[id].DatasetDescription = "ftp://spdf.gsfc.nasa.gov/pub/data/isis/plasma_cep/isis1/00readme.txt";

Presets[id].TimeColumns      = "1,2,3,4,5";
Presets[id].TimeFormat       = "%Y %j %H %M %S";
Presets[id].TimeUnits        = "";
Presets[id].TimeLabels       = "";

Presets[id].ColumnLabels       = ""; 
Presets[id].ColumnLongnames    = Presets[id].ColumnLabels;
Presets[id].ColumnUnits        = [",deg,deg,deg,deg,km,deg,deg,nT,,,,,,,,,K,cm-3,mV"];
Presets[id].ColumnGroupings    = [];

Presets[id].DataColumns      = "6-25"
Presets[id].DataLabels       = ["Local time","Geodetic Latitude","Geodedic Longitude","Geomag. Latitude","Geomag. Longitude","Altitude","Dip Latitude","Magnetic inclination","Magnetic field strength B","L- Invariant Latitude","Quality code for L","Solar zenith angle","ap indices","kp indices","Daily F10.7","Sunspot number","Orbit number","Electron temperature","Electron density","Satellite potential"];

Presets[id].DataNames        = Presets[id].DataLabels;
Presets[id].DataIDs          = Presets[id].DataLabels;

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

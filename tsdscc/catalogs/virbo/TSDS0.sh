wget -O ../../tsds/catalogs/TSDS0.raw "http://virbo.org/meta/outersearch?sourceUrl=http://virbo.org/meta/&searchAction=outersearch&section=NumericalData&strictSearch=true&keyNumericalDataResourceID=spase://VIRBO/NumericalData/WDC_geomag_minute-.*-v0&output=keyNumericalDataResourceID&output=keyResourceName&output=keyResourceHeaderDescription&output=keyStartDate&output=keyStopDate&xslt=http://virbo.org/meta/viewDataFile.jsp%3Fdocname=7A0B07A4-AEFB-2A0E-68B7-D5D70D732815&filetype=data"

wget -O TSDS0.xml "http://virbo.org/exist/servlet/db/virbo/xq/xsltransform.xql?xslt=http://virbo.org/meta/viewDataFile.jsp%3Fdocname=7A0B07A4-AEFB-2A0E-68B7-D5D70D732815%26filetype=data&output=autoplot"
gzip -c TSDS0.xml > TSDS0.xml.gz

wget -O ../../tsds/catalogs/TSDS0.thredds "http://virbo.org/exist/servlet/db/virbo/xq/xsltransform.xql?xslt=http://virbo.org/meta/viewDataFile.jsp%3Fdocname=7A0B07A4-AEFB-2A0E-68B7-D5D70D732815%26filetype=data&output=thredds"

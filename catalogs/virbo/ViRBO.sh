
wget -O ViRBO.xml "http://virbo.org/exist/servlet/db/virbo/xq/xsltransform.xql?xslt=http://virbo.org/meta/viewDataFile.jsp%3Fdocname=C4D8877C-2B31-F543-BDE6-D6CA9066F204%26filetype=data&xml=http://virbo.org/meta/viewDataFile.jsp%3Fdocname=C3C7B30F-CEE6-1EE5-849A-1AB6E3EA6E77%26filetype=data"
gzip -c ViRBO.xml > ViRBO.xml.gz

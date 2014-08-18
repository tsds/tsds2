CAT=SSCWeb
XSLT=F2C6DDE1-5948-B63B-9581-E24C096A3254
CATAP=SSCWeb-autoplot

DATE=`date` 
DATE2=`date "+%Y%m%d"`
RAW=$(CAT)-$(DATE2).raw
#URL=http://tsds.org/catalogs/raw/$(RAW)
URL=http://mag.gmu.edu/tsds/catalogs/raw/$(RAW)
#DIR_AUTOPLOT=/var/www/autoplot/bookmarks
#DIR_TSDS=/var/www/tsds/catalogs
DIR_AUTOPLOT=/Users/robertweigel/Desktop/autoplot/bookmarks
DIR_TSDS=/Users/robertweigel/Desktop/catalogs

XML2THREDDS=http://virbo.org/exist/servlet/db/virbo/xq/xsltransform.xql?xslt=http://virbo.org/meta/viewDataFile.jsp%3Fdocname=$(XSLT)%26filetype=data

autoplot: $(CATAP).xml

catalog: $(CAT).xml

#all: clean autoplot thredds clean
all: clean autoplot catalog clean

src/txtcatalog.class: src/txtcatalog.java 
	cd src; javac -cp ../jar/jaxws-rt-2.0EA3.jar:../jar/sscWS-client.jar txtcatalog.java

src/xmlcatalog.class: src/xmlcatalog.java
	cd src; javac xmlcatalog.java

$(CAT).raw: src/txtcatalog.class
	java -cp jar/jaxws-rt-2.0EA3.jar:jar/sscWS-client.jar:src txtcatalog > $(CAT).raw

$(CAT).json: $(CAT).raw
	perl -ne 'print if /^Satellites/ .. /^Time to execute getAllSatellites/' $(CAT).raw | grep "^\s" | sed "s/\s\-\s/\-/" | sed "s/\s\s*/,/g" | tr "\n" " " | sed 's/^/var sscwebdata = "/' | sed 's/$/"/' > SSCWeb.json

$(CAT).xml: $(CAT).raw src/xmlcatalog.class
	java -cp src xmlcatalog $(CAT).raw > $(CAT).xml
	mkdir -p $(DIR_TSDS)/raw
	cp $(CAT).raw $(DIR_TSDS)/raw/$(CAT)-$(DATE2).raw
	mkdir -p $(DIR_TSDS)/archive
	cp $(CAT).xml $(DIR_TSDS)/archive/$(CAT)-$(DATE2).xml; ln -f $(DIR_TSDS)/archive/$(CAT)-$(DATE2).xml $(DIR_TSDS)/$(CAT).xml

$(CATAP).xml: $(CAT).raw
	mkdir -p $(DIR_TSDS)/raw
	cp $(CAT).raw $(DIR_TSDS)/raw/$(RAW)
	wget -O $(CATAP).xml "$(XML2THREDDS)&output=autoplot"
	gzip -c $(CATAP).xml > $(CATAP).xml.gz
	mkdir -p $(DIR_AUTOPLOT)/archive
	cp $(CATAP).xml $(DIR_AUTOPLOT)/archive/$(CATAP)-$(DATE2).xml; ln -f $(DIR_AUTOPLOT)/archive/$(CATAP)-$(DATE2).xml $(DIR_AUTOPLOT)/$(CATAP).xml
	cp $(CATAP).xml.gz $(DIR_AUTOPLOT)/archive/$(CATAP)-$(DATE2).xml.gz; ln -f $(DIR_AUTOPLOT)/archive/$(CATAP)-$(DATE2).xml.gz $(DIR_AUTOPLOT)/$(CATAP).xml.gz


#$(CAT).thredds: $(CAT).raw
#	mkdir -p $(DIR_TSDS)/raw
#	cp $(CAT).raw $(DIR_TSDS)/raw/$(RAW)
#	wget -O $(CAT).thredds "$(XML2THREDDS)&output=thredds&date=$(DATE)"
#	mkdir -p $(DIR_TSDS)/archive
#	cp $(CAT).thredds $(DIR_TSDS)/archive/$(CAT)-$(DATE2).thredds; ln -f $(DIR_TSDS)/archive/$(CAT)-$(DATE2).thredds $(DIR_TSDS)/$(CAT).thredds

clean:
	- rm -f *.raw
	- rm -f src/*.class
	- rm -f $(CAT)*.xml*
CAT=SSCWeb
XSLT=F2C6DDE1-5948-B63B-9581-E24C096A3254

DATE=`date` 
DATE2=`date "+%Y%m%d"`
RAW=$(CAT)-$(DATE2).raw
#URL=http://tsds.org/catalogs/raw/$(RAW)
URL=http://mag.gmu.edu/tsds/catalogs/raw/$(RAW)
DIR_AUTOPLOT=/var/www/autoplot/bookmarks
DIR_TSDS=/var/www/tsds/catalogs
XML2THREDDS=http://virbo.org/exist/servlet/db/virbo/xq/xsltransform.xql?xslt=http://virbo.org/meta/viewDataFile.jsp%3Fdocname=$(XSLT)%26filetype=data

autoplot: $(CAT).xml

thredds: $(CAT).thredds

all: clean autoplot thredds clean

src/txtcatalog.class: src/txtcatalog.java 
	cd src; javac -cp ../jar/jaxws-rt-2.0EA3.jar:../jar/sscWS-client.jar txtcatalog.java

src/xmlcatalog.class: src/xmlcatalog.java
	cd src; javac xmlcatalog.java

txtcatalog.txt: src/txtcatalog.class
	java -cp jar/jaxws-rt-2.0EA3.jar:jar/sscWS-client.jar:src txtcatalog > txtcatalog.txt

$(CAT).raw: txtcatalog.txt src/xmlcatalog.class
	java -cp src xmlcatalog txtcatalog.txt > $(CAT).raw

$(CAT).xml: $(CAT).raw
	mkdir -p $(DIR_TSDS)/raw
	cp $(CAT).raw $(DIR_TSDS)/raw/$(RAW)
	wget -O $(CAT).xml "$(XML2THREDDS)&output=autoplot"
	gzip -c $(CAT).xml > $(CAT).xml.gz
	mkdir -p $(DIR_AUTOPLOT)/archive
	cp $(CAT).xml $(DIR_AUTOPLOT)/archive/$(CAT)-$(DATE2).xml; ln -f $(DIR_AUTOPLOT)/archive/$(CAT)-$(DATE2).xml $(DIR_AUTOPLOT)/$(CAT).xml
	cp $(CAT).xml.gz $(DIR_AUTOPLOT)/archive/$(CAT)-$(DATE2).xml.gz; ln -f $(DIR_AUTOPLOT)/archive/$(CAT)-$(DATE2).xml.gz $(DIR_AUTOPLOT)/$(CAT).xml.gz


$(CAT).thredds: $(CAT).raw
	mkdir -p $(DIR_TSDS)/raw
	cp $(CAT).raw $(DIR_TSDS)/raw/$(RAW)
	wget -O $(CAT).thredds "$(XML2THREDDS)&output=thredds&date=$(DATE)"
	mkdir -p $(DIR_TSDS)/archive
	cp $(CAT).thredds $(DIR_TSDS)/archive/$(CAT)-$(DATE2).thredds; ln -f $(DIR_TSDS)/archive/$(CAT)-$(DATE2).thredds $(DIR_TSDS)/$(CAT).thredds

clean:
	- rm -f *.raw
	- rm -f src/*.class
	- rm -f *.txt
	- rm -f *.xml*
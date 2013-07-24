CAT=SuperMAG
DATE=`date` 
DATE2=`date "+%Y%m%d"`
RAW=SuperMAG-$(DATE2).raw
#URL=http://tsds.org/catalogs/raw/$(RAW)
URL=http://mag.gmu.edu/tsds/catalogs/raw/$(RAW)
DIR_AUTOPLOT=/var/www/autoplot/bookmarks
DIR_TSDS=/var/www/tsds/catalogs
XML2THREDDS=http://virbo.org/exist/servlet/db/virbo/xq/xsltransform.xql?xslt=http://virbo.org/meta/viewDataFile.jsp%3Fdocname=$(XSLT)%26filetype=data

# NOTE: It appears that an XML catalog is available, obviating the need for the two java programs
# that generate the catalog and time ranges.  Everything could be done with XSLT.
# Sample catalog:
# http://supermag.jhuapl.edu/archive/cat/2008/20080201.xml

autoplot: $(CAT).xml

thredds: $(CAT).thredds

all: clean thredds autoplot clean

timeranges: $(CAT)TimeRanges.txt

src/$(CAT)TimeRanges.class: src/$(CAT)TimeRanges.java 
	cd src; javac $(CAT)TimeRanges.java 

src/$(CAT).class: src/$(CAT).java
	cd src; javac $(CAT).java

$(CAT).raw:
	wget -O $(CAT).raw "http://supermag.jhuapl.edu/info/station_location_ascii_file.txt"
	# Also http://supermag.uib.no/info/station_location_ascii_file.txt

$(CAT)TimeRanges.txt: src/$(CAT)TimeRanges.class $(CAT).raw
	java -cp src $(CAT)TimeRanges $(CAT).raw > $(CAT)TimeRanges.txt

$(CAT).autoplot: src/$(CAT).class $(CAT)TimeRanges.txt
	mkdir -p $(DIR_TSDS)/raw
	cp $(CAT).raw $(DIR_TSDS)/raw/$(RAW)
	wget -O $(CAT).xml "$(XML2THREDDS)&output=autoplot"
	gzip -c $(CAT).xml > $(CAT).xml.gz
	mkdir -p $(DIR_AUTOPLOT)/archive
	cp $(CAT).xml $(DIR_AUTOPLOT)/archive/$(CAT)-$(DATE2).xml; ln -f $(DIR_AUTOPLOT)/archive/$(CAT)-$(DATE2).xml $(DIR_AUTOPLOT)/$(CAT).xml
	cp $(CAT).xml.gz $(DIR_AUTOPLOT)/archive/$(CAT)-$(DATE2).xml.gz; ln -f $(DIR_AUTOPLOT)/archive/$(CAT)-$(DATE2).xml.gz $(DIR_AUTOPLOT)/$(CAT).xml.gz

$(CAT).thredds: src/$(CAT).class $(CAT)TimeRanges.txt
	mkdir -p $(DIR_TSDS)/raw
	cp $(CAT).raw $(DIR_TSDS)/raw/$(RAW)
	java -cp src $(CAT) $(CAT).raw $(CAT)TimeRanges.txt thredds > $(CAT).thredds 2> $(CAT).txt
	mkdir -p $(DIR_TSDS)/archive
	cp $(CAT).thredds $(DIR_TSDS)/archive/$(CAT)-$(DATE2).thredds; ln -f $(DIR_TSDS)/archive/$(CAT)-$(DATE2).thredds $(DIR_TSDS)/$(CAT).thredds
	cp $(CAT).txt $(DIR_TSDS)/archive/$(CAT)-$(DATE2).txt; ln -f $(DIR_TSDS)/archive/$(CAT)-$(DATE2).txt $(DIR_TSDS)/$(CAT).txt

clean:
	- rm -f *.raw
	- rm -f src/*.class
	- rm -f *.xml*
	- rm -f *.thredds

#- rm -f *.txt
	
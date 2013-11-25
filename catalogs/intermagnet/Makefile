CADENCE=PT1S
CAT=INTERMAGNET_$(CADENCE)
DATE=`date` 
DATE2=`date "+%Y%m%d"`
RAW=$(CAT)-$(DATE2).raw
#URL=http://tsds.org/catalogs/raw/$(RAW)
URL=http://mag.gmu.edu/tsds/catalogs/raw/$(RAW)
DIR_AUTOPLOT=/var/www/autoplot/bookmarks
DIR_TSDS=/var/www/tsds/catalogs

all:
	make update CADENCE=PT1M 
	make update CADENCE=PT1S

# Makes one request for each data and each station.  If
# not found, writes ".x" file.
update: $(CAT).json
	node update.js $(CADENCE)

mirror: $(CAT).json
	node mirror.js $(CADENCE)
	cd data; find . -name "min.min" | xargs gzip --fast {}
	cd data; find . -name "sec.sec" | xargs gzip --fast {}
	node metadata.js $(CADENCE) > INTERMAGNET_$(CADENCE).json
	
#TODO.  Create thredds.
$(CAT).json:
	node catalog.js $(CADENCE)

$(CAT).thredds:
	node app.js "thredds" > $(CAT).thredds
	mkdir -p $(DIR_TSDS)/raw
	cp $(CAT).json $(DIR_TSDS)/raw/$(RAW)
	cp $(CAT).txt $(DIR_TSDS)/raw/$(RAW)
	mkdir -p $(DIR_TSDS)/archive
	cp $(CAT).thredds $(DIR_TSDS)/archive/$(CAT)-$(DATE2).thredds; ln -f $(DIR_TSDS)/archive/$(CAT)-$(DATE2).thredds $(DIR_TSDS)/$(CAT).thredds
	cp $(CAT).json $(DIR_TSDS)/archive/$(CAT)-$(DATE2).json; ln -f $(DIR_TSDS)/archive/$(CAT)-$(DATE2).json $(DIR_TSDS)/$(CAT).json
	cp $(CAT).txt $(DIR_TSDS)/archive/$(CAT)-$(DATE2).txt; ln -f $(DIR_TSDS)/archive/$(CAT)-$(DATE2).txt $(DIR_TSDS)/$(CAT).txt

clean:
	- rm -f *.json
	- rm -f *.xml*
	- rm -f *.thredds
	
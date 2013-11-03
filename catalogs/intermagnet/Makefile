CAT=INTERMAGNET
DATE=`date` 
DATE2=`date "+%Y%m%d"`
RAW=$(CAT)-$(DATE2).raw
#URL=http://tsds.org/catalogs/raw/$(RAW)
URL=http://mag.gmu.edu/tsds/catalogs/raw/$(RAW)
DIR_AUTOPLOT=/var/www/autoplot/bookmarks
DIR_TSDS=/var/www/tsds/catalogs

all: $(CAT).thredds update

update:
	node update.js 0 PT1M
	node update.js 0 PT1S

mirror:
	node mirror.js 0 PT1M
	node mirror.js 0 PT1S
	
#TODO.  Also create thredds.
$(CAT).json:
	node app.js "json" > $(CAT).json

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
	
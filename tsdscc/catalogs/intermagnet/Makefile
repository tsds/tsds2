CADENCE=PT1S
CAT=catalog_$(CADENCE).txt

# This catalog must be mirrored because API creates a temporary file that
# is based on the timestamp (down to the second) of the request.  If two requests
# are made in the same second, the first temporary file is over-written on their server.
# Note: FTP access is available, obviating scraping (mirror.js):
# http://intermagnet.org/data-donnee/data-eng.php#conditions
# Request for FTP access sent on 9/27/2014.

# This does variation data only. Options:
# variation vmin.min
# provisional pmin.min
# quasi-definitive qmin.min
# definitive dmin.min

# See also
# http://catalog.data.gov/dataset/intermagnet-definitive-observatory-data/resource/b2bf98db-e05d-499f-9e2d-0b3ef1a05d73
# ftp://ftp.ngdc.noaa.gov/wdc/geomagnetism/
# ftp://ftp.ngdc.noaa.gov/wdc/geomagnetism/data/observatories/definitive/

catalogs:
	make catalog CADENCE=PT1M 
	make catalog CADENCE=PT1S

catalog:
	make $(CAT) CADENCE=$(CADENCE)

$(CAT): catalog.js
	node catalog.js $(CADENCE) 2>&1 | tee catalog_$(CADENCE).log

#

mirrors:
	make mirror CADENCE=PT1M 
	make mirror CADENCE=PT1S

# TODO: After mirror, use API to find list of files that are missing.
# http://intermagnet.org/apps/download/php/ajax/search_catalogue.php?rate=minute&type=best&format=IAGA2002&from_year=2014&from_month=01&from_day=01&to_year=2014&to_month=10&to_day=06&region=America,Asia,Europe,Pacific,Africa&latid=NH,NM,E,SM,SH

# First mirror request zip of 180 files.
# Second mirror requests one file per day (if zip request includes day with no data, returned
# zip file is empty)
mirror: mirror.js $(CAT)
	node mirror.js $(CADENCE) 1 2>&1 | tee mirror_$(CADENCE).log
	node mirror.js $(CADENCE) 1 1 2>&1 | tee mirror_$(CADENCE).log
	- cd data; find . -regex ".*[0-9][0-9]v.*" | xargs gzip --fast {} > /dev/null 2>&1
	rsync -avz data/ weigel@mag.gmu.edu:/media/disk/Data/tsds_data/original-s0/intermagnet.org/
#

metadatas:
	make metadata CADENCE=PT1M
	make metadata CADENCE=PT1S

metadata:
	make INTERMAGNET_$(CADENCE)-tsds.xml CADENCE=$(CADENCE) 2>&1 | tee metadata_$(CADENCE).log

INTERMAGNET_$(CADENCE)-tsds.xml:
	node metadata.js $(CADENCE)

#

clean:
	- rm -f *tsds.xml
	- rm -f catalog_*.txt	
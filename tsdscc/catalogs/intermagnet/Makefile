CADENCE=PT1S
CAT=catalog_$(CADENCE)

# This catalog must be mirrored because API creates a temporary file that
# is based on the timestamp (down to the second) of the request.  If two requests
# are made in the same second, the first temporary file is over-written on their server.
# (Not sure what will happen if someone else made a simultaneous request)
# No: FTP access is available, obviating scraping (mirror.js):
# http://intermagnet.org/data-donnee/data-eng.php#conditions

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
	make $(CAT).json CADENCE=$(CADENCE)

$(CAT).json: catalog.js
	node catalog.js $(CADENCE) 2>&1 | tee catalog_$(CADENCE).log

#

mirrors:
	make mirror CADENCE=PT1M 
	make mirror CADENCE=PT1S

mirror: mirror.js $(CAT).json
	node mirror.js $(CADENCE) 2>&1 | tee mirror_$(CADENCE).log
	cd data; find . -regex ".*[0-9][0-9]v.*" | xargs gzip --fast {} > /dev/null 2>&1

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
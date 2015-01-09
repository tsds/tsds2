# TODO:
# Write plug-in for wdc files
# Check lat longs


DIR=/media/disk/Data/tsds_data/original-s0
# (Could do reads on remote directories and files, but more code is needed.  First mirror then create metadata.)
mirror:
	cd $(DIR); wget -m ftp://ftp.nmh.ac.uk/wdc/obsdata/
	cd $(DIR)/ftp.nmh.ac.uk/wdc/obsdata/1minval/1996/; unzip liv1996m.zip; rm -rf data/; rm -f liv1996m.zip; zip -r liv1996m.zip liv9612m.wdc; rm liv9612m.wdc

metadata:
	node metadata.js

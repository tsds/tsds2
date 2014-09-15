all: node_modules/
	make clean
	make USGS_Mag_RT_PT1S-tsds.xml	
	make USGS_Mag_RT_PT1M-tsds.xml	
	make USGS_Dst_RT_PT1H-tsds.xml	
	make USGS_Dst_RT_PT1M-tsds.xml	

node_modules/: 
	npm install

USGS_RT_MAG_PT1S-tsds.xml: ./templates/USGS_Mag_RT_PT1S-template.json
	node USGS_Mag_RT.js PT1S

USGS_RT_MAG_PT1M-tsds.xml: ./templates/USGS_Mag_RT_PT1M-template.json
	node USGS_Mag_RT.js PT1M

USGS_RT_Dst_PT1H-tsds.xml: ./templates/USGS_Dst_RT_PT1H-template.json
	node USGS_Dst_RT.js PT1H

USGS_RT_Dst_PT1M-tsds.xml: ./templates/USGS_Dst_RT_PT1M-template.json
	node USGS_Dst_RT.js PT1M

clean:
	- mv USGS_RT_MAG_PT1S-tsds.xml archive/USGS_Mag_RT_PT1S-tsds-`/bin/date +\%Y\%m\%d`.xml
	- mv USGS_RT_MAG_PT1M-tsds.xml archive/USGS_Mag_RT_PT1M-tsds-`/bin/date +\%Y\%m\%d`.xml
	- mv USGS_RT_Dst_PT1H-tsds.xml archive/USGS_Dst_RT_PT1H-tsds-`/bin/date +\%Y\%m\%d`.xml
	- mv USGS_RT_Dst_PT1M-tsds.xml archive/USGS_Dst_RT_PT1M-tsds-`/bin/date +\%Y\%m\%d`.xml
	- rm USGS_*-tsds.xml

all: node_modules/
	make clean
	make USGS_RT_PT1S-tsds.xml	
	make USGS_RT_PT1M-tsds.xml	

node_modules/: 
	npm install

USGS_RT_PT1S-tsds.xml: USGS_RT_PT1S-template.json
	node USGS.js PT1S

USGS_RT_PT1M-tsds.xml: USGS_RT_PT1M-template.json
	node USGS.js PT1M

clean:
	- mv USGS_RT_PT1S-tsds.xml archive/USGS_RT_PT1S-tsds-`/bin/date +\%Y\%m\%d`.xml
	- mv USGS_RT_PT1M-tsds.xml archive/USGS_RT_PT1M-tsds-`/bin/date +\%Y\%m\%d`.xml
	- rm USGS_RT_*-tsds.xml

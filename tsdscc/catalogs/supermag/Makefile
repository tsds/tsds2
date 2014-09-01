all: node_modules/
	make clean
	make SuperMAG.xml	

node_modules/: 
	npm install

SuperMAG.xml: SuperMAG.js
	node SuperMAG.js true

clean:
	- mv SuperMAG-tsds.xml archive/SuperMAG-tsds-`/bin/date +\%Y\%m\%d`.xml
	- rm SuperMAG-tsds.xml
	- rm SuperMAG.raw
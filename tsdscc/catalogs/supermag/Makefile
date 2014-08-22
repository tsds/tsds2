all: node_modules/
	make SuperMAG.xml	

node_modules/: 
	npm install

SuperMAG.xml: SuperMAG.js
	node SuperMAG.js false
 
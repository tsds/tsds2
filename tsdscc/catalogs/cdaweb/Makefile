all:
	mv CDAWeb-tsds.xml archive/CDAWeb-tsds-`/bin/date +\%Y\%m\%d`.xml
	node catalog.js
	node ids_vars.js
	java -Djava.awt.headless=true -jar autoplot.jar org.virbo.autoplot.AutoplotUI --script getMetadata.jy
	node json2tsml.js

clean:
	- mv CDAWeb-tsds.xml archive/CDAWeb-tsds-`/bin/date +\%Y\%m\%d`.xml
	- rm -f json/*
	- rm -f CDAWeb-IDs.json
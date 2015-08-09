# To install jetty and start:
# make install && make start
#
# Test with:
# make test

JETTY=jetty-distribution-8.1.16.v20140903
AUTOPLOT_DATA=/tmp/autoplot_data
JAVA_OPTIONS="-DAUTOPLOT_DATA=$(AUTOPLOT_DATA) -Xmx512m -XX:+CMSClassUnloadingEnabled"

WARURL="http://autoplot.org/hudson/job/autoplot-jar-servlet/lastSuccessfulBuild/artifact/autoplot/AutoplotServlet/dist/AutoplotServlet.war"

start:
	cp jetty-logging.xml deps/jetty/etc
	cd deps/jetty; JAVA_OPTIONS=$(JAVA_OPTIONS) JETTY_PORT=8001 bash bin/jetty.sh start;

stop:
	- cd deps/jetty; JETTY_PORT=8001 bash bin/jetty.sh stop; 

test:
	echo "Testing http://localhost:8001/AutoplotServlet/SimpleServlet?url=vap%2Binline:rand(300)"
	curl -s "http://localhost:8001/AutoplotServlet/SimpleServlet?url=vap%2Binline:rand(300)" > test.png
	test -n "$$(find test.png -a -size +10k)" # Failure file size is < 10k.  Not a robust test.
	echo "PASS"

install:
	mkdir -p deps;
	curl $(WARURL) > deps/AutoplotServlet.war
	cd deps; unzip -q -o ../pkgs/$(JETTY).zip
	cd deps; mv AutoplotServlet.war $(JETTY)/webapps
	cd deps; rm -f jetty; ln -s $(JETTY) jetty

clean:
	rm -rf $(AUTOPLOT_DATA)
	rm -f *.class
	rm -rf deps/*
	rm -rf node_modules
	rm -f test.png

# curl "https://raw.githubusercontent.com/bahamas10/css-color-names/master/css-color-names.json" > ../tsdsfe/js/css-color-names.json
fontlist:
	javac ListFonts.java
	java ListFonts > ../tsdsfe/js/autoplotserverfonts.json
	curl http://autoplot.org/jnlp/latest/autoplot.jar > deps/autoplot.jar

test2:
	- pkill -f "node /usr/bin/http-server"
	sleep 1;
	http-server -p 8999 &
	head "$(AUTOPLOT_DATA)/server/whitelist.txt"
	curl "http://localhost:8001/AutoplotServlet/ServletInfo"
	sleep 5; curl "http://localhost:8001/AutoplotServlet/SimpleServlet?format=image/png&url=vap%2Bjyds:http%3A%2F%2Flocalhost%3A8999%2Ftest.jyds" > test2a.png
	head test2a.png
	curl "http://localhost:8001/AutoplotServlet/SimpleServlet?format=image/png&url=http%3A%2F%2Flocalhost%3A8999%2Ftest.jyds" > test2b.png
	head test2b.png
	#display test2.png


# OS-X: Need to execute
# ulimit -S -n 2048
#
# To run only one instance of nailgun and test for 50 near-simultaneous 
# requests, execute
# make all
# make showbug
#
# To test performance of nailgun [jetty] for different numbers of servers/
# number of near-simultaneous requests, execute
# make prep
# make startnailgun [startjetty]
# make testnailgun [testjetty]
# Output file is data/run_nailgun[jetty]_UNAME.txt
#
# For most recent Nailgun (0.9), download from source.
# git clone https://github.com/martylamb/nailgun.git

xall:
	curl http://autoplot.org/jnlp/latest/autoplot.jar > deps/autoplot.jar
	cd deps; unzip ../pkgs/nailgun-0.7.1.zip
	cd deps/nailgun-0.7.1; make
	java -Djava.awt.headless=true -Djava.library.path=. 					\
		-cp ./deps/autoplot.jar:./deps/nailgun-0.7.1/nailgun-0.7.1.jar:. 	\
		com.martiansoftware.nailgun.NGServer 7000 &

showbug:
		rm -f /tmp/BGSM*.png
		node showbug.js 50

###############################################################################
testjetty:
	rm -f data/run_jetty_$(shell uname).txt
	node runtests.js --Nrequests=50 --method=jetty --id=$(shell uname)

testnailgun:
	rm -f data/run_nailgun_$(shell uname).txt
	node runtests.js --Nrequests=50 --method=nailgun --id=$(shell uname)

startjetty:
	node test.js --Nservers=10 --method=launchjetty &

startnailgun:
	node test.js --Nservers=10 --method=launchnailgun &

prep:
	mkdir -p deps;
	javac ListFonts.java
	java ListFonts > ../tsdsfe/js/autoplotserverfonts.json
	curl http://autoplot.org/jnlp/latest/autoplot.jar > deps/autoplot.jar
	curl http://autoplot.org/hudson/job/autoplot-jar-servlet/lastSuccessfulBuild/artifact/autoplot/AutoplotServlet/dist/AutoplotServlet.war > deps/AutoplotServlet.war
	cd deps; unzip ../pkgs/nailgun-0.7.1.zip
	cd deps/nailgun-0.7.1; make;
	cd deps; unzip ../pkgs/jetty-distribution-8.1.16.v20140903.zip
	cd deps; mv AutoplotServlet.war jetty-distribution-8.1.16.v20140903/webapps
	npm install yargs
	cd data; sudo npm install http-server -g;
	cd data; http-server -p 9000;

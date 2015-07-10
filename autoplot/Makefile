# To install jetty and start
# make install
# make start

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

# curl "https://raw.githubusercontent.com/bahamas10/css-color-names/master/css-color-names.json" > ../tsdsfe/js/css-color-names.json

JETTY=jetty-distribution-8.1.16.v20140903

JAVA_OPTIONS="-DAUTOPLOT_DATA=/tmp/autoplot_data -Xmx512m -XX:+CMSClassUnloadingEnabled -XX:MaxPermSize=128m"

start:
	cd deps/jetty; JAVA_OPTIONS=$(JAVA_OPTIONS) JETTY_PORT=8001 bash bin/jetty.sh -d start;

#	cd deps/jetty; JAVA_OPTIONS=-DAUTOPLOT_DATA=/tmp/autoplot_data JETTY_PORT=8001 bash bin/jetty.sh -d start;

stop:
	cd deps/jetty; JETTY_PORT=8001 bash bin/jetty.sh -d stop; 

test2:
	http-server -p 8999 &
	sleep 1; curl "http://localhost:8001/AutoplotServlet/SimpleServlet?format=image/png&url=vap%2Bjyds:http%3A%2F%2Flocalhost%3A8999%2Ftest.jyds" > test2.png
	display test2.png

test:
	curl "http://localhost:8001/AutoplotServlet/SimpleServlet?url=vap%2Binline:rand(300)" > test.png
	display test.png

install:
	mkdir -p autoplot_data/server
	#cp deps/whitelist.txt autoplot_data/server
	mkdir -p deps;
	#javac ListFonts.java
	#java ListFonts > ../tsdsfe/js/autoplotserverfonts.json
	#curl http://autoplot.org/jnlp/latest/autoplot.jar > deps/autoplot.jar
	curl http://autoplot.org/hudson/job/autoplot-jar-servlet/lastSuccessfulBuild/artifact/autoplot/AutoplotServlet/dist/AutoplotServlet.war > deps/AutoplotServlet.war
	cd deps; unzip -q -o ../pkgs/$(JETTY).zip
	cd deps; mv AutoplotServlet.war $(JETTY)/webapps
	cd deps; rm -f jetty; ln -s $(JETTY) jetty

clean:
	rm -f *.class
	rm -rf deps/*
	rm -rf node_modules
	rm -f test.png

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

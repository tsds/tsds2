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

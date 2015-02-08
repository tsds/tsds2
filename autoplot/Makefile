# For most recent Nailgun, download from source.
# git clone https://github.com/martylamb/nailgun.git

# OS-X: Need to execute
# ulimit -S -n 2048

all:
	curl http://autoplot.org/jnlp/latest/autoplot.jar > deps/autoplot.jar
	cd deps; unzip ../pkgs/nailgun-0.7.1.zip
	cd deps/nailgun-0.7.1; make
	java -Djava.awt.headless=true -Djava.library.path=. \
		-cp ./deps/autoplot.jar:./deps/nailgun-0.7.1/nailgun-0.7.1.jar:. \
		com.martiansoftware.nailgun.NGServer 7000 &

showbug:
		rm -f /tmp/BGSM*.png
		node showbug.js 50

clean:
	rm -rf deps/*
	rm -rf node_modules

test:
	node run.js --method=nailgun --id=MacBookAir
	sleep 5;
	node run.js --method=jetty --id=MacBookAir

servers:
	node test.js --Nservers=10 --method=launch &

prep:
	mkdir -p deps;
	curl http://autoplot.org/jnlp/latest/autoplot.jar > deps/autoplot.jar
	curl http://autoplot.org/hudson/job/autoplot-jar-servlet/lastSuccessfulBuild/artifact/autoplot/AutoplotServlet/dist/AutoplotServlet.war > deps/AutoplotServlet.war
	cd deps; unzip ../pkgs/nailgun-0.7.1.zip
	cd deps/nailgun-0.7.1; make;
	cd deps; unzip ../pkgs/jetty-distribution-8.1.16.v20140903.zip
	cd deps; mv AutoplotServlet.war jetty-distribution-8.1.16.v20140903/webapps
	npm install yargs
	cd data; sudo npm install http-server -g;
	cd data; http-server -p 9000 &;

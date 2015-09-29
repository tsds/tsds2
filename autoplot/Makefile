# To install jetty and start:
#  make install && make start
#
# To test:
#  make test

PORT=8001
AUTOPLOT_DATA=/tmp/autoplot_data
JETTY=jetty-distribution-8.1.16.v20140903
JAVA_OPTIONS="-DAUTOPLOT_DATA=$(AUTOPLOT_DATA) -Xmx512m -XX:+CMSClassUnloadingEnabled"
SERVLETBASE="http://localhost:$(PORT)/AutoplotServlet"
WARURL="http://autoplot.org/hudson/job/autoplot-jar-servlet/lastSuccessfulBuild/artifact/autoplot/AutoplotServlet/dist/AutoplotServlet.war"

start:
	cp conf/jetty-logging.xml deps/jetty/etc
	cd deps/jetty; JAVA_OPTIONS=$(JAVA_OPTIONS) JETTY_PORT=$(PORT) bash bin/jetty.sh start;

stop:
	- cd deps/jetty; JETTY_PORT=$(PORT) bash bin/jetty.sh stop; 

test:
	echo "Testing $(SERVLETBASE)/SimpleServlet?url=vap%2Binline:rand(300)"
	curl -s "$(SERVLETBASE)/SimpleServlet?url=vap%2Binline:rand(300)" > test.png
	test -n "$$(find test.png -maxdepth 1 -size +10k)" # Failure file size is < 10k.  Not a robust test.
	echo "PASS"

# Test that we can serve data created by a jyds file served from localhost:8999
# May need to install http-server using
# npm -g install http-server 
test2:
	- pkill -f "node /usr/bin/http-server"
	- pkill -f "node /usr/local/bin/http-server"
	sleep 1;
	http-server -p 8999 &
	echo "Running test in 3 seconds."
	sleep 3; curl -s "$(SERVLETBASE)/SimpleServlet?format=image/png&url=vap%2Bjyds:http%3A%2F%2Flocalhost%3A8999%2Ftest.jyds" > test2a.png
	test -n "$$(find test2a.png -maxdepth 1 -size +10k)"
	echo -e "\033[1;32mPASS\033[0m"

#head "$(AUTOPLOT_DATA)/server/whitelist.txt"
#curl "$(SERVLETBASE)/ServletInfo"
#head test2a.png

# Test with omitting vap+jyds: (should give same result)
# curl "$(SERVLETBASE)/SimpleServlet?format=image/png&url=http%3A%2F%2Flocalhost%3A8999%2Ftest.jyds" > test2b.png
# head test2b.png

install:
	mkdir -p deps;
	curl $(WARURL) > deps/AutoplotServlet.war
	cd deps; unzip -q -o ../pkgs/$(JETTY).zip
	cd deps; mv AutoplotServlet.war $(JETTY)/webapps
	cd deps; rm -f jetty; ln -s $(JETTY) jetty

fontlist:
	cd src; javac ListFonts.java
	cd src; java ListFonts > ../../tsdsfe/js/autoplotserverfonts.json

clean:
	rm -rf $(AUTOPLOT_DATA)
	rm -f *.class
	rm -rf deps/*
	rm -rf node_modules
	rm -f test*.png
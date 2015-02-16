#!/bin/bash
#
# Startup script for TSDSFE and its dependencies
#
# NOT TESTED

MEMORY=--max-old-space-size=1900
DIR=/usr/local/tsds2
NODE=/usr/bin/nodejs

PORTDATACACHE=7999
PORTAUTOPLOT=8001
PORTDATAVIVIZ=8002
PORTTSDSET=8003
PORTTSDSFE=8004

LOGTSDSFE=/var/log/tsdsfe
LOGDATACACHE=/var/log/datacache
LOGAUTOPLOT=/var/log/autoplot
LOGVIVIZ=/var/log/viviz

mkdir -p $LOGTSDSFE
sudo chown www-data $LOGTSDSFE
mkdir -p $LOGTSDSET
sudo chown www-data $LOGTSDSET
mkdir -p $LOGDATACACHE
sudo chown www-data $LOGDATACACHE
mkdir -p $LOGAUTOPLOT
sudo chown www-data $LOGAUTOPLOT
mkdir -p $LOGVIVIZ
sudo chown www-data $LOGVIVIZ

case $1 in
        start)
                sudo -u www-data $NODE $MEMORY $APP/node_modules/datacache/app.js $PORTDATACACHE 2>&1 | tee $LOGDATACACHE/datacache.log
                cd $APP/autoplot/jetty; sudo -u www-data JETTY_PORT=$PORTAUTOPLOT bash bin/jetty.sh -d start 2>&1 | tee $LOGAUTOPLOT/autoplot.log 
                sudo -u www-data $NODE $APP/node_modules/viviz/viviz.js $PORTVIVIZ 2>&1 | tee $LOGVIVIZ/viviz.log
                sudo -u www-data $NODE $APP/tsdset/app.js $PORTTSDSET 2>&1 | tee $LOGTSDSET/tsdset.log
                sudo -u www-data $NODE $APP/tsdsfe/tsdsfe.js $PORTTSDSFE 2>&1 | tee $LOGTSDSFE/tsdsfe.log
        ;;
        stop)
                pid=`pgrep -f "$NODE $APP/tsdsfe/tsdsfe.js $PORTTSDSFE"` 2>&1 | tee $LOGTSDSFE/tsdsfe.log
                sudo kill -9 $pid
                pid=`pgrep -f "$NODE $MEMORY $APP/node_modules/datacache/app.js $PORTDATACACHE"` 2>&1 | tee $LOGDATACACHE/datacache.log
                sudo kill -9 $pid 
                cd $APP/autoplot/jetty; sudo JETTY_PORT=$PORTAUTOPLOT bash bin/jetty.sh -d stop 2>&1 | tee $LOGAUTOPLOT/autoplot.log
                pid=`pgrep -f "$NODE $APP/node_modules/viviz/viviz.js $PORTVIVZ"` $PORTVIVIZ 2>&1 | tee $LOGVIVIZ/viviz.log
                sudo kill -9 $pid
        ;;
        *)
                echo "Usage: /etc/init.d/tsdsfe start|stop"
        ;;
esac

exit 0
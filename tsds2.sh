#!/bin/bash
#
# Startup script for TSDSFE and its dependencies
#
# NOT TESTED

LOG=/var/log
USER=www-data
NODE=/usr/bin/nodejs

LOG=/tmp
USER=robertweigel
NODE=/usr/local/bin/node
APP=`pwd`/tsdsfe/

MEMORY=--max-old-space-size=1900

PORTDATACACHE=7999
PORTAUTOPLOT=8001
PORTDATAVIVIZ=8002
PORTTSDSET=8003
PORTTSDSFE=8004

LOGTSDSFE=$LOG/tsdsfe
LOGTSDSET=$LOG/tsdset
LOGDATACACHE=$LOG/datacache
LOGAUTOPLOT=$LOG/autoplot
LOGVIVIZ=$LOG/viviz

echo $LOGTSDSFE

mkdir -p $LOGTSDSFE
sudo chown $USER $LOGTSDSFE
mkdir -p $LOGTSDSET
sudo chown $USER $LOGTSDSET
mkdir -p $LOGDATACACHE
sudo chown $USER $LOGDATACACHE
mkdir -p $LOGAUTOPLOT
sudo chown $USER $LOGAUTOPLOT
mkdir -p $LOGVIVIZ
sudo chown $USER $LOGVIVIZ

case $1 in
        start)
                sudo -u $USER $NODE $MEMORY $APP/node_modules/datacache/app.js $PORTDATACACHE 2>&1 | tee $LOGDATACACHE/datacache.log
                cd $APP/autoplot/jetty; sudo -u $USER JETTY_PORT=$PORTAUTOPLOT bash bin/jetty.sh -d start 2>&1 | tee $LOGAUTOPLOT/autoplot.log 
                sudo -u $USER $NODE $APP/node_modules/viviz/viviz.js $PORTVIVIZ 2>&1 | tee $LOGVIVIZ/viviz.log
                sudo -u $USER $NODE $APP/tsdset/app.js $PORTTSDSET 2>&1 | tee $LOGTSDSET/tsdset.log
                sudo -u $USER $NODE $APP/tsdsfe/tsdsfe.js $PORTTSDSFE 2>&1 | tee $LOGTSDSFE/tsdsfe.log
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
#!/bin/bash
#
# Startup script for TSDSFE and its dependencies
#
# NOT TESTED

LOG=/var/log
USER=www-data
NODE=/usr/bin/nodejs

LOG=/tmp/log
USER=robertweigel
NODE=/usr/local/bin/node
APP=`pwd`/tsdsfe

MEMORY=--max-old-space-size=1900

PORTDATACACHE=7999
PORTAUTOPLOT=8001
PORTVIVIZ=8002
PORTTSDSET=8003
PORTTSDSFE=8004

LOGTSDSFE=$LOG/tsdsfe
LOGTSDSET=$LOG/tsdset
LOGDATACACHE=$LOG/datacache
LOGAUTOPLOT=$LOG/autoplot
LOGVIVIZ=$LOG/viviz

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
                echo "Starting DataCache"
                sudo -u $USER $NODE $MEMORY $APP/node_modules/datacache/app.js $PORTDATACACHE 2>&1 | tee $LOGDATACACHE/datacache.log &
                echo "Starting Jetty"
                cd $APP/../autoplot/deps/jetty; sudo -u $USER JETTY_PORT=$PORTAUTOPLOT bash bin/jetty.sh -d start 2>&1 | tee $LOGAUTOPLOT/autoplot.log & 
                echo "Starting ViViz"
                sudo -u $USER $NODE $APP/node_modules/viviz/viviz.js $PORTVIVIZ 2>&1 | tee $LOGVIVIZ/viviz.log  &
                echo "Starting TSDSET"
                sudo -u $USER $NODE $APP/node_modules/tsdset/app.js $PORTTSDSET 2>&1 | tee $LOGTSDSET/tsdset.log &
                echo "Starting TSDSFE"
                sudo -u $USER $NODE $APP/tsdsfe.js $PORTTSDSFE 2>&1 | tee $LOGTSDSFE/tsdsfe.log &
        ;;
        stop)
                echo "Killing TSDSFE"
                sudo pkill -f "$NODE $APP/tsdsfe.js $PORTTSDSFE" 2>&1 | tee $LOGTSDSFE/tsdsfe.log
                echo "Killing DataCache"
                sudo pkill -f "$NODE $MEMORY $APP/node_modules/datacache/app.js $PORTDATACACHE" 2>&1 | tee $LOGDATACACHE/datacache.log
                echo "Killing Jetty"
                cd $APP/../autoplot/deps/jetty; JETTY_PORT=$PORTAUTOPLOT bash bin/jetty.sh -d stop 2>&1 | tee $LOGAUTOPLOT/autoplot.log
                echo "Killing ViViz"
                sudo pkill -f "$NODE $APP/node_modules/viviz/viviz.js $PORTVIVZ" 2>&1 | tee $LOGVIVIZ/viviz.log
                echo "Killing TSDSET"
                sudo pkill -f "$NODE $APP/node_modules/tsdset/app.js $PORTTSDSET" | tee $LOGTSDSET/tsdset.log
        ;;      
        *)
                echo "Usage: /etc/init.d/tsdsfe start|stop"
        ;;
esac

exit 0
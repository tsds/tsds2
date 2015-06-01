#!/bin/bash
# Requests TSDSFE URL and shows request log
#
# Usage:
#   curl-test.sh URL
#
# Example:
#   curl-test.sh "http://tsds.org/get/?catalog=SSCWeb&dataset=ace&parameters=X_TOD&start=-P3D&stop=2014-08-17&return=image&format=viviz&type=timeseries&style=1"

echo "---------"
echo -e "\033[1mResponse:\033[0m"
echo "---------"
curl -v -D /tmp/tmp.header "$1"
echo ""

grep "x-tsdsfe-log" /tmp/tmp.header | perl -pe 's/.*: /cat ..\/log\/requests\//' | perl -pe 's/\r//' > /tmp/tmp.sh
grep "x-tsdsfe-warning" /tmp/tmp.header | perl -pe 's/.*: /cat ..\/log\/requests\//' | perl -pe 's/\r//' >> /tmp/tmp.sh

echo "----------------"
echo -e "\033[1mResponse header:\033[0m"
echo "----------------"
cat /tmp/tmp.header
echo "--------------"
echo -e "\033[1mTSDSFE Response file:\033[0m"
echo "--------------"
source /tmp/tmp.sh

grep "x-datacache-log" /tmp/tmp.header | perl -pe 's/.*: /cat ~\/git\/datacache\/log\/requests\//' | perl -pe 's/\r//' > /tmp/tmp2.sh
grep "x-datacache-warning" /tmp/tmp.header | perl -pe 's/.*: /cat ~\/git\/datacache\/requests\//' | perl -pe 's/\r//' >> /tmp/tmp2.sh
echo "--------------"
echo -e "\033[1mDataCache Response file:\033[0m"
echo "--------------"
source /tmp/tmp2.sh

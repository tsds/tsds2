#!/usr/bin/sh

echo "Starting datacache server."
node node_modules/datacache/app.js 7999 &
PID1=$!

echo "Starting TSDSFE server."
node tsdsfe.js 8004 &
PID2=$!

echo "Sleeping for 3 seconds before running tests."

sleep 3

node test/metadata-tests.js

node test/data-tests.js

RESULT=$?

kill $PID1 $PID2

exit $RESULT
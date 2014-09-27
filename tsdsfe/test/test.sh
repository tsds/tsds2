#!/usr/bin/sh

echo "Starting datacache server."
nodejs node_modules/datacache/app.js 7999 &
PID1=$!

echo "Starting TSDSFE server."
nodejs tsdsfe.js 8004 true true true &
PID2=$!

echo "Sleeping for 3 seconds before running tests."

sleep 3

rm -rf node_modules/datacache/cache/*
rm -rf ../cache/*;

nodejs test/test.js --testfile=test/metadata-tests.js
nodejs test/test.js --testfile=test/data-tests.js 

RESULT=$?

kill $PID1 $PID2

exit $RESULT
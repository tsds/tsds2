#!/usr/bin/sh

echo "Starting TSDSFE server."
nodejs tsdsfe.js 8004 &
PID2=$!

echo "Sleeping for 3 seconds before running tests."

sleep 3

rm -rf node_modules/datacache/cache/*
rm -rf ../cache/*;

nodejs test/test.js --testfile=test/metadata-tests.js
nodejs test/test.js --testfile=test/data-tests.js 
nodejs test/test.js --testfile=test/image-tests.js 

RESULT=$?

kill $PID2

exit $RESULT
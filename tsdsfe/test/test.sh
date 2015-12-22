#!/usr/bin/bash

echo "Starting TSDSFE server."
node tsdsfe.js --checkservers false --checkdeps false &
PID=$!

echo "Sleeping for 3 seconds before running tests."

sleep 3

rm -rf node_modules/datacache/cache/*
rm -rf ../cache/*;

node test/test.js --testfile test/metadata-tests.js

RESULT=$?

node test/test.js --testfile test/data-tests.js 

RESULT+=$?

node test/test.js --testfile test/image-tests.js 

RESULT+=$?

node test/test.js --testfile test/dd-tests.js 

RESULT+=$?

kill -s "SIGINT" $PID

if [[ $RESULT != "1" ]]; then
	echo "test.sh Exiting with code 1"
	exit 1
else
	echo "test.sh Exiting with code 0"
	exit 0
fi

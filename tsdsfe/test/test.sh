#!/usr/bin/bash

echo "Starting TSDSFE server."
node tsdsfe.js --checkservers false --checkdeps false &
PID=$!

RESULT=$?
if [[ $RESULT != "0" ]]; then
	echo "test.sh Could not start TSDSFE server.  Exiting with code 1."
	exit $RESULT
fi

echo "Sleeping for 3 seconds before running tests."

sleep 3

rm -rf node_modules/datacache/cache/*
rm -rf ../cache/*

com="node test/test.js --testfile test/metadata-tests.js"
echo "test.sh: $com"
$com
RESULT=$?

com="node test/test.js --testfile test/data-tests.js"
echo "test.sh: $com"
$com
RESULT+=$?

com="node test/test.js --testfile test/image-tests.js"
echo "test.sh: $com"
$com
RESULT+=$?

com="node test/test.js --testfile test/dd-tests.js"
echo "test.sh: $com"
$com
RESULT+=$?

kill -s "SIGINT" $PID

if [[ $RESULT != "0" ]]; then
	echo "test.sh Exiting with code 0."
	exit 1
else
	echo "test.sh Exiting with code 0."
	exit 0
fi

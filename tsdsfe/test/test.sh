#!/usr/bin/bash

echo "Starting TSDSFE server."
node tsdsfe.js &
PID=$!

echo "Sleeping for 3 seconds before running tests."

sleep 3

rm -rf node_modules/datacache/cache/*
rm -rf ../cache/*;

node test/test.js --testfile test/metadata-tests.js

RESULT1=$?

node test/test.js --testfile test/data-tests.js 

RESULT2=$?

node test/test.js --testfile test/image-tests.js 

RESULT3=$?

kill -s "SIGINT" $PID

if [[ $RESULT1 == "1" && $RESULT2 == "1" ]]; then
	echo "test.sh Exiting with code 1"
	exit 1
else
	echo "test.sh Exiting with code 0"
	exit 0
fi

#!/usr/bin/sh

node node_modules/datacache/app.js 7999 &

PID1=$!

sleep 3

node tsdsfe.js 8004 &

PID2=$!

sleep 3

node test/test.js

RESULT=$?

kill $PID1 $PID2

exit $RESULT
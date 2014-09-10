#!/usr/bin/sh

node app.js 7998 &

PID=$!

echo "Starting tests in 1 second."

sleep 1

#curl -s "http://localhost:7998/?template=bdt%Y%m%dvmin.min&start=-P1M&stop=-P1D"

curl -s http://localhost:7998/test > tests/expandTemplate.now.txt

RESULT=`diff tests/expandTemplate.now.txt tests/expandTemplate.out.txt` 

kill $PID

if [ -z "$RESULT" ]; then
	echo "All tests passed."
	exit 0;
else
	echo "At least one test failed.  Differences between"
	echo "tests/expandTemplate.now.txt tests/expandTemplate.out.txt:"
	echo "$RESULT"
	exit 1;
fi


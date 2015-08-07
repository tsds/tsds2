all:
	make install
	make start
	make test

start:
	cd tsdsfe; node tsdsfe.js

test:
	cd tsdsfe; node test/test.js --testfile test/metadata-tests.js
	cd tsdsfe; node test/test.js --testfile test/data-tests.js
#	cd tsdsfe; node test/test.js --testfile test/data-large-tests.js
	cd autoplot; make test

install:
	cd tsdsfe; npm install
	cd autoplot; make install

clean:
	cd tsdsfe; rm -rf node_modules
	cd autoplot; make clean
all: build test


build: parser

parser: spec.txt
	./pegjs.git/bin/pegjs $<

test:
	node ./test.js

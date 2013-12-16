
build: parser

all: build test

parser: spec.txt
	./pegjs.git/bin/pegjs $<

test:
	node ./test.js

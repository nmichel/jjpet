
build: parser

all: build test

parser: spec.txt
	./pegjs.git/bin/pegjs $< ./lib/spec.js

test:
	node ./test.js

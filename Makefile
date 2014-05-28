.PHONY: build all test

build: parser

all: build test browserify

parser: spec.txt
	./pegjs.git/bin/pegjs $< ./lib/spec.js

test:
	node ./test.js

browserify:
	(cd ./lib && browserify  -r ./jjpet.js:jjpet > ../dist/jjpet-dist.js)

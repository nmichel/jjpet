.PHONY: build all test

build: parser

all: build test browserify

parser: spec.txt
	npm install
	./node_modules/pegjs/bin/pegjs $< ./lib/spec.js

test:
	node ./validation_test.js

browserify:
	(cd ./lib && browserify -r ./jjpet.js:jjpet -r ./ast.js:ast -r ./generator.js:generator > ../dist/jjpet-dist.js)

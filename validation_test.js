var https = require('https'),
    jjpet = require('./lib/jjpet.js'),
    assert = require('assert');

https.get("https://gist.githubusercontent.com/nmichel/8b0d6f194e89abb7281d/raw/5033cd42ce3bfbb4f291004737d31987969ef8ab/validation_tests.json",
    function(res) {
        var testCounter = 0,
            body = '';
        res
            .on('data', function(chunk) {
                body += chunk;
            })
            .on('end', function() {
                var tests = JSON.parse(body),
                    someFailed = false;
                for (var i = 0; i < tests.length; ++i) {
                    var test = tests[i],
                        p = test.pattern,
                        m = jjpet.compile(p);

                    for (var j = 0; j < test.tests.length; ++j) {
                        var t = test.tests[j],
                            r = jjpet.run(t.node, m, t.inject || {}),
                            node = JSON.stringify(t.node),
                            exp = {status: t.status, captures: t.captures},
                            res = false;

                        try {
                            assert.deepEqual(r, exp);
                            res = true;
                        }
                        catch (e) {
                            someFailed = true;
                        }

                        console.log('test ' + ++testCounter + '("' + p + '")'
                            + ' | ' + node
                            + ' | ' + JSON.stringify(exp) + ' | ' + (res ? 'PASS' : 'FAILED'));
                    }

                    assert.equal(someFailed, false, "Some tests failed");
                }
            })
        });

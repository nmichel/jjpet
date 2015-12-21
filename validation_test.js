var https = require('https'),
    jjpet = require('./lib/jjpet.js'),
    assert = require('assert'),
    fs = require('fs');

function doTests(allTests) {
    var testCounter = 0,
        someFailed = false;
    for (var i = 0; i < allTests.length; ++i) {
        var test = allTests[i],
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
}

https.get('https://gist.githubusercontent.com/nmichel/8b0d6f194e89abb7281d/raw/907027e8d0be034433e1f56661a6a4fa3292daff/validation_tests.json',
    function(res) {
        var body = '';
        res.setEncoding('utf8');
        res
            .on('data', function(chunk) {
                body += chunk;
            })
            .on('end', function() {
                doTests(JSON.parse(body));
            })
        });

/*
fs.readFile('/home/nmichel/projects/validation_tests.json.git/validation_tests.json', function(err, data) {
    if (err) {
        throw err; // <== 
    }
    doTests(JSON.parse(data));
});
*/

var builders = require('./builders.js');
var parser = require('./spec.js');

var tests =
    [
        // Basics 
        // 
        ['42',
         [
             ['42', [true, []]],
             ['42.0', [true, []]],
             ['\"42\"', [false, []]],
             ['\"42.0\"', [false, []]],
         ]
        ],
        ['"foo"',
         [
             ['"foo"', [true, []]],
             ['"fooo"', [false, []]]
         ]
        ],
        ['#"foo"',
         [
             ['"foo"', [true, []]],
             ['"fooo"', [true, []]],
             ['"booo"', [false, []]]
         ]
        ],
        ['#"^foo.*bar$"',
         [
             ['"foobar"', [true, []]],
             ['"foo  pouet bar"', [true, []]],
             ['" foo  pouet bar"', [false, []]],
             ['"foo  pouet bar "', [false, []]]
         ]
        ],
        ['#"^foo[0-9]+bar$"',
         [
             ['"foobar"', [false, []]],
             ['"foo  pouet bar"', [false, []]],
             ['"foo12345bar"', [true, []]]
         ]
        ],
        ['true',
         [
             ['true', [true, []]],
             ['false', [false, []]],
             ['\"true\"', [false, []]],
             ['\"false\"', [false, []]]
         ]
        ],
        ['false',
         [
             ['true', [false, []]],
             ['false', [true, []]],
             ['\"true\"', [false, []]],
             ['\"false\"', [false, []]]
         ]
        ],
        ['null',
         [
             ['null', [true, []]],
             ['0', [false, []]],
             ['\"null\"', [false, []]],
             ['\"false\"', [false, []]]
         ]
        ],
        ['_',
         [
             ['null', [true, []]],
             ['0', [true, []]],
             ['\"null\"', [true, []]],
             ['\"false\"', [true, []]],
             ['{}', [true, []]],
             ['[]', [true, []]],
             ['{"foo": 42}', [true, []]],
             ['["foo", 42, null]', [true, []]]
         ]
        ],

        // Objects
        // 
        ['{}',
         [
             ['{ }', [true, []]],
             ['{"foo": 42, "bar": "neh"}', [true, []]],
             ['[]', [false, []]],,
             ['[42, "foo"]', [false, []]]
         ]
        ],
        ['{"toto": _, _:"foo" }',
         [
             ['{ "toto": 42, "bar":"foo"}', [true, []]]
         ]
        ],

        // Lists
        // 
        ['[]',
         [
             ['[]', [true, []]],
             ['[42]', [false, []]],
             ['{}', [false, []]],
             ['42', [false, []]],
             ['"[]"', [false, []]]
         ]
        ],
        ['[*]',
         [
             ['[]', [true, []]],
             ['[42]', [true, []]],
             ['[42, "foo", false]', [true, []]],
             ['{}', [false, []]],
             ['42', [false, []]],
             ['"[]"', [false, []]]
         ]
        ],
        ['[42]',
         [
             ['[]', [false, []]],
             ['[42]', [true, []]],
             ['[42, "foo", false]', [false, []]]
         ]
        ],
        ['[42, *]',
         [
             ['[]', [false, []]],
             ['[42]', [true, []]],
             ['[42, "foo"]', [true, []]],
             ['["foo", 42]', [false, []]],
             ['{}', [false, []]],
             ['42', [false, []]],
             ['"[]"', [false, []]]
         ]
        ],
        ['[*, 42]',
         [
            ['[]', [false, []]],
            ['[42]', [true, []]],
            ['[42, "foo"]', [false, []]],
            ['["foo", 42]', [true, []]],
            ['{}', [false, []]],
            ['42', [false, []]],
            ['"[]"', [false, []]]
         ]
        ],
        ['[*, 42, *]',
         [
            ['[]', [false, []]],
            ['[42]', [true, []]],
            ['[42, "foo"]', [true, []]],
            ['["foo", 42]', [true, []]],
            ['["foo", 42, "foo"]', [true, []]],
            ['{}', [false, []]],
            ['42', [false, []]],
            ['"[]"', [false, []]]
         ]
        ]
    ];

var testCounter = 0;
tests.forEach(function(pattTest) {
    var pattern = pattTest[0];
    var suite = pattTest[1];
    var matcher = parser.parse(pattern);
    suite.forEach(function(test) {
        var expr = test[0];
        var matchingRes = matcher(JSON.parse(expr));
        var res = JSON.stringify(matchingRes) == JSON.stringify(builders.build_matching_result.apply(null, test[1]));
        console.log('test ' + ++testCounter + '("' + pattern + '")'
                    + ' | ' + expr + ' | ' + test[1] + ' | '
                    + ' => ' + res);
    });
});

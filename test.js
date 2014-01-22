var jjpet = require('./lib/jjpet.js'),
    builders = require('./lib/builders.js');

var tests =
    [
        // Basics 
        // 
        ['42',
         [
             ['42', [true, {}]],
             ['42.0', [true, {}]],
             ['\"42\"', [false, {}]],
             ['\"42.0\"', [false, {}]],
         ]
        ],
        ['"foo"',
         [
             ['"foo"', [true, {}]],
             ['"fooo"', [false, {}]]
         ]
        ],
        ['#"foo"',
         [
             ['"foo"', [true, {}]],
             ['"fooo"', [true, {}]],
             ['"booo"', [false, {}]]
         ]
        ],
        ['#"^foo.*bar$"',
         [
             ['"foobar"', [true, {}]],
             ['"foo  pouet bar"', [true, {}]],
             ['" foo  pouet bar"', [false, {}]],
             ['"foo  pouet bar "', [false, {}]]
         ]
        ],
        ['#"^foo[0-9]+bar$"',
         [
             ['"foobar"', [false, {}]],
             ['"foo  pouet bar"', [false, {}]],
             ['"foo12345bar"', [true, {}]]
         ]
        ],
        ['#"^★★★.*★★★$"',
         [
             ['"★★★★★★"', [true, {}]],
             ['" ★★★★★★"', [false, {}]],
             ['"★★★★★★ "', [false, {}]],
             ['"★★★안녕하세요★★★"', [true, {}]],
             ['"★★★مرحبا★★★"', [true, {}]],
         ]
        ],
        ['true',
         [
             ['true', [true, {}]],
             ['false', [false, {}]],
             ['\"true\"', [false, {}]],
             ['\"false\"', [false, {}]]
         ]
        ],
        ['false',
         [
             ['true', [false, {}]],
             ['false', [true, {}]],
             ['\"true\"', [false, {}]],
             ['\"false\"', [false, {}]]
         ]
        ],
        ['null',
         [
             ['null', [true, {}]],
             ['0', [false, {}]],
             ['\"null\"', [false, {}]],
             ['\"false\"', [false, {}]]
         ]
        ],
        ['_',
         [
             ['null', [true, {}]],
             ['0', [true, {}]],
             ['\"null\"', [true, {}]],
             ['\"false\"', [true, {}]],
             ['{}', [true, {}]],
             ['[]', [true, {}]],
             ['{"foo": 42}', [true, {}]],
             ['["foo", 42, null]', [true, {}]]
         ]
        ],

        // Objects
        // 
        ['{}',
         [
             ['{ }', [true, {}]],
             ['{"foo": 42, "bar": "neh"}', [true, {}]],
             ['[]', [false, {}]],,
             ['[42, "foo"]', [false, {}]]
         ]
        ],
        ['{"toto": _, _:"foo" }',
         [
             ['{ "toto": 42, "bar":"foo"}', [true, {}]],
             ['{ "neh": {}, "toto": 42, "bar": "foo", "foo": false}', [true, {}]]
         ]
        ],
        ['{_:{_:{_:{"foo":_}}}}',
         [
             ['{"bar": {"bar": {"bar": {"foo": 42}}}}', [true, {}]],
             ['{"foo": {"foo": {"foo": {"bar": 42}}}}', [false, {}]],
             ['{"foo": {"foo": {"foo": {"bar": {"foo": 42}}}}}', [false, {}]]
         ]
        ],
        ['{_:{_:{_:{_:42}}}}',
         [
             ['{"bar": {"bar": {"bar": {"foo": 42}}}}', [true, {}]],
             ['{"foo": {"foo": {"foo": {"bar": 42}}}}', [true, {}]],
             ['{"foo": {"foo": {"foo": {"bar": {"foo": 42}}}}}', [false, {}]]
         ]
        ],

        // Lists
        // 
        ['[]',
         [
             ['[]', [true, {}]],
             ['[42]', [false, {}]],
             ['{}', [false, {}]],
             ['42', [false, {}]],
             ['"[]"', [false, {}]]
         ]
        ],
        ['[*]',
         [
             ['[]', [true, {}]],
             ['[42]', [true, {}]],
             ['[42, "foo", false]', [true, {}]],
             ['{}', [false, {}]],
             ['42', [false, {}]],
             ['"[]"', [false, {}]]
         ]
        ],
        ['[42]',
         [
             ['[]', [false, {}]],
             ['[42]', [true, {}]],
             ['[42, "foo", false]', [false, {}]]
         ]
        ],
        ['[*, 42, *, false, *]',
         [
             ['[]', [false, {}]],
             ['[42]', [false, {}]],
             ['[42, "foo", false]', [true, {}]],
             ['[false, "foo", 42]', [false, {}]]
         ]
        ],
        ['[42, *]',
         [
             ['[]', [false, {}]],
             ['[42]', [true, {}]],
             ['[42, "foo"]', [true, {}]],
             ['["foo", 42]', [false, {}]],
             ['{}', [false, {}]],
             ['42', [false, {}]],
             ['"[]"', [false, {}]]
         ]
        ],
        ['[*, 42]',
         [
            ['[]', [false, {}]],
            ['[42]', [true, {}]],
            ['[42, "foo"]', [false, {}]],
            ['["foo", 42]', [true, {}]],
            ['{}', [false, {}]],
            ['42', [false, {}]],
            ['"[]"', [false, {}]]
         ]
        ],
        ['[*, 42, *]',
         [
            ['[]', [false, {}]],
            ['[42]', [true, {}]],
            ['[42, "foo"]', [true, {}]],
            ['["foo", 42]', [true, {}]],
            ['["foo", 42, "foo"]', [true, {}]],
            ['{}', [false, {}]],
            ['42', [false, {}]],
            ['"[]"', [false, {}]]
         ]
        ],
        [['[*, {_: [*, 42]}]'],
         [
             ['[{"foo": [42]}]', [true, {}]],
             ['[42, {"bar": 42, "foo": [42]}]', [true, {}]],
             ['[42, {"foo": ["neh", 42]}]', [true, {}]],
             ['[42, {"foo": [42, "neh"]}]', [false, {}]],
             ['[{"foo": [42]}, "neh"]', [false, {}]]
         ]   
        ],

        // Iterables
        // 
        [[' <    >   ', '<>'],
         [
             ['42', [false, {}]],
             ['false', [false, {}]],
             ['"{}"', [false, {}]],
             ['"[]"', [false, {}]],
             ['{}', [true, {}]],
             ['{"foo": 42, "bar": "quarante-deux"}', [true, {}]],
             ['[]', [true, {}]],
             ['["foo", 42, "bar", "quarante-deux", true]', [true, {}]]
         ]
        ],
        [['<42> ', '*/42'],
         [
             ['42', [false, {}]],
             ['false', [false, {}]],
             ['"{}"', [false, {}]],
             ['"[]"', [false, {}]],
             ['{}', [false, {}]],
             ['{"foo": 42, "bar": "quarante-deux"}', [true, {}]],
             ['[]', [false, {}]],
             ['["foo", 42, "bar", "quarante-deux", true]', [true, {}]]
         ]
        ],
        ['<{_:42}>',
         [
             ['[{"bar": 42}]', [true, {}]]
         ]
        ],
        ["<{_:[*, 42, *]}>",
         [
             ['[{"bar": [42]}]', [true, {}]]
         ]
        ],
        ['<42>',
         [
             ['[1, "foo", {"bar": [42]}, 42]', [true, {}]]
         ]
        ],
        ['<[*, 42, *]>',
         [
             ['[[42]]', [true, {}]]
         ]
        ],
        ['{_:[*, 42, *]}',
         [
             ['{"bar": [42]}', [true, {}]]
         ]
        ],
        ['<{_:[*, 42, *]}>',
         [
             ['{"foo": {"bar": [42]}}', [true, {}]]
         ]
        ],
        ['<{_:[*, 42, *]}>',
         [
             ['[{"bar": [42]}]', [true, {}]]
         ]
        ],
        ['<42, false>',
         [
             ['[42, false]', [true, {}]],
             ['[false, 42]', [true, {}]],
             ['[{}, false, [], 42, {}]', [true, {}]],
             ['{"foo": 42, "bar": false}', [true, {}]],
             ['{"foo": false, "bar": 42}', [true, {}]],
             ['{"neh": {}, "foo": false, "bar": 42, "eos": []}', [true, {}]],
             ['[42]', [false, {}]],
             ['[false]', [false, {}]],
             ['[{}, 42]', [false, {}]],
             ['{"foo": false, "bar": []}', [false, {}]],
         ]
        ],

        // descenadnt
        // 

        ['**/42',
         [
             ['[42]', [true, {}]],
             ['{"foo": 42}', [true, {}]],
             ['{"bar": {}, "foo": 42}', [true, {}]],
             ['["foo", 42]', [true, {}]],
             ['[[{"bar": [{"foo": ["bar", 42, 13]}]}]]', [true, {}]],
             ['42', [false, {}]],
             ['[]', [false, {}]],
             ['{}', [false, {}]]
         ]
        ],
        ['**/[*, 42]',
         [
             ['[]', [false, {}]],
             ['{}', [false, {}]],
             ['[42]', [false, {}]],
             ['["foo", [42]]', [true, {}]],
             ['{"foo" : [42]}', [true, {}]],
             ['[[{"bar": [{"foo": ["this one matches", 42]}]}], "next does not match", 42]', [true, {}]]

         ]
        ],
        ["**/{_:42}",
         [
             ['[{"bar": 42}]', [true, {}]],
             ['[{"bar": ["42", \
                         {"foo": true, \
                          "bar": ["A", "B", {"neh": 42}, false]}, \
                         true]}]', [true, {}]]
         ]
        ],
        ['[*, "mark", **/**/42, "END"]',
         [
             ['42', [false, {}]],
             ['[42]', [false, {}]],
             ['[{}, "mark", 42]', [false, {}]],
             ['[[], "mark", ["something", true, 42, "at the end"]]', [false, {}]],
             ['[false, "mark", ["something", [true, 42], "at the end"]]', [false, {}]],
             ['[{"foo": []}, "mark", ["something", [true, 42], "at the end"], "inbetween", "END"]', [false, {}]],
             ['[true, "mark", ["something", [true, 42], "at the end"], "END"]', [true, {}]],
             ['[true, "mark", ["something", {"true": 42}, "at the end"], "END"]', [true, {}]],
             ['[true, "mark", ["something", [{"true": 42}], "at the end"], "END"]', [true, {}]],
             ['[true, "mark", {"something": [{"true": 42}], "at the end": null}, "END"]', [true, {}]]
         ]
        ],

        // Captures
        //
        ['(?<cap1>42)',
         [
             ['42', [true, {cap1: [42]}]]
         ]
        ],
        ['(?<value>{_:[*]})',
         [
             ['{"foo": [42]}', [true, {value: [{foo: [42]}]}]]
         ]
        ],
        ['(?<object>{_:(?<value>[*])})',
         [
             ['{"foo": [42]}', [true, {value: [[42]],
                                       object: [{foo: [42]}]}]]
         ]
        ],
        ['<\
            {\
              _:[*, (?<found><42>), *]\
            }\
          >',
         [
             ['[1, 2, {"foo": 42, "bar": [{"neh": 42}]}, 41, 42]', [true, {found: [{neh: 42}]}]]
         ]
        ],
        ['<(?<c1>42), (?<c2>43)>',
         [
             ['[42, 43]', [true, {c1: [42], c2: [43]}]],
             ['[43, 42]', [true, {c1: [42], c2: [43]}]],
             ['["un", 43, 42, {}]', [true, {c1: [42], c2: [43]}]],
             ['{"foo": 43, "bar": 42}', [true, {c1: [42], c2: [43]}]],
             ['{"bar": 42, "foo": 43}', [true, {c1: [42], c2: [43]}]],
             ['{"neh": {}, "bar": 42, "foo": 43, "end": [42]}', [true, {c1: [42], c2: [43]}]],
             ['[42]', [false, {}]],
             ['[43]', [false, {}]],
             ['{"bar": 42, "foo": "43"}', [false, {}]],
             ['{"foo": 43}', [false, {}]],
             ['[[43], 42]', [false, {}]],
             ['{"bar": [42], "foo": "43"}', [false, {}]],
         ]
        ],
        ['[*, (?<c1>42), *, (?<c2>43), *]',
         [
             ['[42, 43]', [true, {c1: [42], c2: [43]}]],
             ['[43, 42]', [false, {}]],
             ['["un", 42, [], 43, {}]', [true, {c1: [42], c2: [43]}]]
         ]
        ],
        ['[*, "mark", **/[(?<cap_iter>*/42), (?<cap_struct>{_:"foo"}), *], "END"]',
         [
             ['[true, "mark", ["something", [{"true": 42}, {"bar": "foo"}, "the world\'send"]], "END"]', [true, {"cap_iter": [{"true": 42}], "cap_struct": [{"bar":"foo"}]}]]
         ]
        ],

        // Injection
        // 
        ['(!<iv1>boolean)',
         [
             ['true', [true, {}], {iv1: true}],
             ['false', [true, {}], {iv1: false}],
             ['false', [false, {}], {iv1: true}],
             ['0', [false, {}], {iv1: false}],
             ['1', [false, {}], {iv1: true}],
             ['true', [false, {}], {iv1: 1}],
             ['false', [false, {}], {iv1: 0}]
         ]],
        ['(!<iv1>string)',
         [
             ['"foo"', [true, {}], {iv1: "foo"}],
             ['"foo"', [true, {}], {iv1: new String("foo")}],
             ['"bar"', [false, {}], {iv1: "foo"}]
         ]],
        ['(!<iv1>number)',
         [
             ['42', [true, {}], {iv1: 42}],
             ['42.0', [true, {}], {iv1: 42}],
             ['42', [true, {}], {iv1: 42.0}],
             ['42.0e10', [true, {}], {iv1: 42e10}],
             ['"42"', [false, {}], {iv1: 42}]
         ]],
        ['(!<iv1>regex)',
         [
             ['"foo"', [true, {}], {iv1: new RegExp("foo")}],
             ['"foobar"', [true, {}], {iv1: new RegExp("foo")}],
             ['"foonehbarbar"', [true, {}], {iv1: new RegExp("foo.*bar")}],
             ['"foonehbarbar"', [true, {}], {iv1: new RegExp("^foo.*bar$")}],
             ['"foobar"', [true, {}], {iv1: new RegExp("^foo.*bar$")}],
             ['"HfoonehbarbarT"', [false, {}], {iv1: new RegExp("^foo.*bar$")}]
         ]
        ],
        ['[*, "mark", **/[(?<cap_iter>*/(!<ivnum>number)), (?<cap_struct>{_:(!<ivstring>string)}), *], "END"]',
         [
             ['[true, "mark", ["something", [{"true": 42}, {"bar": "foo"}, "the world\'send"]], "END"]',
              [true, {"cap_iter": [{"true": 42}], 
                      "cap_struct": [{"bar":"foo"}]}],
              {ivnum: 42, ivstring: "foo"}],
             ['[true, "mark", ["something", [{"true": false}, {"bar": "foo"}, "the world\'send"]], "END"]', [false, {}], {ivnum: 42, ivstring: "foo"}],
             ['[true, "mark", ["something", [{"true": 42}, {"bar": "neh"}, "the world\'send"]], "END"]', [false, {}], {ivnum: 42, ivstring: "foo"}]
         ]
        ]
    ];

var testCounter = 0;
tests.forEach(function(pattTest) {
    var patterns = (pattTest[0] instanceof Array) ? pattTest[0] : [pattTest[0]];
    var suite = pattTest[1];
    for (var i = 0; i < patterns.length; ++i) {
        var pattern = patterns[i];
        var matcher = jjpet.compile(pattern);
        suite.forEach(function(test) {
            var expr = test[0];
            var matchingRes = jjpet.run(JSON.parse(expr), matcher, test[2]);
            var res = JSON.stringify(matchingRes) == JSON.stringify(builders.build_matching_result.apply(null, test[1]));
            // console.log('JSON.stringify(matchingRes)', JSON.stringify(matchingRes));
            console.log('test ' + ++testCounter + '("' + pattern + '")'
                        + ' | ' + expr + ' | ' + JSON.stringify(test[1]) + ' | '
                        + ' => ' + (res ? 'PASS' : 'FAILED'));
        });
    }
});

require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = (function() {
    function build_matching_result(status, captures) {
        return {status: status,
                captures: captures};
    }
    
    function build_matcher_number(expr) {
        var expr = expr;
        
        return function(what) {
            if (typeof what != "number") {
                return build_matching_result(false, {}); // <== 
            }
            else if (what == expr) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_string(expr) {
        var expr = expr;
        
        return function(what) {
            if (typeof what != 'string') {
                return build_matching_result(false, {}); // <== 
            }
            else if (what == expr) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_regex(expr) {
        var expr = new RegExp(expr);

        return function(what) {
            if (typeof what != 'string') {
                return build_matching_result(false, {}); // <== 
            }
            else if (expr.test(what)) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_boolean(expr) {
        var expr = expr;
        
        return function(what) {
            if (typeof what != "boolean") {
                return build_matching_result(false, {}); // <== 
            }
            else if (what == expr) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_null() {
        return function(what) {
            if (what == null) {
                return build_matching_result(true, {}); // <== 
            }
            else {
                return build_matching_result(false, {}); // <== 
            }
        };
    }

    function build_matcher_any() {
        return function(what) {
            return build_matching_result(true, {}); // <== 
        };
    }

    function isObject(what) {
        return what != null &&
            what instanceof Object &&
            !(what instanceof Array);
    }

    function isArray(what) {
        return what != null &&
            what instanceof Array;
    }

    function build_matcher_object_any() {
        return function(what) {
            return build_matching_result(isObject(what), {});
        };
    };

    function melt(into, from) {
        for (key in from) {
            var entry = into[key] || [];
            entry = entry.concat(from[key]);
            into[key] = entry;
        }
        return into;
    }

    function build_matcher_pair(keyMatcher, valueMatcher) {
        var keyMatcher = keyMatcher;
        var valueMatcher = valueMatcher;
        return function(key, value, params) {
            var keyMatchingRes = keyMatcher(key, params);
            var valueMatchingRes = valueMatcher(value, params);
            if (!(keyMatchingRes.status && valueMatchingRes.status)) {
                return build_matching_result(false, {}); // <== 
            }

            return build_matching_result(true, melt(keyMatchingRes.captures, valueMatchingRes.captures)); // <== 
        };
    };

    function objectMatch(what, pairMatcher, params) {
        for (k in what) {
            var res = pairMatcher(k, what[k], params);
            if (res.status) {
                return res; // <== 
            }
        }

        return build_matching_result(false, {}); // <== 
    }

    function build_matcher_object(pairMatchers) {
        return function(what, params) {
            if (!isObject(what)) {
                return build_matching_result(false, {}); // <== 
            }

            var capAcc = {};
            for (var i = 0; i < pairMatchers.length; ++i) {
                var testRes = objectMatch(what, pairMatchers[i], params);
                if (! testRes.status) {
                    return build_matching_result(false, {}); // <== 
                }

                capAcc = melt(capAcc, testRes.captures);
            }

            return build_matching_result(true, capAcc); // <== 
        };
    };

    function build_matcher_list_empty() {
        return function(what) {
            return build_matching_result(isArray(what) && what.length == 0, {}); // <== 
        };
    };

    function build_matcher_list_any() {
        return function(what) {
            return build_matching_result(isArray(what), {}); // <== 
        };
    };

    function check_span_match(what, matchers, params) {
        var w = what,
            acc = [];
        for (var iter = 0; iter < matchers.length; ++iter) {
            var m = matchers[iter];
            if (w.length == 0) {
                var res = m(w, params),
                    stat = res[0];
                if (! stat.status) {
                    return [stat, w]; // <== 
                }
                acc.push(stat);
                var finalAcc = acc.reduce(function(a, status) {
                    return melt(a, status.captures);
                }, {});
                return [build_matching_result(true, finalAcc), w]; // <== 
            }
            else {
                var res = m(w, params),
                    stat = res[0];
                w = w.slice(1);
                if (! stat.status) {
                    return [stat, w]; // <== 
                }
                acc.push(stat);
            }
        }
        var finalAcc = acc.reduce(function(a, status) {
            return melt(a, status.captures);
        }, {});
        return [build_matching_result(true, finalAcc), w]; // <== 
    }

    function continue_until_match(what, matchers, params) {
        var res = check_span_match(what, matchers, params),
            stat = res[0];
        if (stat.status || what.length == 0) {
            // Either the span (possibly empty) matched
            // or it didn't and it is empty
            // In both case, we are finished and 'res' hold the result
            // 
            return res; // <== 
        }
        else {
            return continue_until_match(what.slice(1), matchers, params); // <== 
        }
    };

    function build_matcher_find_item(matchers) {
        return function(what, params) {
            if (isArray(what)) {
                return continue_until_match(what, matchers, params); // <== 
            }
            else {
                return [build_matching_result(false, {}), []]; // <== 
            }
        };
    };

    function build_matcher_item(matcher) {
        return function(what, params) {
            if (isArray(what)) {
                if (what.length == 0) {
                    return [matcher(what, params), []]; // <== 
                }
                else {
                    var head = what[0];
                    return [matcher(head, params), what.slice(1)]; // <== 
                }
            }
            else {
                return [build_matching_result(false, {}), []]; // <== 
            }
        };
    };

    function build_matcher_eol() {
        return function(what) {
            return build_matching_result(isArray(what) && what.length == 0, {}); // <== 
        }
    };

    function build_matcher_list(itemMatchers) {
        return function(what, params) {
            if (!isArray(what)) {
                return build_matching_result(false, {}); // <== 
            }

            var statuses = itemMatchers.reduce(function(acc, matcher) {
                var statusAcc = acc[0];
                var items = acc[1];
                var res = matcher(items, params);
                statusAcc.push(res[0]);
                return [statusAcc, res[1]]; // <== 
            }, [[], what]);

            var finalStatus = statuses[0].reduce(function(acc, status) {
                return build_matching_result(acc.status && status.status, melt(acc.captures, status.captures)); // <== 
            }, build_matching_result(true, {}));
            
            if (finalStatus.status) {
                return finalStatus; // <== 
            }

            return build_matching_result(false, {}); // <== 
        };
    };

    function build_matcher_iterable_any() {
        return function(what) {
            return build_matching_result(isObject(what) || isArray(what), {}); // <== 
        };
    }

    function objectSize(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }

    function continue_until_value_match_object(what, matcher, params, flags) {
        var acc = {},
            matched = false;
        for (var k in what) {
            var res = matcher(what[k], params);
            if (res.status) {
                if (! flags) {
                    return res; // <== no full capture. Break on first match.
                }
                matched = true;
                melt(acc, res.captures);
            }
        }

        return build_matching_result(matched, acc); // <== 
    }

    function continue_until_value_match_list(what, matcher, params, flags) {
        var acc = {},
            matched = false;
        for (var k = 0; k < what.length; ++k) {
            var res = matcher(what[k], params);
            if (res.status) {
                if (! flags) {
                    return res; // <== no full capture. Break on first match.
                }
                matched = true;
                melt(acc, res.captures);
            }
        }

        return build_matching_result(matched, acc); // <== 
    }

    function build_matcher_iterable(valueMatchers, flags) {
        return function(what, params) {
            if (!isObject(what) && !isArray(what)) {
                return build_matching_result(false, {}); // <== 
            }

            var fun = isObject(what) ?
                continue_until_value_match_object :
                continue_until_value_match_list;
            var results = valueMatchers.map(function(matcher) {
                return fun(what, matcher, params, flags); // <== 
            });

            var acc = results.reduce(function(acc, matchRes) {
                if (matchRes.status) {
                    return [melt(acc[0], matchRes.captures), acc[1]]; // <== 
                }
                return [acc[0], acc[1]+1]; // <== 
            }, [{}, 0]);

            if (acc[1] == 0) {
                return build_matching_result(true, acc[0]); // <== 
            }
            return build_matching_result(false, {}); // <== 
        };
    }

    function deep_continue_until_value_match(what, matcher, params, flags) {
        var fun = isObject(what) ?
            deep_continue_until_value_match_object :
            deep_continue_until_value_match_list;
        return fun(what, matcher, params, flags);
    }

    function deep_continue_until_value_match_object(what, matcher, params, flags) {
        var acc = {},
            matched = false;
        for (var k in what) {
            var value = what[k];
            var res = matcher(value, params);

            if (res.status) {
                if (!flags) {
                    return res; // <== 
                }
                matched = true;
            }

            melt(acc, res.captures);
            if (!isObject(value) && !isArray(value)) {
                continue; // <== 
            }
            var deepRes = deep_continue_until_value_match(value, matcher, params, flags);
            if (deepRes.status) {
                if (!flags) {
                    return deepRes; // <== 
                }
                matched = true;
            }
            
            melt(acc, deepRes.captures);
        }

        return build_matching_result(matched, acc); // <== 
    }

    function deep_continue_until_value_match_list(what, matcher, params, flags) {
        var acc = {},
            matched = false;
        for (var k = 0; k < what.length; ++k) {
            var value = what[k];
            var res = matcher(value, params);
            if (res.status) {
                if (!flags) {
                    return res; // <== 
                }
                matched = true;
            }

            melt(acc, res.captures);
            if (!isObject(value) && !isArray(value)) {
                continue; // <== 
            }
            var deepRes = deep_continue_until_value_match(value, matcher, params, flags);
            if (deepRes.status) {
                if (!flags) {
                    return deepRes; // <== 
                }
                matched = true;
            }

            melt(acc, deepRes.captures);
        }

        return build_matching_result(matched, acc); // <== 
    }

    function build_matcher_descendant(valueMatchers, flags) {
        return function(what, params) {
            if (!isObject(what) && !isArray(what)) {
                return build_matching_result(false, {}); // <== 
            }

            var fun = isObject(what) ?
                deep_continue_until_value_match_object :
                deep_continue_until_value_match_list;
            var results = valueMatchers.map(function(matcher) {
                return fun(what, matcher, params, flags); // <== 
            });

            var acc = results.reduce(function(acc, matchRes) {
                if (matchRes.status) {
                    return [melt(acc[0], matchRes.captures), acc[1]]; // <== 
                }
                return [acc[0], acc[1]+1]; // <== 
            }, [{}, 0]);

            if (acc[1] == 0) {
                return build_matching_result(true, acc[0]); // <== 
            }
            return build_matching_result(false, {}); // <== 
        };
    }

    function build_matcher_capture(name, matcher) {
        return function(what, params) {
            var res = matcher(what, params);
            if (res.status) {
                var captures = res.captures;
                var cap = captures[name] || [];
                cap = cap.concat([what]);
                captures[name] = cap;
                return build_matching_result(true, captures); // <== 
            }
            return res; // <== 
        };
    }

    var injectorsBuilders = {
        "boolean": function (name) {
            return function(what, params) {
                if (typeof what != 'boolean' ) {
                    return build_matching_result(false, {}); // <==
                }
                var injected = params[name];
                if (injected == undefined) {
                    return build_matching_result(false, {}); // <==
                }
                return build_matching_result(injected === what, {}); // <== note the strict equality
            };
        },
        "string": function (name) {
            return function(what, params) {
                if (typeof what != 'string' ) {
                    return build_matching_result(false, {}); // <==
                }
                var injected = params[name];
                if (injected == undefined) {
                    return build_matching_result(false, {}); // <==
                }
                // Here we use LOOSE equality, because, as stated in 
                //   http://stackoverflow.com/questions/359494/does-it-matter-which-equals-operator-vs-i-use-in-javascript-comparisons
                //   "abc" === new String("abc") ==> false !
                // This can lead to a wrong match result, if a injected string value is produced using String ctor.
                // 
                return build_matching_result(injected == what, {}); // <== note the LOOSE equality.
            };
        },
        "number": function (name) {
            // TODO : Add compilation param to specify if we must use strict or loose comparison.
            
            return function(what, params) {
                if (typeof what != 'number' ) {
                    return build_matching_result(false, {}); // <==
                }
                var injected = params[name];
                if (injected == undefined) {
                    return build_matching_result(false, {}); // <==
                }
                return build_matching_result(injected === what, {}); // <== note the STRICT equality.
            };
        },
        "regex": function (name) {
            return function(what, params) {
                if (typeof what != 'string' ) {
                    return build_matching_result(false, {}); // <==
                }
                var injected = params[name];
                if (injected == undefined || ! injected instanceof RegExp) {
                    return build_matching_result(false, {}); // <==
                }
                return build_matching_result(injected.test(what), {}); // <== 
            };
        }
    };

    function build_matcher_inject(name, typename) {
        return injectorsBuilders[typename](name);
    }

    return {
        build_matching_result:      build_matching_result,
        build_matcher_number:       build_matcher_number,
        build_matcher_string:       build_matcher_string,
        build_matcher_regex:        build_matcher_regex,
        build_matcher_boolean:      build_matcher_boolean,
        build_matcher_null:         build_matcher_null,
        build_matcher_any:          build_matcher_any,
        build_matcher_object_any:   build_matcher_object_any,
        build_matcher_pair:         build_matcher_pair,
        build_matcher_object:       build_matcher_object,
        build_matcher_list_empty:   build_matcher_list_empty,
        build_matcher_list_any:     build_matcher_list_any,
        build_matcher_find_item:    build_matcher_find_item,
        build_matcher_item:         build_matcher_item,
        build_matcher_eol:          build_matcher_eol,
        build_matcher_list:         build_matcher_list,
        build_matcher_iterable_any: build_matcher_iterable_any,
        build_matcher_iterable:     build_matcher_iterable,
        build_matcher_descendant:   build_matcher_descendant,
        build_matcher_capture:      build_matcher_capture,
        build_matcher_inject:       build_matcher_inject
    };
})();

},{}],"yQ6E8h":[function(require,module,exports){
module.exports = (function() {
    var builders = require('./builders.js');
    var parser = require('./spec.js');
    return {
        compile: function(pattern) {
            var matcher = parser.parse(pattern);
            return matcher; // <== 
        },
        
        run: function(json, matcher, params) {
            return matcher(json, params || {}); // <== 
        }
    }
})();

},{"./builders.js":1,"./spec.js":4}],"jjpet":[function(require,module,exports){
module.exports=require('yQ6E8h');
},{}],4:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { pattern: peg$parsepattern },
        peg$startRuleFunction  = peg$parsepattern,

        peg$c0 = peg$FAILED,
        peg$c1 = "(",
        peg$c2 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c3 = "?<",
        peg$c4 = { type: "literal", value: "?<", description: "\"?<\"" },
        peg$c5 = ">",
        peg$c6 = { type: "literal", value: ">", description: "\">\"" },
        peg$c7 = ")",
        peg$c8 = { type: "literal", value: ")", description: "\")\"" },
        peg$c9 = function(name, matcher) { return builders.build_matcher_capture(name, matcher); },
        peg$c10 = function(expr) { return expr; },
        peg$c11 = [],
        peg$c12 = /^[a-zA-Z_0-9]/,
        peg$c13 = { type: "class", value: "[a-zA-Z_0-9]", description: "[a-zA-Z_0-9]" },
        peg$c14 = "{",
        peg$c15 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c16 = "}",
        peg$c17 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c18 = function() { return builders.build_matcher_object_any(); },
        peg$c19 = ",",
        peg$c20 = { type: "literal", value: ",", description: "\",\"" },
        peg$c21 = function(head, tail) {
                    var pairMatchers = tail.reduce(function(acc, item) {
                        return acc.concat(item[2]);
                    }, [head]);
                    return builders.build_matcher_object(pairMatchers);
                },
        peg$c22 = "[",
        peg$c23 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c24 = "]",
        peg$c25 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c26 = function() { return builders.build_matcher_list_empty(); },
        peg$c27 = "*",
        peg$c28 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c29 = function() { return builders.build_matcher_list_any(); },
        peg$c30 = function(s) {
                  s.push(builders.build_matcher_item(builders.build_matcher_eol()));
                  return builders.build_matcher_list(s);
                },
        peg$c31 = function(s) {return builders.build_matcher_list(s)},
        peg$c32 = function(s, t) { return builders.build_matcher_list(s.concat(t)); },
        peg$c33 = function(t) { return builders.build_matcher_list(t); },
        peg$c34 = "<",
        peg$c35 = { type: "literal", value: "<", description: "\"<\"" },
        peg$c36 = function() { return builders.build_matcher_iterable_any(); },
        peg$c37 = "<!",
        peg$c38 = { type: "literal", value: "<!", description: "\"<!\"" },
        peg$c39 = "!>/g",
        peg$c40 = { type: "literal", value: "!>/g", description: "\"!>/g\"" },
        peg$c41 = function(head, tail) {
                    var matchers = tail.reduce(function(acc, item) {
                        return acc.concat(item[2]);
                    }, [head]);
                    return builders.build_matcher_descendant(matchers, true);
                },
        peg$c42 = "!>",
        peg$c43 = { type: "literal", value: "!>", description: "\"!>\"" },
        peg$c44 = function(head, tail) {
                    var matchers = tail.reduce(function(acc, item) {
                        return acc.concat(item[2]);
                    }, [head]);
                    return builders.build_matcher_descendant(matchers, false);
                },
        peg$c45 = ">/g",
        peg$c46 = { type: "literal", value: ">/g", description: "\">/g\"" },
        peg$c47 = function(head, tail) {
                    var matchers = tail.reduce(function(acc, item) {
                        return acc.concat(item[2]);
                    }, [head]);
                    return builders.build_matcher_iterable(matchers, true);
                },
        peg$c48 = function(head, tail) {
                    var matchers = tail.reduce(function(acc, item) {
                        return acc.concat(item[2]);
                    }, [head]);
                    return builders.build_matcher_iterable(matchers, false);
                },
        peg$c49 = "_",
        peg$c50 = { type: "literal", value: "_", description: "\"_\"" },
        peg$c51 = function() { return builders.build_matcher_any(); },
        peg$c52 = "true",
        peg$c53 = { type: "literal", value: "true", description: "\"true\"" },
        peg$c54 = function() { return builders.build_matcher_boolean(true); },
        peg$c55 = "false",
        peg$c56 = { type: "literal", value: "false", description: "\"false\"" },
        peg$c57 = function() { return builders.build_matcher_boolean(false); },
        peg$c58 = "null",
        peg$c59 = { type: "literal", value: "null", description: "\"null\"" },
        peg$c60 = function() { return builders.build_matcher_null(); },
        peg$c61 = function(number) { return builders.build_matcher_number(parseFloat(number)); },
        peg$c62 = function(string) { return builders.build_matcher_string(string); },
        peg$c63 = function(regex) { return builders.build_matcher_regex(regex); },
        peg$c64 = "!<",
        peg$c65 = { type: "literal", value: "!<", description: "\"!<\"" },
        peg$c66 = function(name, typename) { return builders.build_matcher_inject(name, typename); },
        peg$c67 = ":",
        peg$c68 = { type: "literal", value: ":", description: "\":\"" },
        peg$c69 = function(key, valueMatcher) { var keyMatcher = builders.build_matcher_string(key);
                  return builders.build_matcher_pair(keyMatcher, valueMatcher); },
        peg$c70 = function(key) { var keyMatcher = builders.build_matcher_string(key);
                  return builders.build_matcher_pair(keyMatcher, builders.build_matcher_any()); },
        peg$c71 = function(valueMatcher) { return builders.build_matcher_pair(builders.build_matcher_any(), valueMatcher); },
        peg$c72 = function(h, t) {
                  return t.reduce(function(acc, item) {
                    acc.push(builders.build_matcher_item(item[3]));
                    return acc;
                  }, [builders.build_matcher_item(h)]);
                },
        peg$c73 = null,
        peg$c74 = function(h, t, loose) {
                  var m = t.reduce(function(acc, item) {
                    acc.push(item[3]);
                    return acc;
                  }, [h]);

                  if (loose == null) {
                    var eol = builders.build_matcher_item(builders.build_matcher_eol());
                    m[m.length-1].push(eol);
                  }
                  return m.reduce(function(acc, item) {
                    acc.push(builders.build_matcher_find_item(item));
                    return acc;
                  }, []);
                },
        peg$c75 = function(s) {
                  return s;
                },
        peg$c76 = "-",
        peg$c77 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c78 = ".",
        peg$c79 = { type: "literal", value: ".", description: "\".\"" },
        peg$c80 = /^[0-9]/,
        peg$c81 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c82 = /^[1-9]/,
        peg$c83 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c84 = /^[eE]/,
        peg$c85 = { type: "class", value: "[eE]", description: "[eE]" },
        peg$c86 = /^[+\-]/,
        peg$c87 = { type: "class", value: "[+\\-]", description: "[+\\-]" },
        peg$c88 = "\"",
        peg$c89 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c90 = function(chars) { return chars; },
        peg$c91 = "#",
        peg$c92 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c93 = function(string) { return string; },
        peg$c94 = "string",
        peg$c95 = { type: "literal", value: "string", description: "\"string\"" },
        peg$c96 = "number",
        peg$c97 = { type: "literal", value: "number", description: "\"number\"" },
        peg$c98 = "boolean",
        peg$c99 = { type: "literal", value: "boolean", description: "\"boolean\"" },
        peg$c100 = "regex",
        peg$c101 = { type: "literal", value: "regex", description: "\"regex\"" },
        peg$c102 = function(chars) { return chars.join(""); },
        peg$c103 = "\\n",
        peg$c104 = { type: "literal", value: "\\n", description: "\"\\\\n\"" },
        peg$c105 = function() { return '\n'; },
        peg$c106 = "\\r",
        peg$c107 = { type: "literal", value: "\\r", description: "\"\\\\r\"" },
        peg$c108 = function() { return '\r'; },
        peg$c109 = "\\t",
        peg$c110 = { type: "literal", value: "\\t", description: "\"\\\\t\"" },
        peg$c111 = function() { return '\t'; },
        peg$c112 = "\\b",
        peg$c113 = { type: "literal", value: "\\b", description: "\"\\\\b\"" },
        peg$c114 = function() { return '\b'; },
        peg$c115 = "\\f",
        peg$c116 = { type: "literal", value: "\\f", description: "\"\\\\f\"" },
        peg$c117 = function() { return '\f'; },
        peg$c118 = "\\s",
        peg$c119 = { type: "literal", value: "\\s", description: "\"\\\\s\"" },
        peg$c120 = function() { return '\s'; },
        peg$c121 = "\\\\",
        peg$c122 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
        peg$c123 = function() { return '\\'; },
        peg$c124 = "\\\"",
        peg$c125 = { type: "literal", value: "\\\"", description: "\"\\\\\\\"\"" },
        peg$c126 = function() { return '\"'; },
        peg$c127 = void 0,
        peg$c128 = "\\",
        peg$c129 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c130 = function(char) { return char; },
        peg$c131 = { type: "any", description: "any character" },
        peg$c132 = "\\u",
        peg$c133 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c134 = /^[0-9a-fA-F]/,
        peg$c135 = { type: "class", value: "[0-9a-fA-F]", description: "[0-9a-fA-F]" },
        peg$c136 = /^[ \n\t\r]/,
        peg$c137 = { type: "class", value: "[ \\n\\t\\r]", description: "[ \\n\\t\\r]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsepattern() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13;

      s0 = peg$currPos;
      s1 = peg$parsespaces();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 40) {
          s2 = peg$c1;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c2); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsespaces();
          if (s3 !== peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c3) {
              s4 = peg$c3;
              peg$currPos += 2;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parsespaces();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsename();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parsespaces();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 62) {
                      s8 = peg$c5;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c6); }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsespaces();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseexpr();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parsespaces();
                          if (s11 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 41) {
                              s12 = peg$c7;
                              peg$currPos++;
                            } else {
                              s12 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c8); }
                            }
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parsespaces();
                              if (s13 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                s1 = peg$c9(s6, s10);
                                s0 = s1;
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsespaces();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseexpr();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsespaces();
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c10(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parsename() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c12.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c13); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c12.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c13); }
          }
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseexpr() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c14;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespaces();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 125) {
            s3 = peg$c16;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c17); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c18();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c14;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c15); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parsespaces();
          if (s2 !== peg$FAILED) {
            s3 = peg$parsepair();
            if (s3 !== peg$FAILED) {
              s4 = peg$parsespaces();
              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 44) {
                  s7 = peg$c19;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c20); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsespaces();
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parsepair();
                    if (s9 !== peg$FAILED) {
                      s7 = [s7, s8, s9];
                      s6 = s7;
                    } else {
                      peg$currPos = s6;
                      s6 = peg$c0;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$c0;
                  }
                } else {
                  peg$currPos = s6;
                  s6 = peg$c0;
                }
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 44) {
                    s7 = peg$c19;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c20); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parsespaces();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parsepair();
                      if (s9 !== peg$FAILED) {
                        s7 = [s7, s8, s9];
                        s6 = s7;
                      } else {
                        peg$currPos = s6;
                        s6 = peg$c0;
                      }
                    } else {
                      peg$currPos = s6;
                      s6 = peg$c0;
                    }
                  } else {
                    peg$currPos = s6;
                    s6 = peg$c0;
                  }
                }
                if (s5 !== peg$FAILED) {
                  s6 = peg$parsespaces();
                  if (s6 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s7 = peg$c16;
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c17); }
                    }
                    if (s7 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c21(s3, s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c22;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c23); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsespaces();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s3 = peg$c24;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c25); }
              }
              if (s3 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c26();
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 91) {
              s1 = peg$c22;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c23); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsespaces();
              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 42) {
                  s3 = peg$c27;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c28); }
                }
                if (s3 !== peg$FAILED) {
                  s4 = peg$parsespaces();
                  if (s4 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s5 = peg$c24;
                      peg$currPos++;
                    } else {
                      s5 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c25); }
                    }
                    if (s5 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c29();
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 91) {
                s1 = peg$c22;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c23); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parsespaces();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parsespan();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parsespaces();
                    if (s4 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 93) {
                        s5 = peg$c24;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c25); }
                      }
                      if (s5 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c30(s3);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 91) {
                  s1 = peg$c22;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c23); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parsespaces();
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parsespan();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parsespaces();
                      if (s4 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 44) {
                          s5 = peg$c19;
                          peg$currPos++;
                        } else {
                          s5 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c20); }
                        }
                        if (s5 !== peg$FAILED) {
                          s6 = peg$parsespaces();
                          if (s6 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 42) {
                              s7 = peg$c27;
                              peg$currPos++;
                            } else {
                              s7 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c28); }
                            }
                            if (s7 !== peg$FAILED) {
                              s8 = peg$parsespaces();
                              if (s8 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 93) {
                                  s9 = peg$c24;
                                  peg$currPos++;
                                } else {
                                  s9 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c25); }
                                }
                                if (s9 !== peg$FAILED) {
                                  peg$reportedPos = s0;
                                  s1 = peg$c31(s3);
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 91) {
                    s1 = peg$c22;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c23); }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parsespaces();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parsespan();
                      if (s3 !== peg$FAILED) {
                        s4 = peg$parsespaces();
                        if (s4 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 44) {
                            s5 = peg$c19;
                            peg$currPos++;
                          } else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c20); }
                          }
                          if (s5 !== peg$FAILED) {
                            s6 = peg$parsespaces();
                            if (s6 !== peg$FAILED) {
                              s7 = peg$parsetail();
                              if (s7 !== peg$FAILED) {
                                peg$reportedPos = s0;
                                s1 = peg$c32(s3, s7);
                                s0 = s1;
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 91) {
                      s1 = peg$c22;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c23); }
                    }
                    if (s1 !== peg$FAILED) {
                      s2 = peg$parsespaces();
                      if (s2 !== peg$FAILED) {
                        s3 = peg$parsetail();
                        if (s3 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c33(s3);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 60) {
                        s1 = peg$c34;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c35); }
                      }
                      if (s1 !== peg$FAILED) {
                        s2 = peg$parsespaces();
                        if (s2 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 62) {
                            s3 = peg$c5;
                            peg$currPos++;
                          } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c6); }
                          }
                          if (s3 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c36();
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 2) === peg$c37) {
                          s1 = peg$c37;
                          peg$currPos += 2;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c38); }
                        }
                        if (s1 !== peg$FAILED) {
                          s2 = peg$parsespaces();
                          if (s2 !== peg$FAILED) {
                            s3 = peg$parsepattern();
                            if (s3 !== peg$FAILED) {
                              s4 = peg$parsespaces();
                              if (s4 !== peg$FAILED) {
                                s5 = [];
                                s6 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 44) {
                                  s7 = peg$c19;
                                  peg$currPos++;
                                } else {
                                  s7 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c20); }
                                }
                                if (s7 !== peg$FAILED) {
                                  s8 = peg$parsespaces();
                                  if (s8 !== peg$FAILED) {
                                    s9 = peg$parsepattern();
                                    if (s9 !== peg$FAILED) {
                                      s7 = [s7, s8, s9];
                                      s6 = s7;
                                    } else {
                                      peg$currPos = s6;
                                      s6 = peg$c0;
                                    }
                                  } else {
                                    peg$currPos = s6;
                                    s6 = peg$c0;
                                  }
                                } else {
                                  peg$currPos = s6;
                                  s6 = peg$c0;
                                }
                                while (s6 !== peg$FAILED) {
                                  s5.push(s6);
                                  s6 = peg$currPos;
                                  if (input.charCodeAt(peg$currPos) === 44) {
                                    s7 = peg$c19;
                                    peg$currPos++;
                                  } else {
                                    s7 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c20); }
                                  }
                                  if (s7 !== peg$FAILED) {
                                    s8 = peg$parsespaces();
                                    if (s8 !== peg$FAILED) {
                                      s9 = peg$parsepattern();
                                      if (s9 !== peg$FAILED) {
                                        s7 = [s7, s8, s9];
                                        s6 = s7;
                                      } else {
                                        peg$currPos = s6;
                                        s6 = peg$c0;
                                      }
                                    } else {
                                      peg$currPos = s6;
                                      s6 = peg$c0;
                                    }
                                  } else {
                                    peg$currPos = s6;
                                    s6 = peg$c0;
                                  }
                                }
                                if (s5 !== peg$FAILED) {
                                  s6 = peg$parsespaces();
                                  if (s6 !== peg$FAILED) {
                                    if (input.substr(peg$currPos, 4) === peg$c39) {
                                      s7 = peg$c39;
                                      peg$currPos += 4;
                                    } else {
                                      s7 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c40); }
                                    }
                                    if (s7 !== peg$FAILED) {
                                      peg$reportedPos = s0;
                                      s1 = peg$c41(s3, s5);
                                      s0 = s1;
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$c0;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$c0;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.substr(peg$currPos, 2) === peg$c37) {
                            s1 = peg$c37;
                            peg$currPos += 2;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c38); }
                          }
                          if (s1 !== peg$FAILED) {
                            s2 = peg$parsespaces();
                            if (s2 !== peg$FAILED) {
                              s3 = peg$parsepattern();
                              if (s3 !== peg$FAILED) {
                                s4 = peg$parsespaces();
                                if (s4 !== peg$FAILED) {
                                  s5 = [];
                                  s6 = peg$currPos;
                                  if (input.charCodeAt(peg$currPos) === 44) {
                                    s7 = peg$c19;
                                    peg$currPos++;
                                  } else {
                                    s7 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c20); }
                                  }
                                  if (s7 !== peg$FAILED) {
                                    s8 = peg$parsespaces();
                                    if (s8 !== peg$FAILED) {
                                      s9 = peg$parsepattern();
                                      if (s9 !== peg$FAILED) {
                                        s7 = [s7, s8, s9];
                                        s6 = s7;
                                      } else {
                                        peg$currPos = s6;
                                        s6 = peg$c0;
                                      }
                                    } else {
                                      peg$currPos = s6;
                                      s6 = peg$c0;
                                    }
                                  } else {
                                    peg$currPos = s6;
                                    s6 = peg$c0;
                                  }
                                  while (s6 !== peg$FAILED) {
                                    s5.push(s6);
                                    s6 = peg$currPos;
                                    if (input.charCodeAt(peg$currPos) === 44) {
                                      s7 = peg$c19;
                                      peg$currPos++;
                                    } else {
                                      s7 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c20); }
                                    }
                                    if (s7 !== peg$FAILED) {
                                      s8 = peg$parsespaces();
                                      if (s8 !== peg$FAILED) {
                                        s9 = peg$parsepattern();
                                        if (s9 !== peg$FAILED) {
                                          s7 = [s7, s8, s9];
                                          s6 = s7;
                                        } else {
                                          peg$currPos = s6;
                                          s6 = peg$c0;
                                        }
                                      } else {
                                        peg$currPos = s6;
                                        s6 = peg$c0;
                                      }
                                    } else {
                                      peg$currPos = s6;
                                      s6 = peg$c0;
                                    }
                                  }
                                  if (s5 !== peg$FAILED) {
                                    s6 = peg$parsespaces();
                                    if (s6 !== peg$FAILED) {
                                      if (input.substr(peg$currPos, 2) === peg$c42) {
                                        s7 = peg$c42;
                                        peg$currPos += 2;
                                      } else {
                                        s7 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c43); }
                                      }
                                      if (s7 !== peg$FAILED) {
                                        peg$reportedPos = s0;
                                        s1 = peg$c44(s3, s5);
                                        s0 = s1;
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$c0;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$c0;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$c0;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 60) {
                              s1 = peg$c34;
                              peg$currPos++;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c35); }
                            }
                            if (s1 !== peg$FAILED) {
                              s2 = peg$parsespaces();
                              if (s2 !== peg$FAILED) {
                                s3 = peg$parsepattern();
                                if (s3 !== peg$FAILED) {
                                  s4 = peg$parsespaces();
                                  if (s4 !== peg$FAILED) {
                                    s5 = [];
                                    s6 = peg$currPos;
                                    if (input.charCodeAt(peg$currPos) === 44) {
                                      s7 = peg$c19;
                                      peg$currPos++;
                                    } else {
                                      s7 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c20); }
                                    }
                                    if (s7 !== peg$FAILED) {
                                      s8 = peg$parsespaces();
                                      if (s8 !== peg$FAILED) {
                                        s9 = peg$parsepattern();
                                        if (s9 !== peg$FAILED) {
                                          s7 = [s7, s8, s9];
                                          s6 = s7;
                                        } else {
                                          peg$currPos = s6;
                                          s6 = peg$c0;
                                        }
                                      } else {
                                        peg$currPos = s6;
                                        s6 = peg$c0;
                                      }
                                    } else {
                                      peg$currPos = s6;
                                      s6 = peg$c0;
                                    }
                                    while (s6 !== peg$FAILED) {
                                      s5.push(s6);
                                      s6 = peg$currPos;
                                      if (input.charCodeAt(peg$currPos) === 44) {
                                        s7 = peg$c19;
                                        peg$currPos++;
                                      } else {
                                        s7 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c20); }
                                      }
                                      if (s7 !== peg$FAILED) {
                                        s8 = peg$parsespaces();
                                        if (s8 !== peg$FAILED) {
                                          s9 = peg$parsepattern();
                                          if (s9 !== peg$FAILED) {
                                            s7 = [s7, s8, s9];
                                            s6 = s7;
                                          } else {
                                            peg$currPos = s6;
                                            s6 = peg$c0;
                                          }
                                        } else {
                                          peg$currPos = s6;
                                          s6 = peg$c0;
                                        }
                                      } else {
                                        peg$currPos = s6;
                                        s6 = peg$c0;
                                      }
                                    }
                                    if (s5 !== peg$FAILED) {
                                      s6 = peg$parsespaces();
                                      if (s6 !== peg$FAILED) {
                                        if (input.substr(peg$currPos, 3) === peg$c45) {
                                          s7 = peg$c45;
                                          peg$currPos += 3;
                                        } else {
                                          s7 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$c46); }
                                        }
                                        if (s7 !== peg$FAILED) {
                                          peg$reportedPos = s0;
                                          s1 = peg$c47(s3, s5);
                                          s0 = s1;
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$c0;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$c0;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$c0;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$c0;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.charCodeAt(peg$currPos) === 60) {
                                s1 = peg$c34;
                                peg$currPos++;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c35); }
                              }
                              if (s1 !== peg$FAILED) {
                                s2 = peg$parsespaces();
                                if (s2 !== peg$FAILED) {
                                  s3 = peg$parsepattern();
                                  if (s3 !== peg$FAILED) {
                                    s4 = peg$parsespaces();
                                    if (s4 !== peg$FAILED) {
                                      s5 = [];
                                      s6 = peg$currPos;
                                      if (input.charCodeAt(peg$currPos) === 44) {
                                        s7 = peg$c19;
                                        peg$currPos++;
                                      } else {
                                        s7 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c20); }
                                      }
                                      if (s7 !== peg$FAILED) {
                                        s8 = peg$parsespaces();
                                        if (s8 !== peg$FAILED) {
                                          s9 = peg$parsepattern();
                                          if (s9 !== peg$FAILED) {
                                            s7 = [s7, s8, s9];
                                            s6 = s7;
                                          } else {
                                            peg$currPos = s6;
                                            s6 = peg$c0;
                                          }
                                        } else {
                                          peg$currPos = s6;
                                          s6 = peg$c0;
                                        }
                                      } else {
                                        peg$currPos = s6;
                                        s6 = peg$c0;
                                      }
                                      while (s6 !== peg$FAILED) {
                                        s5.push(s6);
                                        s6 = peg$currPos;
                                        if (input.charCodeAt(peg$currPos) === 44) {
                                          s7 = peg$c19;
                                          peg$currPos++;
                                        } else {
                                          s7 = peg$FAILED;
                                          if (peg$silentFails === 0) { peg$fail(peg$c20); }
                                        }
                                        if (s7 !== peg$FAILED) {
                                          s8 = peg$parsespaces();
                                          if (s8 !== peg$FAILED) {
                                            s9 = peg$parsepattern();
                                            if (s9 !== peg$FAILED) {
                                              s7 = [s7, s8, s9];
                                              s6 = s7;
                                            } else {
                                              peg$currPos = s6;
                                              s6 = peg$c0;
                                            }
                                          } else {
                                            peg$currPos = s6;
                                            s6 = peg$c0;
                                          }
                                        } else {
                                          peg$currPos = s6;
                                          s6 = peg$c0;
                                        }
                                      }
                                      if (s5 !== peg$FAILED) {
                                        s6 = peg$parsespaces();
                                        if (s6 !== peg$FAILED) {
                                          if (input.charCodeAt(peg$currPos) === 62) {
                                            s7 = peg$c5;
                                            peg$currPos++;
                                          } else {
                                            s7 = peg$FAILED;
                                            if (peg$silentFails === 0) { peg$fail(peg$c6); }
                                          }
                                          if (s7 !== peg$FAILED) {
                                            peg$reportedPos = s0;
                                            s1 = peg$c48(s3, s5);
                                            s0 = s1;
                                          } else {
                                            peg$currPos = s0;
                                            s0 = peg$c0;
                                          }
                                        } else {
                                          peg$currPos = s0;
                                          s0 = peg$c0;
                                        }
                                      } else {
                                        peg$currPos = s0;
                                        s0 = peg$c0;
                                      }
                                    } else {
                                      peg$currPos = s0;
                                      s0 = peg$c0;
                                    }
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$c0;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 95) {
                                  s1 = peg$c49;
                                  peg$currPos++;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c50); }
                                }
                                if (s1 !== peg$FAILED) {
                                  peg$reportedPos = s0;
                                  s1 = peg$c51();
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  if (input.substr(peg$currPos, 4) === peg$c52) {
                                    s1 = peg$c52;
                                    peg$currPos += 4;
                                  } else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c53); }
                                  }
                                  if (s1 !== peg$FAILED) {
                                    peg$reportedPos = s0;
                                    s1 = peg$c54();
                                  }
                                  s0 = s1;
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.substr(peg$currPos, 5) === peg$c55) {
                                      s1 = peg$c55;
                                      peg$currPos += 5;
                                    } else {
                                      s1 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c56); }
                                    }
                                    if (s1 !== peg$FAILED) {
                                      peg$reportedPos = s0;
                                      s1 = peg$c57();
                                    }
                                    s0 = s1;
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      if (input.substr(peg$currPos, 4) === peg$c58) {
                                        s1 = peg$c58;
                                        peg$currPos += 4;
                                      } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) { peg$fail(peg$c59); }
                                      }
                                      if (s1 !== peg$FAILED) {
                                        peg$reportedPos = s0;
                                        s1 = peg$c60();
                                      }
                                      s0 = s1;
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        s1 = peg$parsenumber();
                                        if (s1 !== peg$FAILED) {
                                          peg$reportedPos = s0;
                                          s1 = peg$c61(s1);
                                        }
                                        s0 = s1;
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$currPos;
                                          s1 = peg$parsestring();
                                          if (s1 !== peg$FAILED) {
                                            peg$reportedPos = s0;
                                            s1 = peg$c62(s1);
                                          }
                                          s0 = s1;
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            s1 = peg$parseregex();
                                            if (s1 !== peg$FAILED) {
                                              peg$reportedPos = s0;
                                              s1 = peg$c63(s1);
                                            }
                                            s0 = s1;
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$currPos;
                                              if (input.charCodeAt(peg$currPos) === 40) {
                                                s1 = peg$c1;
                                                peg$currPos++;
                                              } else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) { peg$fail(peg$c2); }
                                              }
                                              if (s1 !== peg$FAILED) {
                                                s2 = peg$parsespaces();
                                                if (s2 !== peg$FAILED) {
                                                  if (input.substr(peg$currPos, 2) === peg$c64) {
                                                    s3 = peg$c64;
                                                    peg$currPos += 2;
                                                  } else {
                                                    s3 = peg$FAILED;
                                                    if (peg$silentFails === 0) { peg$fail(peg$c65); }
                                                  }
                                                  if (s3 !== peg$FAILED) {
                                                    s4 = peg$parsespaces();
                                                    if (s4 !== peg$FAILED) {
                                                      s5 = peg$parsename();
                                                      if (s5 !== peg$FAILED) {
                                                        s6 = peg$parsespaces();
                                                        if (s6 !== peg$FAILED) {
                                                          if (input.charCodeAt(peg$currPos) === 62) {
                                                            s7 = peg$c5;
                                                            peg$currPos++;
                                                          } else {
                                                            s7 = peg$FAILED;
                                                            if (peg$silentFails === 0) { peg$fail(peg$c6); }
                                                          }
                                                          if (s7 !== peg$FAILED) {
                                                            s8 = peg$parsespaces();
                                                            if (s8 !== peg$FAILED) {
                                                              s9 = peg$parsetype();
                                                              if (s9 !== peg$FAILED) {
                                                                s10 = peg$parsespaces();
                                                                if (s10 !== peg$FAILED) {
                                                                  if (input.charCodeAt(peg$currPos) === 41) {
                                                                    s11 = peg$c7;
                                                                    peg$currPos++;
                                                                  } else {
                                                                    s11 = peg$FAILED;
                                                                    if (peg$silentFails === 0) { peg$fail(peg$c8); }
                                                                  }
                                                                  if (s11 !== peg$FAILED) {
                                                                    peg$reportedPos = s0;
                                                                    s1 = peg$c66(s5, s9);
                                                                    s0 = s1;
                                                                  } else {
                                                                    peg$currPos = s0;
                                                                    s0 = peg$c0;
                                                                  }
                                                                } else {
                                                                  peg$currPos = s0;
                                                                  s0 = peg$c0;
                                                                }
                                                              } else {
                                                                peg$currPos = s0;
                                                                s0 = peg$c0;
                                                              }
                                                            } else {
                                                              peg$currPos = s0;
                                                              s0 = peg$c0;
                                                            }
                                                          } else {
                                                            peg$currPos = s0;
                                                            s0 = peg$c0;
                                                          }
                                                        } else {
                                                          peg$currPos = s0;
                                                          s0 = peg$c0;
                                                        }
                                                      } else {
                                                        peg$currPos = s0;
                                                        s0 = peg$c0;
                                                      }
                                                    } else {
                                                      peg$currPos = s0;
                                                      s0 = peg$c0;
                                                    }
                                                  } else {
                                                    peg$currPos = s0;
                                                    s0 = peg$c0;
                                                  }
                                                } else {
                                                  peg$currPos = s0;
                                                  s0 = peg$c0;
                                                }
                                              } else {
                                                peg$currPos = s0;
                                                s0 = peg$c0;
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsepair() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsestring();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespaces();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s3 = peg$c67;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c68); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsespaces();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepattern();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c69(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsestring();
        if (s1 !== peg$FAILED) {
          s2 = peg$parsespaces();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s3 = peg$c67;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c68); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parsespaces();
              if (s4 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 95) {
                  s5 = peg$c49;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c50); }
                }
                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c70(s1);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 95) {
            s1 = peg$c49;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c50); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsespaces();
            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 58) {
                s3 = peg$c67;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c68); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parsespaces();
                if (s4 !== peg$FAILED) {
                  s5 = peg$parsepattern();
                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c71(s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        }
      }

      return s0;
    }

    function peg$parsespan() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsepattern();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parsespaces();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c19;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parsespaces();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsepattern();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parsespaces();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c19;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c20); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parsespaces();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsepattern();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c72(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsetail() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parsespan_find();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parsespaces();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c19;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parsespaces();
            if (s6 !== peg$FAILED) {
              s7 = peg$parsespan_find();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parsespaces();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c19;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c20); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parsespaces();
              if (s6 !== peg$FAILED) {
                s7 = peg$parsespan_find();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$c0;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsespaces();
          if (s3 !== peg$FAILED) {
            s4 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 44) {
              s5 = peg$c19;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c20); }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parsespaces();
              if (s6 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 42) {
                  s7 = peg$c27;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c28); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsespaces();
                  if (s8 !== peg$FAILED) {
                    s5 = [s5, s6, s7, s8];
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
            if (s4 === peg$FAILED) {
              s4 = peg$c73;
            }
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s5 = peg$c24;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c25); }
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c74(s1, s2, s4);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsespan_find() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 42) {
        s1 = peg$c27;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c28); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespaces();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c19;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parsespaces();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsespan();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c75(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parseint();
      if (s2 !== peg$FAILED) {
        s3 = peg$parsefrac();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseexp();
          if (s4 !== peg$FAILED) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parseint();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsefrac();
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c0;
        }
        if (s1 !== peg$FAILED) {
          s1 = input.substring(s0, peg$currPos);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          s2 = peg$parseint();
          if (s2 !== peg$FAILED) {
            s3 = peg$parseexp();
            if (s3 !== peg$FAILED) {
              s2 = [s2, s3];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$c0;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c0;
          }
          if (s1 !== peg$FAILED) {
            s1 = input.substring(s0, peg$currPos);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseint();
            if (s1 !== peg$FAILED) {
              s1 = input.substring(s0, peg$currPos);
            }
            s0 = s1;
          }
        }
      }

      return s0;
    }

    function peg$parseint() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsedigit19();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsedigits();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsedigit();
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c76;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c77); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parsedigit19();
            if (s2 !== peg$FAILED) {
              s3 = peg$parsedigits();
              if (s3 !== peg$FAILED) {
                s1 = [s1, s2, s3];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 45) {
              s1 = peg$c76;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c77); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parsedigit();
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          }
        }
      }

      return s0;
    }

    function peg$parsefrac() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c78;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c79); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsedigits();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseexp() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parsee();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsedigits();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedigits() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsedigit();
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parsedigit();
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c80.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c81); }
      }

      return s0;
    }

    function peg$parsedigit19() {
      var s0;

      if (peg$c82.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c83); }
      }

      return s0;
    }

    function peg$parsee() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (peg$c84.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c85); }
      }
      if (s1 !== peg$FAILED) {
        if (peg$c86.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c87); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c73;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsestring() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c88;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c89); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsechars();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c88;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c89); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c90(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseregex() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c91;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c92); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsespaces();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsestring();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c93(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsetype() {
      var s0;

      if (input.substr(peg$currPos, 6) === peg$c94) {
        s0 = peg$c94;
        peg$currPos += 6;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c95); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 6) === peg$c96) {
          s0 = peg$c96;
          peg$currPos += 6;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c97); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 7) === peg$c98) {
            s0 = peg$c98;
            peg$currPos += 7;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c99); }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 5) === peg$c100) {
              s0 = peg$c100;
              peg$currPos += 5;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c101); }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsechars() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsechar();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c102(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2;

      s0 = peg$parsecodepoint();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c103) {
          s1 = peg$c103;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c104); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c105();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c106) {
            s1 = peg$c106;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c107); }
          }
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c108();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c109) {
              s1 = peg$c109;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c110); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c111();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c112) {
                s1 = peg$c112;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c113); }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c114();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c115) {
                  s1 = peg$c115;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c116); }
                }
                if (s1 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c117();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 2) === peg$c118) {
                    s1 = peg$c118;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c119); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c120();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 2) === peg$c121) {
                      s1 = peg$c121;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c122); }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c123();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 2) === peg$c124) {
                        s1 = peg$c124;
                        peg$currPos += 2;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c125); }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c126();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$currPos;
                        peg$silentFails++;
                        if (input.charCodeAt(peg$currPos) === 34) {
                          s2 = peg$c88;
                          peg$currPos++;
                        } else {
                          s2 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c89); }
                        }
                        if (s2 === peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 92) {
                            s2 = peg$c128;
                            peg$currPos++;
                          } else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c129); }
                          }
                        }
                        peg$silentFails--;
                        if (s2 === peg$FAILED) {
                          s1 = peg$c127;
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c0;
                        }
                        if (s1 !== peg$FAILED) {
                          s2 = peg$parseanychar();
                          if (s2 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c130(s2);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseanychar() {
      var s0;

      if (input.length > peg$currPos) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c131); }
      }

      return s0;
    }

    function peg$parsecodepoint() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c132) {
        s1 = peg$c132;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c133); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsehexa();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsehexa();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsehexa();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsehexa();
              if (s5 !== peg$FAILED) {
                s1 = [s1, s2, s3, s4, s5];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsehexa() {
      var s0;

      if (peg$c134.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c135); }
      }

      return s0;
    }

    function peg$parsespaces() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsespace();
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsespace();
      }

      return s0;
    }

    function peg$parsespace() {
      var s0;

      if (peg$c136.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c137); }
      }

      return s0;
    }


        var builders = require('./builders.js');


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();

},{"./builders.js":1}]},{},[])
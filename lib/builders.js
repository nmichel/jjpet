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

    function continue_until_match(what, matcher, params) {
        if (what.length == 0) {
            return [matcher(what, params), []]; // <== 
        }
        else {
            var head = what[0];
            var tail = what.slice(1);
            var res = matcher(head, params);
            if (res.status) {
                return [res, tail]; // <== 
            }
            else {
                return continue_until_match(tail, matcher, params); // <== 
            }
        }
    };

    function build_matcher_find_item(matcher) {
        return function(what, params) {
            if (isArray(what)) {
                return continue_until_match(what, matcher, params); // <== 
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
        var acc = {};
        for (var k in what) {
            var res = matcher(what[k], params);
            if (res.status) {
                if (! flags) {
                    return res; // <== no full capture. Break on first match.
                }
                melt(acc, res.captures);
            }
        }

        var matched = Object.keys(acc).length > 0;
        return build_matching_result(matched, acc); // <== 
    }

    function continue_until_value_match_list(what, matcher, params, flags) {
        var acc = {};
        for (var k = 0; k < what.length; ++k) {
            var res = matcher(what[k], params);
            if (res.status) {
                if (! flags) {
                    return res; // <== no full capture. Break on first match.
                }
                melt(acc, res.captures);
            }
        }

        var matched = Object.keys(acc).length > 0;
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

    function deep_continue_until_value_match(what, matcher, params) {
        var fun = isObject(what) ?
            deep_continue_until_value_match_object :
            deep_continue_until_value_match_list;
        return fun(what, matcher, params);
    }

    function deep_continue_until_value_match_object(what, matcher, params) {
        for (var k in what) {
            var value = what[k];
            var res = matcher(value, params);
            if (res.status) {
                return res; // <== 
            }
            else {
                if (!isObject(value) && !isArray(value)) {
                    continue; // <== 
                }
                var deepRes = deep_continue_until_value_match(value, matcher, params);
                if (deepRes.status) {
                    return deepRes; // <== 
                }
                else {
                    continue; // <== 
                }
            }
        }

        return build_matching_result(false, {}); // <== 
    }

    function deep_continue_until_value_match_list(what, matcher, params) {
        for (var k = 0; k < what.length; ++k) {
            var value = what[k];
            var res = matcher(value, params);
            if (res.status) {
                return res; // <== 
            }
            else {
                if (!isObject(value) && !isArray(value)) {
                    continue; // <== 
                }
                var deepRes = deep_continue_until_value_match(value, matcher, params);
                if (deepRes.status) {
                    return deepRes; // <== 
                }
                else {
                    continue; // <== 
                }
            }
        }

        return build_matching_result(false, {}); // <== 
    }

    function build_matcher_descendant(valueMatchers) {
        return function(what, params) {
            if (!isObject(what) && !isArray(what)) {
                return build_matching_result(false, {}); // <== 
            }

            var fun = isObject(what) ?
                deep_continue_until_value_match_object :
                deep_continue_until_value_match_list;
            var results = valueMatchers.map(function(matcher) {
                return fun(what, matcher, params); // <== 
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

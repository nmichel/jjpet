module.exports = (function() {
function build_matching_result(status, captures) {
    return {status: status,
            captures: captures};
}

function build_matcher_number(expr) {
    var expr = expr;

    return function(what) {
        if (typeof what != "number") {
            return build_matching_result(false, []); // <== 
        }
        else if (what == expr) {
            return build_matching_result(true, []); // <== 
        }
        else {
            return build_matching_result(false, []); // <== 
        }
    };
}

function build_matcher_string(expr) {
    var expr = expr;
    
    return function(what) {
        if (typeof what != "string") {
            return build_matching_result(false, []); // <== 
        }
        else if (what == expr) {
            return build_matching_result(true, []); // <== 
        }
        else {
            return build_matching_result(false, []); // <== 
        }
    };
}

function build_matcher_regex(expr) {
    var expr = new RegExp(expr);

    return function(what) {
        if (typeof what != "string") {
            return build_matching_result(false, []); // <== 
        }
        else if (expr.test(what)) {
            return build_matching_result(true, []); // <== 
        }
        else {
            return build_matching_result(false, []); // <== 
        }
    };
}

function build_matcher_boolean(expr) {
    var expr = expr;
    
    return function(what) {
        if (typeof what != "boolean") {
            return build_matching_result(false, []); // <== 
        }
        else if (what == expr) {
            return build_matching_result(true, []); // <== 
        }
        else {
            return build_matching_result(false, []); // <== 
        }
    };
}

function build_matcher_null() {
    return function(what) {
        if (what == null) {
            return build_matching_result(true, []); // <== 
        }
        else {
            return build_matching_result(false, []); // <== 
        }
    };
}

function build_matcher_any() {
    return function(what) {
        return build_matching_result(true, []); // <== 
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
        return build_matching_result(isObject(what), []);
    };
};

function build_matcher_pair(keyMatcher, valueMatcher) {
    var keyMatcher = keyMatcher;
    var valueMatcher = valueMatcher;
    return function(key, value) {
        var keyMatchingRes = keyMatcher(key);
        var valueMatchingRes = valueMatcher(value);
        if (!(keyMatchingRes.status && valueMatchingRes.status)) {
            return build_matching_result(false, []); // <== 
        }

        return build_matching_result(true, keyMatchingRes.captures.concat(valueMatchingRes.captures)); // <== 
    };
};

function objectMatch(what, pairMatcher) {
    for (k in what) {
        var res = pairMatcher(k, what[k]);
        if (res.status) {
            return res; // <== 
        }
    }

    return build_matching_result(false, []); // <== 
}

function build_matcher_object(pairMatchers) {
    return function(what) {
        if (!isObject(what)) {
            return build_matching_result(false, []); // <== 
        }

        var capAcc = [];
        for (var i = 0; i < pairMatchers.length; ++i) {
            var testRes = objectMatch(what, pairMatchers[i]);
            if (! testRes.status) {
                return build_matching_result(false, []); // <== 
            }

            capAcc.concat(testRes.captures);
        }

        return build_matching_result(true, capAcc); // <== 
    };
};

function build_matcher_list_empty() {
    return function(what) {
        return build_matching_result(isArray(what) && what.length == 0, []); // <== 
    };
};

function build_matcher_list_any() {
    return function(what) {
        return build_matching_result(isArray(what), []); // <== 
    };
};

function continue_until_match(what, matcher) {
    if (what.length == 0) {
        return [matcher(what), []]; // <== 
    }
    else {
        var head = what[0];
        var tail = what.slice(1);
        var res = matcher(head);
        if (res.status) {
            return [res, tail]; // <== 
        }
        else {
            return continue_until_match(tail, matcher); // <== 
        }
    }
};

function build_matcher_find_item(matcher) {
    return function(what) {
        if (isArray(what)) {
            return continue_until_match(what, matcher); // <== 
        }
        else {
            return [build_matching_result(false, []), []]; // <== 
        }
    };
};

function build_matcher_item(matcher) {
    return function(what) {
        if (isArray(what)) {
            if (what.length == 0) {
                return [matcher(what), []]; // <== 
            }
            else {
                var head = what[0];
                return [matcher(head), what.slice(1)]; // <== 
            }
        }
        else {
            return [build_matching_result(false, []), []]; // <== 
        }
    };
};

function build_matcher_eol() {
    return function(what) {
        return build_matching_result(isArray(what) && what.length == 0, []); // <== 
    }
};

function build_matcher_list(itemMatchers) {
    return function(what) {
        if (!isArray(what)) {
            return build_matching_result(false, []); // <== 
        }

        var statuses = itemMatchers.reduce(function(acc, matcher) {
            var statusAcc = acc[0];
            var items = acc[1];
            var res = matcher(items);
            statusAcc.push(res[0]);
            return [statusAcc, res[1]]; // <== 
        }, [[], what]);

        var finalStatus = statuses[0].reduce(function(acc, status) {
            return build_matching_result(acc.status && status.status, acc.captures.concat(status.captures)); // <== 
        }, build_matching_result(true, []));
        
        if (finalStatus.status) {
            return finalStatus; // <== 
        }

        return build_matching_result(false, []); // <== 
    };
};

function build_matcher_iterable_any() {
    return function(what) {
        return build_matching_result(isObject(what) || isArray(what), []); // <== 
    };
}

function objectSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function continue_until_value_match_object(what, matcher) {
    for (var k in what) {
        var res = matcher(what[k]);
        if (res.status) {
            return res; // <== 
        }
    }

    return build_matching_result(false, []); // <== 
}

function continue_until_value_match_list(what, matcher) {
    for (var k = 0; k < what.length; ++k) {
        var res = matcher(what[k]);
        if (res.status) {
            return res; // <== 
        }
    }

    return build_matching_result(false, []); // <== 
}

function build_matcher_iterable(valueMatchers) {
    return function(what) {
        if (!isObject(what) && !isArray(what)) {
            return build_matching_result(false, []); // <== 
        }

        var fun = isObject(what) ?
            continue_until_value_match_object :
            continue_until_value_match_list;
        var results = valueMatchers.map(function(matcher) {
            return fun(what, matcher);
        });

        var acc = results.reduce(function(acc, matchRes) {
            if (matchRes.status) {
                return [acc[0].concat(matchRes.captures), acc[1]]; // <== 
            }
            return [acc[0], acc[1]+1]; // <== 
        }, [[], 0]);

        if (acc[1] == 0) {
            return build_matching_result(true, acc[0]); // <== 
        }
        return build_matching_result(false, []); // <== 
    };
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
    build_matcher_iterable:     build_matcher_iterable
};
})();

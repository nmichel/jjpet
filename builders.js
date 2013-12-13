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
    var pairMatchers = pairMatchers;
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
    build_matcher_list_any:     build_matcher_list_any
};
})();

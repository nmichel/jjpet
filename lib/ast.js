module.exports = (function() {
    var code = 1,
        NODE_KIND = {
            NUMBER:         code++,
            STRING:         code++,
            REGEX:          code++,
            BOOLEAN:        code++,
            NULL:           code++,
            ANY:            code++,
            OBJECT_ANY:     code++,
            PAIR:           code++,
            OBJECT:         code++,
            LIST_EMPTY:     code++,
            LIST_ANY:       code++,
            FIND_SPAN:      code++,
            ITEM:           code++,
            SPAN:           code++,
            LIST:           code++,
            ITERABLE_ANY:   code++,
            ITERABLE:       code++,
            DESCENDANT:     code++,
            CAPTURE:        code++,
            INJECT:         code++
        },
        NODE_STR = {}
        
    for (var k in NODE_KIND) {
        NODE_STR[NODE_KIND[k]] = k
    }

    function node_kind_to_string(c) {
        return NODE_STR[c] || "?"
    }
    
    function build_matcher_number(value) {
        return {
            type: NODE_KIND.NUMBER,
            value: value
        }
    }    

    function build_matcher_string(value) {
        return {
            type: NODE_KIND.STRING,
            value: value
        }
    }
    
    function build_matcher_regex(value) {
        return {
            type: NODE_KIND.REGEX,
            value: value
        }
    }
    
    function build_matcher_boolean(value) {
        return {
            type: NODE_KIND.BOOLEAN,
            value: value
        }
    }

    function build_matcher_null() {
        return {
            type: NODE_KIND.NULL
        }        
    }

    function build_matcher_any() {
        return {
            type: NODE_KIND.ANY
        }
    }

    function build_matcher_object_any() {
        return {
            type: NODE_KIND.OBJECT_ANY
        }
    }
    
    function build_matcher_pair(key, value) {
        return {
            type: NODE_KIND.PAIR,
            key: key,
            value: value
        }
    }

    function build_matcher_object(pairs) {
        return {
            type: NODE_KIND.OBJECT,
            pairs: pairs
        }
    }
    
    function build_matcher_list_empty() {
        return {
            type: NODE_KIND.LIST_EMPTY
        }
    }
    
    function build_matcher_list_any() {
        return {
            type: NODE_KIND.LIST_ANY
        }
    }
    
    function build_matcher_find_span(expr) {
        return {
            type: NODE_KIND.FIND_SPAN,
            expr: expr
        }
    }
    
    function build_matcher_item(expr) {
        return {
            type: NODE_KIND.ITEM,
            expr: expr
        }
    }
    
    function build_matcher_span(items, strict) {
        return {
            type: NODE_KIND.SPAN,
            items: items,
            strict: strict
        }
    }
    
    function build_matcher_list(segments) {
        return {
            type: NODE_KIND.LIST,
            segments: segments
        }        
    }
    
    function build_matcher_iterable_any() {
        return {
            type: NODE_KIND.ITERABLE_ANY
        }
    }

    function build_matcher_iterable(exprs, strict) {
        return {
            type: NODE_KIND.ITERABLE,
            items: exprs,
            strict: strict
        }
    }
    
    function build_matcher_descendant(exprs, strict) {
        return {
            type: NODE_KIND.DESCENDANT,
            items: exprs,
            strict: strict
        }
    }

    function build_matcher_capture(name, expr) {
        return {
            type: NODE_KIND.CAPTURE,
            name: name,
            expr: expr
        }
    }
    
    function build_matcher_inject(name, typename) {
        return {
            type: NODE_KIND.INJECT,
            name: name,
            typename: typename
        }
    }
    
    return {
        NODE_KIND:                  NODE_KIND,
        node_kind_to_string:        node_kind_to_string,
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
        build_matcher_find_span:    build_matcher_find_span,
        build_matcher_item:         build_matcher_item,
        build_matcher_span:         build_matcher_span,
        build_matcher_list:         build_matcher_list,
        build_matcher_iterable_any: build_matcher_iterable_any,
        build_matcher_iterable:     build_matcher_iterable,
        build_matcher_descendant:   build_matcher_descendant,
        build_matcher_capture:      build_matcher_capture,
        build_matcher_inject:       build_matcher_inject
    }
})()

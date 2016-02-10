module.exports = (function() {
    var ast = require('./ast.js'),
        builders = require('./builders.js'),
        generators = {}

    function generate(ast) {
        return (generators[ast.type] || generate_boom)(ast)
    }

    function generate_number(ast) {
        return builders.build_matcher_number(ast.value)
    }
    
    function generate_string(ast) {
        return builders.build_matcher_string(ast.value)
    }
    
    function generate_regex(ast) {
        return builders.build_matcher_regex(ast.value)
    }
    
    function generate_boolean(ast) {
        return builders.build_matcher_boolean(ast.value)
    }
    
    function generate_null(ast) {
        return builders.build_matcher_null()
    }
    
    function generate_any(ast) {
        return builders.build_matcher_any()
    }
    
    function generate_object_any(ast) {
        return builders.build_matcher_object_any()
    }
    
    function generate_pair(ast) {
        return builders.build_matcher_pair(generate(ast.key), generate(ast.value))
    }
    
    function generate_object(ast) {
        var pms = ast.pairs.map(function(p) {
            return generate(p)
        })
        return builders.build_matcher_object(pms)
    }
    
    function generate_list_empty(ast) {
        return builders.build_matcher_list_empty()
    }
    
    function generate_list_any(ast) {
        return builders.build_matcher_list_any()
    }
    
    function generate_find_span(ast) {
        return builders.build_matcher_find_span(generate(ast.expr))
    }
    
    function generate_item(ast) {
        return builders.build_matcher_item(generate(ast.expr))
    }
    
    function generate_span(ast) {
        var ims = ast.items.map(function(p) {
            return generate(p)
        })
        return builders.build_matcher_span(ims, ast.strict)
    }
    
    function generate_list(ast) {
        var sms = ast.segments.map(function(p) {
            return generate(p)
        })
        return builders.build_matcher_list(sms)
    }
    
    function generate_iterable_any(ast) {
        return builders.build_matcher_iterable_any()
    }
    
    function generate_iterable(ast) {
        var ims = ast.items.map(function(p) {
            return generate(p)
        })
        return builders.build_matcher_iterable(ims, ast.strict)
    }
    
    function generate_descendant(ast) {
        var ims = ast.items.map(function(p) {
            return generate(p)
        })
        return builders.build_matcher_descendant(ims, ast.strict)
    }
    
    function generate_capture(ast) {
        return builders.build_matcher_capture(ast.name, generate(ast.expr))
    }
    
    function generate_inject(ast) {
        return builders.build_matcher_inject(ast.name, ast.typename)
    }

    generators[ast.NODE_KIND.NUMBER] =          generate_number
    generators[ast.NODE_KIND.STRING] =          generate_string
    generators[ast.NODE_KIND.REGEX] =           generate_regex
    generators[ast.NODE_KIND.BOOLEAN] =         generate_boolean
    generators[ast.NODE_KIND.NULL] =            generate_null
    generators[ast.NODE_KIND.ANY] =             generate_any
    generators[ast.NODE_KIND.OBJECT_ANY] =      generate_object_any
    generators[ast.NODE_KIND.PAIR] =            generate_pair
    generators[ast.NODE_KIND.OBJECT] =          generate_object
    generators[ast.NODE_KIND.LIST_EMPTY] =      generate_list_empty
    generators[ast.NODE_KIND.LIST_ANY] =        generate_list_any
    generators[ast.NODE_KIND.FIND_SPAN] =       generate_find_span
    generators[ast.NODE_KIND.ITEM] =            generate_item
    generators[ast.NODE_KIND.SPAN] =            generate_span
    generators[ast.NODE_KIND.LIST] =            generate_list
    generators[ast.NODE_KIND.ITERABLE_ANY] =    generate_iterable_any
    generators[ast.NODE_KIND.ITERABLE] =        generate_iterable
    generators[ast.NODE_KIND.DESCENDANT] =      generate_descendant
    generators[ast.NODE_KIND.CAPTURE] =         generate_capture
    generators[ast.NODE_KIND.INJECT] =          generate_inject

    function generate_boom(ast) {
        throw "no generator for node of type " + ast.type // <== 
    }

    return  {
        generate: generate
    }
})()


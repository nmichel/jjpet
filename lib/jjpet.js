module.exports = (function() {
    var builders = require('./builders.js'),
        parser = require('./spec.js')

    function generate(ast) {
        return function(what, params) {
            return builders.build_matching_result(true, {}) // <== 
        }
    }

    return {
        parse: function(pattern) {
            return parser.parse(pattern)
        },
        
        generate: function(ast) {
            return generate(ast)
        },

        compile: function(pattern) {
            return generate(parser.parse(pattern)) // <== 
        },
        
        run: function(json, matcher, params) {
            return matcher(json, params || {}); // <== 
        }
    }
})();

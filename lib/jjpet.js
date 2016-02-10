module.exports = (function() {
    var parser = require('./spec.js'),
        generator = require('./generator.js')

    return {
        parse: function(pattern) {
            return parser.parse(pattern) // <== 
        },
        
        generate: function(ast) {
            return generator.generate(ast) // <== 
        },

        compile: function(pattern) {
            return generator.generate(parser.parse(pattern)) // <== 
        },
        
        run: function(json, matcher, params) {
            return matcher(json, params || {}) // <== 
        }
    }
})()

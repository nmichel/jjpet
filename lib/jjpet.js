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

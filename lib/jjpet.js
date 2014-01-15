module.exports = (function() {
    var builders = require('./builders.js');
    var parser = require('./spec.js');
    return {
        compile: function(pattern) {
            var matcher = parser.parse(pattern);
            return matcher; // <== 
        },
        
        run: function(what, matcher, params) {
            var object = (what instanceof String) ? JSON.parse(what) : what;
            return matcher(object, params || {}); // <== 
        }
    }
})();

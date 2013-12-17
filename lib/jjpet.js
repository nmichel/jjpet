function jjpet() {
    var builders = require('./builders.js');
    var parser = require('./spec.js');
    var jjpet = {};

    jjpet.compile = function(pattern) {
        var matcher = parser.parse(pattern);
        return matcher; // <== 
    };

    return jjpet;
};

module.exports = jjpet;

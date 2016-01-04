var jjpet = require("jjpet"),
    assert = require("assert")

var epm = jjpet.compile('<[*, (?<pred>_), true]>/g'),
    node = {a: [1, 2, true],
            b: [3, true],
            c: [4, false],
            d: [1, 2, "hello world!", true],
            e: [true],
            f: ["last", true]},
    s = jjpet.run(node, epm)

assert(s.status == true)
assert(s.captures.pred[0] == 2)
assert(s.captures.pred[1] == 3)
assert(s.captures.pred[2] == "hello world!")
assert(s.captures.pred[3] == "last")

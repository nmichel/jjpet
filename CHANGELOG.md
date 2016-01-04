# 0.2.1

### New feature(s)
* Add ```tonicExample.js``` file for ```npm/Tonic``` integration.

# 0.2.0

### Bug fix(es)

* Empty list ```[]``` used to match pattern ```[_]```. Shouldn't.

# 0.1.0

### Bug fix(es)
* Fix generator for list matching : matching functions produced for patterns like ```'[*, 42, "foo"]'``` were flawed.

### Breaking change(s)
* Remove shorten pattern forms ```*/``` and ```**/``` because they lead to ambiguous cases when combined with global search marker. E.g. ```*/**/42/g``` is ambiguous when it comes to know to which between ```*/``` and ```**/``` the ```/g``` tag applies to.

### New feature(s)
* Add new pattern form ```<! c1, c2, ... cn !>[/g]```, enhanced version of now deprecated shorten form ```**/c``` with possibly several conditions.

# 0.0.4

### New feature(s)
* global search : marker ```'/g'``` in patterns ```<...>/g```, ```*/.../g```, and ```**/.../g``` indicates a full-length search for matches. Don't stop on first match. Useful only when capturing.


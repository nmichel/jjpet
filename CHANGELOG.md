# master

### Bug fix(es)
* Fix generator for list matching : matching functions produced for patterns like ```'[*, 42, "foo"]'``` were flawed.

### Breaking change(s)
* 

### New feature(s)
* 

# 0.0.4

### New feature(s)
* global search : marker ```'/g'``` in patterns ```<...>/g```, ```*/.../g```, and ```**/.../g``` indicates a full-length search for matches. Don't stop on first match. Useful only when capturing.


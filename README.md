#jjpet

Matching JSON nodes in javascript.

jjpet is a javascript port of Erlang [ejpet](https://github.com/nmichel/ejpet).

[![Build Status](https://travis-ci.org/nmichel/jjpet.png)](https://travis-ci.org/nmichel/jjpet)


#What for ?

Kind of regular expression applied to JSON documents.

* Find if a JSON document has some structural properties, and possibly extract some information.
* Useful to extract small data pieces from large JSON documents.
* Efficient filtering of JSON nodes in real time.


#Quick start

Install (using npm)

```shell
$ npm install jjpet
```

Start nodejs REPL

```shell
$ node
```

Check installation is ok

```javascript
> var jjpet = require('jjpet');
undefined
> var m = jjpet.compile('[*, "foo", *]');
undefined
> jjpet.run(JSON.parse('["foo"]'), m);
{ status: true, captures: [] }
```


#How ?

Express what you want to match using a simple expression language.


##Expression syntax

See [ejpet expressions](https://github.com/nmichel/ejpet/blob/master/README.md#expression-syntax)

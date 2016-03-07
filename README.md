# jjpet

Matching JSON nodes in javascript.

jjpet is a javascript port of Erlang [ejpet](https://github.com/nmichel/ejpet).

[![Build Status](https://travis-ci.org/nmichel/jjpet.png)](https://travis-ci.org/nmichel/jjpet)


# What for ?

Kind of regular expression applied to JSON documents.

* Find if a JSON document has some structural properties, and possibly extract some information.
* Useful to extract small data pieces from large JSON documents.
* Efficient filtering of JSON nodes in real time.


# Quick start

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
{ status: true, captures: {} }
```

# How ?

Express what you want to match using a simple expression language.

## Expression syntax

See [ejpet expressions](https://github.com/nmichel/ejpet/blob/master/README.md#expression-syntax)

## AST

```jjpet``` module exposes ```parse(pattern)``` which returns the AST build from ```pattern```. Use it to transform the AST built
from a pattern expression, and then use function ```generate(ast)``` to produce the corresponding  match function.

## Captures

API function `jjpet.run` returns captures as an object where keys are capture names found in the pattern, and values are arrays
 of matched JSON subparts.

```javascript
> var jjpet = require('jjpet');
undefined
> var m = jjpet.compile('[*, (?<c1>42), *, (?<c2>43), *]');
undefined
> jjpet.run(JSON.parse('["un", 42, [], 43, {}]'), m);
{ status: true,
  captures: { c1: [ 42 ], c2: [ 43 ] } }
```

## Injections

It is possible to provide some matching values at match-time, through parameter injection forms like `(!<param_name>param_type)`, where `param_type` may be `number`, `string`, `boolean` and `regex`.
API function `ejpet.run` allows for passing parameter values as an array which keys are parameter names, and values are parameter values.

```javascript
> var jjpet = require('jjpet')
undefined
> m = jjpet.compile('(!<howmuch>number)')
undefined
> jjpet.run(JSON.parse('42'), m, {howmuch: 42})
{ status: true, captures: {} }
> jjpet.run(JSON.parse('43'), m, {howmuch: 42})
{ status: false, captures: {} }
> jjpet.run(JSON.parse('42'), m, {howmuch: 43})
{ status: false, captures: {} }
```

## Captures AND injections

`jjpet` allows combination of both captures and injections.

```javascript
> var jjpet = require('jjpet')
undefined
> m = jjpet.compile('[*, (!<howmuch>number), *, (?<struct>{"number":(!<howmuch>number)}), *]')
undefined
> jjpet.run(JSON.parse('[41, 42, 43, {"number": 42}]'), m, {howmuch: 42})
{ status: true,
  captures: { struct : [ { number: 42 } ] } }
> jjpet.run(JSON.parse('[41, 43, {"number": 42}]'), m, {howmuch: 42})
{ status: false, captures: {} }
```

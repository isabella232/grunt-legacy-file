/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var grunt = require('grunt');
var File = require('..');
var file;

describe('file.isMatch():', function () {
  beforeEach(function () {
    file = new File({grunt: grunt});
  });

  it('basic matching:', function () {
    assert.equal(file.isMatch('*.js', 'foo.js'), true);
    assert.equal(file.isMatch('*.js', ['foo.js']), true);
    assert.equal(file.isMatch('*.js', ['foo.js', 'bar.css']), true);
    assert.equal(file.isMatch(['*.js', '*.css'], 'foo.js'), true);
    assert.equal(file.isMatch(['*.js', '*.css'], ['foo.js']), true);
    assert.equal(file.isMatch(['*.js', '*.css'], ['foo.js', 'bar.css']), true);
  });

  it('no matches:', function () {
    assert.notEqual(file.isMatch('*.js', 'foo.css'), true);
    assert.notEqual(file.isMatch('*.js', ['foo.css', 'bar.css']), true);
    assert.notEqual(file.isMatch(null, 'foo.css'), true);
    assert.notEqual(file.isMatch('*.js', null), true);
    assert.notEqual(file.isMatch([], 'foo.css'), true);
    assert.notEqual(file.isMatch('*.js', []), true);
  });
});

describe('options.matchBase():', function () {
  it('should matchBase (minimatch) when specified.', function () {
    assert.equal(file.isMatch({matchBase: true}, '*.js', ['baz/xyz.js']), true);
  });

  it('should not matchBase (minimatch) by default.', function () {
    assert.notEqual(file.isMatch('*.js', ['baz/xyz.js']), true);
  });
});

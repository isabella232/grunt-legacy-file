/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var file = require('..');

describe('file.match():', function () {
  it('Should return empty set if a required argument is missing or an empty set.', function () {
    assert.deepEqual(file.match(null, null), []);
    assert.deepEqual(file.match({}, null, null), []);
    assert.deepEqual(file.match(null, 'foo.js'), []);
    assert.deepEqual(file.match('*.js', null), []);
    assert.deepEqual(file.match({}, null, 'foo.js'), []);
    assert.deepEqual(file.match({}, '*.js', null), []);
    assert.deepEqual(file.match({}, [], 'foo.js'), []);
    assert.deepEqual(file.match({}, '*.js', []), []);
    assert.deepEqual(file.match(null, ['foo.js']), []);
    assert.deepEqual(file.match(['*.js'], null), []);
    assert.deepEqual(file.match({}, null, ['foo.js']), []);
    assert.deepEqual(file.match({}, ['*.js'], null), []);
  });
});

describe('basic matching:', function () {
  it('should match correctly.', function () {
    assert.deepEqual(file.match('*.js', 'foo.js'), ['foo.js']);
    assert.deepEqual(file.match('*.js', ['foo.js']), ['foo.js']);
    assert.deepEqual(file.match('*.js', ['foo.js', 'bar.css']), ['foo.js']);
    assert.deepEqual(file.match(['*.js', '*.css'], 'foo.js'), ['foo.js']);
    assert.deepEqual(file.match(['*.js', '*.css'], ['foo.js']), ['foo.js']);
    assert.deepEqual(file.match(['*.js', '*.css'], ['foo.js', 'bar.css']), ['foo.js', 'bar.css']);
  });

  it('should fail to match.', function () {
    assert.deepEqual(file.match('*.js', 'foo.css'), []);
    assert.deepEqual(file.match('*.js', ['foo.css', 'bar.css']), []);
  });
});

describe('basic matching:', function () {
  it('unique: should return a uniqued set:', function () {
    assert.deepEqual(file.match('*.js', ['foo.js', 'foo.js']), ['foo.js']);
    assert.deepEqual(file.match(['*.js', '*.*'], ['foo.js', 'foo.js']), ['foo.js']);
  });

  it('flatten: should process nested pattern arrays correctly:', function () {
    assert.deepEqual(file.match([['*.js', '*.css'], ['*.*', '*.js'] ], ['foo.js', 'bar.css']), ['foo.js', 'bar.css']);
  });
});

describe('exclusion patterns:', function () {
  it('solitary exclusion should match nothing:', function () {
    assert.deepEqual(file.match(['!*.js'], ['foo.js', 'bar.js']), []);
  });

  it('exclusion should cancel match', function () {
    assert.deepEqual(file.match(['*.js', '!*.js'], ['foo.js', 'bar.js']), []);
  });

  it('partial exclusion should partially cancel match:', function () {
    assert.deepEqual(file.match(['*.js', '!f*.js'], ['foo.js', 'bar.js', 'baz.js']), ['bar.js', 'baz.js']);
  });

  it('should respect the order og inclusion / exclusion:', function () {
    assert.deepEqual(file.match(['*.js', '!*.js', 'b*.js'], ['foo.js', 'bar.js', 'baz.js']), ['bar.js', 'baz.js']);
    assert.deepEqual(file.match(['*.js', '!f*.js', '*.js'], ['foo.js', 'bar.js', 'baz.js']), ['bar.js', 'baz.js', 'foo.js']);
  });
});

describe('options.matchBase (minimatch):', function () {
  it('should match the basename of a file path when matchBase is enabled.', function () {
    assert.deepEqual(file.match({matchBase: true}, '*.js', ['foo.js', 'bar', 'baz/xyz.js']), ['foo.js', 'baz/xyz.js']);
  });

  it('should match the basename of a file path by default.', function () {
    assert.deepEqual(file.match('*.js', ['foo.js', 'bar', 'baz/xyz.js']), ['foo.js']);
  });

  it('should match the basename of a file path when matchBase is disabled.', function () {
    assert.deepEqual(file.match({matchBase: false}, '*.js', ['foo.js', 'bar', 'baz/xyz.js']), ['foo.js']);
  });
});

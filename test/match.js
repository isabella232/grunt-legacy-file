/*
 * grunt-legacy-file <http://gruntjs.com/grunt-legacy-file>
 *
 * Copyright (c) 2015, "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');
var file = require('..');

describe('file.match():', function () {
  it('Should return empty set if a required argument is missing or an empty set.', function () {
    file.match(null, null).should.eql([]);
    file.match({}, null, null).should.eql([]);
    file.match(null, 'foo.js').should.eql([]);
    file.match('*.js', null).should.eql([]);
    file.match({}, null, 'foo.js').should.eql([]);
    file.match({}, '*.js', null).should.eql([]);
    file.match({}, [], 'foo.js').should.eql([]);
    file.match({}, '*.js', []).should.eql([]);
    file.match(null, ['foo.js']).should.eql([]);
    file.match(['*.js'], null).should.eql([]);
    file.match({}, null, ['foo.js']).should.eql([]);
    file.match({}, ['*.js'], null).should.eql([]);
  });
});

describe('basic matching:', function () {
  it('should match correctly.', function () {
    file.match('*.js', 'foo.js').should.eql(['foo.js']);
    file.match('*.js', ['foo.js']).should.eql(['foo.js']);
    file.match('*.js', ['foo.js', 'bar.css']).should.eql(['foo.js']);
    file.match(['*.js', '*.css'], 'foo.js').should.eql(['foo.js']);
    file.match(['*.js', '*.css'], ['foo.js']).should.eql(['foo.js']);
    file.match(['*.js', '*.css'], ['foo.js', 'bar.css']).should.eql(['foo.js', 'bar.css']);
  });

  it('should fail to match.', function () {
    file.match('*.js', 'foo.css').should.eql([]);
    file.match('*.js', ['foo.css', 'bar.css']).should.eql([]);
  });
});

describe('basic matching:', function () {
  it('unique: should return a uniqued set:', function () {
    file.match('*.js', ['foo.js', 'foo.js']).should.eql(['foo.js']);
    file.match(['*.js', '*.*'], ['foo.js', 'foo.js']).should.eql(['foo.js']);
  });

  it('flatten: should process nested pattern arrays correctly:', function () {
    file.match([['*.js', '*.css'], ['*.*', '*.js'] ], ['foo.js', 'bar.css']).should.eql(['foo.js', 'bar.css']);
  });
});

describe('exclusion patterns:', function () {
  it('solitary exclusion should match nothing:', function () {
    file.match(['!*.js'], ['foo.js', 'bar.js']).should.eql([]);
  });

  it('exclusion should cancel match', function () {
    file.match(['*.js', '!*.js'], ['foo.js', 'bar.js']).should.eql([]);
  });

  it('partial exclusion should partially cancel match:', function () {
    file.match(['*.js', '!f*.js'], ['foo.js', 'bar.js', 'baz.js']).should.eql(['bar.js', 'baz.js']);
  });

  it('should respect the order og inclusion / exclusion:', function () {
    file.match(['*.js', '!*.js', 'b*.js'], ['foo.js', 'bar.js', 'baz.js']).should.eql(['bar.js', 'baz.js']);
    file.match(['*.js', '!f*.js', '*.js'], ['foo.js', 'bar.js', 'baz.js']).should.eql(['bar.js', 'baz.js', 'foo.js']);
  });
});

describe('options.matchBase (minimatch):', function () {
  it('should match the basename of a file path when matchBase is enabled.', function () {
    file.match({matchBase: true}, '*.js', ['foo.js', 'bar', 'baz/xyz.js']).should.eql(['foo.js', 'baz/xyz.js']);
  });

  it('should match the basename of a file path by default.', function () {
    file.match('*.js', ['foo.js', 'bar', 'baz/xyz.js']).should.eql(['foo.js']);
  });

  it('should match the basename of a file path when matchBase is disabled.', function () {
    file.match({matchBase: false}, '*.js', ['foo.js', 'bar', 'baz/xyz.js']).should.eql(['foo.js']);
  });
});
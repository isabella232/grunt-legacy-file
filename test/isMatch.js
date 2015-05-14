/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

require('should');
var file = require('..');

describe('file.isMatch():', function () {
  it('basic matching:', function () {
    file.isMatch('*.js', 'foo.js').should.be.true;
    file.isMatch('*.js', ['foo.js']).should.be.true;
    file.isMatch('*.js', ['foo.js', 'bar.css']).should.be.true;
    file.isMatch(['*.js', '*.css'], 'foo.js').should.be.true;
    file.isMatch(['*.js', '*.css'], ['foo.js']).should.be.true;
    file.isMatch(['*.js', '*.css'], ['foo.js', 'bar.css']).should.be.true;
  });

  it('no matches:', function () {
    file.isMatch('*.js', 'foo.css').should.be.false;
    file.isMatch('*.js', ['foo.css', 'bar.css']).should.be.false;
    file.isMatch(null, 'foo.css').should.be.false;
    file.isMatch('*.js', null).should.be.false;
    file.isMatch([], 'foo.css').should.be.false;
    file.isMatch('*.js', []).should.be.false;
  });
});

describe('options.matchBase():', function () {
  it('should matchBase (minimatch) when specified.', function () {
    file.isMatch({matchBase: true}, '*.js', ['baz/xyz.js']).should.be.true;
  });

  it('should not matchBase (minimatch) by default.', function () {
    file.isMatch('*.js', ['baz/xyz.js']).should.be.false;
  });
});

/*!
 * grunt-legacy-file <http://gruntjs.com/grunt-legacy-file>
 *
 * Copyright (c) 2015, "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

require('should');
var fs = require('fs');
var path = require('path');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var file = require('..');

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('file.exists():', function () {
  it('should return `true` when a file exists:', function () {
    file.exists('test/fixtures/octocat.png').should.be.true;
  });
  it('should work for paths passes as segments:', function () {
    file.exists('test', 'fixtures', 'octocat.png').should.be.true;
  });
  it('should work for directories:', function () {
    file.exists('test/fixtures').should.be.true;
  });
  it('should work for file symlinks:', function () {
    file.exists(path.join(tempdir.path, 'octocat.png')).should.be.true;
  });
  it('should work for directory symlinks:', function () {
    file.exists(path.join(tempdir.path, 'expand')).should.be.true;
  });

  it('should return `false` when a file does not exist:', function () {
    file.exists('test/fixtures/does/not/exist/fooo.js').should.be.false;
  });
  it('should return `false` when a directory does not exist:', function () {
    file.exists('test/fixtures/does/not/exist').should.be.false;
  });
});
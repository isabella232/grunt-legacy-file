/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var fs = require('fs');
var grunt = require('grunt');
var path = require('path');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var File = require('..');
var file;

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('file.exists():', function () {
  beforeEach(function () {
    file = new File({grunt: grunt, log: grunt.log});
  });

  it('should return `true` when a file exists:', function () {
    assert.equal(file.exists('test/fixtures/octocat.png'), true);
  });
  it('should work for paths passes as segments:', function () {
    assert.equal(file.exists('test', 'fixtures', 'octocat.png'), true);
  });
  it('should work for directories:', function () {
    assert.equal(file.exists('test/fixtures'), true);
  });
  it('should work for file symlinks:', function () {
    assert.equal(file.exists(path.join(tempdir.path, 'octocat.png')), true);
  });
  it('should work for directory symlinks:', function () {
    assert.equal(file.exists(path.join(tempdir.path, 'expand')), true);
  });

  it('should return `false` when a file does not exist:', function () {
    assert.notEqual(file.exists('test/fixtures/does/not/exist/fooo.js'), true);
  });
  it('should return `false` when a directory does not exist:', function () {
    assert.notEqual(file.exists('test/fixtures/does/not/exist'), true);
  });
});

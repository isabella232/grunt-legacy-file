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

describe('file.expand():', function () {
  beforeEach(function (cb) {
    this.cwd = process.cwd();
    process.chdir('test/fixtures/expand');
    cb();
  });
  afterEach(function (cb) {
    process.chdir(this.cwd);
    cb();
  });

  it('.isLink():', function () {
    test.equals(file.isLink('test/fixtures/octocat.png'), false, 'files are not links.');
    test.equals(file.isLink('test/fixtures'), false, 'directories are not links.');
    test.ok(file.isLink(path.join(tempdir.path, 'octocat.png')), 'file links are links.');
    test.ok(file.isLink(path.join(tempdir.path, 'expand')), 'directory links are links.');
    test.ok(file.isLink(tempdir.path, 'octocat.png'), 'should work for paths in parts.');
    test.equals(file.isLink('test/fixtures/does/not/exist'), false, 'nonexistent files are not links.');
  });

  it('.isDir():', function () {
    test.equals(file.isDir('test/fixtures/octocat.png'), false, 'files are not directories.');
    test.ok(file.isDir('test/fixtures'), 'directories are directories.');
    test.ok(file.isDir('test', 'fixtures'), 'should work for paths in parts.');
    test.equals(file.isDir(path.join(tempdir.path, 'octocat.png')), false, 'file links are not directories.');
    test.ok(file.isDir(path.join(tempdir.path, 'expand')), 'directory links are directories.');
    test.equals(file.isDir('test/fixtures/does/not/exist'), false, 'nonexistent files are not directories.');
  });

  it('.isFile():', function () {
    test.ok(file.isFile('test/fixtures/octocat.png'), 'files are files.');
    test.ok(file.isFile('test', 'fixtures', 'octocat.png'), 'should work for paths in parts.');
    test.equals(file.isFile('test/fixtures'), false, 'directories are not files.');
    test.ok(file.isFile(path.join(tempdir.path, 'octocat.png')), 'file links are files.');
    test.equals(file.isFile(path.join(tempdir.path, 'expand')), false, 'directory links are not files.');
    test.equals(file.isFile('test/fixtures/does/not/exist'), false, 'nonexistent files are not files.');
  });
});

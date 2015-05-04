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

describe('path utils:', function () {
  beforeEach(function (cb) {
    this.cwd = process.cwd();
    process.chdir('test/fixtures/expand');
    cb();
  });
  afterEach(function (cb) {
    process.chdir(this.cwd);
    cb();
  });

  it('.isPathAbsolute():', function () {
    test.ok(file.isPathAbsolute(path.resolve('/foo')), 'should return true');
    test.ok(file.isPathAbsolute(path.resolve('/foo') + path.sep), 'should return true');
    test.equal(file.isPathAbsolute('foo'), false, 'should return false');
    test.ok(file.isPathAbsolute(path.resolve('test/fixtures/a.js')), 'should return true');
    test.equal(file.isPathAbsolute('test/fixtures/a.js'), false, 'should return false');
  });

  it('.arePathsEquivalent():', function () {
    test.ok(file.arePathsEquivalent('/foo'), 'should return true');
    test.ok(file.arePathsEquivalent('/foo', '/foo/', '/foo/../foo/'), 'should return true');
    test.ok(file.arePathsEquivalent(process.cwd(), '.', './', 'test/..'), 'should return true');
    test.equal(file.arePathsEquivalent(process.cwd(), '..'), false, 'should return false');
    test.equal(file.arePathsEquivalent('.', '..'), false, 'should return false');
  });

  it('.doesPathContain():', function () {
    test.ok(file.doesPathContain('/foo', '/foo/bar'), 'should return true');
    test.ok(file.doesPathContain('/foo/', '/foo/bar/baz', '/foo/bar', '/foo/whatever'), 'should return true');
    test.equal(file.doesPathContain('/foo', '/foo'), false, 'should return false');
    test.equal(file.doesPathContain('/foo/xyz', '/foo/xyz/123', '/foo/bar/baz'), false, 'should return false');
    test.equal(file.doesPathContain('/foo/xyz', '/foo'), false, 'should return false');
    test.ok(file.doesPathContain(process.cwd(), 'test', 'test/fixtures', 'lib'), 'should return true');
  });

  it('.isPathCwd():', function () {
    test.ok(file.isPathCwd(process.cwd()), 'cwd is cwd');
    test.ok(file.isPathCwd('.'), 'cwd is cwd');
    test.equal(file.isPathCwd('test'), false, 'subdirectory is not cwd');
    test.equal(file.isPathCwd(path.resolve('test')), false, 'subdirectory is not cwd');
    test.equal(file.isPathCwd('..'), false, 'parent is not cwd');
    test.equal(file.isPathCwd(path.resolve('..')), false, 'parent is not cwd');
    test.equal(file.isPathCwd('/'), false, 'root is not cwd (I hope)');
    test.equal(file.isPathCwd('nonexistent'), false, 'nonexistent path is not cwd');
  });

  it('.isPathInCwd():', function () {
    test.equal(file.isPathInCwd(process.cwd()), false, 'cwd is not IN cwd');
    test.equal(file.isPathInCwd('.'), false, 'cwd is not IN cwd');
    test.ok(file.isPathInCwd('test'), 'subdirectory is in cwd');
    test.ok(file.isPathInCwd(path.resolve('test')), 'subdirectory is in cwd');
    test.equal(file.isPathInCwd('..'), false, 'parent is not in cwd');
    test.equal(file.isPathInCwd(path.resolve('..')), false, 'parent is not in cwd');
    test.equal(file.isPathInCwd('/'), false, 'root is not in cwd (I hope)');
    test.equal(file.isPathInCwd('nonexistent'), false, 'nonexistent path is not in cwd');
  });

  describe('.cwdUnderSymlink():', function () {
    beforeEach(function (cb) {
      this.cwd = process.cwd();
      process.chdir(path.join(tempdir.path, 'expand'));
      cb();
    });

    afterEach(function (cb) {
      process.chdir(this.cwd);
      cb();
    });

    it('.isPathCwd():', function () {
      test.ok(file.isPathCwd(process.cwd()), 'cwd is cwd');
      test.ok(file.isPathCwd('.'), 'cwd is cwd');
    });

    it('.isPathInCwd():', function () {
      test.ok(file.isPathInCwd('deep'), 'subdirectory is in cwd');
      test.ok(file.isPathInCwd(path.resolve('deep')), 'subdirectory is in cwd');
    });
  });
});

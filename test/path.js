/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var grunt = require('grunt');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var File = require('..').File;
var file;

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('path:', function () {
  beforeEach(function () {
    file = new File(grunt.option);
  });

  describe('.isPathAbsolute():', function () {
    it('should work for directories with a leading slash:', function () {
      assert.equal(file.isPathAbsolute(path.resolve('/foo')), true);
    });
    it('should work for directories with both leading and trailing slashes:', function () {
      assert.equal(file.isPathAbsolute(path.resolve('/foo') + path.sep), true);
    });
    it('should work for files:', function () {
      assert.equal(file.isPathAbsolute(path.resolve('test/fixtures/a.js')), true);
    });

    it('should return false when the file path is not absolute:', function () {
      assert.notEqual(file.isPathAbsolute('foo'), true);
      assert.notEqual(file.isPathAbsolute('test/fixtures/a.js'), true);
    });
  });

  describe('.arePathsEquivalent():', function () {
    it('should return true when paths are equivalent', function () {
      assert.equal(file.arePathsEquivalent('/foo'), true);
      assert.equal(file.arePathsEquivalent('/foo', '/foo/', '/foo/../foo/'), true);
      assert.equal(file.arePathsEquivalent(process.cwd(), '.', './', 'test/..'), true);
    });
    it('should return true when paths are not equivalent', function () {
      assert.notEqual(file.arePathsEquivalent(process.cwd(), '..'), true);
      assert.notEqual(file.arePathsEquivalent('.', '..'), true);
    });
  });

  describe('.doesPathContain():', function () {
    it('should return true when "path B" contains "path A"', function () {
      assert.equal(file.doesPathContain('/foo', '/foo/bar'), true);
      assert.equal(file.doesPathContain('/foo/', '/foo/bar/baz', '/foo/bar', '/foo/whatever'), true);
      assert.equal(file.doesPathContain(process.cwd(), 'test', 'test/fixtures', 'lib'), true);
    });

    it('should return true when "path B" contains "path A"', function () {
      assert.notEqual(file.doesPathContain('/foo/xyz', '/foo/xyz/123', '/foo/bar/baz'), true);
      assert.notEqual(file.doesPathContain('/foo', '/foo'), true);
      assert.notEqual(file.doesPathContain('/foo/xyz', '/foo'), true);
    });
  });

  describe('.isPathCwd():', function () {
    it('should return false when the given path is the current working directory:', function () {
      assert.equal(file.isPathCwd(process.cwd()), true);
      assert.equal(file.isPathCwd('.'), true);
    });

    it('should return false when a subdirectory is passed:', function () {
      assert.notEqual(file.isPathCwd('test'), true);
      assert.notEqual(file.isPathCwd(path.resolve('test')), true);
    });

    it('should return false when a parent directory is passed:', function () {
      assert.notEqual(file.isPathCwd('..'), true);
      assert.notEqual(file.isPathCwd(path.resolve('..')), true);
    });

    it('should return false when the root is passed:', function () {
      assert.notEqual(file.isPathCwd('/'), true);
    });

    it('should return false when a nonexistent path is passed:', function () {
      assert.notEqual(file.isPathCwd('nonexistent'), true);
    });
  });

  describe('.isPathInCwd() - should be true:', function () {
    it('when a subdirectory is in cwd', function () {
      assert.equal(file.isPathInCwd('test'), true);
      assert.equal(file.isPathInCwd(path.resolve('test')), true);
    });
  });

  describe('.isPathInCwd() - should be false:', function () {
    it('when a subdirectory is NOT in the cwd', function() {
      assert.notEqual(file.isPathInCwd(process.cwd()), true);
    });
    it('when a subdirectory is NOT in the cwd', function() {
      assert.notEqual(file.isPathInCwd('.'), true);
    });
    it('when the parent is not in cwd', function () {
      assert.notEqual(file.isPathInCwd('..'), true);
    });
    it('when the parent is not in cwd', function () {
      assert.notEqual(file.isPathInCwd(path.resolve('..')), true);
    });
    it('when the root is not in cwd (I hope)', function() {
      assert.notEqual(file.isPathInCwd('/'), true);
    });
    it('when the nonexistent path is not in cwd', function () {
      assert.notEqual(file.isPathInCwd('nonexistent'), true);
    });
  });

  describe('when cwd is in a symlink:', function () {
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
      assert.equal(file.isPathCwd(process.cwd()), true);
      assert.equal(file.isPathCwd('.'), true);
    });

    it('.isPathInCwd():', function () {
      assert.equal(file.isPathInCwd('deep'), true);
      assert.equal(file.isPathInCwd(path.resolve('deep')), true);
    });
  });
});

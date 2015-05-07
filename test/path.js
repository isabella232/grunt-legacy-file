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

describe('path:', function () {
  beforeEach(function (cb) {
    this.cwd = process.cwd();
    process.chdir('test/fixtures/expand');
    cb();
  });
  afterEach(function (cb) {
    process.chdir(this.cwd);
    cb();
  });

  describe('.isPathAbsolute():', function () {
    it('should work for directories with a leading slash:', function () {
      file.isPathAbsolute(path.resolve('/foo')).should.be.true;
    });
    it('should work for directories with both leading and trailing slashes:', function () {
      file.isPathAbsolute(path.resolve('/foo') + path.sep).should.be.true;
    });
    it('should work for files:', function () {
      file.isPathAbsolute(path.resolve('test/fixtures/a.js')).should.be.true;
    });

    it('should return false when the file path is not absolute:', function () {
      file.isPathAbsolute('foo').should.be.false;
      file.isPathAbsolute('test/fixtures/a.js').should.be.false;
    });
  });

  describe('.arePathsEquivalent():', function () {
    it('should return true when paths are equivalent', function () {
      file.arePathsEquivalent('/foo').should.be.true;
      file.arePathsEquivalent('/foo', '/foo/', '/foo/../foo/').should.be.true;
      file.arePathsEquivalent(process.cwd(), '.', './', 'test/..').should.be.true;
    });
    it('should return true when paths are not equivalent', function () {
      file.arePathsEquivalent(process.cwd(), '..').should.be.false;
      file.arePathsEquivalent('.', '..').should.be.false;
    });
  });

  describe('.doesPathContain():', function () {
    it('should return true when "path B" contains "path A"', function () {
      file.doesPathContain('/foo', '/foo/bar').should.be.true;
      file.doesPathContain('/foo/', '/foo/bar/baz', '/foo/bar', '/foo/whatever').should.be.true;
      file.doesPathContain(process.cwd(), 'test', 'test/fixtures', 'lib').should.be.true;
    });
      
    it('should return true when "path B" contains "path A"', function () {
      file.doesPathContain('/foo/xyz', '/foo/xyz/123', '/foo/bar/baz').should.be.false;
      file.doesPathContain('/foo', '/foo').should.be.false;
      file.doesPathContain('/foo/xyz', '/foo').should.be.false;
    });
  });

  describe('.isPathCwd():', function () {
    it('should return false when the given path is the current working directory:', function () {
      file.isPathCwd(process.cwd()).should.be.true;
      file.isPathCwd('.').should.be.true;
    });

    it('should return false when a subdirectory is passed:', function () {
      file.isPathCwd('test').should.be.false;
      file.isPathCwd(path.resolve('test')).should.be.false;
    });

    it('should return false when a parent directory is passed:', function () {
      file.isPathCwd('..').should.be.false;
      file.isPathCwd(path.resolve('..')).should.be.false;
    });

    it('should return false when the root is passed:', function () {
      file.isPathCwd('/').should.be.false;
    });

    it('should return false when a nonexistent path is passed:', function () {
      file.isPathCwd('nonexistent').should.be.false;
    });
  });

  describe('.isPathInCwd() - should be true:', function () {
    it.skip('when the subdirectory is in cwd', function () {
      file.isPathInCwd('test').should.be.true;
      file.isPathInCwd(path.resolve('test')).should.be.true;
    });
  });

  describe('.isPathInCwd() - should be false:', function () {
    it('when the cwd is not IN cwd', function() {
      file.isPathInCwd(process.cwd()).should.be.false;
    })
    it('when the cwd is not IN cwd', function() {
      file.isPathInCwd('.').should.be.false;
    })
    it('when the parent is not in cwd', function () {
      file.isPathInCwd('..').should.be.false;
    })
    it('when the parent is not in cwd', function () {
      file.isPathInCwd(path.resolve('..')).should.be.false;
    })
    it('when the root is not in cwd (I hope)', function() {
      file.isPathInCwd('/').should.be.false;
    })
    it('when the nonexistent path is not in cwd', function () {
      file.isPathInCwd('nonexistent').should.be.false;
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
      file.isPathCwd(process.cwd()).should.be.true;
      file.isPathCwd('.').should.be.true;
    });

    it('.isPathInCwd():', function () {
      file.isPathInCwd('deep').should.be.true;
      file.isPathInCwd(path.resolve('deep')).should.be.true;
    });
  });
});

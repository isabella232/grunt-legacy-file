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
var File = require('..');
var file;

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');


describe('.stat():', function () {
  beforeEach(function () {
    file = new File({grunt: grunt});
  });

  describe('.isLink() - false:', function () {
    it('should return false when files are not symlinks.', function () {
      assert.notEqual(file.isLink('test/fixtures/octocat.png'), true);
    });
    it('should return false when directories are not symlinks.', function () {
      assert.notEqual(file.isLink('test/fixtures'), true);
    });
    it('should return false when a filepath does not exist.', function () {
      assert.notEqual(file.isLink('test/fixtures/does/not/exist'), true);
    });
  });

  describe('.isLink() - true:', function () {
    it('should return true when files are symlinks.', function () {
      assert.equal(file.isLink(path.join(tempdir.path, 'octocat.png')), true);
    });
    it('should return true when directories are symlinks.', function () {
      assert.equal(file.isLink(path.join(tempdir.path, 'expand')), true);
    });
    it('should work for paths in parts.', function () {
      assert.equal(file.isLink(tempdir.path, 'octocat.png'), true);
    });
  });

  describe('.isDir():', function () {
    it('should work for directories:', function () {
      assert.notEqual(file.isDir('test/fixtures/octocat.png'), true);
    });
    it('should work for paths in parts.', function () {
      assert.equal(file.isDir('test', 'fixtures'), true);
    });
    it('should return true when a path is not a directory.', function () {
      assert.notEqual(file.isDir(path.join(tempdir.path, 'octocat.png')), true);
    });
    it('directory links are directories.', function () {
      assert.equal(file.isDir(path.join(tempdir.path, 'expand')), true);
    });
    it('nonexistent files are not directories.', function () {
      assert.notEqual(file.isDir('test/fixtures/does/not/exist'), true);
    });
  });

  describe('.isFile():', function () {
    it('files are files.', function () {
      assert.equal(file.isFile('test/fixtures/octocat.png'), true);
    });
    it('should work for paths in parts.', function () {
      assert.equal(file.isFile('test', 'fixtures', 'octocat.png'), true);
    });
    it('directories are not files.', function () {
      assert.notEqual(file.isFile('test/fixtures'), true);
    });
    it('file links are files.', function () {
      assert.equal(file.isFile(path.join(tempdir.path, 'octocat.png')), true);
    });
    it('directory links are not files.', function () {
      assert.notEqual(file.isFile(path.join(tempdir.path, 'expand')), true);
    });
    it('nonexistent files are not files.', function () {
      assert.notEqual(file.isFile('test/fixtures/does/not/exist'), true);
    });
  });
});

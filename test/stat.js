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


describe('.stat():', function () {
  describe('.isLink() - false:', function () {
    it('should return false when files are not symlinks.', function () {
      file.isLink('test/fixtures/octocat.png').should.be.false;
    });
    it('should return false when directories are not symlinks.', function () {
      file.isLink('test/fixtures').should.be.false;
    });
    it('should return false when a filepath does not exist.', function () {
      file.isLink('test/fixtures/does/not/exist').should.be.false;
    });
  });

  describe('.isLink() - true:', function () {
    it('should return true when files are symlinks.', function () {
      file.isLink(path.join(tempdir.path, 'octocat.png')).should.be.true;
    });
    it('should return true when directories are symlinks.', function () {
      file.isLink(path.join(tempdir.path, 'expand')).should.be.true;
    });
    it('should work for paths in parts.', function () {
      file.isLink(tempdir.path, 'octocat.png').should.be.true;
    });
  });

  describe('.isDir():', function () {
    it('should work for directories:', function () {
      file.isDir('test/fixtures/octocat.png').should.be.false;
    });
    it('should work for paths in parts.', function () {
      file.isDir('test', 'fixtures').should.be.true;
    });
    it('should return true when a path is not a directory.', function () {
      file.isDir(path.join(tempdir.path, 'octocat.png')).should.be.false;
    });
    it('directory links are directories.', function () {
      file.isDir(path.join(tempdir.path, 'expand')).should.be.true;
    });
    it('nonexistent files are not directories.', function () {
      file.isDir('test/fixtures/does/not/exist').should.be.false;
    });
  });

  describe('.isFile():', function () {
    it('files are files.', function () {
      file.isFile('test/fixtures/octocat.png').should.be.true;
    });
    it('should work for paths in parts.', function () {
      file.isFile('test', 'fixtures', 'octocat.png').should.be.true;
    });
    it('directories are not files.', function () {
      file.isFile('test/fixtures').should.be.false;
    });
    it('file links are files.', function () {
      file.isFile(path.join(tempdir.path, 'octocat.png')).should.be.true;
    });
    it('directory links are not files.', function () {
      file.isFile(path.join(tempdir.path, 'expand')).should.be.false;
    });
    it('nonexistent files are not files.', function () {
      file.isFile('test/fixtures/does/not/exist').should.be.false;
    });
  });
});

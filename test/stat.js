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

describe.skip('file.stat():', function () {
  var realFile = __dirname + '/fixtures/a.js';
  var realDir = __dirname + '/fixtures/expand/';
  var fakeFile = __dirname + '/temp/a.js';
  var fakeDir = __dirname + '/temp/expand/';

  before(function () {
    fs.symlinkSync(realFile, fakeFile, 'file');
    fs.symlinkSync(realDir, fakeDir, 'dir');
  });

  after(function () {
    file.delete(fakeFile);
    file.delete(fakeDir);
  });

  describe('.isLink() - false:', function () {
    it('should return false when files are not symlinks.', function () {
      file.isLink('fixtures/a.js').should.be.false;
    });
    it('should return false when directories are not symlinks.', function () {
      file.isLink('fixtures').should.be.false;
    });
    it('should return false when a filepath does not exist.', function () {
      file.isLink('fixtures/does/not/exist').should.be.false;
    });
  });

  describe('.isLink() - true:', function () {
    it('should return true when files are symlinks.', function () {
      file.isLink(fakeFile).should.be.true;
    });
    it('should return true when directories are symlinks.', function () {
      file.isLink(fakeDir).should.be.true;
    });
    it('should return true when a filepath is passed as segments.', function () {
      file.isLink(__dirname, 'temp', 'a.js').should.be.true;
    });
  });

  describe('.isDir():', function () {
    it('should work for directories:', function () {
      file.isDir('test/fixtures').should.be.true;
    });
    it('should work for paths in parts.', function () {
      file.isDir('test', 'fixtures').should.be.true;
    });
    it('should return true when a path is not a directory.', function () {
      file.isDir(path.join(tempdir.path, 'a.js')).should.be.false;
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
      file.isFile('test/fixtures/a.js').should.be.true;
    });
    it('should work for paths in parts.', function () {
      file.isFile('test', 'fixtures', 'a.js').should.be.true;
    });
    it('directories are not files.', function () {
      file.isFile('test/fixtures').should.be.false;
    });
    it('file links are files.', function () {
      file.isFile(path.join(tempdir.path, 'a.js')).should.be.true;
    });
    it('directory links are not files.', function () {
      file.isFile(path.join(tempdir.path, 'expand')).should.be.false;
    });
    it('nonexistent files are not files.', function () {
      file.isFile('test/fixtures/does/not/exist').should.be.false;
    });
  });
});

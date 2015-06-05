/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var grunt = require('grunt');
var assert = require('assert');
var Tempfile = require('temporary/lib/file');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var utils = require('./utils');
var File = require('..').File;
var file;

describe('.copy():', function () {
  var defaultEncoding;
  var tempfile;

  beforeEach(function (done) {
    file = new File({grunt: grunt});
    defaultEncoding = file.defaultEncoding;
    file.defaultEncoding = 'utf8';
    done();
  });

  afterEach(function(done) {
    file.defaultEncoding = defaultEncoding;
    done();
  });

  describe('.copy', function() {
    it('files should just be copied as encoding-agnostic by default.', function() {
      tempfile = new Tempfile();
      file.copy('test/fixtures/utf8.txt', tempfile.path);
      assert.equal(utils.compareFiles(tempfile.path, 'test/fixtures/utf8.txt'), true);
      tempfile.unlinkSync();
    });

    it('files should just be copied as encoding-agnostic by default.', function() {
      tempfile = new Tempfile();
      file.copy('test/fixtures/iso-8859-1.txt', tempfile.path);
      assert.equal(utils.compareFiles(tempfile.path, 'test/fixtures/iso-8859-1.txt'), true);
      tempfile.unlinkSync();
    });

    it('files should just be copied as encoding-agnostic by default.', function() {
      tempfile = new Tempfile();
      file.copy('test/fixtures/octocat.png', tempfile.path);
      assert.equal(utils.compareFiles(tempfile.path, 'test/fixtures/octocat.png'), true);
      tempfile.unlinkSync();
    });

    it('file should NOT be created if --no-write was specified.', function() {
      grunt.option('write', false);
      var filepath = path.join(tempdir.path, 'should-not-exist.txt');
      file.copy('test/fixtures/utf8.txt', filepath);
      assert.equal(file.exists(filepath), false);
    });
  });


  describe('options.process:', function () {
    var string = 'Ação é isso aí\n';
    var defaultEncoding;
    var tempfile;

    beforeEach(function (done) {
      defaultEncoding = file.defaultEncoding;
      file.defaultEncoding = 'utf8';
      done();
    });

    afterEach(function(done) {
      grunt.option('write', true);
      file.defaultEncoding = defaultEncoding;
      done();
    });

    describe('`options.process` function paramaters:', function () {
      it('should expose the source file contents as the first parameter:', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function (contents) {
            assert.equal(contents, string, true);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('should expose the source file path as the second parameter:', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function (contents, src) {
            assert.equal(src, 'test/fixtures/utf8.txt');
            assert.equal(contents, string, true);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('should expose the destination file path as the third parameter:', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function (contents, src, dest) {
            assert.equal(dest, tempfile.path, true);
            assert.equal(contents, string, true);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });
    });

    describe('copy and process', function() {
      var tempfile;
      it('src should be passed in, as-specified.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(contents, src) {
            assert.equal(src, 'test/fixtures/utf8.txt', true);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('dest should be passed in, as-specified.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(contents, src, dest) {
            assert.equal(dest, tempfile.path, true);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('when no encoding is specified, use default encoding and process src as a string', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(contents) {
            assert.notEqual(Buffer.isBuffer(contents));
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('when no encoding is specified, use default encoding and process src as a string', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(contents) {
            assert.equal(typeof contents, 'string');
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('file should be saved as properly encoded processed string.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(contents) {
            return 'føø' + contents + 'bår';
          }
        });
        assert.equal(file.read(tempfile.path), 'føø' + string + 'bår');
        tempfile.unlinkSync();
      });

      it('use specified encoding and process src as a string', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/iso-8859-1.txt', tempfile.path, {
          encoding: 'iso-8859-1',
          process: function(contents) {
            assert.equal(Buffer.isBuffer(contents), false);
            assert.equal(typeof contents, 'string');
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('file should be saved as properly encoded processed string.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/iso-8859-1.txt', tempfile.path, {
          encoding: 'iso-8859-1',
          process: function(contents) {
            return 'føø' + contents + 'bår';
          }
        });
        assert.equal(file.read(tempfile.path, {encoding: 'iso-8859-1'}), 'føø' + string + 'bår');
        tempfile.unlinkSync();
      });

      it('when encoding is specified as null, process `contents` as a buffer', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          encoding: null,
          process: function(contents) {
            assert.equal(Buffer.isBuffer(contents), true);
            return new Buffer('føø' + contents.toString() + 'bår');
          }
        });
        tempfile.unlinkSync();
      });

      it('file should be saved as the buffer returned by process.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          encoding: null,
          process: function(contents) {
            return new Buffer('føø' + contents.toString() + 'bår');
          }
        });
        assert.equal(file.read(tempfile.path), 'føø' + string + 'bår');
        tempfile.unlinkSync();
      });

      it('use non-utf8 default encoding and process `contents` as a string', function() {
        file.defaultEncoding = 'iso-8859-1';
        tempfile = new Tempfile();
        file.copy('test/fixtures/iso-8859-1.txt', tempfile.path, {
          process: function(contents) {
            assert.notEqual(Buffer.isBuffer(contents), true);
            assert.equal(typeof contents, 'string');
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('file should be saved as properly encoded processed string.', function() {
        file.defaultEncoding = 'iso-8859-1';
        tempfile = new Tempfile();
        file.copy('test/fixtures/iso-8859-1.txt', tempfile.path, {
          process: function(contents) {
            return 'føø' + contents + 'bår';
          }
        });
        assert.equal(file.read(tempfile.path), 'føø' + string + 'bår');
        tempfile.unlinkSync();
      });

      it('file should NOT be created if process returns false.', function() {
        tempdir = new Tempdir();
        var filepath = path.join(tempdir.path, 'should-not-exist.txt');
        file.copy('test/fixtures/iso-8859-1.txt', filepath, {
          process: function() {
            return false;
          }
        });
        assert.notEqual(file.exists(filepath), true);
      });
    });

    describe('copy and process, noprocess:', function () {
      it('file should not have been processed.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          noProcess: true,
          process: function (contents) {
            return 'føø' + contents + 'bår';
          }
        });

        assert.equal(file.read(tempfile.path), string);
        tempfile.unlinkSync();
      });

      it('file should have been processed.', function () {
        tempfile = new Tempfile();

        ['process', 'noprocess', 'othernoprocess'].forEach(function (filename) {
          var fp = path.join(tempdir.path, filename);
          file.copy('test/fixtures/utf8.txt', fp);

          file.copy(fp, tempfile.path, {
            noProcess: ['**/*no*'],
            process: function (contents) {
              return 'føø' + contents + 'bår';
            }
          });

          if (filename === 'process') {
            assert.equal(file.read(tempfile.path), 'føø' + string + 'bår');
          } else {
            assert.equal(file.read(tempfile.path), string);
          }
          tempfile.unlinkSync();
        });
      });
    });

    describe('copy directories recursively', function () {
      var copyroot1 = path.join(tempdir.path, 'copy-dir-1');
      var copyroot2 = path.join(tempdir.path, 'copy-dir-2');

      it('should copy directories recursively:', function () {
        file.copy('test/fixtures/expand/', copyroot1);
        file.recurse('test/fixtures/expand/', function (src, rootdir, subdir, filename) {
          var dest = path.join(copyroot1, subdir || '', filename);
          assert.equal(file.isFile(src), true);
          assert.equal(file.read(src), file.read(dest));
        });
      });

      it('should create empty directories.', function () {
        file.mkdir(path.join(copyroot1, 'empty'));
        file.mkdir(path.join(copyroot1, 'deep/deeper/empty'));
        file.copy(copyroot1, copyroot2, {
          process: function (contents) {
            return '<' + contents + '>';
          }
        });
        assert.equal(file.isDir(path.join(copyroot2, 'empty')), true);
        assert.equal(file.isDir(path.join(copyroot2, 'deep/deeper/empty')), true);
      });

      it('file contents should be processed correctly.', function () {
        file.recurse('test/fixtures/expand/', function (src, rootdir, subdir, filename) {
          var dest = path.join(copyroot2, subdir || '', filename);
          assert.equal(file.isFile(src), true);
          assert.equal('<' + file.read(src) + '>', file.read(dest));
        });
      });
    });
  });
});

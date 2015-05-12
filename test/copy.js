/*!
 * grunt-legacy-file <http://gruntjs.com/grunt-legacy-file>
 *
 * Copyright (c) 2015, "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

require('should');
var path = require('path');
var grunt = require('grunt');
var assert = require('assert');
var Tempfile = require('temporary/lib/file');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var utils = require('./utils');
var file = require('..');


describe('.copy():', function () {
  var string = 'Ação é isso aí\n';
  var object = {foo: 'Ação é isso aí', bar: ['ømg', 'pønies']};
  var defaultEncoding;
  var tempfile;

  beforeEach(function (done) {
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
    var object = {foo: 'Ação é isso aí', bar: ['ømg', 'pønies']};
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
          process: function (contents, src, dest) {
            contents.should.equal(string);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('should expose the source file path as the second parameter:', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function (contents, src, dest) {
            src.should.equal('test/fixtures/utf8.txt');
            contents.should.equal(string);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('should expose the destination file path as the third parameter:', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function (contents, src, dest) {
            dest.should.equal(tempfile.path);
            contents.should.equal(string);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });
    });

    describe('copy and process', function() {
      var tempfile;
      it('srcpath should be passed in, as-specified.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(src, srcpath, destpath) {
            assert.equal(srcpath, 'test/fixtures/utf8.txt', true);
            return 'føø' + src + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('destpath should be passed in, as-specified.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(src, srcpath, destpath) {
            assert.equal(destpath, tempfile.path, true);
            return 'føø' + src + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('when no encoding is specified, use default encoding and process src as a string', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(src, srcpath, destpath) {
            assert.equal(Buffer.isBuffer(src), false);
            return 'føø' + src + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('when no encoding is specified, use default encoding and process src as a string', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(contents, srcpath, destpath) {
            assert.equal(typeof contents, 'string', true);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('file should be saved as properly encoded processed string.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          process: function(contents, srcpath, destpath) {
            return 'føø' + contents + 'bår';
          }
        });
        assert.equal(file.read(tempfile.path), 'føø' + string + 'bår', true);
        tempfile.unlinkSync();
      });

      it('use specified encoding and process src as a string', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/iso-8859-1.txt', tempfile.path, {
          encoding: 'iso-8859-1',
          process: function(src) {
            assert.equal(Buffer.isBuffer(src), false);
            assert.equal(typeof src, 'string', true);
            return 'føø' + src + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('file should be saved as properly encoded processed string.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/iso-8859-1.txt', tempfile.path, {
          encoding: 'iso-8859-1',
          process: function(src) {
            return 'føø' + src + 'bår';
          }
        });
        assert.equal(file.read(tempfile.path, {encoding: 'iso-8859-1'}), 'føø' + string + 'bår', true);
        tempfile.unlinkSync();
      });

      it('when encoding is specified as null, process src as a buffer', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          encoding: null,
          process: function(src) {
            assert.equal(Buffer.isBuffer(src), true);
            return new Buffer('føø' + src.toString() + 'bår');
          }
        });
        tempfile.unlinkSync();
      });

      it('file should be saved as the buffer returned by process.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          encoding: null,
          process: function(src) {
            return new Buffer('føø' + src.toString() + 'bår');
          }
        });
        assert.equal(file.read(tempfile.path), 'føø' + string + 'bår', true);
        tempfile.unlinkSync();
      });

      it('use non-utf8 default encoding and process src as a string', function() {
        file.defaultEncoding = 'iso-8859-1';
        tempfile = new Tempfile();
        file.copy('test/fixtures/iso-8859-1.txt', tempfile.path, {
          process: function(src) {
            assert.equal(Buffer.isBuffer(src), false);
            assert.equal(typeof src, 'string', true);
            return 'føø' + src + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('file should be saved as properly encoded processed string.', function() {
        file.defaultEncoding = 'iso-8859-1';
        tempfile = new Tempfile();
        file.copy('test/fixtures/iso-8859-1.txt', tempfile.path, {
          process: function(src) {
            return 'føø' + src + 'bår';
          }
        });
        assert.equal(file.read(tempfile.path), 'føø' + string + 'bår', true);
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
        assert.equal(file.exists(filepath), false);
      });
    });

    describe('copy and process, noprocess:', function () {
      it('file should not have been processed.', function () {
        tempfile = new Tempfile();
        file.copy('test/fixtures/utf8.txt', tempfile.path, {
          noProcess: true,
          process: function (src) {
            return 'føø' + src + 'bår';
          }
        });

        file.read(tempfile.path).should.equal(string);
        tempfile.unlinkSync();
      });

      it('file should have been processed.', function () {
        tempfile = new Tempfile();

        ['process', 'noprocess', 'othernoprocess'].forEach(function (filename) {
          var fp = path.join(tempdir.path, filename);
          file.copy('test/fixtures/utf8.txt', fp);

          file.copy(fp, tempfile.path, {
            noProcess: ['**/*no*'],
            process: function (src) {
              return 'føø' + src + 'bår';
            }
          });

          if (filename === 'process') {
            file.read(tempfile.path).should.equal('føø' + string + 'bår');
          } else {
            file.read(tempfile.path).should.equal(string);
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
        file.recurse('test/fixtures/expand/', function (srcpath, rootdir, subdir, filename) {
          var destpath = path.join(copyroot1, subdir || '', filename);
          file.isFile(srcpath).should.be.true;
          file.read(srcpath).should.equal(file.read(destpath));
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
        file.isDir(path.join(copyroot2, 'empty')).should.be.true;
        file.isDir(path.join(copyroot2, 'deep/deeper/empty')).should.be.true;
      });

      it('file contents should be processed correctly.', function () {
        file.recurse('test/fixtures/expand/', function (srcpath, rootdir, subdir, filename) {
          var destpath = path.join(copyroot2, subdir || '', filename);
          file.isFile(srcpath).should.be.true;
          assert.equal('<' + file.read(srcpath) + '>', file.read(destpath));
        });
      });
    });
  });
});

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


function fixtures(name) {
  return path.resolve(__dirname, 'fixtures', name);
}

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
    grunt.option('write', true);
    file.defaultEncoding = defaultEncoding;
    done();
  });

  describe('encoding:', function () {
    it('should copy files as encoding-agnostic by default.', function () {
      tempfile = new Tempfile();
      file.copy(fixtures('utf8.txt'), tempfile.path);
      utils.compareFiles(fixtures('utf8.txt'), tempfile.path).should.be.true;
      tempfile.unlinkSync();
    });

    it('files should just be copied as encoding-agnostic by default.', function () {
      tempfile = new Tempfile();
      file.copy(fixtures('iso-8859-1.txt'), tempfile.path);
      utils.compareFiles(fixtures('iso-8859-1.txt'), tempfile.path).should.be.true;
      tempfile.unlinkSync();
    });

    it('files should just be copied as encoding-agnostic by default.', function () {
      tempfile = new Tempfile();
      file.copy(fixtures('octocat.png'), tempfile.path);
      utils.compareFiles(fixtures('octocat.png'), tempfile.path).should.be.true;
      tempfile.unlinkSync();
    });

    it('should NOT create a file when --no-write is specified.', function () {
      tempfile = new Tempfile();
      grunt.option('write', false);
      var fp = path.join(tempdir.path, 'should-not-exist.txt');
      file.copy('test/fixtures/utf8.txt', fp);
      file.exists(fp).should.be.false;
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

    describe.skip('when no encoding is specified', function () {
      it('should use the default encoding and process contents as a string', function () {
        tempfile = new Tempfile();
        file.copy(fixtures('utf8.txt'), tempfile.path, {
          process: function (contents, src, dest) {
            Buffer.isBuffer(src).should.be.false;
            contents.should.be.a.string;
            contents.should.equal(string);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });

      it('should write the file using the default encoding', function () {
        tempfile = new Tempfile();
        file.copy(fixtures('utf8.txt'), tempfile.path, {
          process: function (contents, src, dest) {
            Buffer.isBuffer(src).should.be.false;
            contents.should.be.a.string;
            contents.should.equal(string);
            return 'føø' + contents + 'bår';
          }
        });
        file.read(tempfile.path).should.equal('føø' + string + 'bår');
        tempfile.unlinkSync();
      });
    });

    describe('alternate encoding:', function () {
      it.skip('should use the specified encoding and process its contents as a string', function () {
        tempfile = new Tempfile();
        file.copy(fixtures('iso-8859-1.txt'), tempfile.path, {
          encoding: 'iso-8859-1',
          process: function (contents, src, dest) {
            Buffer.isBuffer(contents).should.be.false;
            contents.should.be.a.string;
            contents.should.equal(string);
            return 'føø' + src + 'bår';
          }
        });

        file.read(tempfile.path, { encoding: 'iso-8859-1' }).should.equal('føø' + string + 'bår');
        tempfile.unlinkSync();
      });
    });

    describe('when encoding is specified as null:', function () {
      it.skip('should process contents as a buffer:', function () {
        tempfile = new Tempfile();
        file.copy(fixtures('iso-8859-1.txt'), tempfile.path, {
          encoding: null,
          process: function (contents, src, dest) {
            Buffer.isBuffer(contents).should.be.true;
            contents.should.equal(string);
            return new Buffer('føø' + contents.toString() + 'bår');
          }
        });
        tempfile.unlinkSync();
      });

      it.skip('should save the file with the buffer returned by `process`:', function () {
        tempfile = new Tempfile();
        file.copy(fixtures('iso-8859-1.txt'), tempfile.path, {
          encoding: null,
          process: function (contents, src, dest) {
            Buffer.isBuffer(contents).should.be.true;
            contents.should.equal(string);
            return new Buffer('føø' + contents.toString() + 'bår');
          }
        });
        file.read(tempfile.path).should.equal('føø' + string + 'bår');
        tempfile.unlinkSync();
      });
    });

    describe('file.defaultEncoding:', function () {
      it('use non-utf8 default encoding and process contents as a string', function () {
        tempfile = new Tempfile();
        file.defaultEncoding = 'iso-8859-1';
        file.copy(fixtures('iso-8859-1.txt'), tempfile.path, {
          process: function (contents, src, dest) {
            Buffer.isBuffer(contents).should.be.false;
            contents.should.be.a.string;
            contents.should.equal(string);
            return 'føø' + contents + 'bår';
          }
        });
        tempfile.unlinkSync();
      });
      it('should write the file to disk with non-utf8 encoding:', function () {
        tempfile = new Tempfile();
        file.defaultEncoding = 'iso-8859-1';
        file.copy(fixtures('iso-8859-1.txt'), tempfile.path, {
          process: function (contents, src, dest) {
            Buffer.isBuffer(contents).should.be.false;
            contents.should.be.a.string;
            contents.should.equal(string);
            return 'føø' + contents + 'bår';
          }
        });
        file.read(tempfile.path).should.equal('føø' + string + 'bår');
        tempfile.unlinkSync();
      });
    });

    it('should not create a file if process returns false:', function () {
      var fp = path.join(tempdir.path, 'should-not-exist.txt');
      file.copy('test/fixtures/iso-8859-1.txt', fp, {
        process: function () {
          return false;
        }
      });
      file.exists(fp).should.be.false;
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
        var files = ['process', 'noprocess', 'othernoprocess'];
        tempfile = new Tempfile();

        files.forEach(function (filename) {
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
        }, this);
      });

    });

    describe('.recurse', function () {
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

      it('should craete empty directories.', function () {
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








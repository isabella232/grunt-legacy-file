/*!
 * grunt-legacy-file <http://gruntjs.com/grunt-legacy-file>
 *
 * Copyright (c) 2015, "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

require('should');
var path = require('path');
var Tempfile = require('temporary/lib/file');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var grunt = require('grunt');
var file = require('..');
var utils = require('./utils');

describe('file.copy():', function () {
  it('.copy():', function () {
    var tmpfile;
    tmpfile = new Tempfile();
    file.copy('test/fixtures/utf8.txt', tmpfile.path);
    test.ok(utils.compareFiles(tmpfile.path, 'test/fixtures/utf8.txt'), 'files should just be copied as encoding-agnostic by default.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    file.copy('test/fixtures/iso-8859-1.txt', tmpfile.path);
    test.ok(utils.compareFiles(tmpfile.path, 'test/fixtures/iso-8859-1.txt'), 'files should just be copied as encoding-agnostic by default.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    file.copy('test/fixtures/octocat.png', tmpfile.path);
    test.ok(utils.compareFiles(tmpfile.path, 'test/fixtures/octocat.png'), 'files should just be copied as encoding-agnostic by default.');
    tmpfile.unlinkSync();

    grunt.option('write', false);
    var filepath = path.join(tempdir.path, 'should-not-exist.txt');
    file.copy('test/fixtures/utf8.txt', filepath);
    test.equal(file.exists(filepath), false, 'file should NOT be created if --no-write was specified.');
  });
  it('copy and process:', function () {
    var tmpfile = new Tempfile();
    file.copy('test/fixtures/utf8.txt', tmpfile.path, {
      process: function (src, srcpath, destpath) {
        test.equal(srcpath, 'test/fixtures/utf8.txt', 'srcpath should be passed in, as-specified.');
        test.equal(destpath, tmpfile.path, 'destpath should be passed in, as-specified.');
        test.equal(Buffer.isBuffer(src), false, 'when no encoding is specified, use default encoding and process src as a string');
        test.equal(typeof src, 'string', 'when no encoding is specified, use default encoding and process src as a string');
        return 'føø' + src + 'bår';
      }
    });

    test.equal(file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should be saved as properly encoded processed string.');
    tmpfile.unlinkSync();
    tmpfile = new Tempfile();
    file.copy('test/fixtures/iso-8859-1.txt', tmpfile.path, {
      encoding: 'iso-8859-1',
      process: function (src) {
        test.equal(Buffer.isBuffer(src), false, 'use specified encoding and process src as a string');
        test.equal(typeof src, 'string', 'use specified encoding and process src as a string');
        return 'føø' + src + 'bår';
      }
    });

    test.equal(file.read(tmpfile.path, {
      encoding: 'iso-8859-1'
    }), 'føø' + this.string + 'bår', 'file should be saved as properly encoded processed string.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    file.copy('test/fixtures/utf8.txt', tmpfile.path, {
      encoding: null,
      process: function (src) {
        test.ok(Buffer.isBuffer(src), 'when encoding is specified as null, process src as a buffer');
        return new Buffer('føø' + src.toString() + 'bår');
      }
    });

    test.equal(file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should be saved as the buffer returned by process.');
    tmpfile.unlinkSync();
    file.defaultEncoding = 'iso-8859-1';
    tmpfile = new Tempfile();
    file.copy('test/fixtures/iso-8859-1.txt', tmpfile.path, {
      process: function (src) {
        test.equal(Buffer.isBuffer(src), false, 'use non-utf8 default encoding and process src as a string');
        test.equal(typeof src, 'string', 'use non-utf8 default encoding and process src as a string');
        return 'føø' + src + 'bår';
      }
    });

    test.equal(file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should be saved as properly encoded processed string.');
    tmpfile.unlinkSync();

    var filepath = path.join(tempdir.path, 'should-not-exist.txt');
    file.copy('test/fixtures/iso-8859-1.txt', filepath, {
      process: function () {
        return false;
      }
    });

    test.equal(file.exists(filepath), false, 'file should NOT be created if process returns false.');
  });

  it('copy and process, noprocess:', function () {
    var tmpfile = new Tempfile();
    file.copy('test/fixtures/utf8.txt', tmpfile.path, {
      noProcess: true,
      process: function (src) {
        return 'føø' + src + 'bår';
      }
    });

    test.equal(file.read(tmpfile.path), this.string, 'file should not have been processed.');
    tmpfile.unlinkSync();

    var files = ['process', 'noprocess', 'othernoprocess'];

    files.forEach(function (filename) {
      var filepath = path.join(tempdir.path, filename);
      file.copy('test/fixtures/utf8.txt', filepath);
      var tmpfile = new Tempfile();

      file.copy(filepath, tmpfile.path, {
        noProcess: ['**/*no*'],
        process: function (src) {
          return 'føø' + src + 'bår';
        }
      });

      if (filename === 'process') {
        test.equal(file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should have been processed.');
      } else {
        test.equal(file.read(tmpfile.path), this.string, 'file should not have been processed.');
      }
      tmpfile.unlinkSync();
    }, this);
  });

  it('copy directory recursively:', function () {
    var copyroot1 = path.join(tempdir.path, 'copy-dir-1');
    var copyroot2 = path.join(tempdir.path, 'copy-dir-2');

    file.copy('test/fixtures/expand/', copyroot1);
    file.recurse('test/fixtures/expand/', function (srcpath, rootdir, subdir, filename) {
      var destpath = path.join(copyroot1, subdir || '', filename);
      test.ok(file.isFile(srcpath), 'file should have been copied.');
      test.equal(file.read(srcpath), file.read(destpath), 'file contents should be the same.');
    });

    file.mkdir(path.join(copyroot1, 'empty'));
    file.mkdir(path.join(copyroot1, 'deep/deeper/empty'));
    file.copy(copyroot1, copyroot2, {
      process: function (contents) {
        return '<' + contents + '>';
      }
    });

    test.ok(file.isDir(path.join(copyroot2, 'empty')), 'empty directory should have been created.');
    test.ok(file.isDir(path.join(copyroot2, 'deep/deeper/empty')), 'empty directory should have been created.');
    file.recurse('test/fixtures/expand/', function (srcpath, rootdir, subdir, filename) {
      var destpath = path.join(copyroot2, subdir || '', filename);
      test.ok(file.isFile(srcpath), 'file should have been copied.');
      test.equal('<' + file.read(srcpath) + '>', file.read(destpath), 'file contents should be processed correctly.');
    });
  });
});
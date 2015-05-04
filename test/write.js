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
var grunt = require('grunt');
var Tempfile = require('temporary/lib/file');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var utils = require('./utils');
var file = require('..');

describe('file.write():', function () {
  it('.write():', function () {
    var tmpfile;
    tmpfile = new Tempfile();
    file.write(tmpfile.path, this.string);
    test.strictEqual(fs.readFileSync(tmpfile.path, 'utf8'), this.string, 'file should be written as utf8 by default.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    file.write(tmpfile.path, this.string, {
      encoding: 'iso-8859-1'
    });
    test.strictEqual(file.read(tmpfile.path, {
      encoding: 'iso-8859-1'
    }), this.string, 'file should be written using the specified encoding.');
    tmpfile.unlinkSync();

    file.defaultEncoding = 'iso-8859-1';
    tmpfile = new Tempfile();
    file.write(tmpfile.path, this.string);
    file.defaultEncoding = 'utf8';
    test.strictEqual(file.read(tmpfile.path, {
      encoding: 'iso-8859-1'
    }), this.string, 'changing the default encoding should work.');
    tmpfile.unlinkSync();

    tmpfile = new Tempfile();
    var octocat = fs.readFileSync('test/fixtures/octocat.png');
    file.write(tmpfile.path, octocat);
    test.ok(utils.compareBuffers(fs.readFileSync(tmpfile.path), octocat), 'buffers should always be written as-specified, with no attempt at re-encoding.');
    tmpfile.unlinkSync();

    grunt.option('write', false);
    var filepath = path.join(tempdir.path, 'should-not-exist.txt');
    file.write(filepath, 'test');
    test.equal(file.exists(filepath), false, 'file should NOT be created if --no-write was specified.');
  });
});


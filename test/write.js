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
var Tempfile = require('temporary/lib/file');
var Tempdir = require('temporary/lib/dir');
var utils = require('./utils');
var file = require('..');

describe('.write():', function () {
  var string = 'Ação é isso aí\n';
  var defaultEncoding;

  beforeEach(function () {
    defaultEncoding = file.defaultEncoding;
    file.defaultEncoding = 'utf8';
  });

  afterEach(function () {
    file.defaultEncoding = defaultEncoding;
  });

  it('file should be written as utf8 by default.', function () {
    var tempfile = new Tempfile();
    file.write(tempfile.path, string);
    assert.equal(fs.readFileSync(tempfile.path, 'utf8'), string);
    tempfile.unlinkSync();
  });

  it('should write a file using default encoding', function () {
    var tempfile = new Tempfile();
    file.write(tempfile.path, string, {encoding: 'iso-8859-1'});
    assert.equal(file.read(tempfile.path, {encoding: 'iso-8859-1'}), string);
    tempfile.unlinkSync();
  });

  it('should allow encoding to be changed:', function () {
    file.defaultEncoding = 'iso-8859-1';
    var tempfile = new Tempfile();
    file.write(tempfile.path, string);
    file.defaultEncoding = 'utf8';
    assert.equal(file.read(tempfile.path, {encoding: 'iso-8859-1'}), string);
    tempfile.unlinkSync();
  });

  it('should always write buffers as-specified, with no attempt at re-encoding.', function () {
    var tempfile = new Tempfile();
    var octocat = fs.readFileSync('test/fixtures/octocat.png');
    file.write(tempfile.path, octocat);
    assert.equal(utils.compareBuffers(fs.readFileSync(tempfile.path), octocat), true);
    tempfile.unlinkSync();
  });

  it('should NOT create a file if --no-write was specified.', function () {
    var tempdir = new Tempdir();
    grunt.option('write', false);
    var filepath = path.join(tempdir.path, 'should-not-exist.txt');
    file.write(filepath, 'test');
    assert.notEqual(file.exists(filepath), true);
  });
});


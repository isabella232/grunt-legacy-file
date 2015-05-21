/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var fs = require('fs');
var grunt = require('grunt');
var utils = require('./utils');
var File = require('..');
var file;

describe('.read():', function () {
  var string = 'Ação é isso aí\n';
  var object = {foo: 'Ação é isso aí', bar: ['ømg', 'pønies']};
  var defaultEncoding;

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

  describe('encoding:', function () {
    it('should read files as utf8 by default.', function () {
      assert.equal(file.read('test/fixtures/utf8.txt'), string);
    });
    it('should read a file using the specified encoding.', function () {
      assert.equal(file.read('test/fixtures/iso-8859-1.txt', {encoding: 'iso-8859-1'}), string);
    });
    it('should read as a buffer if encoding is specified as null.', function () {
      var a = file.read('test/fixtures/octocat.png', {encoding: null });
      var b = fs.readFileSync('test/fixtures/octocat.png');
      assert.equal(utils.compareBuffers(a, b), true);
    });
  });

  describe('BOM:', function () {
    it('should strip BOM (byte order marks).', function () {
      assert.equal(file.read('test/fixtures/BOM.txt'), 'foo');
    });
    it('should preserve byte order marks when `preserveBOM` is enabled.', function () {
      file.preserveBOM = true;
      assert.equal(file.read('test/fixtures/BOM.txt'), '\ufeff' + 'foo');
    });
    it('should strip byte order marks when `preserveBOM` is disabled.', function () {
      file.preserveBOM = false;
      assert.equal(file.read('test/fixtures/BOM.txt'), 'foo');
    });
    it('should work when the encoding is changed.', function () {
      file.preserveBOM = false;
      file.defaultEncoding = 'iso-8859-1';
      assert.equal(file.read('test/fixtures/iso-8859-1.txt'), string);
    });
  });

  describe('.readJSON():', function () {
    it('file should be read as utf8 by default and parsed correctly.', function () {
      assert.deepEqual(file.readJSON('test/fixtures/utf8.json'), object);
    });
    it('should read files using the user-defined encoding.', function () {
      assert.deepEqual(file.readJSON('test/fixtures/iso-8859-1.json', {encoding: 'iso-8859-1'}), object);
    });
    it('should allow encoding to be changed.', function () {
      file.defaultEncoding = 'iso-8859-1';
      assert.deepEqual(file.readJSON('test/fixtures/iso-8859-1.json'), object);
    });
  });

  describe('.readYAML():', function () {
    it('file should be read as utf8 by default and parsed correctly.', function () {
      assert.deepEqual(file.readYAML('test/fixtures/utf8.yaml'), object);
    });
    it('should read files using the user-defined encoding.', function () {
      assert.deepEqual(file.readYAML('test/fixtures/iso-8859-1.yaml', {encoding: 'iso-8859-1'}), object);
    });
    it('should allow encoding to be changed.', function () {
      file.defaultEncoding = 'iso-8859-1';
      assert.deepEqual(file.readYAML('test/fixtures/iso-8859-1.yaml'), object);
    });
  });
});

/*!
 * grunt-legacy-file <http://gruntjs.com/grunt-legacy-file>
 *
 * Copyright (c) 2015, "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

require('should');
var fs = require('fs');
var file = require('..');
var utils = require('./utils');


describe('.read():', function () {
  var string = 'Ação é isso aí\n';
  var object = {foo: 'Ação é isso aí', bar: ['ømg', 'pønies']};
  var defaultEncoding;

  beforeEach(function (done) {
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
      file.read('test/fixtures/utf8.txt').should.equal(string);
    });
    it('should read a file using the specified encoding.', function () {
      file.read('test/fixtures/iso-8859-1.txt', {encoding: 'iso-8859-1'}).should.equal(string);
    });
    it('should read as a buffer if encoding is specified as null.', function () {
      var a = file.read('test/fixtures/octocat.png', {encoding: null });
      var b = fs.readFileSync('test/fixtures/octocat.png');
      utils.compareBuffers(a, b);
    });
  });

  describe('BOM:', function () {
    it('should strip BOM (byte order marks).', function () {
      file.read('test/fixtures/BOM.txt').should.equal('foo');
    });
    it('should preserve byte order marks when `preserveBOM` is enabled.', function () {
      file.preserveBOM = true;
      file.read('test/fixtures/BOM.txt').should.equal('\ufeff' + 'foo');
    });
    it('should strip byte order marks when `preserveBOM` is disabled.', function () {
      file.preserveBOM = false;
      file.read('test/fixtures/BOM.txt').should.equal('foo');
    });
    it('should work when the encoding is changed.', function () {
      file.preserveBOM = false;
      file.defaultEncoding = 'iso-8859-1';
      file.read('test/fixtures/iso-8859-1.txt').should.equal(string);
    });
  });

  describe('.readJSON():', function () {
    it('file should be read as utf8 by default and parsed correctly.', function () {
      file.readJSON('test/fixtures/utf8.json').should.eql(object);
    });
    it('should read files using the user-defined encoding.', function () {
      file.readJSON('test/fixtures/iso-8859-1.json', {encoding: 'iso-8859-1'}).should.eql(object);
    });
    it('should allow encoding to be changed.', function () {
      file.defaultEncoding = 'iso-8859-1';
      file.readJSON('test/fixtures/iso-8859-1.json').should.eql(object);
    });
  });

  describe('.readYAML():', function () {
    it('file should be read as utf8 by default and parsed correctly.', function () {
      file.readYAML('test/fixtures/utf8.yaml').should.eql(object);
    });
    it('should read files using the user-defined encoding.', function () {
      file.readYAML('test/fixtures/iso-8859-1.yaml', {encoding: 'iso-8859-1'}).should.eql(object);
    });
    it('should allow encoding to be changed.', function () {
      file.defaultEncoding = 'iso-8859-1';
      file.readYAML('test/fixtures/iso-8859-1.yaml').should.eql(object);
    });
  });
});

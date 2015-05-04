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

describe('file.read():', function () {
  describe('read():', function () {
    
    it('.read():', function () {
      test.strictEqual(file.read('test/fixtures/utf8.txt'), this.string, 'file should be read as utf8 by default.');
      test.strictEqual(file.read('test/fixtures/iso-8859-1.txt', {
        encoding: 'iso-8859-1'
      }), this.string, 'file should be read using the specified encoding.');
      test.ok(utils.compareBuffers(file.read('test/fixtures/octocat.png', {
        encoding: null
      }), fs.readFileSync('test/fixtures/octocat.png')), 'file should be read as a buffer if encoding is specified as null.');

      test.strictEqual(file.read('test/fixtures/BOM.txt'), 'foo', 'file should have BOM stripped.');
      file.preserveBOM = true;
      test.strictEqual(file.read('test/fixtures/BOM.txt'), '\ufeff' + 'foo', 'file should have BOM preserved.');
      file.preserveBOM = false;

      file.defaultEncoding = 'iso-8859-1';
      test.strictEqual(file.read('test/fixtures/iso-8859-1.txt'), this.string, 'changing the default encoding should work.');
    });
    it('.readJSON():', function () {
      var obj;
      obj = file.readJSON('test/fixtures/utf8.json');
      test.eql(obj, this.object, 'file should be read as utf8 by default and parsed correctly.');

      obj = file.readJSON('test/fixtures/iso-8859-1.json', {
        encoding: 'iso-8859-1'
      });
      test.eql(obj, this.object, 'file should be read using the specified encoding.');
      file.defaultEncoding = 'iso-8859-1';
      obj = file.readJSON('test/fixtures/iso-8859-1.json');
      test.eql(obj, this.object, 'changing the default encoding should work.');
    });
    it('.readYAML():', function () {
      var obj;
      obj = file.readYAML('test/fixtures/utf8.yaml');
      test.eql(obj, this.object, 'file should be read as utf8 by default and parsed correctly.');

      obj = file.readYAML('test/fixtures/iso-8859-1.yaml', {
        encoding: 'iso-8859-1'
      });
      test.eql(obj, this.object, 'file should be read using the specified encoding.');

      file.defaultEncoding = 'iso-8859-1';
      obj = file.readYAML('test/fixtures/iso-8859-1.yaml');
      test.eql(obj, this.object, 'changing the default encoding should work.');
    });

  });
});


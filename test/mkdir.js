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
var File = require('..');
var file;

describe('.mkdir():', function () {
  before(function () {
    file = new File({grunt: grunt, log: grunt.log});
    file.mkdir(__dirname + '/temp');
  });
  after(function () {
    file.delete(__dirname + '/temp/');
  });

  it('should not explode when a directory already exists:', function () {
    assert.doesNotThrow(function () {
      file.mkdir(__dirname + '/temp/');
    });
  });

  it('filepath should still exist.', function () {
    assert.equal(fs.existsSync(__dirname + '/temp/'), true);
  });

  it('should not explode when a directory does NOT already exists:', function () {
    assert.doesNotThrow(function () {
      file.mkdir(__dirname + '/temp/aa/bb/cc');
    });
  });

  it('filepath should still exist.', function () {
    assert.equal(fs.existsSync(__dirname + '/temp/aa/bb/cc'), true);
  });

  it('should not explode when a directory does NOT already exists:', function () {
    assert.doesNotThrow(function () {
      file.mkdir(__dirname + '/temp/aa/bb/cc');
    });
  });

  it('filepath should still exist.', function () {
    assert.equal(fs.existsSync(__dirname + '/temp/aa/bb/cc'), true);
  });

  it('should throw if a path cannot be created (ENOTDIR).', function () {
    fs.writeFileSync(path.join(__dirname + '/temp/aa/bb/xx'), 'test');

    assert.throws(function () {
      file.mkdir(path.join(__dirname + '/temp/aa/bb/xx/yy'));
    }, Error);
  });
});

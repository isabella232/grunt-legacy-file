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
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var file = require('..');

describe('file.mkdir():', function () {
  it('.mkdir():', function () {
    test.doesNotThrow(function () {
      file.mkdir(tempdir.path);
    }, 'Should not explode if the directory already exists.');
    test.ok(fs.existsSync(tempdir.path), 'path should still exist.');

    test.doesNotThrow(function () {
      file.mkdir(path.join(tempdir.path, 'aa/bb/cc'));
    }, 'Should also not explode, otherwise.');
    test.ok(path.join(tempdir.path, 'aa/bb/cc'), 'path should have been created.');

    fs.writeFileSync(path.join(tempdir.path, 'aa/bb/xx'), 'test');
    test.throws(function () {
      file.mkdir(path.join(tempdir.path, 'aa/bb/xx/yy'));
    }, 'Should throw if a path cannot be created (ENOTDIR).');
  });
});

/*!
 * grunt-legacy-file <http://gruntjs.com/grunt-legacy-file>
 *
 * Copyright (c) 2015, "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

require('should');
var path = require('path');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var file = require('..');

describe('file.exists():', function () {
  it('.exists():', function () {
    test.ok(file.exists('test/fixtures/octocat.png'), 'files exist.');
    test.ok(file.exists('test', 'fixtures', 'octocat.png'), 'should work for paths in parts.');
    test.ok(file.exists('test/fixtures'), 'directories exist.');
    test.ok(file.exists(path.join(tempdir.path, 'octocat.png')), 'file links exist.');
    test.ok(file.exists(path.join(tempdir.path, 'expand')), 'directory links exist.');
    test.equal(file.exists('test/fixtures/does/not/exist'), false, 'nonexistent files do not exist.');
  });
});
/*
 * grunt-legacy-file <http://gruntjs.com/grunt-legacy-file>
 *
 * Copyright (c) 2015, "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

/* deps: mocha temporary */
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var should = require('should');

var file = require('../');
var grunt = require('./support/grunt');
var Tempfile = require('temporary/lib/file');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('.file.match():', function () {
  it('.delete():', function () {
    
    var oldBase = process.cwd();
    var cwd = path.resolve(tempdir.path, 'delete', 'folder');
    file.mkdir(cwd);
    file.setBase(tempdir.path);

    file.write(path.join(cwd, 'test.js'), 'var test;');
    test.ok(file.delete(cwd), 'should return true after deleting file.');
    test.equal(file.exists(cwd), false, 'file should have been deleted.');
    file.setBase(oldBase);

  });

  it('delete nonexistent file:', function () {
    
    this.resetWarnCount();
    test.ok(!file.delete('nonexistent'), 'should return false if file does not exist.');
    test.ok(this.warnCount, 'should issue a warning when deleting non-existent file');

  });
  it('delete outside working directory:', function () {
    
    var oldBase = process.cwd();
    var cwd = path.resolve(tempdir.path, 'delete', 'folder');
    var outsidecwd = path.resolve(tempdir.path, 'delete', 'outsidecwd');
    file.mkdir(cwd);
    file.mkdir(outsidecwd);
    file.setBase(cwd);

    file.write(path.join(outsidecwd, 'test.js'), 'var test;');

    this.resetWarnCount();
    test.equal(file.delete(path.join(outsidecwd, 'test.js')), false, 'should not delete anything outside the cwd.');
    test.ok(this.warnCount, 'should issue a warning when deleting outside working directory');

    test.ok(file.delete(path.join(outsidecwd), {
      force: true
    }), 'should delete outside cwd when using the --force.');
    test.equal(file.exists(outsidecwd), false, 'file outside cwd should have been deleted when using the --force.');

    file.setBase(oldBase);

  });
  it('dont delete current working directory:', function () {
    
    var oldBase = process.cwd();
    var cwd = path.resolve(tempdir.path, 'dontdelete', 'folder');
    file.mkdir(cwd);
    file.setBase(cwd);

    this.resetWarnCount();
    test.equal(file.delete(cwd), false, 'should not delete the cwd.');
    test.ok(this.warnCount, 'should issue a warning when trying to delete cwd');

    test.ok(file.exists(cwd), 'the cwd should exist.');

    file.setBase(oldBase);

  });
  it('dont actually delete with no-write option on:', function () {
    
    grunt.option('write', false);

    var oldBase = process.cwd();
    var cwd = path.resolve(tempdir.path, 'dontdelete', 'folder');
    file.mkdir(cwd);
    file.setBase(tempdir.path);

    file.write(path.join(cwd, 'test.js'), 'var test;');
    test.ok(file.delete(cwd), 'should return true after not actually deleting file.');
    test.equal(file.exists(cwd), true, 'file should NOT be deleted if --no-write was specified.');
    file.setBase(oldBase);


  });
});

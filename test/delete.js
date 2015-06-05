/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

/* deps: mocha temporary */
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var grunt = require('grunt');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var File = require('..').File;
var file;

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('file.delete():', function () {
  var original, cwd;

  before(function(done) {
    file = new File({grunt: grunt});
    this.writeOption = grunt.option('write');

    // Testing that warnings were displayed.
    this.oldFailWarnFn = grunt.fail.warn;
    this.oldLogWarnFn = file.log.warn;

    this.resetWarnCount = function() {
      this.warnCount = 0;
    }.bind(this);

    grunt.fail.warn = file.log.warn = function() {
      this.warnCount += 1;
    }.bind(this);

    original = process.cwd();
    cwd = path.resolve(tempdir.path, 'delete', 'folder');
    done();
  });

  after(function(done) {
    grunt.option('write', this.writeOption);
    grunt.fail.warn = this.oldFailWarnFn;
    file.log.warn = this.oldLogWarnFn;
    file.setBase(original);
    done();
  });

  describe('basic delete operations:', function () {
    it('.delete():', function () {
      file.mkdir(cwd);
      file.setBase(tempdir.path);
      file.write(path.join(cwd, 'test.js'), 'var test;');
    });

    it('should return true after deleting file.', function () {
      assert.equal(file.delete(cwd), true);
    });

    it('file should have been deleted.', function () {
      assert.equal(file.exists(cwd), false);
    });

    it('should return false when attempting to delete a nonexistent file.', function () {
      assert.equal(file.delete('nonexistent'), false);
    });

    it('should issue a warning when attempting to delete a nonexistent file', function () {
      this.resetWarnCount();
      assert.equal(file.delete('nonexistent'), false);
      assert.equal(this.warnCount, true);
    });
  });


  describe('current working directory:', function () {
    var outsidecwd;

    beforeEach(function () {
      outsidecwd = path.resolve(tempdir.path, 'delete', 'outsidecwd');
      file.mkdir(cwd);
      file.mkdir(outsidecwd);
      file.setBase(cwd);

      file.write(path.join(outsidecwd, 'test.js'), 'var test;');
      this.resetWarnCount();
    });
    afterEach(function () {
      file.setBase(original);
    });

    it('should not delete anything outside the cwd by default:', function () {
     assert.equal(file.delete(path.join(outsidecwd, 'test.js')), false);
    });

    it('should issue a warning when deleting outside the cwd:', function () {
      assert.equal(file.delete(path.join(outsidecwd, 'test.js')), false);
      assert.equal(this.warnCount, 1);
    });

    it('should delete outside cwd when using the --force:', function () {
      assert.equal(file.delete(path.join(outsidecwd), {force: true }), true);
    });

    it('file outside cwd should have been deleted when using the --force:', function () {
      file.delete(path.join(outsidecwd), {force: true });
      assert.equal(file.exists(outsidecwd), false);
    });
  });

  describe('prevent accidental deletion of actual cwd:', function () {
    beforeEach(function () {
      cwd = path.resolve(tempdir.path, 'dontdelete', 'folder');
      file.mkdir(cwd);
      file.setBase(cwd);
    });
    afterEach(function () {
      file.setBase(original);
    });

    it('should not delete the cwd:', function () {
      this.resetWarnCount();
      assert.notEqual(file.delete(cwd), true);
    });

    it('should issue a warning when trying to delete cwd:', function () {
      this.resetWarnCount();
      file.delete(cwd);
      assert.equal(this.warnCount, 1);
    });

    it('the cwd should exist after trying to delete it:', function () {
      file.delete(cwd);
      assert.equal(file.exists(cwd), true);
    });
  });

  describe('options.nowrite', function () {
    beforeEach(function () {
      cwd = path.resolve(tempdir.path, 'dontdelete', 'folder');
      file.mkdir(cwd);
      file.setBase(tempdir.path);
      file.write(path.join(cwd, 'test.js'), 'var test;');
      grunt.option('write', false);
    });
    afterEach(function () {
      file.setBase(original);
    });

    it('should not delete when the `nowrite` option is enabled (but still return `true`):', function () {
      assert.equal(file.delete(cwd), true);
    });

    it('file should still exist if `--no-write` was specified.', function () {
      file.delete(cwd);
      assert.equal(file.exists(cwd), true);
    });
  });
});

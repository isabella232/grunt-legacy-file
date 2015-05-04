/*!
 * grunt-legacy-file <http://gruntjs.com/grunt-legacy-file>
 *
 * Copyright (c) 2015, "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

/* deps: mocha temporary */
require('should');
var fs = require('fs');
var path = require('path');
var grunt = require('grunt');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var file = require('..');

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('file.delete():', function () {
  var original, cwd;
  
  before(function(cb) {
    this.writeOption = grunt.option('write');

    // Testing that warnings were displayed.
    this.oldFailWarnFn = grunt.fail.warn;
    this.oldLogWarnFn = grunt.log.warn;
    this.resetWarnCount = function() {
      this.warnCount = 0;
    }.bind(this);

    grunt.fail.warn = grunt.log.warn = function() {
      this.warnCount += 1;
    }.bind(this);
    cb();
  });

  after(function(done) {
    file.defaultEncoding = this.defaultEncoding;
    grunt.option('write', this.writeOption);

    grunt.fail.warn = this.oldFailWarnFn;
    grunt.log.warn = this.oldLogWarnFn;
    done();
  });

  before(function () {
    original = process.cwd();
    cwd = path.resolve(tempdir.path, 'delete', 'folder');
  });
  after(function () {
    file.setBase(original);
  });

  describe('basic delete operations:', function () {
    it('.delete():', function () {
      file.mkdir(cwd);
      file.setBase(tempdir.path);
      file.write(path.join(cwd, 'test.js'), 'var test;');
    });

    it('should return true after deleting file.', function () {
      file.delete(cwd).should.be.ok;
    });
    
    it('file should have been deleted.', function () {
      file.exists(cwd).should.not.be.ok;
    });

    it('should return false when attempting to delete a nonexistent file.', function () {
      file.delete('nonexistent').should.not.be.ok;
    });

    it('should issue a warning when attempting to delete a nonexistent file', function () {
      this.resetWarnCount();
      file.delete('nonexistent').should.not.be.ok;
      this.warnCount.should.be.ok;
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
      file.delete(path.join(outsidecwd, 'test.js')).should.not.be.ok;
    });

    it('should issue a warning when deleting outside the cwd:', function () {
      file.delete(path.join(outsidecwd, 'test.js')).should.not.be.ok;
      this.warnCount.should.equal(1);
    });

    it('should delete outside cwd when using the --force:', function () {
      file.delete(path.join(outsidecwd), {force: true }).should.be.ok;
    });

    it('file outside cwd should have been deleted when using the --force:', function () {
      file.delete(path.join(outsidecwd), {force: true });
      file.exists(outsidecwd).should.be.false;
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
      file.delete(cwd).should.not.be.ok;
    });

    it('should issue a warning when trying to delete cwd:', function () {
      this.resetWarnCount();
      file.delete(cwd);
      this.warnCount.should.equal(1);
    });

    it('the cwd should exist after trying to delete it:', function () {
      file.delete(cwd);
      file.exists(cwd).should.be.true;
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
      file.delete(cwd).should.be.true;
    });

    it('file should still exist if `--no-write` was specified.', function () {
      file.delete(cwd);
      file.exists(cwd).should.be.true;
    });
  });
});

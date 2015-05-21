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
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var File = require('..');
var file;

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('file.expandMapping():', function () {
  var actual, expected;

  beforeEach(function (done) {
    file = new File({grunt: grunt});
    this.cwd = process.cwd();
    process.chdir('test/fixtures');
    done();
  });
  afterEach(function (done) {
    process.chdir(this.cwd);
    done();
  });

  describe('trailing slash handling:', function () {
    var expected = [{
      dest: 'dest/expand/deep/deep.txt',
      src: ['expand/deep/deep.txt']
    }, {
      dest: 'dest/expand/deep/deeper/deeper.txt',
      src: ['expand/deep/deeper/deeper.txt']
    }, {
      dest: 'dest/expand/deep/deeper/deepest/deepest.txt',
      src: ['expand/deep/deeper/deepest/deepest.txt']
    }, ];

    it('`destBase` should behave the same both with or without trailing slash:', function () {
      assert.deepEqual(file.expandMapping(['expand/**/*.txt'], 'dest'), expected);
      assert.deepEqual(file.expandMapping(['expand/**/*.txt'], 'dest/'), expected);
    });
  });

  describe('options.flatten:', function () {
    var expected = [{
      dest: 'dest/deep.txt',
      src: ['expand/deep/deep.txt']
    }, {
      dest: 'dest/deeper.txt',
      src: ['expand/deep/deeper/deeper.txt']
    }, {
      dest: 'dest/deepest.txt',
      src: ['expand/deep/deeper/deepest/deepest.txt']
    }, ];

    it('dest paths should be flattened pre-destBase+destPath join', function () {
      assert.deepEqual(file.expandMapping(['expand/**/*.txt'], 'dest', {flatten: true}), expected);
    });
  });

  describe('options.ext:', function () {
    it('should add the specified extension:', function () {
      expected = [{
        dest: 'dest/expand/deep/deep.foo',
        src: ['expand/deep/deep.txt']
      }, {
        dest: 'dest/expand/deep/deeper/deeper.foo',
        src: ['expand/deep/deeper/deeper.txt']
      }, {
        dest: 'dest/expand/deep/deeper/deepest/deepest.foo',
        src: ['expand/deep/deeper/deepest/deepest.txt']
      }, ];
      assert.deepEqual(file.expandMapping(['expand/**/*.txt'], 'dest', {ext: '.foo'}), expected);
    });

    it('should add the specified extension:', function () {
      expected = [{
        dest: 'dest/expand-mapping-ext/dir.ectory/file-no-extension.foo',
        src: ['expand-mapping-ext/dir.ectory/file-no-extension']
      }, {
        dest: 'dest/expand-mapping-ext/dir.ectory/sub.dir.ectory/file.foo',
        src: ['expand-mapping-ext/dir.ectory/sub.dir.ectory/file.ext.ension']
      }, {
        dest: 'dest/expand-mapping-ext/file.foo',
        src: ['expand-mapping-ext/file.ext.ension']
      }, ];
      assert.deepEqual(file.expandMapping(['expand-mapping-ext/**/file*'], 'dest', {ext: '.foo'}), expected);
    });

    it('empty string extension should be added', function () {
      expected = [{
        dest: 'dest/expand/deep/deep',
        src: ['expand/deep/deep.txt']
      }, {
        dest: 'dest/expand/deep/deeper/deeper',
        src: ['expand/deep/deeper/deeper.txt']
      }, {
        dest: 'dest/expand/deep/deeper/deepest/deepest',
        src: ['expand/deep/deeper/deepest/deepest.txt']
      }, ];
      assert.deepEqual(file.expandMapping(['expand/**/*.txt'], 'dest', {ext: ''}), expected);
    });
  });

  it('options.extDot:', function () {
    actual = file.expandMapping(['expand-mapping-ext/**/file*'], 'dest', {
      ext: '.foo',
      extDot: 'first'
    });
    expected = [{
      dest: 'dest/expand-mapping-ext/dir.ectory/file-no-extension.foo',
      src: ['expand-mapping-ext/dir.ectory/file-no-extension']
    }, {
      dest: 'dest/expand-mapping-ext/dir.ectory/sub.dir.ectory/file.foo',
      src: ['expand-mapping-ext/dir.ectory/sub.dir.ectory/file.ext.ension']
    }, {
      dest: 'dest/expand-mapping-ext/file.foo',
      src: ['expand-mapping-ext/file.ext.ension']
    }, ];
    // 'extDot of `first` should replace everything after the first dot in the filename.'
    assert.deepEqual(actual, expected); 

    actual = file.expandMapping(['expand-mapping-ext/**/file*'], 'dest', {
      ext: '.foo',
      extDot: 'last'
    });
    expected = [{
      dest: 'dest/expand-mapping-ext/dir.ectory/file-no-extension.foo',
      src: ['expand-mapping-ext/dir.ectory/file-no-extension']
    }, {
      dest: 'dest/expand-mapping-ext/dir.ectory/sub.dir.ectory/file.ext.foo',
      src: ['expand-mapping-ext/dir.ectory/sub.dir.ectory/file.ext.ension']
    }, {
      dest: 'dest/expand-mapping-ext/file.ext.foo',
      src: ['expand-mapping-ext/file.ext.ension']
    }, ];
    // 'extDot of `last` should replace everything after the last dot in the filename.'
    assert.deepEqual(actual, expected); 
  });

  it('options.cwd:', function () {
    var actual = file.expandMapping(['**/*.txt'], 'dest', {
      cwd: 'expand'
    });
    var expected = [{
      dest: 'dest/deep/deep.txt',
      src: ['expand/deep/deep.txt']
    }, {
      dest: 'dest/deep/deeper/deeper.txt',
      src: ['expand/deep/deeper/deeper.txt']
    }, {
      dest: 'dest/deep/deeper/deepest/deepest.txt',
      src: ['expand/deep/deeper/deepest/deepest.txt']
    }, ];
    // 'cwd should be stripped from front of destPath, pre-destBase+destPath join'
    assert.deepEqual(actual, expected); 
  });

  it('options.rename:', function () {
    var actual = file.expandMapping(['**/*.txt'], 'dest', {
      cwd: 'expand',
      flatten: true,
      rename: function (destBase, destPath, options) {
        return path.join(destBase, options.cwd, 'o-m-g', destPath);
      }
    });

    var expected = [{
      dest: 'dest/expand/o-m-g/deep.txt',
      src: ['expand/deep/deep.txt']
    }, {
      dest: 'dest/expand/o-m-g/deeper.txt',
      src: ['expand/deep/deeper/deeper.txt']
    }, {
      dest: 'dest/expand/o-m-g/deepest.txt',
      src: ['expand/deep/deeper/deepest/deepest.txt']
    }, ];
    // 'custom rename function should be used to build dest, post-flatten'
    assert.deepEqual(actual, expected); 
  });

  it('rename to same dest:', function () {
    var actual = file.expandMapping(['**/*'], 'dest', {
      filter: 'isFile',
      cwd: 'expand',
      flatten: true,
      rename: function (destBase, destPath) {
        return path.join(destBase, 'all' + path.extname(destPath));
      }
    });
    var expected = [{
      dest: 'dest/all.css',
      src: ['expand/css/baz.css', 'expand/css/qux.css']
    }, {
      dest: 'dest/all.txt',
      src: ['expand/deep/deep.txt', 'expand/deep/deeper/deeper.txt', 'expand/deep/deeper/deepest/deepest.txt']
    }, {
      dest: 'dest/all.js',
      src: ['expand/js/bar.js', 'expand/js/foo.js']
    }, {
      dest: 'dest/all.md',
      src: ['expand/README.md']
    }];
// 'if dest is same for multiple src, create an array of src'

    assert.deepEqual(actual, expected); 
  });
});

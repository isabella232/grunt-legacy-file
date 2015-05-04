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

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('file.expandMapping():', function () {
  var actual, expected;

  beforeEach(function (done) {
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
      file.expandMapping(['expand/**/*.txt'], 'dest').should.eql(expected); 
      file.expandMapping(['expand/**/*.txt'], 'dest/').should.eql(expected);
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
      file.expandMapping(['expand/**/*.txt'], 'dest', {flatten: true}).should.eql(expected);
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
      file.expandMapping(['expand/**/*.txt'], 'dest', {ext: '.foo'}).should.eql(expected); 
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
      file.expandMapping(['expand-mapping-ext/**/file*'], 'dest', {ext: '.foo'}).should.eql(expected); 
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
      file.expandMapping(['expand/**/*.txt'], 'dest', {ext: ''}).should.eql(expected);
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
    actual.should.eql(expected); // 'extDot of `first` should replace everything after the first dot in the filename.'

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
    actual.should.eql(expected); // 'extDot of `last` should replace everything after the last dot in the filename.'
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
    actual.should.eql(expected); // 'cwd should be stripped from front of destPath, pre-destBase+destPath join'
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
    actual.should.eql(expected); // 'custom rename function should be used to build dest, post-flatten'
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
      dest: 'dest/all.md',
      src: ['expand/README.md']
    }, {
      dest: 'dest/all.css',
      src: ['expand/css/baz.css', 'expand/css/qux.css']
    }, {
      dest: 'dest/all.txt',
      src: ['expand/deep/deep.txt', 'expand/deep/deeper/deeper.txt', 'expand/deep/deeper/deepest/deepest.txt']
    }, {
      dest: 'dest/all.js',
      src: ['expand/js/bar.js', 'expand/js/foo.js']
    }];
    actual.should.eql(expected); // 'if dest is same for multiple src, create an array of src'
  });
});

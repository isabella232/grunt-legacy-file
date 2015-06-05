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
var File = require('..').File;
var file;
var cwd;

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('file.expand():', function () {
  beforeEach(function (cb) {
    file = new File({grunt: grunt});
    cwd = process.cwd();
    process.chdir('test/fixtures/expand');
    cb();
  });
  afterEach(function (cb) {
    process.chdir(cwd);
    cb();
  });

  describe('basic matching:', function () {
    it('should match:', function () {
      assert.deepEqual(file.expand('**/*.js'), ['js/bar.js', 'js/foo.js'], 'should match.');
      assert.deepEqual(file.expand('**/*.js', '**/*.css'), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
      assert.deepEqual(file.expand(['**/*.js', '**/*.css']), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
      assert.deepEqual(file.expand('**d*/**'), ['deep', 'deep/deep.txt', 'deep/deeper', 'deep/deeper/deeper.txt', 'deep/deeper/deepest', 'deep/deeper/deepest/deepest.txt'], 'should match files and directories.');
      assert.deepEqual(file.expand('**d*/**/'), ['deep/', 'deep/deeper/', 'deep/deeper/deepest/'], 'should match directories, arbitrary / at the end appears in matches.');
    });
    it('should fail to match.', function () {
      assert.deepEqual(file.expand('*.xyz'), []);
    });
  });

  describe('unique results:', function () {
    it('file list should be uniqed.', function () {
      assert.deepEqual(file.expand('**/*.js', 'js/*.js'), ['js/bar.js', 'js/foo.js']);
      assert.deepEqual(file.expand('**/*.js', '**/*.css', 'js/*.js'), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css']);
    });

    it('mixed non-ending-/ and ending-/ dirs will not be uniqed by default.', function () {
      assert.deepEqual(file.expand('js', 'js/'), ['js', 'js/']);
    });

    it('mixed non-ending-/ and ending-/ dirs will be uniqed when `mark` is enabled.', function () {
      assert.deepEqual(file.expand({ mark: true }, 'js', 'js/'), ['js/']);
    });
  });

  describe('file order:', function () {
    var actual, expected;
    it('should select 4 files in this order, by default.', function () {
      actual = file.expand('**/*.{js,css}');
      expected = ['css/baz.css', 'css/qux.css', 'js/bar.js', 'js/foo.js'];
      assert.deepEqual(actual, expected);
    });
    it('specifically-specified-up-front file order should be maintained.', function () {
      actual = file.expand('js/foo.js', 'js/bar.js', '**/*.{js,css}');
      expected = ['js/foo.js', 'js/bar.js', 'css/baz.css', 'css/qux.css'];
      assert.deepEqual(actual, expected);
    });
    it('specifically-specified-up-front file order should be maintained.', function () {
      actual = file.expand('js/bar.js', 'js/foo.js', '**/*.{js,css}');
      expected = ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'];
      assert.deepEqual(actual, expected);
    });
    it('if a file is excluded and then re-added, it should be added at the end.', function () {
      actual = file.expand('js/foo.js', '**/*.{js,css}', '!js/bar.js', 'js/bar.js');
      expected = ['js/foo.js', 'css/baz.css', 'css/qux.css', 'js/bar.js'];
      assert.deepEqual(actual, expected);
    });
  });

  it('flatten:', function () {
    assert.deepEqual(file.expand([['**/*.js'], ['**/*.css', 'js/*.js'] ]), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
  });
});

describe('exclusion:', function () {
  beforeEach(function (cb) {
    cwd = process.cwd();
    process.chdir('test/fixtures/expand');
    cb();
  });
  afterEach(function (cb) {
    process.chdir(cwd);
    cb();
  });

  it('solitary exclusion should match nothing', function() {
    assert.deepEqual(file.expand(['!js/*.js']), []);
  });
  it('exclusion should cancel match', function() {
    assert.deepEqual(file.expand(['js/bar.js', '!js/bar.js']), []);
  });
  it('should omit single file from matched set', function() {
    assert.deepEqual(file.expand(['**/*.js', '!js/foo.js']), ['js/bar.js']);
  });
  it('inclusion / exclusion order matters', function() {
    assert.deepEqual(file.expand(['!js/foo.js', '**/*.js']), ['js/bar.js', 'js/foo.js']);
  });
  it('multiple exclusions should be removed from the set', function() {
    assert.deepEqual(file.expand(['**/*.js', '**/*.css', '!js/bar.js', '!css/baz.css']), ['js/foo.js', 'css/qux.css']);
  });
  it('excluded wildcards should be removed from the matched set', function() {
    assert.deepEqual(file.expand(['**/*.js', '**/*.css', '!**/*.css']), ['js/bar.js', 'js/foo.js']);
  });
  it('different pattern for exclusion should still work', function() {
    assert.deepEqual(file.expand(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css', '!**/b*.*']), ['js/foo.js', 'css/qux.css']);
  });
  it('should respect the order of inclusion / exclusion:', function () {
    assert.deepEqual(file.expand(['js/bar.js', '!**/b*.*', 'js/foo.js', 'css/baz.css', 'css/qux.css']), ['js/foo.js', 'css/baz.css', 'css/qux.css']);
  });
});

describe('options:', function () {
  beforeEach(function (cb) {
    cwd = process.cwd();
    process.chdir('test/fixtures/expand');
    cb();
  });
  afterEach(function (cb) {
    process.chdir(cwd);
    cb();
  });

  describe('options.mark (minimatch):', function () {
    it('should ensure that directories end in /', function () {
      assert.deepEqual(file.expand({mark: true }, '**d*/**'), ['deep/', 'deep/deep.txt', 'deep/deeper/', 'deep/deeper/deeper.txt', 'deep/deeper/deepest/', 'deep/deeper/deepest/deepest.txt']);
    });

    it('should match directories, arbitrary / at the end appears in matches.', function () {
      assert.deepEqual(file.expand({mark: true }, '**d*/**/'), ['deep/', 'deep/deeper/', 'deep/deeper/deepest/']);
    });
  });

  describe('options.filter:', function () {
    it('`isFile` should match files only.', function () {
      assert.deepEqual(file.expand({filter: 'isFile'}, '**d*/**'), ['deep/deep.txt', 'deep/deeper/deeper.txt', 'deep/deeper/deepest/deepest.txt']);
    });
    it('`isDirectory` should match directories only.', function () {
      assert.deepEqual(file.expand({filter: 'isDirectory'}, '**d*/**'), ['deep', 'deep/deeper', 'deep/deeper/deepest']);
    });
    it('should allow a custom filter function to be passed.', function () {
      function filter(fp) {
        return (/deepest/).test(fp);
      }
      assert.deepEqual(file.expand({filter: filter}, '**'), ['deep/deeper/deepest', 'deep/deeper/deepest/deepest.txt', ]);
    });
    it('should not return files that fail to match.', function () {
      assert.deepEqual(file.expand({filter: 'isFile'}, 'js', 'css'), []);
    });
    it('should not return directories that fail to match.', function () {
      assert.deepEqual(file.expand({filter: 'isDirectory'}, '**/*.js'), []);
    });
  });

  describe('options.matchBase:', function () {
    it('options.matchBase:', function () {
      var opts = {matchBase: true};
      assert.deepEqual(file.expand('*.js'), [], 'should not matchBase (minimatch) by default.');
      assert.deepEqual(file.expand(opts, '*.js'), ['js/bar.js', 'js/foo.js'], 'options should be passed through to minimatch.');
      assert.deepEqual(file.expand(opts, '*.js', '*.css'), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
      assert.deepEqual(file.expand(opts, ['*.js', '*.css']), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
    });
  });

  describe('options.cwd:', function () {
    it('options.cwd:', function () {
      var cwd = path.resolve(process.cwd(), '..');
      assert.deepEqual(file.expand({cwd: cwd}, ['expand/js', 'expand/js/*']), ['expand/js', 'expand/js/bar.js', 'expand/js/foo.js'], 'should match.');
      assert.deepEqual(file.expand({cwd: cwd, filter: 'isFile'}, ['expand/js', 'expand/js/*']), ['expand/js/bar.js', 'expand/js/foo.js'], 'should match.');
      assert.deepEqual(file.expand({cwd: cwd, filter: 'isDirectory'}, ['expand/js', 'expand/js/*']), ['expand/js'], 'should match.');
      assert.deepEqual(file.expand({cwd: cwd, filter: 'isFile'}, ['expand/js', 'expand/js/*', '!**/b*.js']), ['expand/js/foo.js'], 'should negate properly.');
    });
  });

  describe('options.nonull:', function () {
    var opts = {nonull: true};

    it('should return non-matching glob patterns in the result set.', function () {
      assert.deepEqual(file.expand(opts, ['js/a*', 'js/b*', 'js/c*']), ['js/a*', 'js/bar.js', 'js/c*']);
      assert.deepEqual(file.expand(opts, ['js/foo.js', 'js/bar.js', 'js/baz.js']), ['js/foo.js', 'js/bar.js', 'js/baz.js']);
    });
  });
});

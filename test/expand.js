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
var cwd;

fs.symlinkSync(path.resolve('test/fixtures/octocat.png'), path.join(tempdir.path, 'octocat.png'), 'file');
fs.symlinkSync(path.resolve('test/fixtures/expand'), path.join(tempdir.path, 'expand'), 'dir');

describe('file.expand():', function () {
  beforeEach(function (cb) {
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
      file.expand('**/*.js').should.eql(['js/bar.js', 'js/foo.js'], 'should match.');
      file.expand('**/*.js', '**/*.css').should.eql(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
      file.expand(['**/*.js', '**/*.css']).should.eql(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
      file.expand('**d*/**').should.eql(['deep', 'deep/deep.txt', 'deep/deeper', 'deep/deeper/deeper.txt', 'deep/deeper/deepest', 'deep/deeper/deepest/deepest.txt'], 'should match files and directories.');
      file.expand('**d*/**/').should.eql(['deep/', 'deep/deeper/', 'deep/deeper/deepest/'], 'should match directories, arbitrary / at the end appears in matches.');
    });
    it('should fail to match.', function () {
      file.expand('*.xyz').should.eql([]);
    });
  });

  describe('unique results:', function () {
    it('file list should be uniqed.', function () {
      file.expand('**/*.js', 'js/*.js').should.eql(['js/bar.js', 'js/foo.js']);
      file.expand('**/*.js', '**/*.css', 'js/*.js').should.eql(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css']);
    });

    it('mixed non-ending-/ and ending-/ dirs will not be uniqed by default.', function () {
      file.expand('js', 'js/').should.eql(['js', 'js/']);
    });

    it('mixed non-ending-/ and ending-/ dirs will be uniqed when `mark` is enabled.', function () {
      file.expand({ mark: true }, 'js', 'js/').should.eql(['js/']);
    });
  });

  describe('file order:', function () {
    var actual, expected;
    it('should select 4 files in this order, by default.', function () {
      actual = file.expand('**/*.{js,css}');
      expected = ['css/baz.css', 'css/qux.css', 'js/bar.js', 'js/foo.js'];
      actual.should.eql(expected);
    });
    it('specifically-specified-up-front file order should be maintained.', function () {
      actual = file.expand('js/foo.js', 'js/bar.js', '**/*.{js,css}');
      expected = ['js/foo.js', 'js/bar.js', 'css/baz.css', 'css/qux.css'];
      actual.should.eql(expected);
    });
    it('specifically-specified-up-front file order should be maintained.', function () {
      actual = file.expand('js/bar.js', 'js/foo.js', '**/*.{js,css}');
      expected = ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'];
      actual.should.eql(expected);
    });
    it('if a file is excluded and then re-added, it should be added at the end.', function () {
      actual = file.expand('js/foo.js', '**/*.{js,css}', '!js/bar.js', 'js/bar.js');
      expected = ['js/foo.js', 'css/baz.css', 'css/qux.css', 'js/bar.js'];
      actual.should.eql(expected);
    });
  });

  it('flatten:', function () {
    file.expand([['**/*.js'], ['**/*.css', 'js/*.js'] ]).should.eql(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
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
    file.expand(['!js/*.js']).should.eql([]);
  });
  it('exclusion should cancel match', function() {
    file.expand(['js/bar.js', '!js/bar.js']).should.eql([]);
  });
  it('should omit single file from matched set', function() {
    file.expand(['**/*.js', '!js/foo.js']).should.eql(['js/bar.js']);
  });
  it('inclusion / exclusion order matters', function() {
    file.expand(['!js/foo.js', '**/*.js']).should.eql(['js/bar.js', 'js/foo.js']);
  });
  it('multiple exclusions should be removed from the set', function() {
    file.expand(['**/*.js', '**/*.css', '!js/bar.js', '!css/baz.css']).should.eql(['js/foo.js', 'css/qux.css']);
  });
  it('excluded wildcards should be removed from the matched set', function() {
    file.expand(['**/*.js', '**/*.css', '!**/*.css']).should.eql(['js/bar.js', 'js/foo.js']);
  });
  it('different pattern for exclusion should still work', function() {
    file.expand(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css', '!**/b*.*']).should.eql(['js/foo.js', 'css/qux.css']);
  });
  it('should respect the order of inclusion / exclusion:', function () {
    file.expand(['js/bar.js', '!**/b*.*', 'js/foo.js', 'css/baz.css', 'css/qux.css']).should.eql(['js/foo.js', 'css/baz.css', 'css/qux.css']);
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
      file.expand({mark: true }, '**d*/**').should.eql(['deep/', 'deep/deep.txt', 'deep/deeper/', 'deep/deeper/deeper.txt', 'deep/deeper/deepest/', 'deep/deeper/deepest/deepest.txt']);
    });

    it('should match directories, arbitrary / at the end appears in matches.', function () {
      file.expand({mark: true }, '**d*/**/').should.eql(['deep/', 'deep/deeper/', 'deep/deeper/deepest/']);
    });
  });

  describe('options.filter:', function () {
    it('`isFile` should match files only.', function () {
      file.expand({filter: 'isFile'}, '**d*/**').should.eql(['deep/deep.txt', 'deep/deeper/deeper.txt', 'deep/deeper/deepest/deepest.txt']);
    });
    it('`isDirectory` should match directories only.', function () {
      file.expand({filter: 'isDirectory'}, '**d*/**').should.eql(['deep', 'deep/deeper', 'deep/deeper/deepest']);
    });
    it('should allow a custom filter function to be passed.', function () {
      function filter(fp) {
        return (/deepest/).test(fp);
      }
      file.expand({filter: filter}, '**').should.eql(['deep/deeper/deepest', 'deep/deeper/deepest/deepest.txt', ]);
    });
    it('should not return files that fail to match.', function () {
      file.expand({filter: 'isFile'}, 'js', 'css').should.eql([]);
    });
    it('should not return directories that fail to match.', function () {
      file.expand({filter: 'isDirectory'}, '**/*.js').should.eql([]);
    });
  });

  describe('options.matchBase:', function () {
    it('options.matchBase:', function () {
      var opts = {matchBase: true};
      file.expand('*.js').should.eql([], 'should not matchBase (minimatch) by default.');
      file.expand(opts, '*.js').should.eql(['js/bar.js', 'js/foo.js'], 'options should be passed through to minimatch.');
      file.expand(opts, '*.js', '*.css').should.eql(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
      file.expand(opts, ['*.js', '*.css']).should.eql(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
    });
  });

  describe('options.cwd:', function () {
    it('options.cwd:', function () {
      var cwd = path.resolve(process.cwd(), '..');
      file.expand({cwd: cwd}, ['expand/js', 'expand/js/*']).should.eql(['expand/js', 'expand/js/bar.js', 'expand/js/foo.js'], 'should match.');
      file.expand({cwd: cwd, filter: 'isFile'}, ['expand/js', 'expand/js/*']).should.eql(['expand/js/bar.js', 'expand/js/foo.js'], 'should match.');
      file.expand({cwd: cwd, filter: 'isDirectory'}, ['expand/js', 'expand/js/*']).should.eql(['expand/js'], 'should match.');
      file.expand({cwd: cwd, filter: 'isFile'}, ['expand/js', 'expand/js/*', '!**/b*.js']).should.eql(['expand/js/foo.js'], 'should negate properly.');
    });
  });

  describe('options.nonull:', function () {
    var opts = {nonull: true};

    it('should return non-matching glob patterns in the result set.', function () {
      file.expand(opts, ['js/a*', 'js/b*', 'js/c*']).should.eql(['js/a*', 'js/bar.js', 'js/c*']);
      file.expand(opts, ['js/foo.js', 'js/bar.js', 'js/baz.js']).should.eql(['js/foo.js', 'js/bar.js', 'js/baz.js']);
    });
  });
});
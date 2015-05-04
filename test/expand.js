/*
 * grunt-legacy-file <http://gruntjs.com/grunt-legacy-file>
 *
 * Copyright (c) 2015, "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

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

describe('file.expand():', function () {
  beforeEach(function (cb) {
    this.cwd = process.cwd();
    process.chdir('test/fixtures/expand');
    done();
  });
  afterEach(function (done) {
    process.chdir(this.cwd);
    done();
  });


  describe('basic matching:', function () {
    it('should match:', function () {
      test.eql(file.expand('**/*.js'), ['js/bar.js', 'js/foo.js'], 'should match.');
      test.eql(file.expand('**/*.js', '**/*.css'), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
      test.eql(file.expand(['**/*.js', '**/*.css']), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
      test.eql(file.expand('**d*/**'), ['deep', 'deep/deep.txt', 'deep/deeper', 'deep/deeper/deeper.txt', 'deep/deeper/deepest', 'deep/deeper/deepest/deepest.txt'], 'should match files and directories.');
      test.eql(file.expand('**d*/**/'), ['deep/', 'deep/deeper/', 'deep/deeper/deepest/'], 'should match directories, arbitrary / at the end appears in matches.');
    });
    it('should fail to match.', function () {
      test.eql(file.expand('*.xyz'), []);
    });
  });

  describe('unique results:', function () {
    it('file list should be uniqed.', function () {
      test.eql(file.expand('**/*.js', 'js/*.js'), ['js/bar.js', 'js/foo.js']);
      test.eql(file.expand('**/*.js', '**/*.css', 'js/*.js'), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css']);
    });

    it('mixed non-ending-/ and ending-/ dirs will not be uniqed by default.', function () {
      test.eql(file.expand('js', 'js/'), ['js', 'js/']);
    });

    it('mixed non-ending-/ and ending-/ dirs will be uniqed when `mark` is enabled.', function () {
      test.eql(file.expand({ mark: true }, 'js', 'js/'), ['js/']);
    });
  });

  describe('file order:', function () {
    it('should select 4 files in this order, by default.', function () {
      var actual = file.expand('**/*.{js,css}');
      var expected = ['css/baz.css', 'css/qux.css', 'js/bar.js', 'js/foo.js'];
      test.eql(actual, expected);
    });
    it('specifically-specified-up-front file order should be maintained.', function () {
      actual = file.expand('js/foo.js', 'js/bar.js', '**/*.{js,css}');
      expected = ['js/foo.js', 'js/bar.js', 'css/baz.css', 'css/qux.css'];
      test.eql(actual, expected);
    });
    it('specifically-specified-up-front file order should be maintained.', function () {
      actual = file.expand('js/bar.js', 'js/foo.js', '**/*.{js,css}');
      expected = ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'];
      test.eql(actual, expected);
    });
    it('if a file is excluded and then re-added, it should be added at the end.', function () {
      actual = file.expand('js/foo.js', '**/*.{js,css}', '!js/bar.js', 'js/bar.js');
      expected = ['js/foo.js', 'css/baz.css', 'css/qux.css', 'js/bar.js'];
      test.eql(actual, expected);
    });
  });

  it('flatten:', function () {
    test.eql(file.expand([['**/*.js'], ['**/*.css', 'js/*.js'] ]), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
  });
});

describe('exclusion:', function () {
  it('solitary exclusion should match nothing', function() {
    file.expand(['!js/*.js']).should.eql([]);
  })
  it('exclusion should cancel match', function() {
    file.expand(['js/bar.js', '!js/bar.js']).should.eql([]);
  })
  it('should omit single file from matched set', function() {
    file.expand(['**/*.js', '!js/foo.js']).should.eql(['js/bar.js']);
  })
  it('inclusion / exclusion order matters', function() {
    file.expand(['!js/foo.js', '**/*.js']).should.eql(['js/bar.js', 'js/foo.js']);
  })
  it('multiple exclusions should be removed from the set', function() {
    file.expand(['**/*.js', '**/*.css', '!js/bar.js', '!css/baz.css']).should.eql(['js/foo.js', 'css/qux.css']);
  })
  it('excluded wildcards should be removed from the matched set', function() {
    file.expand(['**/*.js', '**/*.css', '!**/*.css']).should.eql(['js/bar.js', 'js/foo.js']);
  })
  it('different pattern for exclusion should still work', function() {
    file.expand(['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css', '!**/b*.*']).should.eql(['js/foo.js', 'css/qux.css']);
  })
  it('should respect the order of inclusion / exclusion:', function () {
    file.expand(['js/bar.js', '!**/b*.*', 'js/foo.js', 'css/baz.css', 'css/qux.css']).should.eql(['js/foo.js', 'css/baz.css', 'css/qux.css']);
  });
});

describe('options:', function () {
  describe('options.mark (minimatch):', function () {
    it('should ensure that directories end in /', function () {
      test.eql(file.expand({mark: true }, '**d*/**'), ['deep/', 'deep/deep.txt', 'deep/deeper/', 'deep/deeper/deeper.txt', 'deep/deeper/deepest/', 'deep/deeper/deepest/deepest.txt']);
    });

    it('should match directories, arbitrary / at the end appears in matches.', function () {
      test.eql(file.expand({mark: true }, '**d*/**/'), ['deep/', 'deep/deeper/', 'deep/deeper/deepest/']);
    });
  });

  describe('options.filter:', function () {
    it('`isFile` should match files only.', function () {
      test.eql(file.expand({filter: 'isFile'}, '**d*/**'), ['deep/deep.txt', 'deep/deeper/deeper.txt', 'deep/deeper/deepest/deepest.txt']);
    });
    it('`isDirectory` should match directories only.', function () {
      test.eql(file.expand({filter: 'isDirectory'}, '**d*/**'), ['deep', 'deep/deeper', 'deep/deeper/deepest']);
    });
    it('should allow a custom filter function to be passed.', function () {
      function filter(fp) {
        return (/deepest/).test(fp);
      }
      test.eql(file.expand({filter: filter}, '**'), ['deep/deeper/deepest', 'deep/deeper/deepest/deepest.txt', ]);
    });
    it('should not return files that fail to match.', function () {
      test.eql(file.expand({filter: 'isFile'}, 'js', 'css'), []);
    });
    it('should not return directories that fail to match.', function () {
      test.eql(file.expand({filter: 'isDirectory'}, '**/*.js'), []);
    });
  });

  describe('options.matchBase:', function () {
    it('options.matchBase:', function () {
      var opts = {matchBase: true};
      test.eql(file.expand('*.js'), [], 'should not matchBase (minimatch) by default.');
      test.eql(file.expand(opts, '*.js'), ['js/bar.js', 'js/foo.js'], 'options should be passed through to minimatch.');
      test.eql(file.expand(opts, '*.js', '*.css'), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
      test.eql(file.expand(opts, ['*.js', '*.css']), ['js/bar.js', 'js/foo.js', 'css/baz.css', 'css/qux.css'], 'should match.');
    });
  });

  describe('options.cwd:', function () {
    it('options.cwd:', function () {
      var cwd = path.resolve(process.cwd(), '..');
      test.eql(file.expand({cwd: cwd }, ['expand/js', 'expand/js/*']), ['expand/js', 'expand/js/bar.js', 'expand/js/foo.js'], 'should match.');
      test.eql(file.expand({cwd: cwd, filter: 'isFile'}, ['expand/js', 'expand/js/*']), ['expand/js/bar.js', 'expand/js/foo.js'], 'should match.');
      test.eql(file.expand({cwd: cwd, filter: 'isDirectory'}, ['expand/js', 'expand/js/*']), ['expand/js'], 'should match.');
      test.eql(file.expand({cwd: cwd, filter: 'isFile'}, ['expand/js', 'expand/js/*', '!**/b*.js']), ['expand/js/foo.js'], 'should negate properly.');
    });
  });

  describe('options.nonull:', function () {
    it('options.nonull:', function () {
      var opts = {nonull: true};
      test.eql(file.expand(opts, ['js/a*', 'js/b*', 'js/c*']), ['js/a*', 'js/bar.js', 'js/c*'], 'non-matching patterns should be returned in result set.');
      test.eql(file.expand(opts, ['js/foo.js', 'js/bar.js', 'js/baz.js']), ['js/foo.js', 'js/bar.js', 'js/baz.js'], 'non-matching filenames should be returned in result set.');
    });
  });
});
/*!
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

var file = require('..');
var grunt = require('grunt');
var Tempfile = require('temporary/lib/file');
var Tempdir = require('temporary/lib/dir');
var tempdir = new Tempdir();
var test;

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

  it('.extDot():', function () {
    var actual, expected;

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
  it('.cwd():', function () {
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
  it('.rename():', function () {
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
  })

  // Compare two buffers. Returns true if they are equivalent.
  var compareBuffers = function (buf1, buf2) {
    if (!Buffer.isBuffer(buf1) || !Buffer.isBuffer(buf2)) {
      return false;
    }
    if (buf1.length !== buf2.length) {
      return false;
    }
    for (var i = 0; i < buf2.length; i++) {
      if (buf1[i] !== buf2[i]) {
        return false;
      }
    }
    return true;
  };

  // Compare two files. Returns true if they are equivalent.
  var compareFiles = function (filepath1, filepath2) {
    return compareBuffers(fs.readFileSync(filepath1), fs.readFileSync(filepath2));
  };

  describe('file():', function () {
    beforeEach(function () {
      this.defaultEncoding = file.defaultEncoding;
      file.defaultEncoding = 'utf8';
      this.string = 'Ação é isso aí\n';
      this.object = {
        foo: 'Ação é isso aí',
        bar: ['ømg', 'pønies']
      };
      this.writeOption = grunt.option('write');

      // Testing that warnings were displayed.
      this.oldFailWarnFn = grunt.fail.warn;
      this.oldLogWarnFn = grunt.log.warn;
      this.resetWarnCount = function () {
        this.warnCount = 0;
      }.bind(this);
      grunt.fail.warn = grunt.log.warn = function () {
        this.warnCount += 1;
      }.bind(this);
    });
    afterEach(function () {
      file.defaultEncoding = this.defaultEncoding;
      grunt.option('write', this.writeOption);
      grunt.fail.warn = this.oldFailWarnFn;
      grunt.log.warn = this.oldLogWarnFn;
    });

    it('.read():', function () {
      test.strictEqual(file.read('test/fixtures/utf8.txt'), this.string, 'file should be read as utf8 by default.');
      test.strictEqual(file.read('test/fixtures/iso-8859-1.txt', {
        encoding: 'iso-8859-1'
      }), this.string, 'file should be read using the specified encoding.');
      test.ok(compareBuffers(file.read('test/fixtures/octocat.png', {
        encoding: null
      }), fs.readFileSync('test/fixtures/octocat.png')), 'file should be read as a buffer if encoding is specified as null.');

      test.strictEqual(file.read('test/fixtures/BOM.txt'), 'foo', 'file should have BOM stripped.');
      file.preserveBOM = true;
      test.strictEqual(file.read('test/fixtures/BOM.txt'), '\ufeff' + 'foo', 'file should have BOM preserved.');
      file.preserveBOM = false;

      file.defaultEncoding = 'iso-8859-1';
      test.strictEqual(file.read('test/fixtures/iso-8859-1.txt'), this.string, 'changing the default encoding should work.');
    });
    it('.readJSON():', function () {
      var obj;
      obj = file.readJSON('test/fixtures/utf8.json');
      test.eql(obj, this.object, 'file should be read as utf8 by default and parsed correctly.');

      obj = file.readJSON('test/fixtures/iso-8859-1.json', {
        encoding: 'iso-8859-1'
      });
      test.eql(obj, this.object, 'file should be read using the specified encoding.');
      file.defaultEncoding = 'iso-8859-1';
      obj = file.readJSON('test/fixtures/iso-8859-1.json');
      test.eql(obj, this.object, 'changing the default encoding should work.');
    });
    it('.readYAML():', function () {
      var obj;
      obj = file.readYAML('test/fixtures/utf8.yaml');
      test.eql(obj, this.object, 'file should be read as utf8 by default and parsed correctly.');

      obj = file.readYAML('test/fixtures/iso-8859-1.yaml', {
        encoding: 'iso-8859-1'
      });
      test.eql(obj, this.object, 'file should be read using the specified encoding.');

      file.defaultEncoding = 'iso-8859-1';
      obj = file.readYAML('test/fixtures/iso-8859-1.yaml');
      test.eql(obj, this.object, 'changing the default encoding should work.');
    });
    it('.write():', function () {
      var tmpfile;
      tmpfile = new Tempfile();
      file.write(tmpfile.path, this.string);
      test.strictEqual(fs.readFileSync(tmpfile.path, 'utf8'), this.string, 'file should be written as utf8 by default.');
      tmpfile.unlinkSync();

      tmpfile = new Tempfile();
      file.write(tmpfile.path, this.string, {
        encoding: 'iso-8859-1'
      });
      test.strictEqual(file.read(tmpfile.path, {
        encoding: 'iso-8859-1'
      }), this.string, 'file should be written using the specified encoding.');
      tmpfile.unlinkSync();

      file.defaultEncoding = 'iso-8859-1';
      tmpfile = new Tempfile();
      file.write(tmpfile.path, this.string);
      file.defaultEncoding = 'utf8';
      test.strictEqual(file.read(tmpfile.path, {
        encoding: 'iso-8859-1'
      }), this.string, 'changing the default encoding should work.');
      tmpfile.unlinkSync();

      tmpfile = new Tempfile();
      var octocat = fs.readFileSync('test/fixtures/octocat.png');
      file.write(tmpfile.path, octocat);
      test.ok(compareBuffers(fs.readFileSync(tmpfile.path), octocat), 'buffers should always be written as-specified, with no attempt at re-encoding.');
      tmpfile.unlinkSync();

      grunt.option('write', false);
      var filepath = path.join(tempdir.path, 'should-not-exist.txt');
      file.write(filepath, 'test');
      test.equal(file.exists(filepath), false, 'file should NOT be created if --no-write was specified.');
    });
    it('.copy():', function () {
      var tmpfile;
      tmpfile = new Tempfile();
      file.copy('test/fixtures/utf8.txt', tmpfile.path);
      test.ok(compareFiles(tmpfile.path, 'test/fixtures/utf8.txt'), 'files should just be copied as encoding-agnostic by default.');
      tmpfile.unlinkSync();

      tmpfile = new Tempfile();
      file.copy('test/fixtures/iso-8859-1.txt', tmpfile.path);
      test.ok(compareFiles(tmpfile.path, 'test/fixtures/iso-8859-1.txt'), 'files should just be copied as encoding-agnostic by default.');
      tmpfile.unlinkSync();

      tmpfile = new Tempfile();
      file.copy('test/fixtures/octocat.png', tmpfile.path);
      test.ok(compareFiles(tmpfile.path, 'test/fixtures/octocat.png'), 'files should just be copied as encoding-agnostic by default.');
      tmpfile.unlinkSync();

      grunt.option('write', false);
      var filepath = path.join(tempdir.path, 'should-not-exist.txt');
      file.copy('test/fixtures/utf8.txt', filepath);
      test.equal(file.exists(filepath), false, 'file should NOT be created if --no-write was specified.');
    });
    it('copy and process:', function () {
      var tmpfile = new Tempfile();
      file.copy('test/fixtures/utf8.txt', tmpfile.path, {
        process: function (src, srcpath, destpath) {
          test.equal(srcpath, 'test/fixtures/utf8.txt', 'srcpath should be passed in, as-specified.');
          test.equal(destpath, tmpfile.path, 'destpath should be passed in, as-specified.');
          test.equal(Buffer.isBuffer(src), false, 'when no encoding is specified, use default encoding and process src as a string');
          test.equal(typeof src, 'string', 'when no encoding is specified, use default encoding and process src as a string');
          return 'føø' + src + 'bår';
        }
      });

      test.equal(file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should be saved as properly encoded processed string.'); tmpfile.unlinkSync();
      tmpfile = new Tempfile();
      file.copy('test/fixtures/iso-8859-1.txt', tmpfile.path, {
        encoding: 'iso-8859-1',
        process: function (src) {
          test.equal(Buffer.isBuffer(src), false, 'use specified encoding and process src as a string');
          test.equal(typeof src, 'string', 'use specified encoding and process src as a string');
          return 'føø' + src + 'bår';
        }
      });

      test.equal(file.read(tmpfile.path, {encoding: 'iso-8859-1'}), 'føø' + this.string + 'bår', 'file should be saved as properly encoded processed string.');
      tmpfile.unlinkSync();

      tmpfile = new Tempfile();
      file.copy('test/fixtures/utf8.txt', tmpfile.path, {
        encoding: null,
        process: function (src) {
          test.ok(Buffer.isBuffer(src), 'when encoding is specified as null, process src as a buffer');
          return new Buffer('føø' + src.toString() + 'bår');
        }
      });

      test.equal(file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should be saved as the buffer returned by process.'); tmpfile.unlinkSync();
      file.defaultEncoding = 'iso-8859-1'; tmpfile = new Tempfile(); file.copy('test/fixtures/iso-8859-1.txt', tmpfile.path, {
        process: function (src) {
          test.equal(Buffer.isBuffer(src), false, 'use non-utf8 default encoding and process src as a string');
          test.equal(typeof src, 'string', 'use non-utf8 default encoding and process src as a string');
          return 'føø' + src + 'bår';
        }
      });

      test.equal(file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should be saved as properly encoded processed string.');
      tmpfile.unlinkSync();

      var filepath = path.join(tempdir.path, 'should-not-exist.txt');
      file.copy('test/fixtures/iso-8859-1.txt', filepath, {
        process: function () {
          return false;
        }
      });
  
      test.equal(file.exists(filepath), false, 'file should NOT be created if process returns false.');
    });

    it('copy and process, noprocess:', function () {
      var tmpfile = new Tempfile();
      file.copy('test/fixtures/utf8.txt', tmpfile.path, {
        noProcess: true,
        process: function (src) {
          return 'føø' + src + 'bår';
        }
      });

      test.equal(file.read(tmpfile.path), this.string, 'file should not have been processed.'); tmpfile.unlinkSync();

      var files = ['process', 'noprocess', 'othernoprocess'];

      files.forEach(function (filename) {
        var filepath = path.join(tempdir.path, filename);
        file.copy('test/fixtures/utf8.txt', filepath);
        var tmpfile = new Tempfile();

        file.copy(filepath, tmpfile.path, {
          noProcess: ['**/*no*'],
          process: function (src) {
            return 'føø' + src + 'bår';
          }
        });

          if (filename === 'process') {
            test.equal(file.read(tmpfile.path), 'føø' + this.string + 'bår', 'file should have been processed.');
          } else {
            test.equal(file.read(tmpfile.path), this.string, 'file should not have been processed.');
          }
          tmpfile.unlinkSync();
      }, this);
    });

    it('copy directory recursively:', function () {
      var copyroot1 = path.join(tempdir.path, 'copy-dir-1');
      var copyroot2 = path.join(tempdir.path, 'copy-dir-2');

      file.copy('test/fixtures/expand/', copyroot1);
      file.recurse('test/fixtures/expand/', function (srcpath, rootdir, subdir, filename) {
        var destpath = path.join(copyroot1, subdir || '', filename);
        test.ok(file.isFile(srcpath), 'file should have been copied.');
        test.equal(file.read(srcpath), file.read(destpath), 'file contents should be the same.');
      });

      file.mkdir(path.join(copyroot1, 'empty'));
      file.mkdir(path.join(copyroot1, 'deep/deeper/empty'));
      file.copy(copyroot1, copyroot2, {
        process: function (contents) {
          return '<' + contents + '>';
        }
      });

      test.ok(file.isDir(path.join(copyroot2, 'empty')), 'empty directory should have been created.');
      test.ok(file.isDir(path.join(copyroot2, 'deep/deeper/empty')), 'empty directory should have been created.'); file.recurse('test/fixtures/expand/', function (srcpath, rootdir, subdir, filename) {
      var destpath = path.join(copyroot2, subdir || '', filename);
      test.ok(file.isFile(srcpath), 'file should have been copied.');
      test.equal('<' + file.read(srcpath) + '>', file.read(destpath), 'file contents should be processed correctly.');
    });
  });

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

  it('.recurse():', function () {
    var rootdir = 'test/fixtures/expand';
    var expected = {};
    expected[rootdir + '/css/baz.css'] = [rootdir, 'css', 'baz.css'];
    expected[rootdir + '/css/qux.css'] = [rootdir, 'css', 'qux.css'];
    expected[rootdir + '/deep/deep.txt'] = [rootdir, 'deep', 'deep.txt'];
    expected[rootdir + '/deep/deeper/deeper.txt'] = [rootdir, 'deep/deeper', 'deeper.txt'];
    expected[rootdir + '/deep/deeper/deepest/deepest.txt'] = [rootdir, 'deep/deeper/deepest', 'deepest.txt'];
    expected[rootdir + '/js/bar.js'] = [rootdir, 'js', 'bar.js'];
    expected[rootdir + '/js/foo.js'] = [rootdir, 'js', 'foo.js'];
    expected[rootdir + '/README.md'] = [rootdir, undefined, 'README.md'];

    var actual = {};
    file.recurse(rootdir, function (abspath, rootdir, subdir, filename) {
      actual[abspath] = [rootdir, subdir, filename];
    });
    actual.should.eql(expected); // 'paths and arguments should match.'
  });

  it('.exists():', function () {
    test.ok(file.exists('test/fixtures/octocat.png'), 'files exist.');
    test.ok(file.exists('test', 'fixtures', 'octocat.png'), 'should work for paths in parts.');
    test.ok(file.exists('test/fixtures'), 'directories exist.');
    test.ok(file.exists(path.join(tempdir.path, 'octocat.png')), 'file links exist.');
    test.ok(file.exists(path.join(tempdir.path, 'expand')), 'directory links exist.');
    test.equal(file.exists('test/fixtures/does/not/exist'), false, 'nonexistent files do not exist.');
  });

  it('.isLink():', function () {
    test.equals(file.isLink('test/fixtures/octocat.png'), false, 'files are not links.');
    test.equals(file.isLink('test/fixtures'), false, 'directories are not links.');
    test.ok(file.isLink(path.join(tempdir.path, 'octocat.png')), 'file links are links.');
    test.ok(file.isLink(path.join(tempdir.path, 'expand')), 'directory links are links.');
    test.ok(file.isLink(tempdir.path, 'octocat.png'), 'should work for paths in parts.');
    test.equals(file.isLink('test/fixtures/does/not/exist'), false, 'nonexistent files are not links.');
  });

  it('.isDir():', function () {
    test.equals(file.isDir('test/fixtures/octocat.png'), false, 'files are not directories.');
    test.ok(file.isDir('test/fixtures'), 'directories are directories.');
    test.ok(file.isDir('test', 'fixtures'), 'should work for paths in parts.');
    test.equals(file.isDir(path.join(tempdir.path, 'octocat.png')), false, 'file links are not directories.');
    test.ok(file.isDir(path.join(tempdir.path, 'expand')), 'directory links are directories.');
    test.equals(file.isDir('test/fixtures/does/not/exist'), false, 'nonexistent files are not directories.');
  });

  it('.isFile():', function () {
    test.ok(file.isFile('test/fixtures/octocat.png'), 'files are files.');
    test.ok(file.isFile('test', 'fixtures', 'octocat.png'), 'should work for paths in parts.');
    test.equals(file.isFile('test/fixtures'), false, 'directories are not files.');
    test.ok(file.isFile(path.join(tempdir.path, 'octocat.png')), 'file links are files.');
    test.equals(file.isFile(path.join(tempdir.path, 'expand')), false, 'directory links are not files.');
    test.equals(file.isFile('test/fixtures/does/not/exist'), false, 'nonexistent files are not files.');
  });

  it('.isPathAbsolute():', function () {
    test.ok(file.isPathAbsolute(path.resolve('/foo')), 'should return true');
    test.ok(file.isPathAbsolute(path.resolve('/foo') + path.sep), 'should return true');
    test.equal(file.isPathAbsolute('foo'), false, 'should return false');
    test.ok(file.isPathAbsolute(path.resolve('test/fixtures/a.js')), 'should return true');
    test.equal(file.isPathAbsolute('test/fixtures/a.js'), false, 'should return false');
  });

  it('.arePathsEquivalent():', function () {
    test.ok(file.arePathsEquivalent('/foo'), 'should return true');
    test.ok(file.arePathsEquivalent('/foo', '/foo/', '/foo/../foo/'), 'should return true');
    test.ok(file.arePathsEquivalent(process.cwd(), '.', './', 'test/..'), 'should return true');
    test.equal(file.arePathsEquivalent(process.cwd(), '..'), false, 'should return false');
    test.equal(file.arePathsEquivalent('.', '..'), false, 'should return false');
  });

  it('.doesPathContain():', function () {
    test.ok(file.doesPathContain('/foo', '/foo/bar'), 'should return true');
    test.ok(file.doesPathContain('/foo/', '/foo/bar/baz', '/foo/bar', '/foo/whatever'), 'should return true');
    test.equal(file.doesPathContain('/foo', '/foo'), false, 'should return false');
    test.equal(file.doesPathContain('/foo/xyz', '/foo/xyz/123', '/foo/bar/baz'), false, 'should return false');
    test.equal(file.doesPathContain('/foo/xyz', '/foo'), false, 'should return false');
    test.ok(file.doesPathContain(process.cwd(), 'test', 'test/fixtures', 'lib'), 'should return true');
  });

  it('.isPathCwd():', function () {
    test.ok(file.isPathCwd(process.cwd()), 'cwd is cwd');
    test.ok(file.isPathCwd('.'), 'cwd is cwd');
    test.equal(file.isPathCwd('test'), false, 'subdirectory is not cwd');
    test.equal(file.isPathCwd(path.resolve('test')), false, 'subdirectory is not cwd');
    test.equal(file.isPathCwd('..'), false, 'parent is not cwd');
    test.equal(file.isPathCwd(path.resolve('..')), false, 'parent is not cwd');
    test.equal(file.isPathCwd('/'), false, 'root is not cwd (I hope)');
    test.equal(file.isPathCwd('nonexistent'), false, 'nonexistent path is not cwd');
  });

  it('.isPathInCwd():', function () {
    test.equal(file.isPathInCwd(process.cwd()), false, 'cwd is not IN cwd');
    test.equal(file.isPathInCwd('.'), false, 'cwd is not IN cwd');
    test.ok(file.isPathInCwd('test'), 'subdirectory is in cwd');
    test.ok(file.isPathInCwd(path.resolve('test')), 'subdirectory is in cwd');
    test.equal(file.isPathInCwd('..'), false, 'parent is not in cwd');
    test.equal(file.isPathInCwd(path.resolve('..')), false, 'parent is not in cwd');
    test.equal(file.isPathInCwd('/'), false, 'root is not in cwd (I hope)');
    test.equal(file.isPathInCwd('nonexistent'), false, 'nonexistent path is not in cwd');
  });

  describe('.cwdUnderSymlink():', function () {
    beforeEach(function (cb) {
      this.cwd = process.cwd();
      process.chdir(path.join(tempdir.path, 'expand'));
      cb();
    });

    afterEach(function (cb) {
      process.chdir(this.cwd);
      cb();
    });

    it('.isPathCwd():', function () {
      test.ok(file.isPathCwd(process.cwd()), 'cwd is cwd');
      test.ok(file.isPathCwd('.'), 'cwd is cwd');
    });

    it('.isPathInCwd():', function () {
      test.ok(file.isPathInCwd('deep'), 'subdirectory is in cwd');
      test.ok(file.isPathInCwd(path.resolve('deep')), 'subdirectory is in cwd');
    });
  })
});

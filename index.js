/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var YAML = require('js-yaml');
var rimraf = require('rimraf');
var iconv = require('iconv-lite');
var kindOf = require('kind-of');
var legacyLog = require('grunt-legacy-log');
var legacyUtil = require('grunt-legacy-util');
var _ = require('lodash');

/**
 * Is the platform windows?
 */

var win32 = process.platform === 'win32';

/**
 * Regex used for path separators.
 *
 * @type {RegExp}
 */

var pathSeparatorRe = /[\/\\]/g;

/**
 * Used by the `expandMapping` method. The "ext" option refers
 * to either everything after the first dot (default) or everything
 * after the last dot.
 * @api public
 */

var extDotRe = {
  first: /(\.[^\/]*)?$/,
  last: /(\.[^\/\.]*)?$/,
};

/**
 * Create an instance of `File` with the given `options`.
 *
 * @param {Object} `options`
 * @api public
 */

function File(options) {
  this.options = options || {};
  this.options.grunt = this.options.grunt || require('grunt');
  this.log = new legacyLog.Log({grunt: this.options.grunt});
}

/**
 * Expose `glob`
 */

File.prototype.glob = require('glob');

/**
 * Expose `minimatch`
 */

File.prototype.minimatch = require('minimatch');

/**
 * Expose `findup`
 */

File.prototype.findup = require('findup-sync');

/**
 * Check for options through Grunt if specified, otherwise
 * defer to options object properties.
 *
 * @param  {String} `name` The key of the option to get.
 * @return {*}
 */

File.prototype.option = function(name) {
  if (this.options.grunt && this.options.grunt.option) {
    return this.options.grunt.option(name);
  }
  var no = name.match(/^no-(.+)$/);
  return no ? !this.options[no[1]] : this.options[name];
};

/**
 * Normalize all `\\` paths to unix-style (`/`) paths.
 *
 * @param {String} `filepath` Path to normalize
 * @return {String}
 */

File.prototype._unixifyPath = function(filepath) {
  if (win32) {
    return filepath.replace(/\\/g, '/');
  } else {
    return filepath;
  }
};

/**
 * Change the current base path (ie, CWD) to the specified path.
 *
 * @param {String} `filepath` Path may be a single string, or list of file path segments.
 * @api public
 */

File.prototype.setBase = function() {
  var dirpath = path.join.apply(path, arguments);
  process.chdir(dirpath);
};

/**
 * Process specified wildcard glob patterns or filenames
 * against a callback, excluding and uniquing files in the result set.
 *
 * @param  {String|Array} `patterns`
 * @param  {Function} `fn`
 */

File.prototype._processPatterns = function(patterns, fn) {
  // Filepaths to return.
  var result = [];
  // Iterate over flattened patterns array.
  _.flatten(patterns).forEach(function(pattern) {
    // If the first character is ! it should be omitted
    var exclusion = pattern.indexOf('!') === 0;
    // If the pattern is an exclusion, remove the !
    if (exclusion) { pattern = pattern.slice(1); }
    // Find all matching files for this pattern.
    var matches = fn(pattern);
    if (exclusion) {
      // If an exclusion, remove matching files.
      result = _.difference(result, matches);
    } else {
      // Otherwise add matching files.
      result = _.union(result, matches);
    }
  });
  return result;
};

/**
 * Match a filepath or filepaths against one or more wildcard
 * patterns. Returns all matching filepaths.
 *
 * @param {Object} `options`
 * @param {String|Array} `patterns` String or array of glob patterns.
 * @param {Array} `filepaths` Filepath or paths to match against.
 * @return {Array}
 * @api public
 */

File.prototype.match = function(options, patterns, filepaths) {
  if (kindOf(options) !== 'object') {
    filepaths = patterns;
    patterns = options;
    options = {};
  }
  // Return empty set if either patterns or filepaths was omitted.
  if (patterns == null || filepaths == null) { return []; }
  // Normalize patterns and filepaths to arrays.
  if (!Array.isArray(patterns)) { patterns = [patterns]; }
  if (!Array.isArray(filepaths)) { filepaths = [filepaths]; }
  // Return empty set if there are no patterns or filepaths.
  if (patterns.length === 0 || filepaths.length === 0) { return []; }
  // Return all matching filepaths.
  return this._processPatterns(patterns, function(pattern) {
    return this.minimatch.match(filepaths, pattern, options);
  }.bind(this));
};

/**
 * Returns true if any of the wildcard patterns match any
 * of the given file paths.
 *
 * @param {Object} `options`
 * @param {String|Array} `patterns` String or array of glob patterns.
 * @param {Array} `filepaths` Filepath or paths to match against.
 * @return {Boolean}
 * @api public
 */

File.prototype.isMatch = function() {
  return this.match.apply(this, arguments).length > 0;
};

/**
 * Return an array of all file paths that match the
 * given wildcard patterns.
 *
 * @param {Object} `options`
 * @param {String|Array} `patterns` String or array of glob patterns.
 * @return {Array} `filepaths` Filepath or paths to match against.
 * @api public
 */

File.prototype.expand = function() {
  var args = _.toArray(arguments);

  // If the first argument is an options object, save those options to pass
  // into the file.glob.sync method.
  var options = kindOf(args[0]) === 'object' ? args.shift() : {};
  // Use the first argument if it's an Array, otherwise convert the arguments
  // object to an array and use that.
  var patterns = Array.isArray(args[0]) ? args[0] : args;
  // Return empty set if there are no patterns or filepaths.
  if (patterns.length === 0) { return []; }
  // Return all matching filepaths.
  var matches = this._processPatterns(patterns, function(pattern) {
    // Find all matching files for this pattern.
    return this.glob.sync(pattern, options);
  }.bind(this));
  // Filter result set?
  if (options.filter) {
    matches = matches.filter(function(filepath) {
      filepath = path.join(options.cwd || '', filepath);
      try {
        if (typeof options.filter === 'function') {
          return options.filter(filepath);
        } else {
          // If the file is of the right type and exists, this should work.
          return fs.statSync(filepath)[options.filter]();
        }
      } catch (e) {
        // Otherwise, it's probably not the right type.
        return false;
      }
    });
  }
  return matches;
};

/**
 * Build a multi task "files" object dynamically.
 *
 * @param {String|Array} patterns Glob pattern or patterns.
 * @param {String} `destBase`
 * @param {Object} `options`
 *   @option {String} `cwd`
 *   @option {String} `ext`
 *   @option {String} `extDot`
 *   @option {Boolean} `flatten`
 *   @option {Function} `rename`
 * @return {Array}
 * @api public
 */

File.prototype.expandMapping = function(patterns, destBase, options) {
  options = _.defaults({}, options, {
    extDot: 'first',
    rename: function(destBase, destPath) {
      return path.join(destBase || '', destPath);
    }
  });
  var files = [];
  var fileByDest = {};
  // Find all files matching pattern, using passed-in options.
  this.expand(options, patterns).forEach(function(src) {
    var destPath = src;
    // Flatten?
    if (options.flatten) {
      destPath = path.basename(destPath);
    }
    // Change the extension?
    if ('ext' in options) {
      destPath = destPath.replace(extDotRe[options.extDot], options.ext);
    }
    // Generate destination filename.
    var dest = options.rename(destBase, destPath, options);
    // Prepend cwd to src path if necessary.
    if (options.cwd) { src = path.join(options.cwd, src); }
    // Normalize filepaths to be unix-style.
    dest = dest.replace(pathSeparatorRe, '/');
    src = src.replace(pathSeparatorRe, '/');
    // Map correct src path to dest path.
    if (fileByDest[dest]) {
      // If dest already exists, push this src onto that dest's src array.
      fileByDest[dest].src.push(src);
    } else {
      // Otherwise create a new src-dest file mapping object.
      files.push({
        src: [src],
        dest: dest,
      });
      // And store a reference for later use.
      fileByDest[dest] = files[files.length - 1];
    }
  });
  return files;
};

/**
 * Like `mkdir -p`. Create a directory and any intermediary directories.
 *
 * @param {String} `dirpath`
 * @param {String} `mode`
 * @api public
 */

File.prototype.mkdir = function(dirpath, mode) {
  if (this.option('no-write')) { return; }
  // Set directory mode in a strict-mode-friendly way.
  if (mode == null) {
    mode = parseInt('0777', 8) & (~process.umask());
  }
  dirpath.split(pathSeparatorRe).reduce(function(parts, part) {
    parts += part + '/';
    var subpath = path.resolve(parts);
    if (!this.exists(subpath)) {
      try {
        fs.mkdirSync(subpath, mode);
      } catch (e) {
        throw legacyUtil.error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
      }
    }
    return parts;
  }.bind(this), '');
};

/**
 * Recurse into a directory, executing callback for each file.
 *
 * @param {String} `rootdir` The root directory from which to being recursing.
 * @param {Function} callback
 * @param {String} `subdir`
 * @return {Array} Array of filepaths.
 * @api public
 */

File.prototype.recurse = function(rootdir, callback, subdir) {
  var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
  fs.readdirSync(abspath).forEach(function(filename) {
    var filepath = path.join(abspath, filename);
    if (fs.statSync(filepath).isDirectory()) {
      this.recurse(rootdir, callback, this._unixifyPath(path.join(subdir || '', filename || '')));
    } else {
      callback(this._unixifyPath(filepath), rootdir, subdir, filename);
    }
  }.bind(this));
};

/**
 * The default file encoding to use. Default is `utf8`
 *
 * @type {String}
 * @api public
 */

File.prototype.defaultEncoding = 'utf8';

/**
 * Preserve the BOM (byte-order mark) on `file.read`, rather than strip it.
 * Set to `false` by default.
 *
 * @type {Boolean}
 * @api public
 */

File.prototype.preserveBOM = false;

/**
 * Read a file, return its contents.
 *
 * @param {String} `filepath`
 * @param {Object} `options`
 * @return {String|Buffer}
 * @api public
 */

File.prototype.read = function(filepath, options) {
  if (!options) { options = {}; }
  var contents;

  this.log.verbose.write('Reading ' + filepath + '...');
  try {
    contents = fs.readFileSync(String(filepath));
    // If encoding is not explicitly null, convert from encoded buffer to a
    // string. If no encoding was specified, use the default.
    if (options.encoding !== null) {
      contents = iconv.decode(contents, options.encoding || this.defaultEncoding);
      // Strip any BOM that might exist.
      if (!this.preserveBOM && contents.charCodeAt(0) === 0xFEFF) {
        contents = contents.substring(1);
      }
    }
    this.log.verbose.ok();
    return contents;
  } catch (e) {
    this.log.verbose.error();
    throw legacyUtil.error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
  }
};

/**
 * Read a JSON file, parse its contents, return an object.
 *
 * @param {String} `filepath`
 * @param {Object} `options`
 * @return {Object}
 * @api public
 */

File.prototype.readJSON = function(filepath, options) {
  var src = this.read(filepath, options);
  var result;
  this.log.verbose.write('Parsing ' + filepath + '...');
  try {
    result = JSON.parse(src);
    this.log.verbose.ok();
    return result;
  } catch (e) {
    this.log.verbose.error();
    throw legacyUtil.error('Unable to parse "' + filepath + '" file (' + e.message + ').', e);
  }
};

/**
 * Read a YAML file, parse its contents, return an object.
 *
 * @param {String} `filepath`
 * @param {Object} `options`
 * @return {Object}
 * @api public
 */

File.prototype.readYAML = function(filepath, options) {
  var src = this.read(filepath, options);
  var result;
  this.log.verbose.write('Parsing ' + filepath + '...');
  try {
    result = YAML.load(src);
    this.log.verbose.ok();
    return result;
  } catch (e) {
    this.log.verbose.error();
    throw legacyUtil.error('Unable to parse "' + filepath + '" file (' + e.problem + ').', e);
  }
};

/**
 * Write a file.
 *
 * @param {String} `filepath`
 * @param {String|Buffer} `contents`
 * @param {Object} `options`
 * @api public
 */

File.prototype.write = function(filepath, contents, options) {
  if (!options) { options = {}; }
  var nowrite = this.option('no-write');
  this.log.verbose.write((nowrite ? 'Not actually writing ' : 'Writing ') + filepath + '...');
  // Create path, if necessary.
  this.mkdir(path.dirname(filepath));
  try {
    // If contents is already a Buffer, don't try to encode it. If no encoding
    // was specified, use the default.
    if (!Buffer.isBuffer(contents)) {
      contents = iconv.encode(contents, options.encoding || this.defaultEncoding);
    }
    // Actually write file.
    if (!nowrite) {
      fs.writeFileSync(filepath, contents);
    }
    this.log.verbose.ok();
    return true;
  } catch (e) {
    this.log.verbose.error();
    throw legacyUtil.error('Unable to write "' + filepath + '" file (Error code: ' + e.code + ').', e);
  }
};

/**
 * Read a file, optionally processing its content, then
 * write the output. Or read a directory, recursively
 * creating directories, reading files, processing content,
 * writing output.
 *
 * @param {String} `srcpath`
 * @param {String} `destpath`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

File.prototype.copy = function(srcpath, destpath, options) {
  if (this.isDir(srcpath)) {
    // Copy a directory, recursively.
    // Explicitly create new dest directory.
    this.mkdir(destpath);
    // Iterate over all sub-files/dirs, recursing.
    fs.readdirSync(srcpath).forEach(function(filepath) {
      this.copy(path.join(srcpath, filepath), path.join(destpath, filepath), options);
    }.bind(this));
  } else {
    // Copy a single file.
    this._copy(srcpath, destpath, options);
  }
};

/**
 * Read a file, optionally processing its content, then write the output.
 *
 * @param {String} `srcpath`
 * @param {String} `destpath`
 * @param {Object} `options`
 * @api public
 */

File.prototype._copy = function(srcpath, destpath, options) {
  if (!options) { options = {}; }
  // If a process function was specified, and noProcess isn't true or doesn't
  // match the srcpath, process the file's source.
  var process = options.process && options.noProcess !== true &&
    !(options.noProcess && this.isMatch(options.noProcess, srcpath));
  // If the file will be processed, use the encoding as-specified. Otherwise,
  // use an encoding of null to force the file to be read/written as a Buffer.
  var readWriteOptions = process ? options : {encoding: null};
  // Actually read the file.
  var contents = this.read(srcpath, readWriteOptions);
  if (process) {
    this.log.verbose.write('Processing source...');
    try {
      contents = options.process(contents, srcpath, destpath);
      this.log.verbose.ok();
    } catch (e) {
      this.log.verbose.error();
      throw legacyUtil.error('Error while processing "' + srcpath + '" file.', e);
    }
  }
  // Abort copy if the process function returns false.
  if (contents === false) {
    this.log.verbose.writeln('Write aborted.');
  } else {
    this.write(destpath, contents, readWriteOptions);
  }
};

/**
 * Delete folders and files recursively
 *
 * @param {String} `filepath` The file path to delete.
 * @param {Object} `options`
 * @api public
 */

File.prototype.delete = function(filepath, options) {
  var grunt = this.options.grunt;
  filepath = String(filepath);

  var nowrite = this.option('no-write');
  if (!options) {
    options = {force: this.option('force') || false};
  }

  this.log.verbose.write((nowrite ? 'Not actually deleting ' : 'Deleting ') + filepath + '...');

  if (!this.exists(filepath)) {
    this.log.verbose.error();
    this.log.warn('Cannot delete nonexistent file.');
    return false;
  }

  // Only delete cwd or outside cwd if --force enabled. Be careful, people!
  if (!options.force) {
    if (this.isPathCwd(filepath)) {
      this.log.verbose.error();
      grunt.fail.warn('Cannot delete the current working directory.');
      return false;
    } else if (!this.isPathInCwd(filepath)) {
      this.log.verbose.error();
      grunt.fail.warn('Cannot delete files outside the current working directory.');
      return false;
    }
  }

  try {
    // Actually delete. Or not.
    if (!nowrite) {
      rimraf.sync(filepath);
    }
    this.log.verbose.ok();
    return true;
  } catch (e) {
    this.log.verbose.error();
    throw legacyUtil.error('Unable to delete "' + filepath + '" file (' + e.message + ').', e);
  }
};

/**
 * Returns true if the given file path exists.
 *
 * @return {Boolean}
 * @api public
 */

File.prototype.exists = function() {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};

/**
 * Returns true if the given file is a symbolic link.
 *
 * @return {Boolean}
 * @api public
 */

File.prototype.isLink = function() {
  var filepath = path.join.apply(path, arguments);
  return this.exists(filepath) && fs.lstatSync(filepath).isSymbolicLink();
};

/**
 * Returns true if the given path is a directory.
 *
 * @return {Boolean}
 * @api public
 */

File.prototype.isDir = function() {
  var filepath = path.join.apply(path, arguments);
  return this.exists(filepath) && fs.statSync(filepath).isDirectory();
};

/**
 * Returns true if the given path is a file.
 *
 * @return {Boolean}
 * @api public
 */

File.prototype.isFile = function() {
  var filepath = path.join.apply(path, arguments);
  return this.exists(filepath) && fs.statSync(filepath).isFile();
};

/**
 * Returns true if the given file path absolute.
 *
 * @return {Boolean}
 * @api public
 */

File.prototype.isPathAbsolute = function() {
  var filepath = path.join.apply(path, arguments);
  return path.resolve(filepath) === filepath.replace(/[\/\\]+$/, '');
};

/**
 * Returns true if all of specified paths refer to the same path.
 *
 * @return {Boolean}
 * @api public
 */

File.prototype.arePathsEquivalent = function(first) {
  first = path.resolve(first);
  for (var i = 1; i < arguments.length; i++) {
    if (first !== path.resolve(arguments[i])) { return false; }
  }
  return true;
};

/**
 * Returns true if descendant path(s) are contained within ancestor path.
 * Note: does not test if paths actually exist.
 *
 * @return {Boolean}
 * @api public
 */

File.prototype.doesPathContain = function(ancestor) {
  ancestor = path.resolve(ancestor);
  var relative;
  for (var i = 1; i < arguments.length; i++) {
    relative = path.relative(path.resolve(arguments[i]), ancestor);
    if (relative === '' || /\w+/.test(relative)) { return false; }
  }
  return true;
};

/**
 * Returns true if a filepath is the CWD.
 *
 * @param {String} `filepath` A filepath may be passed as a single argument or as a list of path segments.
 * @return {Boolean}
 * @api public
 */

File.prototype.isPathCwd = function() {
  var filepath = path.join.apply(path, arguments);
  try {
    return this.arePathsEquivalent(fs.realpathSync(process.cwd()), fs.realpathSync(filepath));
  } catch (e) {
    return false;
  }
};

/**
 * Returns true if a filepath is contained within the given CWD.
 *
 * @param {String} `filepath` A filepath may be passed as a single argument or as a list of path segments.
 * @return {Boolean}
 * @api public
 */

File.prototype.isPathInCwd = function() {
  var filepath = path.join.apply(path, arguments);
  try {
    return this.doesPathContain(fs.realpathSync(process.cwd()), fs.realpathSync(filepath));
  } catch (e) {
    return false;
  }
};

/**
 * Expose `File`
 */

module.exports = File;

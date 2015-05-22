# grunt-legacy-file [![NPM version](https://badge.fury.io/js/grunt-legacy-file.svg)](http://badge.fury.io/js/grunt-legacy-file)   [![Build Status](https://travis-ci.org/gruntjs/grunt-legacy-file.svg)](https://travis-ci.org/gruntjs/grunt-legacy-file)  [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

> Grunt's file methods.

## Heads up!

This is not ready for use yet! We'll update the readme when it's ready to go, feel free to star the project if you want updates in the meantime!

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i grunt-legacy-file --save-dev
```

## Usage

```js
var file = require('grunt-legacy-file');
```

## API

### [extDotRe](index.js#L45)

Used by the `expandMapping` method. The "ext" option refers
to either everything after the first dot (default) or everything
after the last dot.

### [File](index.js#L57)

Create an instance of `File` with the given `options`.

**Params**

* `options` **{Object}**

### [.setBase](index.js#L119)

Change the current base path (ie, CWD) to the specified path.

**Params**

* `filepath` **{String}**: Path may be a single string, or list of file path segments.

### [.match](index.js#L165)

Match a filepath or filepaths against one or more wildcard
patterns. Returns all matching filepaths.

**Params**

* `options` **{Object}**
* `patterns` **{String|Array}**: String or array of glob patterns.
* `filepaths` **{Array}**: Filepath or paths to match against.
* `returns` **{Array}**

### [.isMatch](index.js#L195)

Returns true if any of the wildcard patterns match any
of the given file paths.

**Params**

* `options` **{Object}**
* `patterns` **{String|Array}**: String or array of glob patterns.
* `filepaths` **{Array}**: Filepath or paths to match against.
* `returns` **{Boolean}**

### [.expand](index.js#L209)

Return an array of all file paths that match the
given wildcard patterns.

**Params**

* `options` **{Object}**
* `patterns` **{String|Array}**: String or array of glob patterns.
* `returns` **{Array}** `filepaths`: Filepath or paths to match against.

### [.expandMapping](index.js#L260)

Build a multi task "files" object dynamically.

**Params**

* **{String|Array}**: patterns Glob pattern or patterns.
* `destBase` **{String}**
* `options` **{Object}**
* `returns` **{Array}**

### [.mkdir](index.js#L312)

Like `mkdir -p`. Create a directory and any intermediary directories.

**Params**

* `dirpath` **{String}**
* `mode` **{String}**

### [.recurse](index.js#L342)

Recurse into a directory, executing callback for each file.

**Params**

* `rootdir` **{String}**: The root directory from which to being recursing.
* **{Function}**: callback
* `subdir` **{String}**
* `returns` **{Array}**: Array of filepaths.

### [.defaultEncoding](index.js#L361)

The default file encoding to use. Default is `utf8`

### [.preserveBOM](index.js#L371)

Preserve the BOM (byte-order mark) on `file.read`, rather than strip it.
Set to `false` by default.

### [.read](index.js#L382)

Read a file, return its contents.

**Params**

* `filepath` **{String}**
* `options` **{Object}**
* `returns` **{String|Buffer}**

### [.readJSON](index.js#L415)

Read a JSON file, parse its contents, return an object.

**Params**

* `filepath` **{String}**
* `options` **{Object}**
* `returns` **{Object}**

### [.readYAML](index.js#L438)

Read a YAML file, parse its contents, return an object.

**Params**

* `filepath` **{String}**
* `options` **{Object}**
* `returns` **{Object}**

### [.write](index.js#L461)

Write a file.

**Params**

* `filepath` **{String}**
* `contents` **{String|Buffer}**
* `options` **{Object}**

### [.copy](index.js#L498)

Read a file, optionally processing its content, then
write the output. Or read a directory, recursively
creating directories, reading files, processing content,
writing output.

**Params**

* `srcpath` **{String}**
* `destpath` **{String}**
* `options` **{Object}**
* `returns` **{String}**

### [._copy](index.js#L522)

Read a file, optionally processing its content, then write the output.

**Params**

* `srcpath` **{String}**
* `destpath` **{String}**
* `options` **{Object}**

### [.delete](index.js#L559)

Delete folders and files recursively

**Params**

* `filepath` **{String}**: The file path to delete.
* `options` **{Object}**

### [.exists](index.js#L609)

Returns true if the given file path exists.

* `returns` **{Boolean}**

### [.isLink](index.js#L621)

Returns true if the given file is a symbolic link.

* `returns` **{Boolean}**

### [.isDir](index.js#L633)

Returns true if the given path is a directory.

* `returns` **{Boolean}**

### [.isFile](index.js#L645)

Returns true if the given path is a file.

* `returns` **{Boolean}**

### [.isPathAbsolute](index.js#L657)

Returns true if the given file path absolute.

* `returns` **{Boolean}**

### [.arePathsEquivalent](index.js#L669)

Returns true if all of specified paths refer to the same path.

* `returns` **{Boolean}**

### [.doesPathContain](index.js#L685)

Returns true if descendant path(s) are contained within ancestor path.
Note: does not test if paths actually exist.

* `returns` **{Boolean}**

### [.isPathCwd](index.js#L703)

Returns true if a filepath is the CWD.

**Params**

* `filepath` **{String}**: A filepath may be passed as a single argument or as a list of path segments.
* `returns` **{Boolean}**

### [.isPathInCwd](index.js#L720)

Returns true if a filepath is contained within the given CWD.

**Params**

* `filepath` **{String}**: A filepath may be passed as a single argument or as a list of path segments.
* `returns` **{Boolean}**

## TODO

**First:**

_(loosely in this order...)_

* [x] migrate code
* [x] migrate tests
* [x] get tests passing with 100% parity
* [x] add Grunfile
* [ ] coverage reports
* [x] API documentation, written as code comments
* [ ] Add links to website docs for any methods that have more info

**Next:**

* [ ] replace core `grunt.file` internal module with `grunt-legacy-file`
* [ ] remove any dependencies that are no longer needed from grunt.
* [ ] enable travis
* [ ] add travis badge
* [ ] Add the event to the changelogs of both libraries

## Related projects

* [grunt](http://gruntjs.com/): The JavaScript Task Runner
* [grunt-cli](http://gruntjs.com/): The grunt command line interface.
* [grunt-legacy-log](http://gruntjs.com/): The Grunt 0.4.x logger.
* [grunt-legacy-util](http://gruntjs.com/): Some old grunt utils provided for backwards compatibility.

## Running tests

Install dev dependencies:

```sh
$ npm install -d && grunt
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/gruntjs/grunt-legacy-file/issues/new)

## Author

**"Cowboy" Ben Alman**

+ [github/cowboy](https://github.com/cowboy)
* [twitter/cowboy](http://twitter.com/cowboy)

## Release history

{%= changelog(yaml(read("CHANGELOG"))) %}

## License

Copyright © 2015 "Cowboy" Ben Alman
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on May 22, 2015._
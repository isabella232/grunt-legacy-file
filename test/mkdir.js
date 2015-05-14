/*!
 * grunt <http://gruntjs.com/>
 *
 * Copyright (c) 2013-2015 "Cowboy" Ben Alman.
 * Licensed under the MIT license.
 */

'use strict';

require('should');
var fs = require('fs');
var path = require('path');
var file = require('..');

describe('.mkdir():', function () {
  before(function () {
    file.mkdir(__dirname + '/temp');
  });
  after(function () {
    file.delete(__dirname + '/temp/');
  });

  it('should not explode when a directory already exists:', function () {
    (function () {
      file.mkdir(__dirname + '/temp/');
    }).should.not.throw();
  });

  it('filepath should still exist.', function () {
    fs.existsSync(__dirname + '/temp/').should.be.true;
  });

  it('should not explode when a directory does NOT already exists:', function () {
    (function () {
      file.mkdir(__dirname + '/temp/aa/bb/cc');
    }).should.not.throw();
  });

  it('filepath should still exist.', function () {
    fs.existsSync(__dirname + '/temp/aa/bb/cc').should.be.true;
  });

  it('should not explode when a directory does NOT already exists:', function () {
    (function () {
      file.mkdir(__dirname + '/temp/aa/bb/cc');
    }).should.not.throw();
  });

  it('filepath should still exist.', function () {
    fs.existsSync(__dirname + '/temp/aa/bb/cc').should.be.true;
  });

  it('should throw if a path cannot be created (ENOTDIR).', function () {
    fs.writeFileSync(path.join(__dirname + '/temp/aa/bb/xx'), 'test');

    (function () {
      file.mkdir(path.join(__dirname + '/temp/aa/bb/xx/yy'));
    }).should.throw();
  });
});

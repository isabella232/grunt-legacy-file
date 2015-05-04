'use strict';

var fs = require('fs');

/**
 * Test helpers
 */

/**
 * Compare buffer `a` to buffer `b`, and return true if they are equivalent.
 *
 * @param  {Buffer} `a` 
 * @param  {Buffer} `b`
 * @return {Boolean}
 */

exports.compareBuffers = function compareBuffers(buf1, buf2) {
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

/**
 * Compare filepath `a` to filepath `b`, and return true if they are equivalent.
 *
 * @param  {String} `a` Filepath A
 * @param  {String} `b` Filepath B
 * @return {Boolean}
 */

exports.compareFiles = function compareFiles(a, b) {
  return exports.compareBuffers(fs.readFileSync(a), fs.readFileSync(b));
};

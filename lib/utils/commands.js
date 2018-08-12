'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _compact2 = require('lodash/compact');

var _compact3 = _interopRequireDefault(_compact2);

var _drop2 = require('lodash/drop');

var _drop3 = _interopRequireDefault(_drop2);

exports.isPromise = isPromise;
exports.runCommand = runCommand;
exports.shellescape = shellescape;

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _logger = require('../utils/logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */
const { spawn } = require('child_process');

process.env.FORCE_COLOR = true;

function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}

/**
 * @description Run a bash command using spawn pipeing the results to the main
 * process
 * @param {String} command - Command to be executed
 * @private
 */
function runCommand({ beforeMsg, successMsg, command, errorMsg, args }) {
  if (beforeMsg) (0, _logger.info)(beforeMsg);
  return new Promise((resolve, reject) => {
    const child = spawn((0, _isArray3.default)(command) ? command[0] : command.split(' ')[0], args || (0, _compact3.default)((0, _drop3.default)(command.split(' '))));
    var customStream = new _stream2.default.Writable();
    var customErrorStream = new _stream2.default.Writable();
    let output;
    let error;
    customStream._write = (data, ...argv) => {
      output += data;
      process.stdout._write(data, ...argv);
    };
    customErrorStream._write = (data, ...argv) => {
      error += data;
      process.stderr._write(data, ...argv);
    };
    // Pipe errors and console output to main process
    child.stdout.pipe(customStream);
    child.stderr.pipe(customErrorStream);
    // When child exits resolve or reject based on code
    child.on('exit', (code, signal) => {
      if (code !== 0) {
        // Resolve for npm warnings
        if (output && output.indexOf('npm WARN') !== -1) {
          return resolve(successMsg || output);
        }
        reject(errorMsg || error);
      } else {
        // resolve(null, stdout)
        if (successMsg) (0, _logger.info)(successMsg);
        resolve(successMsg || output);
      }
    });
  });
}

/**
 * Escape shell command arguments and join them to a single string
 * @param  {Array} a - List of arguments to escape
 * @return {String} Command string with arguments escaped
 */
function shellescape(a) {
  let ret = [];

  a.forEach(s => {
    if (/[^A-Za-z0-9_/:=-]/.test(s)) {
      // eslint-disable-line no-useless-escape
      s = "'" + s.replace(/'/g, "'\\''") + "'";
      s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
      .replace(/\\'''/g, "\\'"); // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    ret.push(s);
  });

  return ret.join(' ');
}
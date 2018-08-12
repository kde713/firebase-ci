'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.error = exports.warn = exports.success = exports.info = exports.log = undefined;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const colorMapping = {
  info: 'blue',
  warn: 'yellow',
  success: 'green',
  error: 'red'
};

const logType = (type, message, other) => {
  console.log(_chalk2.default[type](message)); // eslint-disable-line no-console
  if (other) {
    console.log('\n', other); // eslint-disable-line no-console
  }
};

const log = exports.log = console.log; // eslint-disable-line
const info = exports.info = (message, other) => logType(colorMapping.info, message, other);
const success = exports.success = (message, other) => logType(colorMapping.success, message, other);
const warn = exports.warn = (message, other) => logType(colorMapping.warn, message, other);
const error = exports.error = (message, other) => logType(colorMapping.error, message, other);
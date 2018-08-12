'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFile = undefined;
exports.functionsExists = functionsExists;
exports.functionsNodeModulesExist = functionsNodeModulesExist;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get settings from firebaserc file
 * @return {Object} Firebase settings object
 */
const getFile = exports.getFile = filePath => {
  const localPath = _path2.default.join(process.cwd(), filePath);
  if (!_fs2.default.existsSync(localPath)) {
    return {};
  }

  try {
    return JSON.parse(_fs2.default.readFileSync(localPath, 'utf8'));
  } catch (err) {
    /* eslint-disable no-console */
    console.log(_chalk2.default.red(`Error parsing ${filePath}.`), 'JSON is most likley not valid');
    /* eslint-enable no-console */
    return {};
  }
};

function functionsExists() {
  return _fs2.default.existsSync(_path2.default.join(process.cwd(), 'functions'));
}

function functionsNodeModulesExist() {
  return _fs2.default.existsSync(_path2.default.join(process.cwd(), 'functions', 'node_modules'));
}
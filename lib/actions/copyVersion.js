'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = copyVersion;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logger = require('../utils/logger');

var _files = require('../utils/files');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPath(filePath) {
  return _path2.default.join(process.cwd(), filePath);
}

/**
 * Copy version from main package file into functions package file
 * @param  {String} opts - name of project
 * @param  {Boolean} opts.silent - Whether or not to warn
 */
function copyVersion(config = { silence: false }) {
  if (!(0, _files.functionsExists)()) {
    if (config.silence) {
      return;
    }
    (0, _logger.warn)('Functions folder does not exist. Exiting...');
    return;
  }
  (0, _logger.info)('Copying version into functions package.json...');
  const pkg = JSON.parse(_fs2.default.readFileSync(createPath('package.json')));
  const functionsPkg = JSON.parse(_fs2.default.readFileSync(createPath(`functions/package.json`)));
  functionsPkg.version = pkg.version;
  try {
    _fs2.default.writeFileSync(createPath(`functions/package.json`), JSON.stringify(functionsPkg, null, 2), 'utf8');
    (0, _logger.success)('Version copied successfully');
  } catch (err) {
    (0, _logger.error)('Error copying version to functions folder');
    (0, _logger.log)(_logger.error);
  }
}
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _mapValues2 = require('lodash/mapValues');

var _mapValues3 = _interopRequireDefault(_mapValues2);

var _template2 = require('lodash/template');

var _template3 = _interopRequireDefault(_template2);

var _reduce2 = require('lodash/reduce');

var _reduce3 = _interopRequireDefault(_reduce2);

exports.default = createConfigFile;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _files = require('../utils/files');

var _logger = require('../utils/logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  FIREBASE_CI_PROJECT,
  TRAVIS_BRANCH,
  CIRCLE_BRANCH,
  CI_COMMIT_REF_SLUG,
  CI_ENVIRONMENT_SLUG
} = process.env;

function tryTemplating(str, name) {
  try {
    return (0, _template3.default)(str)(process.env);
  } catch (err) {
    (0, _logger.warn)(`Warning: ${err.message || 'Issue templating config file'}`);
    (0, _logger.warn)(`Setting "${name}" to an empty string`);
    return '';
  }
}

/**
 * Create config file based on CI environment variables
 * @param {Object} settings - Settings for how environment variables should
 * be copied from Travis-CI to Firebase Functions Config
 * @param {String} settings.path - Path where config file should be written
 * @return {Promise} Resolves with undefined (result of functions config set)
 * @example
 * "ci": {
 *   "createConfig": {
 *     "prod": {
 *        "firebase": {
 *          "apiKey": "${PROD_FIREBASE_API_KEY}"
 *        }
 *     }
 *   }
 * }
 * @private
 */
function createConfigFile(config) {
  const settings = (0, _files.getFile)('.firebaserc');

  // Check for .firebaserc settings file
  if (!settings) {
    (0, _logger.error)('.firebaserc file is required');
    throw new Error('.firebaserc file is required');
  }

  // Check for ci section of settings file
  if (!settings.ci || !settings.ci.createConfig) {
    (0, _logger.warn)('Create config settings needed in .firebaserc!');
    return;
  }

  // Set options object for later use (includes path for config file)
  const opts = {
    path: (0, _get3.default)(config, 'path', './src/config.js'),
    project: (0, _get3.default)(config, 'project', FIREBASE_CI_PROJECT || TRAVIS_BRANCH || CIRCLE_BRANCH || CI_COMMIT_REF_SLUG)

    // Get environment config from settings file based on settings or branch
    // default is used if TRAVIS_BRANCH env not provided, master used if default not set
  };const {
    ci: { createConfig }
  } = settings;

  // Fallback to different project name
  const fallBackConfigName = CI_ENVIRONMENT_SLUG || (createConfig.master ? 'master' : 'default');

  (0, _logger.info)(`Attempting to load config for project: "${opts.project}"`);

  if (!createConfig[opts.project]) {
    (0, _logger.info)(`Project named "${opts.project}" does not exist in create config settings, falling back to ${fallBackConfigName}`);
  }

  const envConfig = createConfig[opts.project] ? createConfig[opts.project] : createConfig[fallBackConfigName];

  if (!envConfig) {
    const msg = 'Valid create config settings could not be loaded';
    (0, _logger.error)(msg);
    throw new Error(msg);
  }

  (0, _logger.info)(`Creating config file at path: ${opts.path}`);

  // template data based on environment variables
  const templatedData = (0, _mapValues3.default)(envConfig, (parent, parentName) => (0, _isString3.default)(parent) ? tryTemplating(parent, parentName) : (0, _mapValues3.default)(parent, (data, childKey) => tryTemplating(data, `${parentName}.${childKey}`)));
  // convert object into formatted object string
  const parentAsString = parent => (0, _reduce3.default)(parent, (acc, child, childKey) => acc.concat(`  ${childKey}: ${JSON.stringify(child, null, 2)},\n`), '');

  // combine all stringified vars and attach default export
  const exportString = (0, _reduce3.default)(templatedData, (acc, parent, parentName) => acc.concat(`export const ${parentName} = `).concat((0, _isString3.default)(parent) ? `"${parent}";\n\n` : `{\n${parentAsString(parent)}};\n\n`), '').concat(`export default { ${Object.keys(templatedData).join(', ')} }`);

  const folderName = _path2.default.basename(_path2.default.dirname(opts.path));

  // Add folder containing config file if it does not exist
  if (!_fs2.default.existsSync(`./${folderName}`)) {
    _fs2.default.mkdirSync(folderName);
  }

  // Write config file
  try {
    _fs2.default.writeFileSync(opts.path, exportString, 'utf8');
  } catch (err) {
    (0, _logger.error)('Error creating config file: ', err);
  }
}
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _map2 = require('lodash/map');

var _map3 = _interopRequireDefault(_map2);

let setEnvVarInFunctions = (() => {
  var _ref2 = _asyncToGenerator(function* (functionsVar, travisVar) {
    if (!process.env[travisVar]) {
      const msg = `${travisVar} does not exist on within Travis-CI environment variables`;
      (0, _logger.success)(msg);
      throw new Error(msg);
    }
    (0, _logger.info)(`Setting ${functionsVar} within Firebase config from ${travisVar} variable on Travis-CI.`);
    // TODO: Check for not allowed characters in functionsVar (camelcase not allowed?)
    const setConfigCommand = `firebase functions:config:set ${functionsVar}="${process.env[travisVar]}"`;
    const [configSetErr] = yield (0, _async.to)((0, _commands.runCommand)(setConfigCommand));
    if (configSetErr) {
      const errMsg = `Error setting Firebase functions config variable: ${functionsVar} from ${travisVar} variable on Travis-CI.`;
      (0, _logger.error)(errMsg);
      throw new Error(errMsg);
    }
    (0, _logger.info)(`Successfully set ${functionsVar} within Firebase config from ${travisVar} variable on Travis-CI.`);
  });

  return function setEnvVarInFunctions(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

var _logger = require('../utils/logger');

var _files = require('../utils/files');

var _async = require('../utils/async');

var _commands = require('../utils/commands');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Map CI environment variables to Firebase functions config variables
 * @param {Object} copySettings - Settings for how environment variables should
 * be copied from CI environment to Firebase Functions Environment
 * @return {Promise} Resolves with undefined (result of functions config set)
 * @example
 * "ci": {
 *   "mapEnv": {
 *     "SOME_TOKEN": "some.token"
 *   }
 * }
 */
exports.default = (() => {
  var _ref = _asyncToGenerator(function* (copySettings) {
    const settings = (0, _files.getFile)('.firebaserc');
    if (!settings) {
      (0, _logger.error)('.firebaserc file is required');
      return Promise.reject(new Error('.firebaserc file is required'));
    }

    const mapEnvSettings = (0, _get3.default)(settings, 'ci.mapEnv', copySettings);

    if (!mapEnvSettings) {
      const msg = 'mapEnv parameter with settings needed in .firebaserc!';
      (0, _logger.warn)(msg);
      throw new Error(msg);
    }

    (0, _logger.info)('Mapping Environment to Firebase Functions...');

    return Promise.all((0, _map3.default)(mapEnvSettings, setEnvVarInFunctions));
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

module.exports = exports['default'];
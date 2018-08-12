'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _compact2 = require('lodash/compact');

var _compact3 = _interopRequireDefault(_compact2);

var _isUndefined2 = require('lodash/isUndefined');

var _isUndefined3 = _interopRequireDefault(_isUndefined2);

exports.runActions = runActions;

var _copyVersion = require('./copyVersion');

var _copyVersion2 = _interopRequireDefault(_copyVersion);

var _mapEnv = require('./mapEnv');

var _mapEnv2 = _interopRequireDefault(_mapEnv);

var _files = require('../utils/files');

var _logger = require('../utils/logger');

var _commands = require('../utils/commands');

var _deps = require('../utils/deps');

var _ci = require('../utils/ci');

var _async = require('../utils/async');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { FIREBASE_TOKEN } = process.env;

const skipPrefix = 'Skipping Firebase Deploy';

/**
 * Run firebase-ci actions
 * @param  {String} project - name of project
 * @return {Promise}
 * @private
 */
function runActions() {
  (0, _copyVersion2.default)();
  const settings = (0, _files.getFile)('.firebaserc');
  if ((0, _files.functionsExists)() && settings.ci && settings.ci.mapEnv) {
    return (0, _mapEnv2.default)().catch(err => {
      (0, _logger.error)('Error mapping CI environment variables to Functions environment: ', err);
      return Promise.reject(err);
    });
  }
  (0, _logger.info)('No ci action settings found in .firebaserc. Skipping actions.');
  return Promise.resolve({});
}

/**
 * @description Deploy to Firebase under specific conditions
 * @param {Object} opts - Options object
 * @param {String} opts.only - String corresponding to list of entities
 * to deploy (hosting, functions, database)
 * @param {Function} cb - Callback called when complete (err, stdout)
 */

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (opts) {
    const settings = (0, _files.getFile)('.firebaserc');
    const firebaseJson = (0, _files.getFile)('firebase.json');
    const branchName = (0, _ci.getBranch)();
    if ((0, _isUndefined3.default)(branchName) || opts && opts.test) {
      const nonCiMessage = `${skipPrefix} - Not a supported CI environment`;
      (0, _logger.warn)(nonCiMessage);
      return nonCiMessage;
    }

    if ((0, _ci.isPullRequest)()) {
      const pullRequestMessage = `${skipPrefix} - Build is a Pull Request`;
      (0, _logger.info)(pullRequestMessage);
      return pullRequestMessage;
    }

    if (!settings) {
      (0, _logger.error)('.firebaserc file is required');
      throw new Error('.firebaserc file is required');
    }

    if (!firebaseJson) {
      (0, _logger.error)('firebase.json file is required');
      throw new Error('firebase.json file is required');
    }

    const fallbackProjectName = (0, _ci.getFallbackProjectName)();
    // Get project from passed options, falling back to branch name
    const projectName = (0, _ci.getProjectName)(opts);
    // Get project setting from settings file based on branchName falling back
    // to fallbackProjectName
    const projectSetting = (0, _get3.default)(settings, `projects.${projectName}`);
    const fallbackProjectSetting = (0, _get3.default)(settings, `projects.${fallbackProjectName}`);
    // Handle project option
    if (!projectSetting) {
      const nonProjectBranch = `${skipPrefix} - "${projectName}" not an Alias, checking for fallback...`;
      (0, _logger.info)(nonProjectBranch);
      if (!fallbackProjectSetting) {
        const nonFallbackBranch = `${skipPrefix} - Fallback Project: "${fallbackProjectName}" is a not an Alias, exiting...`;
        (0, _logger.info)(nonFallbackBranch);
        return nonProjectBranch;
      }
      return nonProjectBranch;
    }
    if (!FIREBASE_TOKEN) {
      (0, _logger.error)('Error: FIREBASE_TOKEN env variable not found.');
      (0, _logger.info)('Run firebase login:ci (from  firebase-tools) to generate a token' + 'and place it travis environment variables as FIREBASE_TOKEN');
      throw new Error('Error: FIREBASE_TOKEN env variable not found.');
    }
    const onlyString = opts && opts.only ? `--only ${opts.only}` : '';
    const message = (0, _ci.getDeployMessage)();
    // Install firebase-tools and functions dependencies if enabled
    if (!settings.skipDependencyInstall) {
      yield (0, _deps.installDeps)(opts, settings);
    } else {
      (0, _logger.info)('Dependency install skipped');
    }
    // Run CI actions if enabled (i.e. copyVersion, createConfig)
    if (!opts.simple) {
      runActions(opts.actions);
    } else {
      (0, _logger.info)('Simple mode enabled. Skipping CI actions');
    }
    const [deployErr] = yield (0, _async.to)((0, _commands.runCommand)({
      command: 'firebase',
      args: (0, _compact3.default)(['deploy', onlyString, '--token', FIREBASE_TOKEN || 'Invalid.Token', '--project', projectName, '--message', (0, _commands.shellescape)([message])]),
      beforeMsg: `Deploying to ${branchName} branch to ${projectName} Firebase project`,
      errorMsg: 'Error deploying to firebase.',
      successMsg: `Successfully Deployed ${branchName} branch to ${projectName} Firebase project`
    }));
    if (deployErr) {
      (0, _logger.error)('Error in firebase-ci:\n ', deployErr);
      throw deployErr;
    }
    return null;
  });

  function deploy(_x) {
    return _ref.apply(this, arguments);
  }

  return deploy;
})();
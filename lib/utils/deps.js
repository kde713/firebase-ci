'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.installDeps = undefined;

/**
 * Install Firebase tools and run npm install in functions folder
 * @return {[type]} [description]
 */
let installDeps = exports.installDeps = (() => {
  var _ref = _asyncToGenerator(function* (opts = {}, settings = {}) {
    const { info } = opts;
    const { toolsVersion } = settings;
    const versionSuffix = toolsVersion ? `@${toolsVersion}` : '';
    const promises = [];
    (0, _logger.info)('Checking to see if firebase-tools already exists...');
    if (!commandExistsSync('firebase')) {
      if (!settings.skipToolsInstall) {
        promises.push((0, _commands.runCommand)({
          command: `npm i firebase-tools${versionSuffix} ${info ? '' : '-q'}`,
          beforeMsg: 'firebase-tools does not already exist, installing...',
          errorMsg: 'Error installing firebase-tools.',
          successMsg: 'Firebase tools installed successfully!'
        }));
      }
    } else {
      (0, _logger.info)('firebase-tools already exists');
    }
    // Call npm install in functions folder if it exists and does
    // not already contain node_modules
    if ((0, _files.functionsExists)() && !(0, _files.functionsNodeModulesExist)() && !settings.skipFunctionsInstall) {
      promises.push((0, _commands.runCommand)({
        command: `npm i --prefix functions`,
        beforeMsg: 'Running npm install in functions folder...',
        errorMsg: 'Error installing functions dependencies.',
        successMsg: 'Functions dependencies installed successfully!'
      }));
    }
    return Promise.all(promises);
  });

  return function installDeps() {
    return _ref.apply(this, arguments);
  };
})();

var _commandExists = require('command-exists');

var _commandExists2 = _interopRequireDefault(_commandExists);

var _files = require('./files');

var _commands = require('./commands');

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const commandExistsSync = _commandExists2.default.sync;
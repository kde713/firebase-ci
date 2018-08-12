'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

exports.getBranch = getBranch;
exports.getProjectName = getProjectName;
exports.getFallbackProjectName = getFallbackProjectName;
exports.isPullRequest = isPullRequest;
exports.getCommitMessage = getCommitMessage;
exports.getDeployMessage = getDeployMessage;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getBranch() {
  const {
    TRAVIS_BRANCH,
    CIRCLE_BRANCH,
    BITBUCKET_BRANCH,
    CI_COMMIT_REF_SLUG
  } = process.env;
  return TRAVIS_BRANCH || CIRCLE_BRANCH || BITBUCKET_BRANCH || CI_COMMIT_REF_SLUG || 'master';
}

function getProjectName(opts) {
  const branchName = getBranch();
  const { FIREBASE_CI_PROJECT } = process.env;
  // Get project from passed options, falling back to branch name
  return FIREBASE_CI_PROJECT || (0, _get3.default)(opts, 'project', branchName === 'master' ? 'default' : branchName);
}

/**
 * [getFallbackProjectName description]
 * @return {[type]} [description]
 */
function getFallbackProjectName() {
  const { CI_ENVIRONMENT_SLUG } = process.env;
  return CI_ENVIRONMENT_SLUG;
}

function isPullRequest() {
  // Currently Bitbucket pipeline doesn't support build for PR. So doesn't include in this function.
  const { TRAVIS_PULL_REQUEST, CIRCLE_PR_NUMBER } = process.env;
  return !!TRAVIS_PULL_REQUEST && TRAVIS_PULL_REQUEST !== 'false' || !!CIRCLE_PR_NUMBER && CIRCLE_PR_NUMBER !== 'false';
}

function getCommitMessage() {
  const { TRAVIS_COMMIT_MESSAGE, CIRCLE_SHA1, CI_COMMIT_MESSAGE } = process.env;
  return TRAVIS_COMMIT_MESSAGE || CIRCLE_SHA1 || CI_COMMIT_MESSAGE;
}

function getDeployMessage() {
  const originalMessage = getCommitMessage();
  // // First 300 characters of travis commit message or "Update"
  return originalMessage ? originalMessage.replace(/"/g, "'").substring(0, 300) : 'Update';
}
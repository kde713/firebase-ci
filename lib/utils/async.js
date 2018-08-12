"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.to = to;
/**
 * Async await wrapper for easy error handling
 * @param { Promise } promise
 * @return { Promise }
 */
function to(promise) {
  return promise.then(data => {
    return [null, data];
  }).catch(err => [err, undefined]);
}
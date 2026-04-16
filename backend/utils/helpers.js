/**
 * Simple asynchronous wrapper for handling errors in Express routes
 */
function asyncWrapper(fn) {
  return function(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  asyncWrapper
};

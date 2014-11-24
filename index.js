'use strict';

var util = require('util')
  , stats = null;

var called = false;

var TRACKERS = {
  COUNT_FOR_PATH: 'Calls to route: %s',
  RES_TIME_FOR_PATH: 'Response time for %s',
  OPEN_REQUESTS: 'Open Requests',
  TOTAL_REQ_ERROR: 'Requests with Errors',
  TOTAL_REQ_RECIEVED: 'Requests Received',
  TOTAL_REQ_SERVED: 'Requests Served'
};


module.exports = function getStatsMiddleware (fh) {
  if (called) {
    throw new Error('Called fh-express-stats twice. This middleware can ' +
      'only be called once to ensure accurate statistics; ideally before ' +
      'your custom routes.');
  } else if (!fh || !fh.stats) {
    throw new Error('Please provide a valid FeedHenry API (fh-mbaas-api) ' +
      'reference to the stats middleware. e.g:' +
      'app.use(fhStats(require("fh-mbaas-api")))');
  } else {
    called = true;
    stats = fh.stats;
    return statsMiddleware;
  }
};


/**
 * Main public function used to get a middleware instance
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
function statsMiddleware (req, res, next) {
  stats.inc(TRACKERS.OPEN_REQUESTS);
  stats.inc(TRACKERS.TOTAL_REQ_RECIEVED);

  // Tracks calls to route and subroutes
  increaseRouteCallCount(req.baseUrl);
  increaseRouteCallCount(req.url);

  req['reqStartTime'] = res['reqStartTime'] = Date.now();

  // Add events to manage stats
  res.on('close', onRequestClosed.bind(req));
  res.on('finish', onRequestFinished.bind(req));

  next();
}


/**
 * Increment the number of calls to a specific URL
 * @param  {String} url
 */
function increaseRouteCallCount (url) {
  var name = util.format(TRACKERS.COUNT_FOR_PATH, url);
  stats.inc(name);
}


/**
 * onRequestFinished handles a successfully called res.end()
 */
function onRequestFinished () {
  // Dec open request count
  stats.dec(TRACKERS.OPEN_REQUESTS);

  // Increase number of successful reqs
  stats.inc(TRACKERS.TOTAL_REQ_SERVED);

  // Add response time
  var timerName = util.format(TRACKERS.RES_TIME_FOR_PATH, this.url);
  stats.timing(timerName, (Date.now() - this.reqStartTime));
}


/**
 * onRequestClosed handles a failed request
 */
function onRequestClosed () {
  stats.dec(TRACKERS.OPEN_REQUESTS);

  // Increase number of abruptly closed reqs
  stats.inc(TRACKERS.TOTAL_REQ_ERROR);
}

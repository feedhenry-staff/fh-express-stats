'use strict';

var proxyquire = require('proxyquire')
  , statsStub = require('./fh-stats-stub')
  , ReqResStub = require('./req-res-stub')
  , expect = require('chai').expect
  , xtend = require('xtend');

var expstats = require('../index.js');

// Get a middleware instance
expstats = expstats({
  stats: statsStub
});

var DEFAULT_RESULTS = {
  'Requests Received': 1,
  'Calls to route: test': 1,
  'Calls to route: /test/testroute': 1
};

var TEST_ROUTE = '/test/testroute';

// Perform a batch of requests
function reqBatch (n) {
  var objs = {
    req: [],
    res: [],

    respond: function () {
      this.res.forEach(function (r) {
        r.emit('finish');
      });
    }
  };

  for (var i = 0; i<n; i++) {
    var req = new ReqResStub(TEST_ROUTE)
      , res = new ReqResStub(TEST_ROUTE);

    objs.req.push(req);
    objs.res.push(res);

    expstats(req, res, function () {});
  }

  return objs;
}

describe('FeedHenry Stats Middleware', function () {
  var req, res;

  // Reset the stats stub before each run
  beforeEach(function () {
    req = new ReqResStub(TEST_ROUTE);
    res = new ReqResStub(TEST_ROUTE);

    statsStub.reset();
  });


  describe('Async behaviour', function () {
    it('Call the "next" middleware callback', function (done) {
      expstats(req, res, done);
    });
  });

  describe('TOTAL_REQ_RECIEVED', function () {
    it('Should track the number of requests received', function () {
      reqBatch(5);
      expect(statsStub.getCounters()['Requests Received']).to.be.at.least(5);
    });
  });


  describe('TOTAL_REQ_SERVED', function () {
    it('Should track the number of requets served', function () {
      var batch = reqBatch(8);
      batch.respond();
      expect(statsStub.getCounters()['Requests Served']).to.be.at.least(8);
    });
  });


  describe('COUNT_FOR_PATH', function () {

    it('Should increase the number of calls to the test path', function () {
      var afterReq = xtend(DEFAULT_RESULTS, {
        'Open Requests': 1,
      });

      var afterFinish = xtend(DEFAULT_RESULTS, {
        'Open Requests': 0,
        'Requests Served': 1
      });

      expstats(req, res, function () {
        expect(statsStub.getCounters()).to.deep.equal(afterReq);
        res.emit('finish');
        expect(statsStub.getCounters()).to.deep.equal(afterFinish);
      });
    });


  });

  describe('RES_TIME_FOR_PATH', function () {

    it('Should track the response times for the given path', function (done) {
      expstats(req, res, function () {

        setTimeout(function () {
          res.emit('finish');

          expect(statsStub.getTimers())
            .to.contain.key('Response time for /test/testroute');
          expect(statsStub.getTimers()['Response time for /test/testroute'][0])
            .to.be.at.least(10);

          done();
        }, 10);

      });
    });

  });


  describe('OPEN_REQUESTS', function () {
    it('Should track 10 requests', function () {
      reqBatch(10);
      expect(statsStub.getCounters()['Open Requests']).to.equal(10);
    });
  });


  describe('TOTAL_REQ_ERROR', function () {
    it('Should register a request that had an error', function () {
      expstats(req, res, function () {
        res.emit('close'); // Used for requests that did not finish successfully

        expect(statsStub.getCounters()).to.contain.key('Requests with Errors');
        expect(statsStub.getCounters()['Requests with Errors'])
          .to.be.at.least(1);
      });
    });
  });

});

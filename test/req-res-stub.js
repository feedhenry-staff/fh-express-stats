'use strict';

var util = require('util')
  , events = require('events');

function ReqResStub (url) {
  events.EventEmitter.call(this);

  this.url = url;
  this.baseUrl = url.split('/')[1];
}
util.inherits(ReqResStub, events.EventEmitter);
module.exports = ReqResStub;

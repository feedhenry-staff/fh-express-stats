'use strict';

var timers = {};
var counters = {};

exports.getCounters = function () {
  return counters;
};

exports.getTimers = function () {
  return timers;
};

exports.reset = function () {
  counters = {};
  timers = {};
};

exports.inc = function (name) {
  if (!counters.hasOwnProperty(name)) {
    counters[name] = 0;
  }

  counters[name] += 1;
};

exports.dec = function (name) {
  if (!counters.hasOwnProperty(name)) {
    counters[name] = 0;
  }

  counters[name] -= 1;
};

exports.timing = function (name, time) {
  if (!timers.hasOwnProperty(name)) {
    timers[name] = [];
  }

  timers[name].push(time);
};

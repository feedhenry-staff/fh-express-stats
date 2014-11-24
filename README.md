fh-express-stats
================

Express Middleware to provide application statistics via the Statistics Tab in 
the FeedHenry Studio.

## What do I get?
The following statistics will be added to the Statistics tab for your Cloud App
automaitcally when using this module:

#### Counters
* Calls to route: [ROUTE]
* Open Requests
* Requests Served
* Requests Received
* Requests with Errors

"Calls to route" will show the baseUrl and any subroutes independently.

#### Timers
Response Time for [ROUTE]


## Usage

Install with NPM:
```
$ npm i fh-express-stats --save
```

Add to FeedHenry Express application. The _fh-mbaas-api_ dependency must 
be installed in your project to use this.

```javascript
var mbaasApi = require('fh-mbaas-api');
var express = require('express');
var mbaasExpress = mbaasApi.mbaasExpress();
var fhStats = require('fh-express-stats');
var cors = require('cors');

var app = express();

// Note: the order which we add middleware to Express here is important!
app.use('/sys', mbaasExpress.sys(securableEndpoints));
app.use('/mbaas', mbaasExpress.mbaas);

// Note: important that this is added just before your own Routes
app.use(mbaasExpress.fhmiddleware());

// Stats middleware can go here
app.use(fhStats(mbaasApi));

// fhlint-begin: custom-routes
app.use('/hello', require('./lib/hello.js')());
// fhlint-end

// Important that this is last!
app.use(mbaasExpress.errorHandler());

var port = process.env.FH_PORT || process.env.VCAP_APP_PORT || 8001;
var server = app.listen(port, function() {
  console.log("App started at: " + new Date() + " on port: " + port);
});

```

## Contributing
Add any new statistics you think would be useful! 

Simply run _npm test_ to run tests from the root directory.

Stubs are used for testing, take a look at the test file and it should be clear 
how they work.
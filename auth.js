var https = require('https'),
    concat = require('concat-stream'),
    async = require('async');

var pageId = 'csinsit';

function FacebookPage(pageId) {
    if (!(this instanceof FacebookPage))
        return new FacebookPage(pageId);

    this.pageId = pageId;
}

FacebookPage.prototype.getPublicFeeds = function (callback) {

var pageId = this.pageId;

async.waterfall([

  function (done) {
        var params = {
            hostname: 'graph.facebook.com',
            port: 3000,
            path: '/oauth/access_token?client_id=774249796068621&' +
                'client_secret=2d3c25556391ef227e0d848c748766b1&grant_type=client_credentials',
            method: 'GET'
        };

        https.get(params, function (response) {
            //response is a stream so it is an EventEmitter
            response.setEncoding("utf8");

            //More compact
            response.pipe(concat(function (data) {
                done(null, data);
            }));

            response.on("error", done);
        });
  },

  function (access_token, done) {

        var params = {
            hostname: 'graph.facebook.com',
            port: 3000,
            path: '/v2.0/' + pageId + '/feed?' + access_token,
            method: 'GET'
        };

        https.get(params, function (response) {
            //response is a stream so it is an EventEmitter
            response.setEncoding("utf8");

            //More compact
            response.pipe(concat(function (data) {
                callback(null, JSON.parse(data));
		console.log(JSON.parse(data));
            }));

            response.on("error", callback);
        });

  }]);
};

module.exports = FacebookPage;






































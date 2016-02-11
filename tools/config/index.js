var express = require("express");
var path = require('path');

var staticdir = 'static';
var cfn_dir = path.join(path.dirname(path.dirname(__dirname)), 'cloudformation');

module.exports = function(callback) {

    var app = express();

	app.set('views', __dirname);
	app.set('view engine', 'jade');
	app.locals.pretty = true;

	// app.use(express.logger());

	app.use(express.static(__dirname));

	app.get('/', function (req, res) {
	  res.render('index',
	    { title : 'Home' }
	  )
	});

	app.get('/params', function (req, res) {
	  var params = {};

	  try {
        params = require(path.join(cfn_dir, 'vpc-' + req.query.setup, 'django-master.cfn.json'));
      } catch (e) {
        console.log(e);
      }

      return res.json(params);

	});
	var port = 4000;
	var ip = "127.0.0.1";

	app.listen(port, ip, function() {
	  console.log("Listening on " + ip + ':' + port);
	  require('opn')('http://localhost:4000');
	});

	app.on('close', function() {
	  console.log("Closed config server.");
	  callback();
	});
}
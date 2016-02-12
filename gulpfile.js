
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var spawn = require('cross-spawn-async');
var prompt = require('prompt');
var async = require('async');


var python = /^win/.test(process.platform) ? './env/Scripts/python.exe' :  './env/bin/python';


gulp.task('deploy_lambda_resources', function (callback) {

    var cfnlambda = require('cfn-lambda');
    var config = require('./config.json');
    var format = require('string-format');

    async.waterfall([
      function(cb) {
        return cfnlambda.deploy(
          'cfn-elasticsearch-domain',
          config.region,
          [config.region],
          function (res) {
              cb(null);
          }
        );
      },
      function(cb) {
        return cfnlambda.deploy(
          'cfn-natgateway',
          config.region,
          [config.region],
          function (res) {
              cb(null);
          }
        );
      },
      function(cb) {
        return cfnlambda.deploy(
          'cfn-natroute',
          config.region,
          [config.region],
          function (res) {
              cb(null);
          }
        );
      }
    ],
    function() {
      console.log("All lambdas deployed!");
      callback();
    });

    
});

gulp.task('deploy_full_stack', function (callback) {

    var config = require('./config.json');
    var full_deploy = require(path.join(__dirname, 'tools', 'deploy_full_stack'));
    full_deploy(config, function () {
      return callback();
    });
});

gulp.task('js', function (callback) {

  var config = {
      baseUrl: 'assets',
      name: 'main',
      include: ['requireLib', 'text'],
      optimize: "uglify",
      out: 'django/testproject/static/js/main.js',
      // The shim config allows us to configure dependencies for
      // scripts that do not call define() to register a module
      'shim': {
          'underscore': {
              'exports': '_'
          },
          'backbone': {
              'deps': [
                  'underscore',
                  'jquery'
              ],
              'exports': 'Backbone'
          }
      },
      'paths': {
          'jquery': 'bower_components/jquery/dist/jquery',
          'underscore': 'bower_components/underscore/underscore',
          'backbone': 'bower_components/backbone/backbone',
          'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap',
          'text': 'bower_components/text/text',
          'datetimepicker': 'bower_components/bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
          'moment': 'bower_components/moment/moment',
          'moment-nb': 'bower_components/moment/locale/nb',
          'requireLib': 'bower_components/requirejs/require'

      }
  };

  return requirejs.optimize(config, function (res) {
    callback();
  }, function(err) {
    console.log(err);
  });

});

gulp.task('less', function () {
  var LessPluginCleanCSS = require("less-plugin-clean-css"),
      cleancss = new LessPluginCleanCSS({advanced: true});
  
  var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
      autoprefix= new LessPluginAutoPrefix({browsers: ["last 3 versions"]});
  
  gulp.src('./assets/less/*.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [ path.join(__dirname, 'bower_components') ],
      plugins: [autoprefix, cleancss]
     }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./django/testproject/static/css'));

});

gulp.task('copy', function() {
  gulp.src(['./static/**/*' ])
    .pipe(gulp.dest('./django/testproject/static/'));

  gulp.src([path.join(__dirname, 'assets', 'bower_components', 'bootstrap', 'fonts') + '/**/*' ])
    .pipe(gulp.dest('./django/testproject/static/fonts'));
});

gulp.task('build', ['js', 'less', 'copy'], function () {
   
});

gulp.task('configure', function (callback) {
  require(path.join(__dirname, 'tools', 'config'))(callback);
  /*
  prompt.start();
  prompt.get([{
    name: 'project_name',
    description: 'Project name',
    type: 'string',
    required: true
  }, {
    name: 'region',
    description: 'Deploy to region',
    type: 'string',
    required: true
  }, {
    name: 'keyname',
    description: 'EC2 keypair for instance',
    type: 'string',
    required: true
  }, {
    name: 'email',
    description: 'Email adress for error mails/server (ses verified)',
    type: 'string',
    required: true
  }, {
    name: 'use_ha',
    description: 'Use HA Cloudformation Templates?',
    type: 'boolean'
  }], function(err, result) {
    fs.writeFile('./config.json', JSON.stringify(result), function(err) {
      if (err) throw err;
      console.log('config.json saved!');
      return callback();
    });
  });
*/
});


gulp.task('config_js', function (callback) {

  var requirejs = require('requirejs');

  var config = {
      baseUrl: 'assets',
      name: 'config/main',
      include: ['requireLib', 'text'],
      optimize: "uglify",
      out: 'tools/config/main.js',
      // The shim config allows us to configure dependencies for
      // scripts that do not call define() to register a module
      'shim': {
          'underscore': {
              'exports': '_'
          },
          'backbone': {
              'deps': [
                  'underscore',
                  'jquery'
              ],
              'exports': 'Backbone'
          }
      },
      'paths': {
          'jquery': 'bower_components/jquery/dist/jquery',
          'underscore': 'bower_components/underscore/underscore',
          'backbone': 'bower_components/backbone/backbone',
          'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap',
          'text': 'bower_components/text/text',
          'datetimepicker': 'bower_components/bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
          'moment': 'bower_components/moment/moment',
          'moment-nb': 'bower_components/moment/locale/nb',
          'requireLib': 'bower_components/requirejs/require'

      }
  };

  return requirejs.optimize(config, function (res) {
    callback();
  }, function(err) {
    console.log(err);
  });

});

gulp.task('config_less', function () {
  var LessPluginCleanCSS = require("less-plugin-clean-css"),
      cleancss = new LessPluginCleanCSS({advanced: true});
  
  var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
      autoprefix= new LessPluginAutoPrefix({browsers: ["last 3 versions"]});
  
  gulp.src('./assets/less/*.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [ path.join(__dirname, 'assets', 'bower_components') ],
      plugins: [autoprefix, cleancss]
     }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./tools/config/'));

});

gulp.task('config_build', ['config_js', 'config_less'], function () {
   
});

gulp.task('connectdjango', function () {
    var env = process.env,
        varName,
        envCopy = {DJANGO_DEV:1};

    // Copy process.env into envCopy
    for (varName in env) {
      envCopy[varName] = env[varName];
    }
    return spawn(python, [
      path.join('django', 'manage.py'), 'runserver', 'localhost:9000'
    ], {stdio: 'inherit', env: envCopy});

});

gulp.task('serve', ['connectdjango'], function () {
   
    require('opn')('http://localhost:9000');
    
    gulp.watch(['./js/**/*'], ['js']);
    gulp.watch(['./less/**/*'], ['less']);
});

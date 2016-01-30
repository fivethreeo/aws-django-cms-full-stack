
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var spawn = require('cross-spawn-async');
var prompt = require('prompt');

gulp.task('less', function () {
  var LessPluginCleanCSS = require("less-plugin-clean-css"),
      cleancss = new LessPluginCleanCSS({advanced: true});
  
  var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
      autoprefix= new LessPluginAutoPrefix({browsers: ["last 3 versions"]});
  
  gulp.src('./less/*.less')
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

  gulp.src([path.join(__dirname, 'bower_components', 'bootstrap', 'fonts') + '/**/*' ])
    .pipe(gulp.dest('./django/testproject/static/fonts'));
});

var python = /^win/.test(process.platform) ? './env/Scripts/python.exe' :  './env/bin/python';

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

gulp.task('js', function () {
    return spawn('node', [
      path.join('tools', 'r.js'), '-o', path.join('tools', 'build.js')
    ], {stdio: 'inherit'});
});

gulp.task('serve', ['connectdjango'], function () {
   
    require('opn')('http://localhost:9000');
    
    gulp.watch(['./js/**/*'], ['js']);
    gulp.watch(['./less/**/*'], ['less']);
});


gulp.task('build', ['js', 'less', 'copy'], function () {
   
});

gulp.task('deploy_lambda_resource', function () {

    var config = require('./config.json');
    var format = require('string-format');
    var deploy = require(path.join(
      __dirname,
      'tools',
      'deploy'));

    return deploy(
      config.region, [config.region], function (res) {
          console.log(format(res, config.region));
      }
    );
});

gulp.task('configure', function (callback) {
  
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
  }], function(err, result) {
    fs.writeFile('./config.json', JSON.stringify(result), function(err) {
      if (err) throw err;
      console.log('config.json saved!');
      return callback();
    });
  });

});

gulp.task('deploy_full_stack', function (callback) {

    var config = require('./config.json');
    var full_deploy = require(path.join(__dirname, 'tools', 'deploy_full_stack'));
    full_deploy(config, function () {
      return callback();
    });
});
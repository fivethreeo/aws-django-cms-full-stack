


var main = function (opts, main_callback) {

	var format = require('string-format');
	var path = require('path');
	var fs = require('fs');
	var stream = require('stream');
	var async = require('async');
	var archiver = require('archiver');
    var prompt = require('prompt');
	var _ = require('lodash');

	function cfn_params(obj) {
		var params = [];
		_.forIn(obj, function(value, key) {
		  params.push({
		    "ParameterKey": key,
		    "ParameterValue": value
		  });
		});
		return params;
	}

	var region = opts.region ? opts.region : 'us-east-1';
	if (!opts.keyname) throw 'AWS keypair name not supplied';
	var keyname = opts.keyname;
	var project_name = opts.project_name ? opts.project_name : 'django-aws';
	var applicationname = project_name + '-app';
	var environmentname = applicationname + '-env';
	var stackname = project_name;
	var assetsbucketprefix = project_name + '-';
	var assetsbucket = assetsbucketprefix + region;

	var AWS = require('aws-sdk');
	AWS.config.region = region;

	var templates = function(input){
		var output = [];
		for (var i=0;i<input.length;i++) {
			output.push({
				key: 'public/vpc/' + input[i],
				buffer: fs.readFileSync(path.join(path.dirname(__dirname), 'cloudformation', 'vpc-simple-freetier', input[i]))
			});
		}
		return output;
	}([
		'django-elasticbeanstalk.cfn.json',
		'django-master.cfn.json',
		'django-resources.cfn.json',
		'django-vpc.cfn.json'
	]);

	var s3 = new AWS.S3();

	var version_params = {
		VersionLabel: 'Initial version',
		VersionDescription: 'New version'
	};

	var version;

	async.waterfall([
	    function(callback) {
		  prompt.start();
		  prompt.get([{
		    name: 'version',
		    description: 'Version of application zip',
		    type: 'string',
		    default: 'initial'
		  }], function(err, result) {
		  	  version = result.version;
		      return callback();
		  });
	    },
	    function(callback) {
	        var params = {
	        	Bucket: assetsbucket,
	        	ACL: 'private',
	        	CreateBucketConfiguration: {
	        	    LocationConstraint: region
	        	}
	        };

	        s3.createBucket(params, function(err, data) {
	        	if (err) callback(null);  // an error occurred
	        	else callback(null); // successful response
	        });
	    },
	    function(callback) {

	    	async.each(templates, function (template, eachcallback) {
			        var params = {
			        	Bucket: assetsbucket, /* required */
			        	Key: template.key, /* required */
			        	ACL: 'private',
			        	Body: template.buffer,
			        };

			        s3.putObject(params, function(err, data) {
			        	if (err) throw err;  // an error occurred
			        	else eachcallback(); // successful response
			        });
			    },
		        function () { callback(null); }
		    );
	    },
	    function(callback) {

			var zip_parts = [];

			var archive = archiver('zip');

			var converter = new stream.Writable({
			  write: function (chunk, encoding, next) {
			    zip_parts.push(chunk);
			    next()
			}});

		    converter.on('finish', function () {
		        var params = {
		        	Bucket: assetsbucket, /* required */
		        	Key: 'public/django-' + version + '.zip', /* required */
		        	ACL: 'private',
		        	Body: Buffer.concat(zip_parts),
		        };

		        s3.putObject(params, function(err, data) {
		        	if (err) throw err;  // an error occurred
		        	else callback(null); // successful response
		        });
		    })

			console.log('Zipping django deployment to buffer...');

			archive.directory(path.join(path.dirname(__dirname), 'django'), '');

			archive.pipe(converter);

			archive.finalize();
	    },
	    function(callback) {
	    	var ec2 = new AWS.EC2();

	        var params = {
	        	DryRun: false,
	        };

	        ec2.describeAvailabilityZones(params, function(err, data) {
	        	if (err) throw err;  // an error occurred
	        	else callback(null, data); // successful response
	        });
	    },
	    function(zonedata, callback) {

	    	var cloudformation = new AWS.CloudFormation();
			        
			var params = {
			  StackName: stackname // required
			};

	        cloudformation.describeStacks(params, function(err, data) {
	            if (err) callback(null, false, zonedata);    // an error occurred
	            else {
	               if (!/(CREATE|UPDATE)_(ROLLBACK_)?COMPLETE/.test(data.Stacks[0].StackStatus)) throw 'Wait for stack status COMPLETE';
	               callback(null, true, zonedata);
	            }      // successful response
	        });

	    },
	    function(update, zonedata, callback) {

	    	var cloudformation = new AWS.CloudFormation();
			        
			var params = {
			  StackName: stackname, // required
			  Capabilities: [
			    'CAPABILITY_IAM'
			  ],
			  Parameters: cfn_params({
			  	ApplicationName: applicationname,
				EnvironmentName: environmentname,
				AssetsBucketPrefix: assetsbucketprefix,
				KeyName: keyname,
				VPCAvailabilityZone1: zonedata.AvailabilityZones[0].ZoneName,
				VPCAvailabilityZone2: zonedata.AvailabilityZones[1].ZoneName,
				ElasticsearchDomainName: applicationname,
				VersionLabel: version_params.VersionLabel,
				VersionDescription: version_params.VersionDescription,
				AppZIPFile:'public/django-' + version + '.zip'
			  }),
			  TemplateURL: ["http://", assetsbucket, ".s3.amazonaws.com/", "public/vpc/django-master.cfn.json"].join('')
			};

			if (update) {
		        cloudformation.updateStack(params, function(err, data) {
		            if (err) throw err; // an error occurred
		            else callback();      // successful response
		        });
			}
			else {
		        cloudformation.createStack(_.assign(params, {OnFailure: 'ROLLBACK'}), function(err, data) {
		            if (err) throw err; // an error occurred
		            else callback();      // successful response
		        });
		    }

	    }],
	    function() {
	    	console.log('Full stack deployed!');
	    	return main_callback();
	    }
	);
}

module.exports = main;
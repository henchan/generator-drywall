'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var sys = require('sys');

var mongojs = require('mongojs');
var simpleGit = require('simple-git');	

var generatorName='generator-drywall'
var generatorPath;

var drywall_versions = {
	"latest" : null, // do not remove this key
	"0.9.27" : "5a6c76a05b8d55b9193efa403ca3fc7d1488d65d",
	"0.9.26" : "5a6c76a05b8d55b9193efa403ca3fc7d1488d65d"
};

var initCap = function (inStr) {
	return inStr.slice(0,1).toUpperCase() + inStr.slice(1);
};

var DrywallGenerator = yeoman.generators.Base.extend({
  init: function () {
  
	generatorPath = this.src._base.slice(0, this.src._base.indexOf(generatorName) + generatorName.length);
	console.log("Using Generator at: " + generatorPath);
  
    this.env.options.appPath = this.options.appPath || 'app';
	this.config.set('appPath', this.env.options.appPath);

    this.pkg = yeoman.file.readJSON(path.join(__dirname, '../package.json'));

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.npmInstall();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // have Yeoman greet the user
    console.log(this.yeoman);

    console.log(chalk.magenta("You're using the Drywall generator. This will create a new Drywall App with optional basic crud features"));

 	var dependsCustom = function (input) {
		if (input.customApp) { return true; } return false;	};
 	var dependsConfig = function (input) {
		if (input.configApp) { return true; } return false;	};
 	var dependsMongo = function (input) {
		if (input.noSQL && input.noSQL == "MongoDB") { return true; } return false; };
 	var dependsUseFullDBString = function (input) {
		if (input.useFullDBString) { return true; } return false; };
 	var dependsNotUseFullDBString = function (input) {
		if (input.useFullDBString) { return false; } return true; };
 	var dependsdwAdmin = function (input) {
		if (input.dwAdmin) { return true; } return false; };
 	var dependsNotLocalDB = function (input) {
		if (input.configDB != 'local') { return true; } return false; };

		
	var prompts = [
		{
		  type: 'list',
		  name: 'installType',
		  message: 'Do you want me to make a new Drywall app or to add CRUD to an existing Drywall app?',
　　　　choices: [ "New App'", "New App with CRUD", "Add CRUD to app" ],
		  default: 'New App'
		},
　　　　{
		  type: 'input',
		  name: 'projectName',
		  message: 'Tell me the name of your new Drywall project',
		  default: 'Wine Rack'
		},
		{
		  type: 'list',
		  name: 'dryWallCloneVersion',
		  message: 'Tell me which version of jedireza/drywall to clone',
		  choices: Object.keys(drywall_versions),
		  default: 'latest'
		},
		{
		  type: 'confirm',
		  name: 'customApp',
		  message: 'Do you want a custom installation?',
		  default: true 
		},
		{
		  type: 'input',
		  name: 'appName',
		  message: 'Tell me the name of your custom app',
		  default: 'crud',
		  when : dependsCustom
		},
		{
		  type: 'input',
		  name: 'keyWordSingular',
		  message: 'Tell me the key word (singular) that characterises your project',
		  default: 'wine',
		  when : dependsCustom
		},
		{
		  type: 'input',
		  name: 'keyWordPlural',
		  message: 'Tell me the plural of the previous key word',
		  default: 'wines',
		  when : dependsCustom
		},
		{
		  type: 'input',
		  name: 'firstAttribute',
		  message: 'Tell me one attribute of your crud schema',
		  default: 'grapes',
		  when : dependsCustom
		},
		{
		  type: 'confirm',
		  name: 'configApp',
		  message: 'Do you want me to help you configure your Drywall App?',
		  default: true 
		},
		{
		  type: 'list',
		  name: 'noSQL',
		  message: 'Tell me about your NoSQL Database. Is it MongoDB or CouchDB?',
		  choices: ["MongoDB"],
		  default: 'MongoDB',
		  when : dependsConfig
		},
		{
		  type: 'confirm',
		  name: 'useFullDBString',
		  message: 'Do you want to enter the full Mongo Connection string? If not, I will help you produce it.',
		  default: false,
		  when : dependsMongo
		},
		{
		  type: 'input',
		  name: 'fullDBString',
		  message: 'Type or paste your full Mongo DB Connection string',
		  when : dependsUseFullDBString
		},
		{
		  type: 'list',
		  name: 'configDB',
		  message: 'Tell me about your Mongo DB. First, where is it hosted?',
		  choices: [ "local", "mongolab", "mongohq" ],
		  default: 'mongohq',
		  when : dependsNotUseFullDBString
		},
		{
		  type: 'input',
		  name: 'dbName',
		  message: 'What is the name of your DB?',
		  default: 'drywall',
		  when : dependsNotUseFullDBString
		},
		{
		  type: 'input',
		  name: 'dbServer',
		  message: 'Tell me which server to use to connect to the DB',
		  default: 'troup',
		  when : dependsNotLocalDB
		},
		{
		  type: 'input',
		  name: 'dbPort',
		  message: 'Tell me which port to use to connect to the DB',
		  default: '10059',
		  when : dependsNotLocalDB
		},
		{
		  type: 'input',
		  name: 'dbUser',
		  message: 'Tell me the Mongo Admin user name for this DB',
		  default: 'drywall',
		  when : dependsNotLocalDB
		},
		{
		  type: 'input',
		  name: 'dbPass',
		  message: 'Tell me the password for this Admin user',
		  default: 'drywall',
		  when : dependsNotLocalDB
		},
		{
		  type: 'input',
		  name: 'smtpServer',
		  message: 'Tell me the host name of your SMTP (outgoing) mail server',
		  default: 'smtp.gmail.com',
		  when : dependsConfig
		},
		{
		  type: 'input',
		  name: 'smtpUser',
		  message: 'Tell me your SMTP account name',
		  default: 'my.drywall.app.mail.manager@gmail.com',
		  when : dependsConfig
		},
		{
		  type: 'input',
		  name: 'smtpPass',
		  message: 'Tell me your SMTP account password',
		  default: 'passw0rd',
		  when : dependsConfig
		},
		{
		  type: 'confirm',
		  name: 'dwAdmin',
		  message: 'Do you want me to set up a Drywall admistrator automatically?',
		  default: true 
		},
		{
		  type: 'input',
		  name: 'dwAdminUser',
		  message: 'What is the user name for your Drywall administrator account',
		  default: 'root',
		  when : dependsdwAdmin
		},
		{
		  type: 'input',
		  name: 'dwAdminEmail',
		  message: 'What is the email address of your Drywall administrator',
		  default: 'my.drywall.administrators.mail.addy@gmail.com',
		  when : dependsdwAdmin
		},
		
	];

    this.prompt(prompts, function (props) {
	
		this.appPath = './'; 
		this.gitProject = 'drywall';
		this.dwPath = this.gitProject+'/';
		this.dwAbsolutePath = generatorPath+'/'+this.dwPath;
		this.projectName = props.projectName;
		this.dryWallCloneVersion = props.dryWallCloneVersion;
		this.customApp = props.customApp;
		this.appName = props.appName.toLowerCase();
		this.keyWordSingular = props.keyWordSingular.toLowerCase();
		this.keyWordPlural = props.keyWordPlural.toLowerCase();
		this.firstAttribute = props.firstAttribute;
		this.configApp = props.configApp;
		this.configDB = props.configDB;
		this.dbString = props.dbString;
		this.dbUser = props.dbUser;
		this.dbPass = props.dbPass;
		this.dbPort = props.dbPort;
		this.dbServer = props.dbServer;
		this.dbName = props.dbName;
		this.smtpServer = props.smtpServer;
		this.smtpUser = props.smtpUser;
		this.smtpPass = props.smtpPass;
		this.dwAdmin = props.dwAdmin;
		this.dwAdminUser = props.dwAdminUser;
		this.dwAdminEmail = props.dwAdminEmail;
　　　　this.installType = props.installType;
		
		if (this.configDB == 'mongolab' || this.configDB == 'mongohq') {
			this.dbString = 
				this.fullDBString ||
				'mongodb://'+
				this.dbUser+':'+
				this.dbPass+'@'+
				this.dbServer+'.'+
				this.configDB+'.com'+':'+
				this.dbPort+'/'+
				this.dbName;
		}
		else {
			this.dbString = 'localhost/'+this.dbName
		}
		done();
    }.bind(this));
  },

	app: function () {
		this.mkdir(this.appPath);
	},
	
	dw_clone_source: function () {
		console.log('Cloning Drywall source into '+this.dwAbsolutePath+'   ...'); 
	    var done = this.async();
		simpleGit(generatorPath)
			.clone('https://github.com/jedireza/drywall.git', this.gitProject, function () {
			done();
		});
	},
	
	dw_checkout_version: function () {
		console.log('git cloned');
		
		if (this.dryWallCloneVersion != 'latest') {
			var done = this.async();
			simpleGit(this.dwAbsolutePath)
				.checkout(drywall_versions[this.dryWallCloneVersion], function() {
					done();
				});
			console.log('git checked out version '+this.dryWallCloneVersion);
		}
	},

  	git: function () {
	  this.copy(this.dwAbsolutePath+'.gitignore', './.gitignore');
	},

	bower: function () {	
	  this.write('./.bowerrc', '{\n"directory": "./bower_components"\n}');
	  this.copy(this.dwAbsolutePath+'bower.json', './bower.json');
	},
	
	jshint: function () {
	  this.copy(this.dwAbsolutePath+'.jshintrc-client', './.jshintrc-client');
	  this.copy(this.dwAbsolutePath+'.jshintrc-server', './.jshintrc-server');
	},

	gruntfile: function () {
//	  this.copy(this.dwAbsolutePath+'Gruntfile.js', './Gruntfile.js');
	},

	packageJSON: function () {
	  this.template('package.json', './package.json');
	},

  baseDrywall: function () {
  
	this.directory(this.dwAbsolutePath+'layouts', 	this.appPath+'layouts');
	this.directory(this.dwAbsolutePath+'views', 	this.appPath+'views');
	this.directory(this.dwAbsolutePath+'public', 	this.appPath+'public');
	this.directory(this.dwAbsolutePath+'schema', 	this.appPath+'schema');
 	this.directory(this.dwAbsolutePath+'node_modules', 	this.appPath+'node_modules');
 
	this.copy(this.dwAbsolutePath+'app.js', 			this.appPath+'app.js');
	this.copy(this.dwAbsolutePath+'passport.js', 		this.appPath+'passport.js');
	this.copy(this.dwAbsolutePath+'README.md', 			this.appPath+'README.md');
	this.copy(this.dwAbsolutePath+'LICENSE', 			this.appPath+'LICENSE');
  },
      
   // Make templates for the files that will be copied and modified
  customNewFiles: function () {
     if (this.customApp) {
		console.log('Custom App files follows ...');
		var keyWordSingular = this.keyWordSingular, 
			keyWordPlural = this.keyWordPlural, 
			firstAtt = this.firstAttribute,
			appName = this.appName;
	 
		var replaceStrings = function (sourceStr) {
			var 
				targetStr, i, strPair, fromRegExp, 
				strPairs = [
					{from : 'admin/', 	to : appName+'\/'},
					{from : 'statuses', to : keyWordPlural},
					{from : 'status', 	to : keyWordSingular},
					{from : 'Statuses', to : initCap(keyWordPlural)},
					{from : 'Status', 	to : initCap(keyWordSingular) },
					 // add first attribute to user created schema
					{from : "name: { type: String, default: '' }", 	to : "name: { type: String, default: '' },\n\t"+firstAtt+": { type: String, default: '' }" },
					{from : "pivot: '',", 	to : "pivot: '',\n\t  "+firstAtt+": ''," },
					{from : "pivot: app.mainView", 	to : firstAtt+": app.mainView.model.get('"+firstAtt+"'),\n\t\tpivot: app.mainView" },
					{from : "keys: 'pivot name'", 	to : "keys: 'pivot name "+firstAtt+"'" },
					{from : "th.stretch name", 	to : "th.stretch name\n          th.stretch "+firstAtt },
					{from : "td <%- name %>", 	to : "td <%- name %>\n    td <%- "+firstAtt+" %>" },
					{from : "name: req.body.name", 	to : "name: req.body.name,\n      "+firstAtt+": req.body."+firstAtt },
					{from : "span.help-block <%- errfor.name %>", 	to : "span.help-block <%- errfor.name %>\n      div.control-group(class!='<%- errfor."+firstAtt+" ? "+'"has-error"'+" : "+'""'+" %>')\n        label.control-label "+firstAtt+":\n        input.form-control(type='text', name='"+firstAtt+"', value!='<%- "+firstAtt+" %>')\n        span.help-block <%- errfor."+firstAtt+" %>" },
					{from : "pivot: this.", 	to : ""+firstAtt+": this.$el.find('[name="+'"'+firstAtt+'"'+"]').val(),\n\t\t\pivot: this." }

					];
				
			targetStr = sourceStr.slice(0);	
			for (i=0; i<strPairs.length; i++) {
				strPair = strPairs[i]; 
				fromRegExp = new RegExp(strPair.from, "g");
				targetStr = targetStr.replace(fromRegExp, strPair.to);
			}
			return targetStr;
		};
	
		var i, j, sourceStr, targetStr, source, target, sourceDir, targetDir, sourceFile, template, targetFile,
		templates = [ 
			{sourceDir: 'views/admin/statuses', files: [{source: 'index.js'}, {source: 'index.jade'}, {source: 'details.jade'}], targetDir: 'views/'+appName+'/'+keyWordPlural},
			{sourceDir: 'views/admin', files: [{source: 'index.js'}, {source: 'index.jade'}], targetDir: 'views/'+appName},
			{sourceDir: 'public/views/admin', files: [{source: 'index.less'}], targetDir: 'public/views/'+appName},
			{sourceDir: 'public/views/admin/statuses', files: [{source: 'index.js'}, {source: 'index.less'}, {source: 'details.js'}], targetDir: 'public/views/'+appName+'/'+keyWordPlural},
			{sourceDir: 'schema', files: [{source: 'Status.js', target: initCap(keyWordSingular)+'.js'}]},
			{sourceDir: 'layouts', files: [{source: 'admin.jade', target: appName+'.jade'}]},
			{sourceDir: 'public/layouts', files: [{source: 'admin.js', target: appName+'.js'}, {source: 'admin.less', target: appName+'.less'}]}
		];
		
		for (i=0; i<templates.length; i++) {
			template = templates[i];
			sourceDir = this.dwPath+template.sourceDir;
			targetDir = template.targetDir || template.sourceDir;
			if (! template.targetDir) {
				this.mkdir(targetDir);
			}
			for (j=0; j<template.files.length; j++) {
				sourceFile = template.files[j].source;
				targetFile = template.files[j].target || sourceFile;
				source = generatorPath+'/'+sourceDir+'/'+ sourceFile;
				target = targetDir+'/'+ targetFile;
				sourceStr = this.readFileAsString(source);
				targetStr = replaceStrings(sourceStr);
				
				this.write(target, targetStr);
			}
		}
	  }
   },
   
   customRoutes: function () {
	if (this.customApp) {
		var keyWordPlural = this.keyWordPlural, 
			appName = this.appName,
			source = generatorPath+'/'+this.dwPath+'routes.js', target = 'routes.js',
			sourceStr, targetStr,
			insertBeforeString, 
			appRoutesString =  
				"  //"+appName+" > "+keyWordPlural+"\n"+				
				"  app.get('/"+appName+"/"+keyWordPlural+"/', require('./views/"+appName+"/"+keyWordPlural+"/index').find);\n"+
				"  app.post('/"+appName+"/"+keyWordPlural+"/', require('./views/"+appName+"/"+keyWordPlural+"/index').create);\n"+
				"  app.get('/"+appName+"/"+keyWordPlural+"/:id/', require('./views/"+appName+"/"+keyWordPlural+"/index').read);\n"+
				"  app.put('/"+appName+"/"+keyWordPlural+"/:id/', require('./views/"+appName+"/"+keyWordPlural+"/index').update);\n"+
				"  app.delete('/"+appName+"/"+keyWordPlural+"/:id/', require('./views/"+appName+"/"+keyWordPlural+"/index').delete);\n\n";
				
		sourceStr = this.readFileAsString(source);
		insertBeforeString = sourceStr.lastIndexOf("//route not found"); // TODO find a more reliable way to insert routes before app.all
		targetStr = sourceStr.slice(0, insertBeforeString)+
					appRoutesString+
					sourceStr.slice(insertBeforeString);				
		this.write(target, targetStr);		
	}
  },
  
  customModels: function () {
	if (this.customApp) {
		var keyWordSingularInitCap = initCap(this.keyWordSingular), 
			appNameInitCap = initCap(this.appName),
			source = generatorPath+'/'+this.dwPath+'models.js', target = 'models.js',
			sourceStr, targetStr,
			closingBrace,
			appModelsString =  
				"\n  require('./schema/"+keyWordSingularInitCap+"')(app, mongoose);\n"
				
		sourceStr = this.readFileAsString(source);
		closingBrace = sourceStr.lastIndexOf("}");
		targetStr = sourceStr.slice(0, closingBrace)+
					appModelsString+
					sourceStr.slice(closingBrace);				
		this.write(target, targetStr);		
	}
  },
  
  customGrunt: function () {
	if (this.customApp) {
		var 
			appName = this.appName,
			source = generatorPath+'/'+this.dwPath+'Gruntfile.js', target = 'Gruntfile.js',
			sourceStr, targetStr,
			insertBeforeString,
			appGruntString =  
				"\n\t\t  'public/layouts/"+appName+".min.js': ['public/layouts/"+appName+".js'],\n\t\t\t";
		
		sourceStr = this.readFileAsString(source);
		insertBeforeString = sourceStr.lastIndexOf("'public/layouts/admin.min.js'");
		targetStr = sourceStr.slice(0, insertBeforeString)+
					appGruntString+
					sourceStr.slice(insertBeforeString);

		// the second and last edit
		appGruntString =  
				"\n\t\t  'public/layouts/"+appName+".min.css': ['public/layouts/"+appName+".less'],\n\t\t\t";
		
		insertBeforeString = targetStr.lastIndexOf("'public/layouts/admin.min.css'");
		targetStr = targetStr.slice(0, insertBeforeString)+
					appGruntString+
					targetStr.slice(insertBeforeString);				
					
		this.write(target, targetStr);		
	}
  },
  
	config: function () {
		if (this.configApp) {
			this.template('_config.js', 'config.js');
		}
		else {
			this.copy(this.dwAbsolutePath+'config.example.js', 			this.appPath+'config.js');
		}
	},
  
	adminUser: function () {
	
		if (this.dwAdmin)  {
			this.dbString = this.dbString.slice(10); // slice off the mongodb:// stem
			var db = mongojs.connect(this.dbString, ["admingroups", "admins", "users"]);	
			var smtpUser = this.smtpUser;
			var dwAdminUser = this.dwAdminUser;
			
			db.admingroups.insert({ _id: 'root', name: 'Root' }, function() {
				db.admins.insert({ name: {first: 'Root', last: 'Admin', full: 'Root Admin'}, groups: ['root'] }, function() {
					db.admins.findOne(function(err, rootAdmin) {
						db.users.save({ username: dwAdminUser, isActive: 'yes', email: smtpUser, roles: {admin: rootAdmin._id} });
						db.users.findOne(function(err, rootUser) {
							rootAdmin.user = { id: rootUser._id, name: rootUser.username };
							db.admins.save(rootAdmin); 
						});
					});
				});
			});
		}
	},
  
    finishOff: function () { // TODO get this working.
/* 	  this.on('end', function () { // bower
		this.installDependencies();
	  });
 */
	}
 });

module.exports = DrywallGenerator;

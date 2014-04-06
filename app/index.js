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

var keyWordsArr;

var installTypes = [ 
	"New app", 
	"New app with CRUD", 
	"Add CRUD to existing app" 
];

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

 	var dependsCreate = function (input) {
		if (input.installType === installTypes[2]) { return false; } return true;	};
  	var dependsCustom = function (input) {
		if (input.installType === installTypes[0]) { return false; } return true;	};
  	var dependsCustomFile = function (input) {
		if (input.customFile) { return true; } return false;	};
  	var dependsNotCustomFile = function (input) {
		if (input.customFile) { return false; } return  true;	};
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
		  type: 'rawlist',
		  name: 'installType',
		  message: 'Do you want me to make a new Drywall app or to add CRUD to an existing Drywall app?',
　　　　	  choices: installTypes,
		  default: 1
		},
　　　　	{
		  type: 'input',
		  name: 'projectName',
		  message: 'Tell me the name of your new Drywall project',
		  default: 'Booze Rack'
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
		  name: 'customFile',
		  message: 'Do you want to load customisation data from a file?',
		  default: true,
		  when : dependsCustom
		},
		{
		  type: 'input',
		  name: 'appName',
		  message: 'Tell me the name of your custom app',
		  default: 'crud',
		  when : dependsNotCustomFile
		},
		{
		  type: 'input',
		  name: 'keyWords',
		  message: 'Tell me entity key word: singular (s), plural (p) and one attribute (a) for each of the CRUD pages you wish to create',
		  default: '[{"s" : "wine", "p" : "wines", "a" : ["grape"]}, {"s" : "spirit", "p" : "spirits", "a" : ["grain", "proof"]}]',
		  validate : function (keyWordsStr) {
			try {
				keyWordsArr = JSON.parse(keyWordsStr);
				if (!Array.isArray(keyWordsArr)) {
					return false; 
				}
			}
			catch (e) {
				return false; 
			}
			return true;
		  },
		  when : dependsNotCustomFile
		},
		{
		  type: 'input',
		  name: 'customFileName',
		  message: 'What is the path to your customisation data file?',
		  default: 'templates/drywall.json',
		  when : dependsCustomFile
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
		  default: 'local',
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
	
		var i, prop;
		
		this.appPath = './'; 
		this.gitProject = 'drywall';
		this.dwPath = this.gitProject+'/';
		this.dwAbsolutePath = generatorPath+'/'+this.dwPath;
	
		for (i in props) {
			prop = props[i];
			this[i] = prop;
			console.log('user requested: %s = %s', i, this[i]);
		}
				
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
		if (this.installType !== installTypes[0]) {
		  this.copy(this.dwAbsolutePath+'.jshintrc-client', './.jshintrc-client');
		  this.copy(this.dwAbsolutePath+'.jshintrc-server', './.jshintrc-server');
		}
	},

	gruntfile: function () {
//	  this.copy(this.dwAbsolutePath+'Gruntfile.js', './Gruntfile.js');
	},

	packageJSON: function () {
		if (this.installType !== installTypes[2]) {
			console.log("packageJSON %s", this.installType);
			this.template('package.json', './package.json');
		} 
	},

  baseDrywall: function () {
 	if (this.installType !== installTypes[2]) {
		this.directory(this.dwAbsolutePath+'layouts', 	this.appPath+'layouts');
		this.directory(this.dwAbsolutePath+'views', 	this.appPath+'views');
		this.directory(this.dwAbsolutePath+'public', 	this.appPath+'public');
		this.directory(this.dwAbsolutePath+'schema', 	this.appPath+'schema');
		this.directory(this.dwAbsolutePath+'node_modules', 	this.appPath+'node_modules');
	 
		this.copy(this.dwAbsolutePath+'app.js', 			this.appPath+'app.js');
		this.copy(this.dwAbsolutePath+'passport.js', 		this.appPath+'passport.js');
		this.copy(this.dwAbsolutePath+'README.md', 			this.appPath+'README.md');
		this.copy(this.dwAbsolutePath+'LICENSE', 			this.appPath+'LICENSE');
	}
  },
      
   // Make templates for the files that will be copied and modified
  customNewFiles: function () {
	if (this.installType !== installTypes[0]) {
		var keyWordSingular, keyWordPlural, firstAtt, attsArr = [],
			appName = this.appName,
			i, j, sourceStr, targetStr, source, target, sourceDir, targetDir, sourceFile, 
			template, targetFile, keyWords, templates, strPairs, spacedAtts;

		var replaceStrings = function (sourceStr) {
			var 
				oldTargetStr, targetStr, i, strPair, fromRegExp; 
				
			targetStr = sourceStr.slice(0);	
			for (i=0; i<strPairs.length; i++) {
				oldTargetStr = targetStr;
				strPair = strPairs[i]; 
				fromRegExp = new RegExp(strPair.from, "g");
				targetStr = oldTargetStr.replace(fromRegExp, strPair.to);
				if (oldTargetStr.length !== targetStr.length) {
					console.log("%s go around. inserted at  %s  %s", i, oldTargetStr.length,  strPair.from);
				}
				if (strPair.from === "update(type\='button') Update") {
					console.log("%s go around.", i);
				}
			}
			return targetStr;
		};
		
		var routesSource = generatorPath+'/'+this.dwPath+'routes.js', routesTarget = 'routes.js',
			routesSourceStr = this.readFileAsString(routesSource),
			routesTargetStr;

		var modelsSource = generatorPath+'/'+this.dwPath+'models.js', modelsTarget = 'models.js',
			modelsSourceStr = this.readFileAsString(modelsSource),
			modelsTargetStr;

		//  custom Grunt
		var 
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
		
		console.log('Custom App files follows ...');
		if (this.customFile) {
			var customFileObj = yeoman.file.readJSON(path.join(__dirname, this.customFileName));
			appName = this.appName = customFileObj.appName;
			keyWordsArr = customFileObj.keyWords;
		}		
				
		// create new custom files per entity
		for (var entity = 0; entity < keyWordsArr.length; entity++) {
			keyWordSingular = keyWordsArr[entity].s; 
			keyWordPlural = keyWordsArr[entity].p;
			attsArr = keyWordsArr[entity].a;
		 	
			strPairs = [
				{from : 'admin/', 	to : appName+'\/'},
				{from : 'statuses', to : keyWordPlural},
				{from : 'status', 	to : keyWordSingular},
				{from : 'Statuses', to : initCap(keyWordPlural)},
				{from : 'Status', 	to : initCap(keyWordSingular)}
			];
			
			// add attributes to user created schema
			spacedAtts = "";
			for (var k = 0, l = attsArr.length -1; k < attsArr.length; k++, l--) {
				var attName = attsArr[l].name;
				spacedAtts = spacedAtts + " " + attsArr[k].name;
				strPairs.push({
					from 	: "th.stretch name", 	
					to 		: "th.stretch name\n          th.stretch "+attName });
				strPairs.push({
					from 	: "pivot: app.mainView", 	
					to 		: attName+": app.mainView.model.get('"+attName+"'),\n\t\tpivot: app.mainView" });
				strPairs.push({
					from 	: "td <%- name %>", 	
					to 		: "td <%- name %>\n    td <%- "+attName+" %>" });
				strPairs.push({
					from 	: "pivot: '',", 	
					to 		: "pivot: '',\n\t  "+attName+": ''," });
				strPairs.push({
					from 	: " name: req.body.name", 	
					to 		: " name: req.body.name\n      ,"+attName+": req.body."+attName});
				strPairs.push({
					from 	: "pivot: this.", 	
					to 		: ""+attName+": this.$el.find('[name="+'"'+attName+'"'+"]').val(),\n\t\t\pivot: this." });
				if (attsArr[l].type === "string") {
					strPairs.push({
				// /views/admin/statuses/details.jade
						from 	: "span.help-block <%- errfor.name %>", 	
						to 		: "span.help-block <%- errfor.name %>\n      div.control-group(class!='<%- errfor."+attName+" ? "+'"has-error"'+" : "+'""'+" %>')\n        label.control-label "+attName+":\n        input.form-control(type='text', name='"+attName+"', value!='<%- "+attName+" %>')\n        span.help-block <%- errfor."+attName+" %>" });
					strPairs.push({
				// /schema/Status.js
						from 	: " name: { type: String, default: '' }", 	
						to 		: " name: { type: String, default: '' }\n\t,"+attName+": { type: String, default: '' }\n"});
				}
				else if (attsArr[l].type === "array") {	
				// /schema/Status.js
					strPairs.push({
						from 	: " name: { type: String, default: '' }", 	
						to 		: " name: { type: String, default: '' }\r\n\t,"+attName+"s: [{ name: String, permit: Boolean }]"});
				// /views/admin/statuses/details.jade
					strPairs.push({
						from 	: "button.btn.btn-primary.btn-update\\(type='button'\\) Update", 	
						to 		: "button.btn.btn-primary.btn-update(type='button') Update\r\n\r\n  script(type='text/template', id='tmpl-"+attName+"s')\r\n    fieldset\r\n      legend "+initCap(attName)+"s\r\n      div.alerts\r\n        |<% _.each(errors, function(err) { %>\r\n        div.alert.alert-danger.alert-dismissable\r\n          button.close(type='button', data-dismiss='alert') &times;\r\n          |<%- err %>\r\n        |<% }); %>\r\n        |<% if (success) { %>\r\n        div.alert.alert-info.alert-dismissable\r\n          button.close(type='button', data-dismiss='alert') &times;\r\n          | Changes have been saved.\r\n        |<% } %>\r\n      div.control-group(class!='<%- errfor.new"+initCap(attName)+" ? "+'"has-error" : ""'+" %>')\r\n        label.control-label New Setting:\r\n        div.input-group\r\n          input.form-control(name='new"+initCap(attName)+"', type='text', placeholder='enter a name')\r\n          div.input-group-btn\r\n            button.btn.btn-success.btn-add(type='button') Add\r\n        span.help-block <%- errfor.newUsername %>\r\n      div.control-group(class!='<%- errfor.new"+initCap(attName)+" ? "+'"has-error" : ""'+" %>')\r\n        label.control-label Settings:\r\n        div."+attName+"s\r\n          |<% _.each("+attName+"s, function("+attName+") { %>\r\n          div.input-group\r\n            input.form-control(disabled=true, value!='<%= "+attName+".name %>')\r\n            div.input-group-btn\r\n              |<% if ("+attName+".permit) { %>\r\n              button.btn.btn-default.btn-allow(type='button', disabled) Allow\r\n              button.btn.btn-default.btn-deny(type='button') Deny\r\n              |<% } else { %>\r\n              button.btn.btn-default.btn-allow(type='button') Allow\r\n              button.btn.btn-default.btn-deny(type='button', disabled) Deny\r\n              |<% } %>\r\n              button.btn.btn-danger.btn-delete(type='button')\r\n                i.fa.fa-trash-o.fa-inverse\r\n          |<% }); %>\r\n          |<% if ("+attName+"s.length == 0) { %>\r\n          span.badge\r\n            | no "+attName+"s defined\r\n          |<% } %>\r\n          span.help-block <%- errfor.settings %>\r\n      div.control-group\r\n        button.btn.btn-primary.btn-set(type='button') Save Settings"});					
					strPairs.push({
						from 	: "      div\\#details", 	
						to 		: "      div#details\n      div#"+attName+"s"});
				// /views/admin/statuses/index.js
					strPairs.push({
						from 	: "exports.delete = function\\(req, res, next\\){", 	
						to 		: "exports."+attName+"s = function(req, res, next){ \r\n  var workflow = req.app.utility.workflow(req, res); \r\n \r\n  workflow.on('validate', function() { \r\n    if (!req.body."+attName+"s) { \r\n      workflow.outcome.errfor."+attName+"s = 'required'; \r\n      return workflow.emit('response'); \r\n    } \r\n    workflow.emit('patchSpot'); \r\n  }); \r\n \r\n  workflow.on('patchSpot', function() { \r\n    var fieldsToSet = { \r\n      "+attName+"s: req.body."+attName+"s \r\n    }; \r\n \r\n    req.app.db.models.Spot.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, spot) { \r\n      if (err) { \r\n        return workflow.emit('exception', err); \r\n      } \r\n \r\n      workflow.outcome.spot = spot; \r\n      return workflow.emit('response'); \r\n    }); \r\n  }); \r\n \r\n  workflow.emit('validate'); \r\n}; \r\n\r\nexports.delete = function(req, res, next){"});
				// /public/views/admin/statuses/details.js
					strPairs.push({
						from 	: "return response;\r\n    }\r\n  }\\);\r\n\r\n  app.HeaderView = Backbone.View.extend", 	
						to 		: "return response;\r\n    }\r\n  });\r\n\r\n    app."+initCap(attName)+"s = Backbone.Model.extend({ \r\n    idAttribute: '_id', \r\n    defaults: { \r\n      success: false, \r\n      errors: [], \r\n      errfor: {}, \r\n      "+attName+"s: [], \r\n      new"+initCap(attName)+": '' \r\n    }, \r\n    url: function() { \r\n      return '/"+appName+"/"+keyWordSingular+"s/'+ app.mainView.model.id +'/"+attName+"s/'; \r\n    }, \r\n    parse: function(response) { \r\n      if (response.adminGroup) { \r\n        app.mainView.model.set(response.adminGroup); \r\n        delete response.adminGroup; \r\n      } \r\n \r\n      return response;\r\n     }\r\n   }); \r\n\napp.HeaderView = Backbone.View.extend"});
					strPairs.push({
						from 	: "this.model.save\\(\\);\r\n    }\r\n  }\\);\r\n\r\n\r\n      this.model.save\\(\\);\r\n    }\r\n  }\\);\r\n\r\n\r\n  app.MainView = Backbone.View.extend", 	
						to 		: "this.model.save();\r\n    }\r\n  });\r\n\r\n\r\n      this.model.save();\r\n    }\r\n  });\r\n\r\n\r\n  app."+initCap(attName)+"sView = Backbone.View.extend({ \r\n    el: '#"+attName+"s', \r\n    template: _.template( $('#tmpl-"+attName+"s').html() ), \r\n    events: { \r\n      'click .btn-add': 'add', \r\n      'click .btn-allow': 'allow', \r\n      'click .btn-deny': 'deny', \r\n      'click .btn-delete': 'delete', \r\n      'click .btn-set': 'save"+initCap(attName)+"s' \r\n    }, \r\n     initialize: function() { \r\n      this.model = new app."+initCap(attName)+"s(); \r\n      this.syncUp(); \r\n      this.listenTo(app.mainView.model, 'change', this.syncUp); \r\n      this.listenTo(this.model, 'sync', this.render); \r\n      this.render(); \r\n    }, \r\n    syncUp: function() { \r\n      this.model.set({ \r\n        _id: app.mainView.model.id, \r\n        "+attName+"s: app.mainView.model.get('"+attName+"s') \r\n      }); \r\n    }, \r\n     render: function() { \r\n      this.$el.html(this.template( this.model.attributes )); \r\n \r\n      for (var key in this.model.attributes) { \r\n        if (this.model.attributes.hasOwnProperty(key)) { \r\n          this.$el.find('[name="+'"'+"'+ key +'"+'"'+"]').val(this.model.attributes[key]); \r\n        } \r\n      } \r\n    }, \r\n    add: function() { \r\n      var new"+initCap(attName)+" = this.$el.find('[name="+'"'+"new"+initCap(attName)+""+'"'+"]').val().trim(); \r\n      if (!new"+initCap(attName)+") { \r\n        alert('Please enter a name.'); \r\n        return; \r\n      } \r\n      else { \r\n        var alreadyAdded = false; \r\n        _.each(this.model.get('"+attName+"s'), function("+attName+") { \r\n          if (new"+initCap(attName)+" === "+attName+".name) { \r\n            alreadyAdded = true; \r\n          } \r\n        }); \r\n \r\n        if (alreadyAdded) { \r\n          alert('That name already exists.'); \r\n          return; \r\n        } \r\n      } \r\n \r\n      this.model.get('"+attName+"s').push({ name: new"+initCap(attName)+", permit: true }); \r\n \r\n      var sorted = this.model.get('"+attName+"s'); \r\n      sorted.sort(function(a, b) { \r\n        return a.name.toLowerCase() > b.name.toLowerCase(); \r\n      }); \r\n      this.model.set('"+attName+"s', sorted); \r\n \r\n      this.render(); \r\n    }, \r\n    allow: function(event) { \r\n      var idx = this.$el.find('.btn-allow').index(event.currentTarget); \r\n      this.model.get('"+attName+"s')[idx].permit = true; \r\n      this.render(); \r\n    }, \r\n    deny: function(event) { \r\n      var idx = this.$el.find('.btn-deny').index(event.currentTarget); \r\n      this.model.get('"+attName+"s')[idx].permit = false; \r\n      this.render(); \r\n    }, \r\n    delete: function(event) { \r\n      if (confirm('Are you sure?')) { \r\n        var idx = this.$el.find('.btn-delete').index(event.currentTarget); \r\n        this.model.get('"+attName+"s').splice(idx, 1); \r\n        this.render(); \r\n      } \r\n    }, \r\n    save"+initCap(attName)+"s: function() { \r\n      this.model.save(); \r\n    } \r\n  });\r\n\r\n  app.MainView = Backbone.View.extend"});
					strPairs.push({
						from 	: "app.deleteView = new app.DeleteView\\(\\);", 	
						to 		: "app.deleteView = new app.DeleteView();\r\n      app."+attName+"sView = new app."+initCap(attName)+"sView();" });
					strPairs.push({
						from 	: "app.deleteView.model.set\\(response\\);\r\n            }\r\n          }\r\n        }\\);\r\n      }\r\n    }\r\n  }\\);\r\n\r\n  app.MainView = Backbone.View.extend", 	
						to 		: "app.deleteView.model.set(response);\r\n            }\r\n          }\r\n        });\r\n      }\r\n    }\r\n  });\r\n\r\n  app."+initCap(attName)+"sView = Backbone.View.extend({ \r\n    el: '#"+attName+"s', \r\n    template: _.template( $('#tmpl-"+attName+"s').html() ), \r\n    events: { \r\n      'click .btn-add': 'add', \r\n      'click .btn-allow': 'allow', \r\n      'click .btn-deny': 'deny', \r\n      'click .btn-delete': 'delete', \r\n      'click .btn-set': 'save"+initCap(attName)+"s' \r\n    }, \r\n     initialize: function() { \r\n      this.model = new app."+initCap(attName)+"s(); \r\n      this.syncUp(); \r\n      this.listenTo(app.mainView.model, 'change', this.syncUp); \r\n      this.listenTo(this.model, 'sync', this.render); \r\n      this.render(); \r\n    }, \r\n    syncUp: function() { \r\n      this.model.set({ \r\n        _id: app.mainView.model.id, \r\n        "+attName+"s: app.mainView.model.get('"+attName+"s') \r\n      }); \r\n    }, \r\n     render: function() { \r\n      this.$el.html(this.template( this.model.attributes )); \r\n \r\n      for (var key in this.model.attributes) { \r\n        if (this.model.attributes.hasOwnProperty(key)) { \r\n          this.$el.find('[name="+'"'+"'+ key +'"+'"'+"]').val(this.model.attributes[key]); \r\n        } \r\n      } \r\n    }, \r\n    add: function() { \r\n      var new"+initCap(attName)+" = this.$el.find('[name="+'"'+"new"+initCap(attName)+'"'+"]').val().trim(); \r\n      if (!new"+initCap(attName)+") { \r\n        alert('Please enter a name.'); \r\n        return; \r\n      } \r\n      else { \r\n        var alreadyAdded = false; \r\n        _.each(this.model.get('"+attName+"s'), function("+attName+") { \r\n          if (new"+initCap(attName)+" === "+attName+".name) { \r\n            alreadyAdded = true; \r\n          } \r\n        }); \r\n \r\n        if (alreadyAdded) { \r\n          alert('That name already exists.'); \r\n          return; \r\n        } \r\n      } \r\n \r\n      this.model.get('"+attName+"s').push({ name: new"+initCap(attName)+", permit: true }); \r\n \r\n      var sorted = this.model.get('"+attName+"s'); \r\n      sorted.sort(function(a, b) { \r\n        return a.name.toLowerCase() > b.name.toLowerCase(); \r\n      }); \r\n      this.model.set('"+attName+"s', sorted); \r\n \r\n      this.render(); \r\n    }, \r\n    allow: function(event) { \r\n      var idx = this.$el.find('.btn-allow').index(event.currentTarget); \r\n      this.model.get('"+attName+"s')[idx].permit = true; \r\n      this.render(); \r\n    }, \r\n    deny: function(event) { \r\n      var idx = this.$el.find('.btn-deny').index(event.currentTarget); \r\n      this.model.get('"+attName+"s')[idx].permit = false; \r\n      this.render(); \r\n    }, \r\n    delete: function(event) { \r\n      if (confirm('Are you sure?')) { \r\n        var idx = this.$el.find('.btn-delete').index(event.currentTarget); \r\n        this.model.get('"+attName+"s').splice(idx, 1); \r\n        this.render(); \r\n      } \r\n    }, \r\n    save"+initCap(attName)+"s: function() { \r\n      this.model.save(); \r\n    } \r\n  });\r\n\r\n  app.MainView = Backbone.View.extend"});
				}
			}
			strPairs.push({from : "keys: 'pivot name'", 	to : "keys: 'pivot name"+spacedAtts+"'" });
			
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
		console.log("targetFile = %s %s", targetDir, targetFile);
					source = generatorPath+'/'+sourceDir+'/'+ sourceFile;
					target = targetDir+'/'+ targetFile;
					sourceStr = this.readFileAsString(source);
					targetStr = replaceStrings(sourceStr);
					
					this.write(target, targetStr);
				}
			}
   
			//  custom Routes
			var 
				insertBeforeString, 
				appRoutesString =  
					"  //"+appName+" > "+keyWordPlural+"\n"+				
					"  app.get('/"+appName+"/"+keyWordPlural+"/', require('./views/"+appName+"/"+keyWordPlural+"/index').find);\n"+
					"  app.post('/"+appName+"/"+keyWordPlural+"/', require('./views/"+appName+"/"+keyWordPlural+"/index').create);\n"+
					"  app.get('/"+appName+"/"+keyWordPlural+"/:id/', require('./views/"+appName+"/"+keyWordPlural+"/index').read);\n"+
					"  app.put('/"+appName+"/"+keyWordPlural+"/:id/', require('./views/"+appName+"/"+keyWordPlural+"/index').update);\n"+
					"  app.delete('/"+appName+"/"+keyWordPlural+"/:id/', require('./views/"+appName+"/"+keyWordPlural+"/index').delete);\n";
					
			for (var k = 0; k < attsArr.length; k++) {
				var attName = attsArr[k].name;
				if (attsArr[k].type === "array") {	
					appRoutesString = appRoutesString + "  app.put('/"+appName+"/"+keyWordPlural+"/:id/"+attName+"s/', require('./views/"+appName+"/"+keyWordPlural+"/index')."+attName+"s);\n";
				}
			}
			appRoutesString = appRoutesString + "\n";
					
			insertBeforeString = routesSourceStr.lastIndexOf("//route not found"); // TODO find a more reliable way to insert routes before app.all
			routesTargetStr = routesSourceStr.slice(0, insertBeforeString)+
						appRoutesString+
						routesSourceStr.slice(insertBeforeString);				
			routesSourceStr = routesTargetStr;
			
			//  custom Models
			var keyWordSingularInitCap = initCap(keyWordSingular), 
				appNameInitCap = initCap(appName),
				sourceStr, targetStr,
				closingBrace,
				appModelsString =  
					"\n  require('./schema/"+keyWordSingularInitCap+"')(app, mongoose);\n"
					
			closingBrace = modelsSourceStr.lastIndexOf("}");
			modelsTargetStr = modelsSourceStr.slice(0, closingBrace)+
						appModelsString+
						modelsSourceStr.slice(closingBrace);
			modelsSourceStr = modelsTargetStr;			
		}
		
		this.write(routesTarget, routesTargetStr);
		this.write(modelsTarget, modelsTargetStr);	
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

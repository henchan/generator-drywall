This Yeoman generator installs and configures a standard Drywall app. 
Optionally, it also installs and configures a simple user-specified CRUD app called Wine Rack on top of Drywall.
 
You may accept nearly all of Yeoman's defaults, if you have a MongoDB service running on your local machine with an empty DB called drywall, an administrator called drywall having a password of drywall. 
However, defaults for SMTP server are no good. You must configure an SMTP server. If you have one, you may use your own gmail account. 
 
This generator has been tested on Drywall [version 0.9.26] (https://github.com/jedireza/drywall/tree/5a6c76a05b8d55b9193efa403ca3fc7d1488d65d). 

### Prerequisites
First, install the Drywall prerequsities. See [Drywall Requirements] (https://github.com/jedireza/drywall#requirements). Return here after you've fulfilled the Requirements section

Next, install [Yeoman] (http://yeoman.io/gettingstarted.html) and the [Yeoman Drywall Generator] (https://www.npmjs.org/package/generator-drywall) globally.

    $ npm install yo -g 
    $ npm install -g generator-drywall 

Make a directory for your new app.

    $ mkdir {my_drywall_app} 
    $ cd {my_drywall_app} 

Run the Yeoman Drywall Generator and answer his questions about your app. 

    $ yo drywall

See the [wiki page] (https://github.com/henchan/generator-drywall/wiki/_new?wiki[name]=Yeoman%27s%20questions) for an explanation of Yeoman's questions.

Download dependent modules

    $ bower install

Minify, uglify javascripts and serve the new app

    $ grunt
   
Test your installation in a web browser. Set a new application password.    
If required, make additional configuration changes in config.js
	
    http://127.0.0.1:3000/
    http://localhost:3000/login/forgot/
    Submit your email address and wait a second. Go check your email and get the reset link.
    http://localhost:3000/login/reset/:email/:token/

If you have installed a CRUD app, test it using the URL below (replacing crud and wines according to your earlier responses to Yeoman.
After installation, grep for keywords "crud", "wine" and "grapes" (or alternatives selected by you) to locate sections of code that need to be added and/or modified to customise your own crud apps manually. 

    http://127.0.0.1:3000/crud/wines
    
If you wish, you can now remove Yeoman and the Yeoman Drywall generator, leaving just your new app in a functioning state.

     $ npm remove yo -g 
     $ npm remove generator-drywall -g 


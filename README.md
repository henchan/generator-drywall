This Yeoman generator installs and configures a Drywall app. Optionally, it also installs a simple user specified CRUD app on top of Drywall.
This generator has been tested on Drywall [version 0.9.26] (https://github.com/jedireza/drywall/tree/5a6c76a05b8d55b9193efa403ca3fc7d1488d65d).

### Prerequisites
First, install the Drywall prerequsities. See [Drywall Requirements] (https://github.com/jedireza/drywall#requirements). Return here after you've fulfilled the Requirements section

Next, install [Yeoman] (http://yeoman.io/gettingstarted.html) and the Yeoman Drywall Generator globally.

    $ npm install yo -g 
    $ npm install generator-drywall -g 

Make a new directory for your app and cd into it.

    $ mkdir {my_drywall_app} 
    $ cd {my_drywall_app} 

Run the Yeoman Drywall Generator and answer his questions about your app. 

    $ yo drywall

See the [wiki page] (https://github.com/henchan/generator-drywall/wiki/_new?wiki[name]=Yeoman%27s%20questions) for an explanation of Yeoman's questions.

Download dependent modules

    $ bower install

Minify, uglify javascripts and serve the new app

    $ grunt
   
Test your installation in a web browser.

    http://127.0.0.1:3000/
    
If you wish, you can remove Yeoman and the Yeoman Drywall generator, leaving just your new functioning app.

     $ npm remove yo -g 
     $ npm remove generator-drywall -g 

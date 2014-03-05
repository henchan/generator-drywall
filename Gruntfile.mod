var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      vendor: {
        files: [
          {
            expand: true, cwd: 'app/bower_components/bootstrap/',
            src: ['js/**', 'less/**'], dest: 'app/public/vendor/bootstrap/'
          },
          {
            expand: true, cwd: 'app/bower_components/backbone/',
            src: ['backbone.js'], dest: 'app/public/vendor/backbone/'
          },
          {
            expand: true, cwd: 'app/bower_components/font-awesome/',
            src: ['fonts/**', 'less/**'], dest: 'app/public/vendor/font-awesome/'
          },
          {
            expand: true, cwd: 'app/bower_components/html5shiv/dist/',
            src: ['html5shiv.js'], dest: 'app/public/vendor/html5shiv/'
          },
          {
            expand: true, cwd: 'app/bower_components/jquery/dist/',
            src: ['jquery.js'], dest: 'app/public/vendor/jquery/'
          },
          {
            expand: true, cwd: 'app/bower_components/momentjs/',
            src: ['moment.js'], dest: 'app/public/vendor/momentjs/'
          },
          {
            expand: true, cwd: 'app/bower_components/respond/src/',
            src: ['respond.js'], dest: 'app/public/vendor/respond/'
          },
          {
            expand: true, cwd: 'app/bower_components/underscore/',
            src: ['underscore.js'], dest: 'app/public/vendor/underscore/'
          }
        ]
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          ignore: [
            'node_modules/**',
            'app/public/**'
          ],
          ext: 'js'
        }
      }
    },
    watch: {
      clientJS: {
         files: [
          'app/public/layouts/**/*.js', '!app/public/layouts/**/*.min.js',
          'app/public/views/**/*.js', '!app/public/views/**/*.min.js'
         ],
         tasks: ['newer:uglify', 'newer:jshint:client']
      },
      serverJS: {
         files: ['views/**/*.js'],
         tasks: ['newer:jshint:server']
      },
      clientLess: {
         files: [
          'app/public/layouts/**/*.less',
          'app/public/views/**/*.less',
          'app/public/less/**/*.less'
         ],
         tasks: ['newer:less']
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapName: function(filePath) {
          return filePath + '.map';
        }
      },
      layouts: {
        files: {
          'app/public/layouts/core.min.js': [
            'app/public/vendor/jquery/jquery.js',
            'app/public/vendor/underscore/underscore.js',
            'app/public/vendor/backbone/backbone.js',
            'app/public/vendor/bootstrap/js/affix.js',
            'app/public/vendor/bootstrap/js/alert.js',
            'app/public/vendor/bootstrap/js/button.js',
            'app/public/vendor/bootstrap/js/carousel.js',
            'app/public/vendor/bootstrap/js/collapse.js',
            'app/public/vendor/bootstrap/js/dropdown.js',
            'app/public/vendor/bootstrap/js/modal.js',
            'app/public/vendor/bootstrap/js/tooltip.js',
            'app/public/vendor/bootstrap/js/popover.js',
            'app/public/vendor/bootstrap/js/scrollspy.js',
            'app/public/vendor/bootstrap/js/tab.js',
            'app/public/vendor/bootstrap/js/transition.js',
            'app/public/vendor/momentjs/moment.js',
            'app/public/layouts/core.js'
          ],
          'app/public/layouts/ie-sucks.min.js': [
            'app/public/vendor/html5shiv/html5shiv.js',
            'app/public/vendor/respond/respond.js',
            'app/public/layouts/ie-sucks.js'
          ],
          'app/public/layouts/admin.min.js': ['app/public/layouts/admin.js']
        }
      },
      views: {
        files: [{
          expand: true,
          cwd: 'app/public/views/',
          src: ['**/*.js', '!**/*.min.js'],
          dest: 'app/public/views/',
          ext: '.min.js'
        }]
      }
    },
    jshint: {
      client: {
        options: {
          jshintrc: '.jshintrc-client',
          ignores: [
            'app/public/layouts/**/*.min.js',
            'app/public/views/**/*.min.js'
          ]
        },
        src: [
          'app/public/layouts/**/*.js',
          'app/public/views/**/*.js'
        ]
      },
      server: {
        options: {
          jshintrc: '.jshintrc-server'
        },
        src: [
          'schema/**/*.js',
          'views/**/*.js'
        ]
      }
    },
    less: {
      options: {
        compress: true
      },
      layouts: {
        files: {
          'app/public/layouts/core.min.css': [
            'app/public/less/bootstrap-build.less',
            'app/public/less/font-awesome-build.less',
            'app/public/layouts/core.less'
          ],
          'app/public/layouts/admin.min.css': ['app/public/layouts/admin.less']
        }
      },
      views: {
        files: [{
          expand: true,
          cwd: 'app/public/views/',
          src: ['**/*.less'],
          dest: 'app/public/views/',
          ext: '.min.css'
        }]
      }
    },
    clean: {
      js: {
        src: [
          'app/public/layouts/**/*.min.js',
          'app/public/layouts/**/*.min.js.map',
          'app/public/views/**/*.min.js',
          'app/public/views/**/*.min.js.map'
        ]
      },
      css: {
        src: [
          'app/public/layouts/**/*.min.css',
          'app/public/views/**/*.min.css'
        ]
      },
      vendor: {
        src: ['app/public/vendor/**']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('default', ['copy:vendor', 'newer:uglify', 'newer:less', 'concurrent']);
  grunt.registerTask('build', ['copy:vendor', 'uglify', 'less']);
  grunt.registerTask('lint', ['jshint']);
};

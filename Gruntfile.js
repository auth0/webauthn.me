module.exports = grunt => {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.initConfig({
    clean: {
      default: [ 'dist' ]
    },

    copy: {
      default: {
        files: [{
          expand: true,
          cwd: 'img',
          src: ['**'],
          dest: 'dist/img'
        }, /*{
          expand: true,
          flatten: true,
          src: [
            'node_modules/bulma/css/bulma.min.css'
          ],
          dest: 'dist/css/'
        }*/]
      }
    },

    less: {
      default: {
        files: {
          'dist/css/common.css': 'less/common.less',
          'dist/css/index.css': 'less/index.less',
          'dist/css/tutorial.css': 'less/tutorial/index.less',
          'dist/css/introduction.css': 'less/introduction.less'
        }
      }
    },

    pug: {
      default: {
        options: {
          pretty: true,
          data: {
          }
        },
        files: {
          //'dist/index.html': 'views/index.pug',
          //'dist/introduction.html': 'views/introduction/index.pug',
          'dist/tutorial.html': 'views/tutorial/index.pug',
        }
      }
    },

    webpack: {
      prod: require('./webpack.prod.js'),
      dev: require('./webpack.dev.js')
    },

    watch: {
      src: {
        files: ['src/**'],
        tasks: 'webpack:dev'
      },
      img: {
        files: [ 'img/**' ],
        tasks: 'copy'
      },
      assets: {
        files: [
          'node_modules/bulma/css/**'
        ],
        tasks: 'copy'
      },
      views: {
        files: [
          'views/**'
        ],
        tasks: 'pug'
      },
      less: {
        files: [
          'less/**',
        ],
        tasks: 'less'
      }
    },

    /*mochaTest: {
      unit: {
        options: {},
        src: ['dist/test/unit-tests.js']
      },
      functional: {
        options: {
          // Higher default timeout to account for some animations
          timeout: 10000
        },
        src: ['test/functional/**.js']
      }
    },*/

    connect: {
      default: {
        options: {
          hostname: '127.0.0.1',
          base: 'dist',
        }
      }
    },
  });

  grunt.registerTask('build-dev', [
    'clean',
    'copy',
    'less',
    'pug',
    'webpack:dev'
  ]);

  grunt.registerTask('build-prod', [
    'clean',
    'copy',
    'less',
    'pug',
    'webpack:prod'
  ]);

  grunt.registerTask('default', ['build-dev', 'connect', 'watch']);
};

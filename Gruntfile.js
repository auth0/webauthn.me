module.exports = grunt => {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-stylus');
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
        }, {
          expand: true,
          flatten: true,
          src: [
            'node_modules/bulma/css/bulma.min.css'
          ],
          dest: 'dist/css/'
        }]
      }
    },

    stylus: {
      default: {
        files: {
          'dist/css/index.css': 'stylus/index.styl'
        }
      }
    },

    pug: {
      default: {
        options: {
          //pretty: true,
          data: {
          }
        },
        files: {
          'dist/index.html': 'views/index.pug',
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
      stylus: {
        files: [
          'stylus/**',
        ],
        tasks: 'stylus'
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
    'stylus',
    'pug',
    'webpack:dev'
  ]);

  grunt.registerTask('build-prod', [
    'clean',
    'copy',
    'stylus',
    'pug',
    'webpack:prod'
  ]);

  grunt.registerTask('default', ['build-dev', 'connect', 'watch']);
};

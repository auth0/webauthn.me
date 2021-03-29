module.exports = (grunt) => {
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-pug");
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-sitemap");
    grunt.loadNpmTasks("grunt-real-favicon");

    grunt.initConfig({
        clean: {
            default: ["dist"],
        },

        copy: {
            default: {
                files: [{
                        expand: true,
                        cwd: "img",
                        src: ["**"],
                        dest: "dist/img",
                    },
                    {
                        expand: true,
                        cwd: "fonts",
                        src: ["**"],
                        dest: "dist/fonts",
                    },
                    {
                        expand: true,
                        cwd: "./",
                        src: "robots.txt",
                        dest: "dist/",
                    },
                    /*{
                                       expand: true,
                                       flatten: true,
                                       src: [
                                         'node_modules/bulma/css/bulma.min.css'
                                       ],
                                       dest: 'dist/css/'
                                     }*/
                ],
            },
        },

        less: {
            default: {
                files: {
                    "dist/css/common.css": "less/common.less",
                    "dist/css/index.css": "less/index.less",
                    "dist/css/tutorial.css": "less/tutorial/index.less",
                    "dist/css/introduction.css": "less/introduction/index.less",
                    "dist/css/debugger.css": "less/debugger/index.less",
                    "dist/css/browser-support.css": "less/browser-support/index.less",
                },
            },
        },

        pug: {
            default: {
                options: {
                    pretty: true,
                    data: {},
                },
                files: {
                    //'dist/index.html': 'views/index.pug',
                    "dist/introduction.html": "views/introduction/index.pug",
                    "dist/index.html": "views/tutorial/index.pug",
                    "dist/debugger.html": "views/debugger/index.pug",
                    "dist/browser-support.html": "views/browser-support/index.pug",
                },
            },
        },

        webpack: {
            prod: require("./webpack.prod.js"),
            dev: require("./webpack.dev.js"),
        },

        sitemap: {
            dist: {
                homepage: "https://webauthn.me/",
                pattern: ["*/*.html"],
                siteRoot: "./dist",
                extension: {
                    required: false,
                },
            },
        },

        watch: {
            src: {
                files: ["src/**"],
                tasks: "webpack:dev",
            },
            img: {
                files: ["img/**"],
                tasks: "copy",
            },
            assets: {
                files: ["node_modules/bulma/css/**"],
                tasks: "copy",
            },
            views: {
                files: ["views/**"],
                tasks: ["pug", "sitemap"],
            },
            less: {
                files: ["less/**"],
                tasks: "less",
            },
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

        realFavicon: {
            favicons: {
                src: "./favicon.png",
                dest: "./dist/",
                options: {
                    iconsPath: "/",
                    html: ["./dist/**/*.html"],
                    keep: ['meta[property="og:image"]'],
                    design: {
                        ios: {
                            pictureAspect: "backgroundAndMargin",
                            backgroundColor: "#000000",
                            margin: "35%",
                            assets: {
                                ios6AndPriorIcons: false,
                                ios7AndLaterIcons: false,
                                precomposedIcons: false,
                                declareOnlyDefaultIcon: true,
                            },
                        },
                        desktopBrowser: {},
                        windows: {
                            pictureAspect: "noChange",
                            backgroundColor: "#000000",
                            onConflict: "override",
                            assets: {
                                windows80Ie10Tile: false,
                                windows10Ie11EdgeTiles: {
                                    small: false,
                                    medium: true,
                                    big: false,
                                    rectangle: false,
                                },
                            },
                        },
                        androidChrome: {
                            pictureAspect: "noChange",
                            themeColor: "#ffffff",
                            manifest: {
                                display: "standalone",
                                orientation: "notSet",
                                onConflict: "override",
                                declared: true,
                                name: "Web Authentication (WebAuthn) Credential and Login Demo",
                                short_name: "WebAuthn demo",
                            },
                            assets: {
                                legacyIcon: false,
                                lowResolutionIcons: false,
                            },
                        },
                        safariPinnedTab: {
                            pictureAspect: "silhouette",
                            themeColor: "#d43aff",
                        },
                    },
                    settings: {
                        scalingAlgorithm: "Mitchell",
                        errorOnImageTooSmall: false,
                        readmeFile: false,
                        htmlCodeFile: false,
                        usePathAsIs: false,
                    },
                },
            },
        },

        connect: {
            default: {
                options: {
                    hostname: "127.0.0.1",
                    base: "dist",
                },
            },
        },
    });

    grunt.registerTask("build-dev", [
        "clean",
        "copy",
        "less",
        "pug",
        "webpack:dev",
        "sitemap",
    ]);

    grunt.registerTask("build-prod", [
        "clean",
        "copy",
        "less",
        "pug",
        "webpack:prod",
        "sitemap",
        "realFavicon",
    ]);

    grunt.registerTask("default", ["build-dev", "connect", "watch"]);
};
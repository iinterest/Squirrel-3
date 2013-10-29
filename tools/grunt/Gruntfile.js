module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        // 本地服务器
        // 文档 https://github.com/gruntjs/grunt-contrib-connect
        connect: {
            devServer: {
                options: {
                    port: 8000,
                    hostname: "localhost",
                    //hostname: '0.0.0.0',
                    base: '../../',
                    keepalive: true
                }
            },
            testServer: {}
        },
        less: {
            core: {
                files: {
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/<%= pkg.name%>-core.css": [
                        "<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/core/core.less"
                    ]
                }
            },
            build: {
                files: {
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/<%= pkg.name%>.css": [
                        "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/<%= pkg.name%>-core.css",
                        "<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/*.less"
                    ]
                }
            }
        },
        concat: {
            core: {
                src: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/core/core.js",     // 确保合并顺序
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/core*//*.js"
                ],
                dest: "<%= pkg.dirs.base %>/<%= pkg.dirs.js_build %>/<%= pkg.name%>-core.js"
            },
            build: {
                src: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_build %>/<%= pkg.name%>-core.js",
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>*//*.js"
                ],
                dest: "<%= pkg.dirs.base %>/<%= pkg.dirs.js_build %>/<%= pkg.name%>.js",
                nonull: true
            }
        },
        uglify: {
            options: {
                banner: "/** \n" +
                    " * <%= pkg.name%> \n" +
                    " * @version: <%= pkg.version%> \n" +
                    " * @date: <%= grunt.template.today('yyyy-mm-dd hh:MM:ss') %> \n" +
                    " */\n"
            },
            build: {
                src: "<%= pkg.dirs.base %>/<%= pkg.dirs.js_build %>/<%= pkg.name%>.js",
                dest: "<%= pkg.dirs.base %>/<%= pkg.dirs.js_dist %>/<%= pkg.name%>-min.js"
            }
        },
        cssmin: {
            minify : {
                options: {
                    banner: "/** \n" +
                        " * <%= pkg.name%> \n" +
                        " * @version: <%= pkg.version%> \n" +
                        " * @date: <%= grunt.template.today('yyyy-mm-dd hh:MM:ss') %> \n" +
                        " */"
                },
                files: {
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.css_dist %>/<%= pkg.name%>-min.css": "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/<%= pkg.name%>.css"
                }
            }
        },
        clean: {
            options: { force: true },
            build: [
                "<%= pkg.dirs.base %>/build/css/*.css",
                "<%= pkg.dirs.base %>/build/js/*.js"
            ],
            dist: [
                "<%= pkg.dirs.base %>/dist/css/*.css",
                "<%= pkg.dirs.base %>/dist/js/*.js"
            ]
        },
        open: {
            server: {
                path: 'http://localhost:8000'
            }
        },
        watch: {
            less: {
                files: ["<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/*.less"],
                tasks: ["less", "cssmin"]
            },
            script: {
                files: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/*.js",
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/core/*.js"
                ],
                tasks: ["concat", "uglify"]
            }
        },
        jsdoc : {
            dist : {
                src: ["<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/**/*.js"],
                options: {
                    destination: "<%= pkg.dirs.base %>/docs/jsdoc"
                }
            }
        }/*,
        transport: {
            options : {
                format : "test/mod/"  //生成的id的格式
            },
            mod: {
                files: {
                    "mod": [
                        //"<%= pkg.dirs.base %>/libs/zepto/zepto-1.0.min.js",
                        //"<%= pkg.dirs.base %>/test/modules/src/js/squirrel-core.js",
                        "<%= pkg.dirs.base %>/test/modules/src/js/dialog.js",
                        //"<%= pkg.dirs.base %>/test/modules/src/js/tabs.js",
                        "<%= pkg.dirs.base %>/test/modules/src/js/main.js"

                    ]
                }
            }
        },
        concat: {
            main: {
                options: {
                    relative : true
                },
                files: {
                    'dist/application.js' : ['../../test/dist/application.js'],  // 合并.build/application.js文件到dist/application.js中
                    'dist/application-debug.js' : ['../../test/dist/application-debug.js']
                }
            }
        }*/
    });

    grunt.loadNpmTasks('grunt-contrib-connect'); // 本地服务器
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');
    //grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jsdoc');
    //grunt.loadNpmTasks('grunt-cmd-transport');
    //grunt.loadNpmTasks('grunt-cmd-concat');
    //grunt.registerTask("openit", ["open"]);
    //grunt.registerTask('webServer', ['connect:devServer']);
    grunt.registerTask("build", ["clean", "less", "concat", "uglify", "cssmin"]);
    grunt.registerTask("mod", ["transport","concat"]);
    /*grunt.event.on('watch', function (action, filepath) {
        grunt.log.writeln(filepath + ' has ' + action);
    });*/
    /*grunt.event.on('watch', function (action, filepath) {
        grunt.config(["less"], filepath);
    });*/
};
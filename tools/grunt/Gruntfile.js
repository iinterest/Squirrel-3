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
            build: {
                files: {
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/<%= pkg.name%>.css": [
                        "<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/core/core.less",
                        "<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/*.less",
                        "!<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/base.less",  // 排除重复样式
                        "!<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/core/reset.less"
                    ]
                }
            },
            apkx: {
                files: {
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/<%= pkg.name%>.css": "<%= pkg.project.apkx.css %>"
                }
            }
        },
        concat: {
            build: {
                src: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/core/core.js",     // 确保合并顺序
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/core/*.js",
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/*.js"
                ],
                dest: "<%= pkg.dirs.base %>/<%= pkg.dirs.js_build %>/<%= pkg.name%>.js",
                nonull: true
            },
            apkx: {
                src: "<%= pkg.project.apkx.js %>",
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
                tasks: ["less:build", "cssmin"]
            },
            script: {
                files: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/*.js",
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/core/*.js"
                ],
                tasks: ["concat:build", "uglify"]
            }
        },
        jsdoc : {
            dist : {
                src: ["<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/**/*.js"],
                options: {
                    destination: "<%= pkg.dirs.base %>/docs/jsdoc"
                }
            }
        }
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

    //grunt.registerTask("openit", ["open"]);
    grunt.registerTask('webServer', ['connect:devServer']);
    grunt.registerTask("apkx", ["clean", "less:apkx", "concat:apkx", "uglify", "cssmin"]);
    grunt.registerTask("build", ["clean", "less:build", "concat:build", "uglify", "cssmin"]);

    /*grunt.event.on('watch', function (action, filepath) {
        grunt.log.writeln(filepath + ' has ' + action);
    });*/
    /*grunt.event.on('watch', function (action, filepath) {
        grunt.config(["less"], filepath);
    });*/
};
module.exports = function (grunt) {
    "use strict";
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
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
                        "<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/*.less",
                        "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/animate.css"
                    ]
                }
            }
        },
        concat: {
            core: {
                src: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/core/core.js",
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/core/*.js"
                ],
                dest: "<%= pkg.dirs.base %>/<%= pkg.dirs.js_build %>/<%= pkg.name%>-core.js"
            },
            build: {
                src: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_build %>/<%= pkg.name%>-core.js",
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/*.js"
                ],
                dest: "<%= pkg.dirs.base %>/<%= pkg.dirs.js_build %>/<%= pkg.name%>.js",
                nonull: true
            },
            // 动画 CSS 合并
            animate: {
                src: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/animate/_base.css",
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/animate/**/*.css"
                ],
                dest: "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/animate.css"
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
            minify: {
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
            options: {force: true},
            build: [
                "<%= pkg.dirs.base %>/build/css/*.css",
                "<%= pkg.dirs.base %>/build/js/*.js"
            ],
            dist: [
                "<%= pkg.dirs.base %>/dist/css/*.css",
                "<%= pkg.dirs.base %>/dist/js/*.js"
            ]
        },
        watch: {
            less: {
                files: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/*.less",
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.less_src %>/animate/**/*.css"
                ],
                tasks: ["concat:animate", "autoprefixer", "less", "cssmin", "copy", "notify:builded"]
            },
            script: {
                files: [
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/*.js",
                    "<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/core/*.js"
                ],
                tasks: ["concat", "uglify", "copy", "notify:builded"]
            }
        },
        jsdoc: {
            dist: {
                src: ["<%= pkg.dirs.base %>/<%= pkg.dirs.js_src %>/**/*.js"],
                options: {
                    destination: "<%= pkg.dirs.base %>/docs/jsdoc"
                }
            }
        },
        copy: {
            template: {
                expand: true,
                cwd: "<%= pkg.dirs.base %>",
                src: "dist/**",
                dest: "../../../Project-Template/app/"
            }
        },
        open: {
            server: {
                path: "http://192.168.93.170/~Bell/Dropbox/Code/Framework/Squirrel-3/index.html"
            }
        },
        notify: {
            builded: {
                options: {
                    message: "Squirrel is ready!"
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ["android 3"]
            },
            multiple_files: {
                expand: true,
                flatten: true,
                src: "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/animate.css",
                dest: "<%= pkg.dirs.base %>/<%= pkg.dirs.css_build %>/"
            }
        }
    });
    
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-autoprefixer");
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-open");
    grunt.loadNpmTasks("grunt-notify");
    grunt.registerTask("build", ["clean", "concat", "less", "autoprefixer", "uglify", "cssmin", "copy"]);
};
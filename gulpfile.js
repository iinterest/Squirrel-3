/**
 * Squirrel-3
 * @version 1.0.1
 * @anthor: iinterest.bell@gmail.com
 */
/* jshint strict: false, quotmark: false */

/**
 * change log
 * 1.0.1    * autoprefixer 设置为 'android 4', 'ios 7'
 *          - 删除 gulp-minify-css
 */

// Load plugins
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var del = require('del');
var footer = require('gulp-footer');
var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var pkg = require('./package.json');
var date = new Date();
pkg.date = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
('00' + date.getDate()).slice(-2) + ' ' + ('00' + date.getHours()).slice(-2) + ':' +
('00' + date.getMinutes()).slice(-2) + ':' + ('00' + date.getSeconds()).slice(-2);
var timestamp = ['\n/*',
    ' <%= pkg.name %>',
    ' @version v<%= pkg.version %>',
    ' @date <%= pkg.date %>',
    ' */'].join('');

// Config
var toggle = {
    autoprefix: true,
    imagemin: false,
    jshint: true,
    sourcemaps: true
};
var paths = {
    scripts: [
        'src/scripts/core/*.js',
        'src/scripts/global.js',
        'src/scripts/*.js',
        'src/scripts/plugins/*.js',
        'src/scripts/**/*.js'
    ],
    styles: 'src/styles/' + pkg.name + '.less',
    images: [
        'src/images/**/*.jpg',
        'src/images/**/*.gif',
        'src/images/**/*.png'
    ],
    fonts: [
        /*'bower_components/fontawesome/fonts/fontawesome.otf',
        'bower_components/fontawesome/fonts/fontawesome-webfont.eot',
        'bower_components/fontawesome/fonts/fontawesome-webfont.svg',*/
        'bower_components/fontawesome/fonts/fontawesome-webfont.ttf',
        'bower_components/fontawesome/fonts/fontawesome-webfont.woff'
    ],
    lib: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/jquery/dist/jquery.min.map'
    ],
    watchs: {
        scripts: 'src/scripts/**/*.js',
        styles: 'src/styles/**/*.less',
        templates: 'example/**/*.html',
        dist: 'dist/**/*'
    }
};
var dests = {
    styles: './dist/css',
    scripts: './dist/js',
    images: './dist/images',
    fonts: './dist/fonts',
    maps: '../maps'
};
var options = {
    autoprefix: {
        browsers: ['android 4', 'ios 7']
    },
    fileName: pkg.name,
    less: {compress: true},
    imagemin: {progressive: true},
    jshint: '.jshintrc',
    jshintReporter: 'default',
    rename: {suffix: '.min'}
};

// Tasks
// 通常情况，以下任务是不能修改的，如果遇到特殊情况需要修改，请注明！

// Styles
gulp.task('styles', function () {
    gulp.src(paths.styles)
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.init()))
        .pipe(less(options.less))
        .pipe(gulpif(toggle.autoprefix, autoprefixer(options.autoprefix)))
        .pipe(rename(options.rename))
        .pipe(footer(timestamp, {pkg: pkg}))
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.write(dests.maps)))
        .pipe(gulp.dest(dests.styles));
});

// Scripts
gulp.task('scripts', function () {
    gulp.src(paths.scripts)
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.init()))
        .pipe(gulpif(toggle.jshint, jshint(options.jshint)))
        .pipe(gulpif(toggle.jshint, jshint.reporter(options.jshintReporter)))
        .pipe(concat(options.fileName + '.js'))
        .pipe(rename(options.rename))
        .pipe(uglify())
        .pipe(footer(timestamp, {pkg: pkg}))
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.write(dests.maps)))
        .pipe(gulp.dest(dests.scripts));
});

// Images
gulp.task('images', function () {
    gulp.src(paths.images)
        .pipe(gulp.dest(dests.images));
});

// Fonts
gulp.task('coypFonts', function () {
    gulp.src(paths.fonts)
        .pipe(gulp.dest(dests.fonts));
});

// Lib
gulp.task('copyLib', function () {
    gulp.src(paths.lib)
        .pipe(gulp.dest(dests.scripts));
});

// Clean
gulp.task('clean', function (cb) {
    del(['dist', 'build'], cb);
});

// Build
gulp.task('build', ['clean'], function () {
    gulp.start('styles', 'scripts', 'images', 'coypFonts', 'copyLib');
});

// Default
gulp.task('default', ['build']);

// Release 发布
gulp.task('release', function (cb) {
    // 因为 UAE 不支持 .map 文件类型，所以暂时在发布时去除 sourcemaps
    toggle.sourcemaps = false;
    gulp.start('build');
});

// Watch
gulp.task('watch', function () {
    // .js files
    gulp.watch(paths.watchs.scripts, ['scripts']);
    // .less files
    gulp.watch(paths.watchs.styles, ['styles']);
    // images files
    gulp.watch(paths.images, ['images']);
    // LiveReload server
    livereload.listen();
    // Watch any files in dist/, pages/, reload on change
    gulp.watch([paths.watchs.dist, paths.watchs.templates]).on('change', livereload.changed);
});
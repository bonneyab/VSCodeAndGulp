var minifyCSS = require('gulp-minify-css')
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var del = require('del');
var uglify = require('gulp-uglify');
var mainBowerFiles = require('main-bower-files');
var gulpFilter = require('gulp-filter')
var bower = require('gulp-bower')
var concat = require('gulp-concat')
var rename = require('gulp-rename')
var less = require('gulp-less')
var aspnetk = require("gulp-aspnet-k");

var publishdir = 'wwwroot'
var dist = {
  all: [publishdir + '/**/*'],
  css: publishdir + '/lib/css',
  js: publishdir + '/lib/js',
  fonts: publishdir + '/lib/fonts'
}

var config = {
    bowerDir: './bower_components',
	lessDir: './resources/less/styles.less',
	jsDir: './resources/js/',
}

gulp.task('aspnet-run', aspnetk());
// only restores the packages 
gulp.task('aspnet-restore', aspnetk.restore());
// only builds the project 
gulp.task('aspnet-build', aspnetk.build());
// restores the packages and builds the project 
gulp.task('aspnet-restore-build', aspnetk.restoreBuild());

gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir))
});

gulp.task('less', function(){
    return gulp.src(config.lessDir)
        .pipe(less())
        .pipe(gulp.dest(dist.css));
});

gulp.task('scripts', function(){
	return gulp.src(config.jsDir)
        .pipe(concat('internal.js'))
		.pipe(uglify())
        .pipe(gulp.dest(dist.js));
})

//TODO user bower files instead of calling main bower?
gulp.task('external', function() {
	var jsFilter = gulpFilter(['**/*.js','!**/*.min.js'])
	var cssFilter = gulpFilter(['**/*.css'])
	var fontFilter = gulpFilter(['**/*.eot','**/*.svg','**/*.ttf','**/*.woff','**/*.woff2'])
	
    return gulp.src(mainBowerFiles())
			.pipe(jsFilter)
			.pipe(concat('exernal.js'))
			.pipe(uglify())
            .pipe(gulp.dest(dist.js))
			.pipe(jsFilter.restore())
			.pipe(cssFilter)
			.pipe(concat('exernal.css'))
            .pipe(gulp.dest(dist.css))
			.pipe(minifyCSS())
			.pipe(cssFilter.restore())
			.pipe(fontFilter)
			.pipe(gulp.dest(dist.fonts))
});

gulp.task('clean', function(cb) {
    del(['wwwroot/*'], cb)
});

// Lint Task
gulp.task('lint', function() {
    return gulp.src(config.jsDir + '**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default', ['clean', 'lint', 'external', 'less', 'scripts', 'aspnet-build', 'watch'])
gulp.task('init', ['bower','default'])

// // Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(config.js + "**/*.js", ['lint', 'scripts']);
    gulp.watch(config.less + "**/*.less", ['less']);
});

// // Default Task
// gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);
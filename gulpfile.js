var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    del = require('del'),
    scp = require('gulp-scp'),
    jshint = require('gulp-jshint'),
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    browserify = require('gulp-browserify');

var path = {
	"app": {
		"html": "app/**/*.html",
		"css": "app/**/*.css",
		"js": "app/**/*.js",
		"test": "app/**/*-test.js",
	},
	"build": {
		"src": "build/**",
		"target": "build"
	},
	"dependencies": {
		"src": "bower_components/**/+(require|*min).+(js|map)"
	}
}


gulp.task('clean', function(cb) {
  del([path.build.target], cb);
});

gulp.task('dist-html', function() {
	gulp.src(path.app.html)
		.pipe(gulp.dest(path.build.target));
});

gulp.task('dist-css', function() {
	gulp.src(path.app.css)
		.pipe(gulp.dest(path.build.target));
});

gulp.task('dist-js', ['jshint'], function() {
	gulp.src(path.app.js)
		.pipe(concat())
		.pipe(browserify())
		.pipe(gulp.dest(path.build.target));
});

gulp.task('dist-deps', ['jshint'], function() {
	gulp.src(path.dependencies.src)
		.pipe(gulp.dest(path.build.target));
});

gulp.task('dist', ['dist-html', 'dist-css', 'dist-js', 'dist-deps']);

gulp.task('deploy', function () {
	runSequence('dist', 'scp');
});

gulp.task('scp', function () {
	var config = require('./deploy-config.json');
    gulp.src(path.build.src)
        .pipe(scp({ 
            host: config.host,
            user: config.user,
            path: config.targetdir
        }));
});

gulp.task('jshint', function() {
  return gulp.src(path.app.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
 
gulp.task('bower', function() {
  return bower({ cmd: 'update'});
});

gulp.task('watch', function () {
    gulp.watch(path.app.html, ['dist-html', 'scp']);
    gulp.watch(path.app.css, ['dist-css', 'scp']);
    gulp.watch(path.app.js, ['dist-js', 'scp']);
    gulp.watch(path.dependencies.src, ['dist-deps', 'scp']);
    gulp.watch('bower.json', ['bower', 'scp']);
});

gulp.task('default', function(){
	runSequence('watch');
});

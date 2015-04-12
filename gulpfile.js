var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    del = require('del'),
    scp = require('gulp-scp'),
    jshint = require('gulp-jshint'),
    bower = require('gulp-bower');

var path = {
	"app": {
		"src": "app/**",
		"js": "app/**/*.js"
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

gulp.task('dist', ['jshint'], function() {
	gulp.src(path.app.src)
		.pipe(gulp.dest(path.build.target));
	gulp.src(path.dependencies.src)
		.pipe(gulp.dest(path.build.target));
});

gulp.task('deploy', function () {
	runSequence('clean', 'dist', 'scp');
});

gulp.task('scp', function () {
	var config = require('./deploy-config.json');
    gulp.src(path.build.src)
        .pipe(scp({ host: config.host,
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
    gulp.watch(path.app.src, ['dist', 'scp']);
    gulp.watch(path.dependencies.src, ['dist', 'scp']);
    gulp.watch('bower.json', ['bower', 'scp']);
});

gulp.task('default', function(){
	runSequence('clean',
				'dist');
});

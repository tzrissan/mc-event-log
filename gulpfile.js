var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    del = require('del'),
    scp = require('gulp-scp');

var path  = {
	"app": {
		"src": "app/**"
	},
	"build": {
		"src": "build/**",
		"target": "build"
	},
	"dependencies": {
		"src": "bower_components/**/*min*.+(js|map)"
	}
}


gulp.task('clean', function(cb) {
  del([path.build.target], cb);
});

gulp.task('dist', function() {
	gulp.src(path.app.src)
		.pipe(gulp.dest(path.build.target));
	gulp.src(path.dependencies.src)
		.pipe(gulp.dest(path.build.target));
});

gulp.task('deploy', ['dist'], function () {
	var config = require('./deploy-config.json');
    gulp.src(path.build.src)
        .pipe(scp({ host: config.host,
		            user: config.user,
		            path: config.targetdir
		        }));
});

var bower = require('gulp-bower');
 
gulp.task('bower', function() {
  return bower({ cmd: 'update'});
});

gulp.task('watch', function () {
    gulp.watch(path.app.src, ['deploy']);
    gulp.watch('bower.json', ['bower']);
});


gulp.task('default', function(){
	runSequence('clean',
				'dist');
});

var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    del = require('del'),
    scp = require('gulp-scp');

var path  = {
	"app": {
		"src": "app/*"
	},
	"build": {
		"src": "build/*",
		"target": "build"
	}
}


gulp.task('clean', function(cb) {
  del([path.build.target], cb);
});

gulp.task('package', function(cb) {
	return gulp.src(path.app.src)
			   .pipe(gulp.dest(path.build.target));
});

gulp.task('deploy', ['package'], function () {
	var config = require('./deploy-config.json');
    gulp.src(path.build.src)
        .pipe(scp({ host: config.host,
		            user: config.user,
		            path: config.targetdir
		        }));
});

gulp.task('watch', function () {
    gulp.watch(path.app.src, ['deploy']);
});


gulp.task('default', function(callback){
	runSequence('clean',
				'package',
				callback);
});

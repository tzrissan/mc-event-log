var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    del = require('del');

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

gulp.task('package', function(cb) {
	return gulp.src('app/**')
		.pipe(gulp.dest('build'));
});


gulp.task('default', function(callback){
	runSequence('clean',
				'package',
				callback);
});

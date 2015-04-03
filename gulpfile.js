var gulp = require('gulp');
var del = require('del');

gulp.task('clean', function(cb) {
  del(['build'], cb);
});

gulp.task('package', function(cb) {
	return gulp.src('app')
		.pipe(gulp.dest('build'));
});


gulp.task('default', ['clean', 'package' ]);

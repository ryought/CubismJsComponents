var gulp = require("gulp");
var clean = require('gulp-clean');
var flatten = require('gulp-flatten');
var runSequence = require('run-sequence');
var ts = require("gulp-typescript");


gulp.task('build-tsc', function() {
    var tsProject = ts.createProject('./src/tsc/tsconfig.json');
    return tsProject.src()
        .pipe(tsProject())
        .pipe(flatten())
        .pipe(gulp.dest('./wwwroot/js'));
});


gulp.task('copy-src', function() {
    return gulp.src(['./src/**/*.*', '!**/*.ts', '!**/tsconfig.json'])
        .pipe(gulp.dest('./wwwroot'));
});


gulp.task('copy-assets', function() {
    return gulp.src('./assets/**/*.*')
        .pipe(gulp.dest('./wwwroot/assets'));
});


gulp.task('default', [
    'build-tsc',
    'copy-src',
    'copy-assets'
]);

gulp.task('watch', function() {
    gulp.watch('./src/tsc/*.ts', ['default']);
});
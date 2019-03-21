var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    cssmin = require('gulp-minify-css'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer');

var path = {
      root: './'
    };

gulp.task('scripts', function() {
  return gulp.src([
      'js/*.js',
    ])
    .pipe(concat('main.js'))
    .pipe(gulp.dest(path.root + '/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(path.root + '/js'));
});

gulp.task('style', function () {
  gulp.src('scss/**/*.scss')
    .pipe(sourcemaps.init()) // init sourcemaps
    .pipe(sass({ // compile sass
      outputStyle: 'compressed'
      //outputStyle: 'expanded'
    }))
    .pipe(autoprefixer('last 2 versions')) // run css postprocessor
    .pipe(cssmin()) // minify css
    .pipe(sourcemaps.write('./')) // write sourcemaps
    .pipe(gulp.dest(path.root + '/css')); // transfer css to build folder
});

gulp.task('watch', function() {
  // Watch .js files
  // gulp.watch('js/**/*.js', ['scripts']);
  // Watch .scss files
  gulp.watch('scss/**/*.scss', ['style']);
});

// Default Task
gulp.task('default', ['watch']);

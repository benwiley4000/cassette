// main build is managed through webpack.
// this is for compiling individual component-level css files.

var gulp = require('gulp');
var path = require('path');
var sass = require('gulp-sass')(require('sass'));
var postcss = require('gulp-postcss');
var uglifycss = require('gulp-uglifycss');
var rename = require('gulp-rename');

// aim to emulate sass import resolution of webpack sass-loader
// based in part on example at http://stackoverflow.com/a/29924381/4956731
var aliases = {};
function nodeModuleSassImporter(url, prev, done) {
  // check if the path was already found and cached
  if (aliases[url]) {
    return done({ file: aliases[url] });
  }

  // look for modules installed through npm
  if (url[0] === '~') {
    var newPath = path.join(__dirname, 'node_modules', url.slice(1));
    aliases[url] = newPath; // cache this request
    return done({ file: newPath });
  }

  aliases[url] = url;
  return done({ file: url });
}

gulp.task('compilecss', function() {
  // excluding index.scss and variables.scss
  return gulp
    .src('./src/styles/_!(variables).scss')
    .pipe(
      rename(function(path) {
        path.basename = path.basename.slice(1); // remove _ from front.
      })
    )
    .pipe(
      sass({
        importer: nodeModuleSassImporter
      }).on('error', sass.logError)
    )
    .pipe(postcss())
    .pipe(gulp.dest('./dist/component_css'));
});

gulp.task('uglifycss', gulp.series(['compilecss']), function() {
  return gulp
    .src('./dist/component_css/*.css')
    .pipe(uglifycss())
    .pipe(
      rename(function(path) {
        path.extname = '.min.css';
      })
    )
    .pipe(gulp.dest('./dist/component_css'));
});

gulp.task('styles', gulp.series(['compilecss', 'uglifycss']));

gulp.task('watch', function() {
  gulp.watch('./src/styles/*.scss', gulp.series(['styles']));
});

gulp.task('default', gulp.series(['styles']));

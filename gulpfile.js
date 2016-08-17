'use strict';

const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const livereload = require('gulp-livereload');
const gutil = require('gulp-util');
const chalk = require('chalk');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const watchify = require('watchify');
const merge = require('utils-merge');
const duration = require('gulp-duration');

let config = {
  js: {
    src: './client/app.jsx',
    watch: './js/**/*',
    outputDir: './public/js/',
    outputFile: 'app.js'
  }
}

function mapError(err) {
  if (err.fileName) {
    // Regular error
    gutil.log(
      `${chalk.red(err.name)}:${chalk.yellow(err.fileName.replace(`${__dirname}/client`))}:Line ${chalk.magenta(err.lineNumber)}: & Column ${chalk.magenta(err.columnNumber)}: ${chalk.blue(err.description)}`
    )
  } else {
    // Browserify error
    gutil.log(
      `${chalk.red(err.name)}:${chalk.yellow(err.message)}`
    )
  }
}

function bundle(bundler) {
  var bundleTimer = duration('Javascript bundle time');

  bundler
    .bundle()
    .on('error', mapError)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(rename(config.js.outputFile))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./map'))
    .pipe(gulp.dest(config.js.outputDir))
    .pipe(notify({
      message: 'Generated file: <%= file.relative %>'
    }))
    .pipe(bundleTimer)
    .pipe(livereload());
}

gulp.task('default', () => {
  livereload.listen();
  let args = merge(watchify.args, { debug: true });

  let bundler = browserify(config.js.src, args)
    .plugin(watchify, {ignoreWatch: ['**/node_modules/**']})
    .transform(babelify, {presets: ['es2015', 'react']})

  bundle(bundler);

  bundler.on('update', () => {
    bundle(bundler);
  })
})

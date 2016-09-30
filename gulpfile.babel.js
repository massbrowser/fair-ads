import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import {argv as argv} from 'yargs';
import runSequence from 'run-sequence';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();

var platformName = 'chromium';

if (argv.firefox) {
  platformName = 'firefox';
} else if (argv.opera) {
  platformName = 'opera';
} else if (argv.safari) {
  platformName = 'safari';
}

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    '!app/scripts.babel',
    '!app/*.json',
    '!app/*.html',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest(`dist/${platformName}`));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format());
  };
}

gulp.task('lint', lint(['app/scripts.babel/**/*.js', `app/scripts.platform.babel/${platformName}/*.js`], {
  env: {
    es6: true
  }
}));

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest(`dist/${platformName}/images`));
});

gulp.task('html',  () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.sourcemaps.init())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
    .pipe($.sourcemaps.write())
    .pipe($.if('*.html', $.htmlmin({removeComments: true, collapseWhitespace: true})))
    .pipe(gulp.dest(`dist/${platformName}`));
});

gulp.task('makeManifest', () => {
  return gulp.src(`app/manifest.${platformName}.json`)
    .pipe($.rename('manifest.json'))
    .pipe(gulp.dest('app'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.chromium.json')
    .pipe($.chromeManifest({
      buildnumber: true,
      background: {
        target: 'scripts/background.js',
        exclude: [
          'scripts/chromereload.js'
        ]
      }
  }))
  .pipe($.rename('manifest.json'))
  .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
  .pipe($.if('*.js', $.sourcemaps.init()))
  .pipe($.if('*.js', $.uglify()))
  .pipe($.if('*.js', $.sourcemaps.write('.')))
  .pipe(gulp.dest(`dist/${platformName}`));
});

gulp.task('babel', () => {
  return gulp.src(['app/scripts.babel/**/*.js', `app/scripts.platform.babel/${platformName}/*.js`])
      .pipe($.babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest('app/scripts'));
});

gulp.task('less', () => {
  return gulp.src(['app/styles.less/*.less'])
    .pipe($.less())
    .pipe(gulp.dest('app/styles'));
});

gulp.task('ublock', () => {
  return gulp.src(['app/scripts.ublock/**/*.js'])
    // .pipe($.babel({
    //   presets: ['es2015']
    // }))
    .pipe(gulp.dest('app/scripts/ublock'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', ['lint', 'babel', 'ublock', 'less', 'makeManifest'], () => {
  $.livereload.listen();

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*.css',
    'app/_locales/**/*.json'
  ]).on('change', function(options) {
    $.livereload.reload(options);
  });

  gulp.watch(['app/scripts.babel/**/*.js', `app/scripts.platform.babel/${platformName}/*.js`], ['lint', 'babel']);
  gulp.watch('app/scripts.ublock/**/*.js', ['ublock']);
  gulp.watch('app/styles.less/**/*.less', ['less']);
  gulp.watch('app/manifest.*.json', ['makeManifest']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('wiredep', () => {
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('package', function () {
  var manifest = require(`./dist/${platformName}/manifest.json`);
  return gulp.src('dist/**')
      .pipe($.zip(`mass ad block-${manifest.version}.zip`))
      .pipe(gulp.dest('package'));
});

gulp.task('build', (cb) => {
  runSequence(
    'lint', 'babel', 'ublock', 'chromeManifest',
    ['html', 'images', 'extras'],
    'size', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});

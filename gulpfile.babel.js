import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import LessAutoprefix from 'less-plugin-autoprefix';
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

var distBasePath = `app`;

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

gulp.task('lint', lint(['app/scripts.babel/**/*.js', `app/platform/${platformName}/*.js`], {
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
    .pipe(gulp.dest(`${distBasePath}/images`));
});

gulp.task('html',  () => {
  return gulp.src('app/*.html')
    .pipe($.if('*.html', $.htmlmin({removeComments: true, collapseWhitespace: true})))
    .pipe(gulp.dest(`${distBasePath}`));
});

gulp.task('makeManifest', () => {
  return gulp.src('app/manifest.common.json')
    .pipe($.jsonEditor(function (json) {
      if (platformName === 'chromium') {
        json.browser_action.default_icon['38'] = 'images/icon-38.png';
      } else if (platformName === 'opera') {
        json.browser_action.default_icon['38'] = 'images/icon-19.png';
        delete json.options_ui;
      }
      return json;
    }))
    .pipe($.rename('manifest.json'))
    .pipe(gulp.dest('app'));
});

gulp.task('buildManifest', () => {
  return gulp.src('app/manifest.common.json')
    .pipe($.jsonEditor(function (json) {
      let index = -1;
      json.background.scripts.forEach(function (el, i) {
        if (el.includes('chromereload')) {
          index = i;
        }
      });
      json.background.scripts.splice(index, 1);
      if (platformName === 'chromium') {
        json.browser_action.default_icon['38'] = 'images/icon-38.png';
      } else if (platformName === 'opera') {
        json.browser_action.default_icon['38'] = 'images/icon-19.png';
        delete json.options_ui;
      }
      return json;
    }))
    .pipe($.rename('manifest.json'))
    .pipe(gulp.dest(distBasePath))
});

gulp.task('locales', () => {
  return gulp.src('app/_locales/**/*.*')
    .pipe(gulp.dest(`${distBasePath}/_locales`));
});

gulp.task('fonts', () => {
  return gulp.src('app/fonts/**/*.*')
    .pipe(gulp.dest(`${distBasePath}/fonts`));
});

gulp.task('assets', () => {
  return gulp.src('app/assets/**/*.*')
    .pipe(gulp.dest(`${distBasePath}/assets`));
});

gulp.task('babel', () => {
  return gulp.src('app/scripts.babel/**/*.js')
      .pipe($.babel({
        presets: ['es2015']
      }))
      .pipe(gulp.dest(`${distBasePath}/scripts`));
});

gulp.task('lib', () => {
  return gulp.src(['app/scripts.lib/**/*.js']).pipe(gulp.dest(`${distBasePath}/scripts/lib`));
});

gulp.task('less', () => {
  let autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });
  return gulp.src(['app/styles.less/*.less'])
    .pipe($.less({
      plugins: [autoprefix]
    }))
    .pipe(gulp.dest(`${distBasePath}/styles`));
});

gulp.task('ublock', () => {
  return gulp.src(['app/scripts.ublock/**/*.js'])
    .pipe(gulp.dest(`${distBasePath}/scripts/ublock`));
});

gulp.task('platform', () => {
  switch (platformName) {
    case 'chromium':
    case 'opera':
      console.log('platform');
      return gulp.src('app/platform/chromium/**/*.js')
        // .pipe($.babel({
        //   presets: ['es2015']
        // }))
        .pipe(gulp.dest(`${distBasePath}/scripts`));
    case 'firefox':
      console.log('firefox');
      break;
    case 'safari':
      console.log('safari');
  }
});

gulp.task('clean', del.bind(null, ['.tmp', `build/${platformName}/mass-fair-ads`]));

gulp.task('clean2', del.bind(null, ['app/scripts', 'app/styles', 'app/manifest.json']));

gulp.task('compile', ['lint', 'babel', 'lib', 'ublock', 'platform', 'less', 'makeManifest']);


gulp.task('watch', ['compile'], () => {
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

  gulp.watch(['app/scripts.babel/**/*.js', `app/platform/${platformName}/*.js`], ['lint', 'babel']);
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
      .pipe($.zip(`mass-fair-ads-${manifest.version}.zip`))
      .pipe(gulp.dest('package'));
});

gulp.task('build', (cb) => {
  distBasePath = `build/${platformName}/mass-fair-ads`;
  runSequence('lint', 'babel', 'html', 'buildManifest', 'lib', 'ublock', 'platform', 'less', 'images', 'locales', 'fonts', 'assets', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});

gulp.task('mytask', ['clean2'], () => {
  runSequence('compile');
});
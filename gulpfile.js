var gulp = require('gulp'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    pug = require('gulp-pug'),
    data = require('gulp-data'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    csscomb = require('gulp-csscomb'),
    prettify = require('gulp-html-prettify'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    plumber = require('gulp-plumber'),
    plumberNotifier = require('gulp-plumber-notifier');

// De-caching for Data files
function requireUncached( $module ) {
    delete require.cache[require.resolve( $module )];
    return require( $module );
}

gulp.task('style:build', function(){
    gulp.src('app/sass/style.sass')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(prefix())
    .pipe(csscomb())
    .pipe(gulp.dest('app/css/'))
    .pipe(reload({stream: true}))
});

gulp.task('html:build', function(){
    gulp.src('app/templates/*.pug')
    .pipe(data(function(file){
        return requireUncached('./app/templates/data/data.json')
    }))
    .pipe(plumber())
    .pipe(plumberNotifier())
    .pipe(pug())
    .pipe(prettify())
    .pipe(gulp.dest('app/'))
    .pipe(reload({stream: true}))
});

gulp.task('js:build', function(){
    gulp.src(['app/js/*.js', '!app/js/*min.js'])
        .pipe(plumber())
        .pipe(plumberNotifier())
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest('app/js'))
        .pipe(reload({stream: true}))
});

gulp.task('build', ['html:build', 'js:build', 'style:build']);

gulp.task('webserver', function (){
    browserSync({
        server: {
            baseDir: "app/"
        },
        port: 8080,
        open: true,
        notify: false
    });
});

gulp.task('watch', function(){
    gulp.watch('app/sass/**/*.sass', ['style:build']);
    gulp.watch('app/templates/**/*.pug', ['html:build']);
    gulp.watch('app/js/*.js', ['js:build']);
    gulp.watch('app/templates/data/**/*.json', ['html:build']);
});

gulp.task('default', ['build', 'webserver', 'watch']);
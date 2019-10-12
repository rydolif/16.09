var syntax        = 'sass'; // Syntax: sass or scss;

var gulp          = require('gulp'),
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'),
		browsersync   = require('browser-sync'),
		concat        = require('gulp-concat'),
		uglify        = require('gulp-uglify'),
		cleancss      = require('gulp-clean-css'),
		rename        = require('gulp-rename'),
		autoprefixer  = require('gulp-autoprefixer'),
		notify        = require("gulp-notify"),
		rsync         = require('gulp-rsync'),
		svgstore      = require('gulp-svgstore'),
		svgmin        = require('gulp-svgmin'),
		cheerio       = require('gulp-cheerio'),
		rename        = require('gulp-rename'),
		plumber       = require('gulp-plumber');

gulp.task('browser-sync', function() {
	browsersync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// tunnel: true,
		// tunnel: "projectname", //Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('minstyles', function() {
	return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
	.pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browsersync.reload( {stream: true} ))
});


gulp.task('styles', function() {
	return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
	.pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(gulp.dest('app/css'))
	.pipe(browsersync.reload( {stream: true} ))
});

gulp.task('minjs', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',  			//----jquery
		'app/libs/jquery.validate.js', 					//----форма
		'app/libs/jquery.mask.min.js', 					//----форма
		'app/libs/jquery.popupoverlay.js', 				//----модалки
		// 'app/libs/slick/slick.js', 					//----слайдер
		 // 'app/libs/flipclock/flipclock.js',
		'app/libs/swiper/swiper.min.js', 			//----слайдер
		'app/libs/fancybox/jquery.fancybox.js', 		//----картінка прикліку
		// 'app/libs/jquery.spincrement.min.js', 		//----цифри анімованні
		// 'app/libs/isotope.pkgd.min.js', 				//----сетка елементов + фильтр
		'app/js/common.js', // Always at the end
		])
	.pipe(plumber())
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browsersync.reload({ stream: true }))
});


gulp.task('js', function() {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',  			//----jquery
		'app/libs/jquery.validate.js', 					//----форма
		'app/libs/jquery.mask.min.js', 					//----форма
		'app/libs/jquery.popupoverlay.js', 				//----модалки
		'app/libs/swiper/swiper.min.js', 			//----слайдер
		// 'app/libs/fancybox/jquery.fancybox.js', 		//----картінка прикліку
		// 'app/libs/jquery.spincrement.min.js', 		//----цифри анімованні
		'app/libs/lazy.js',
		'app/js/common.js', // Always at the end
	])
	.pipe(plumber())
	.pipe(concat('scripts.js'))
	.pipe(gulp.dest('app/js'))
	.pipe(browsersync.reload({ stream: true }))
});


gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('watch', ['minstyles', 'minjs', 'styles', 'js', 'browser-sync'], function() {
	gulp.watch('app/'+syntax+'/**/*.'+syntax+'', ['styles']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);	
	gulp.watch('app/'+syntax+'/**/*.'+syntax+'', ['minstyles']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['minjs']);
	gulp.watch('app/*.html', browsersync.reload)
});

//--------------------------------svg-sprite-----------------------------
gulp.task('symbols', function() {
  return gulp.src('app/img/icon/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(cheerio({
      run: function($) {
        $('[fill]').removeAttr('fill');
        $('[style]').removeAttr('style');
        $('[class]').removeAttr('class');
        $('title').remove();
        $('defs').remove();
        $('style').remove();
        $('svg').attr('style', 'display:none');
      }
    }))
    .pipe(rename('symbols.html'))
    .pipe(gulp.dest('app/img'));
});

gulp.task('default', ['watch']);

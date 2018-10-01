var gulp     	 = require('gulp'),
	babel 		 = require("gulp-babel"),
	sass    	 = require('gulp-sass'),
	csscomb 	 = require('gulp-csscomb'),
	server    	 = require('browser-sync'),
	rsync 		 = require('gulp-rsync'),
	plumber 	 = require('gulp-plumber'),
	uglify   	 = require('gulp-uglify'),
	rigger 		 = require('gulp-rigger'),
	concat       = require('gulp-concat'),
	rename   	 = require('gulp-rename'),
	imagemin 	 = require('gulp-imagemin'),
	pngquant 	 = require('imagemin-pngquant'),
	cache    	 = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	iconfont 	 = require('gulp-iconfont'),
	sourcemaps	 = require('gulp-sourcemaps'),
	del 		 = require('del');

var autoprefixerList = [
	'Chrome >= 45',
	'Firefox ESR',
	'Edge >= 12',
	'Explorer >= 10',
	'iOS >= 9',
	'Safari >= 9',
	'Android >= 4.4',
	'Opera >= 30'
];

/*--------------------------------------------------------------
# Paths
--------------------------------------------------------------*/

var dist = 'dist/',
 	src  = 'app/';

var path = {
	build: {
		html:  		dist,
		styles:   	dist + 'css/',
		stylesLib:  dist + 'css/',
		scripts:    dist + 'js/',
		scriptsLib: dist + 'js/',		
		images:   	dist + 'images/',
		fonts: 		dist + 'fonts/',
		php:   		dist,
		htaccess: 	dist
	},
	src: {
		html:  		src + '*.html',
		styles: 	src + 'sass/main.scss',
		stylesLib:  src + 'sass/libs.scss',
		scripts:    [
					'!'+ src + 'js/libs.js',
					src +'js/*.js'
					],
		scriptsLib: src + 'js/libs.js',
		images: 	src + 'images/**/*.*',
		fonts: 		src + 'fonts/**/*.*',
		php: 		src + '*.php',
		htaccess: 	src + '.htaccess'
	},
	watch: {
		html:   	src + '*.html',
		styles: 	src + 'sass/**/*.scss',
		scripts:    src + 'js/**/*.js',		
		images: 	src + 'images/**/*.*',
		php: 		src + '*.php'
	},
	clean:      	dist
};

/*--------------------------------------------------------------
# Common tasks
--------------------------------------------------------------*/

gulp.task('server', function() { 
	server ({ 
		server: { 
			baseDir: dist 
		},
		notify: false 
	});
});	

gulp.task('cache', function (callback) {
	return cache.clearAll();
});	

gulp.task('default', ['watch']);

/*--------------------------------------------------------------
# Html
--------------------------------------------------------------*/

gulp.task('html', function () {
    gulp.src(path.src.html) 
    .pipe(plumber())  
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html)) 
    .pipe(server.reload({stream: true})); 
});

/*--------------------------------------------------------------
# Styles
--------------------------------------------------------------*/

gulp.task('styles', function () {
	gulp.src(path.src.styles)  
	.pipe(sourcemaps.init({loadMaps: true}))  
	.pipe(plumber())      
	.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
	//.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
	.pipe(autoprefixer({browsers: autoprefixerList}))
	//.pipe(csscomb())
	.pipe(rename({suffix: '.min'}))
	.pipe(sourcemaps.write('../maps/'))
	.pipe(gulp.dest(path.build.styles)) 
	.pipe(server.reload({stream: true}));
});

gulp.task('stylesLib', function () {
	gulp.src(path.src.stylesLib) 
	.pipe(sourcemaps.init({loadMaps: true}))        
	.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
	.pipe(autoprefixer({browsers: autoprefixerList}))
	.pipe(rename({suffix: '.min'}))
	.pipe(sourcemaps.write('../maps/'))
	.pipe(gulp.dest(path.build.stylesLib));
});	

/*--------------------------------------------------------------
# Scripts
--------------------------------------------------------------*/

/* Sourcemaps don't support rigger. If maps aren't needed, comment 1. */

gulp.task('scripts', function () {
	gulp.src(path.src.scripts)	 
	.pipe(sourcemaps.init({loadMaps: true})) //1
	//.pipe(rigger()) //2	 	
	.pipe(plumber())  
	.pipe(babel({presets: ['env']}))	
	.pipe(concat('main.min.js')) //1
	.pipe(uglify())
	//.pipe(rename({suffix: '.min'})) //2
	.pipe(sourcemaps.write('../maps/')) //1
	.pipe(gulp.dest(path.build.scripts)) 
	.pipe(server.reload({stream: true}));
});

gulp.task('scriptsLib', function () {
	gulp.src(path.src.scriptsLib) 
	//.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(rigger()) 
	.pipe(plumber()) 
	.pipe(babel({presets: ['env']}))
	//.pipe(concat('main.min.js'))
	.pipe(uglify()) 
	.pipe(rename({suffix: '.min'}))
	//.pipe(sourcemaps.write('../maps/'))
	.pipe(gulp.dest(path.build.scriptsLib));
});

/*--------------------------------------------------------------
# Images
--------------------------------------------------------------*/

gulp.task('images', function () {
	gulp.src(path.src.images) 
	.pipe(cache(imagemin({ 
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))   
	.pipe(gulp.dest(path.build.images)); 
});

/*--------------------------------------------------------------
# Fonts
--------------------------------------------------------------*/

gulp.task('fonts', function() {
	gulp.src(path.src.fonts)
	.pipe(iconfont({
		fontName: 'MyFont',
		prependUnicode: true,      
		formats: ['ttf', 'woff', 'woff2']      
	}))
	.pipe(gulp.dest(path.build.fonts));
});

/*--------------------------------------------------------------
# Php
--------------------------------------------------------------*/

gulp.task('php', function () {
    gulp.src(path.src.php) 
    .pipe(gulp.dest(path.build.php)) 
});

/*--------------------------------------------------------------
# Htaccess
--------------------------------------------------------------*/

gulp.task('htaccess', function () {
    gulp.src(path.src.htaccess) 
    .pipe(gulp.dest(path.build.htaccess)) 
});

/*--------------------------------------------------------------
# Watch
--------------------------------------------------------------*/

gulp.task('watch', ['server'], function() {
    gulp.watch(path.watch.html, ['html']);
    gulp.watch(path.watch.styles, ['styles']);
    gulp.watch(path.watch.scripts, ['scripts']);
    gulp.watch(path.watch.images, ['images']);
});

/*--------------------------------------------------------------
# Build
--------------------------------------------------------------*/

gulp.task('clean', function () {
    del.sync(path.clean);
});

gulp.task('build', [
    'clean',  
    'html',  
    'styles',
    'stylesLib',
    'scripts',
    'scriptsLib',
    'images',    
    'fonts',  
    'php',  
    'htaccess'    
]);

/*--------------------------------------------------------------
# Deploy
--------------------------------------------------------------*/

gulp.task('deploy', function() {
	gulp.src(dist + '**')
	.pipe(rsync({
		root: dist,
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',		
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});
const { src, dest, parallel, watch } = require('gulp');
const header  = require('gulp-header');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const less    = require('gulp-less');
const rename  = require('gulp-rename');
const postcss = require('gulp-postcss');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('autoprefixer');
const pkg = require('./package.json');

//设置 banner 文本：这段代码定义了一个注释文本，
//其中包含了项目名称、版本、版权信息和许可证信息。这个文本将被插入到最终生成的文件的开头。
var banner = [
    '/*!',
    ' * <%= pkg.name %> v<%= pkg.version %>',
    ' * Copyright <%= new Date().getFullYear() %> Jaxzhu, Inc.',
    ' * Licensed under the <%= pkg.license %> license',
    ' */',
    ''
].join('\n');

//这个任务用于处理 JavaScript 文件。它首先从 src/js/ 目录下选取所有的 .js 文件，然后使用 Babel 进行语法转换，接着通过 UglifyJS 进行代码压缩，最后添加上面定义的 banner，将处理后的文件保存到 dist/js/ 目录下。
function script() {
  return src('src/js/*.js')
    .pipe(babel())
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(dest('./dist/js'));
}

//这个任务用于处理 LESS 文件。它首先从 src/less/ 目录下选取所有的 .less 文件，然后通过 Less 编译为 CSS，接着使用 PostCSS 进行 CSS 后处理，包括自动添加浏览器前缀等，然后使用 CSSNano 进行 CSS 压缩，接着将文件重命名为 .min.css，最后添加上面定义的 banner，将处理后的文件保存到 dist/css/ 目录下。
function style(){
  return src('src/less/*.less')
    .pipe(less())
    .pipe(postcss([autoprefixer(['iOS >= 8', 'Android >= 4.1'])]))
    .pipe(
      cssnano({
        zindex: false,
        autoprefixer: false,
        reduceIdents: false,
        discardComments: { removeAll: true }
      })
    )
    .pipe(
      rename(function(path) {
        path.extname = '.min.css';
      })
    )
    .pipe(header(banner, { pkg: pkg }))
    .pipe(dest('./dist/css'));
}

//这个任务用于监听 src/ 目录下所有文件的变化，一旦有文件发生变化，就会并行执行 script 和 style 任务。
function watchAll() {
  return watch('src/**', parallel(script, style))
}

//使用 exports 导出了 script、style 和 default 任务，其中 default 任务会在没有指定任务名称时被执行，通常用于设置默认的任务（比如这里是 watchAll）。
exports.script = script;
exports.style = style;
exports.default = watchAll;
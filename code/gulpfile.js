var gulp = require("gulp");
var shell = require("gulp-shell");
var merge = require("merge-stream");
var rimraf = require("rimraf");
var runSequence = require("run-sequence");
var mocha = require("gulp-mocha");

var ts = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var path = require('path');

var nodemon = require("gulp-nodemon");

//=================================== Global Variable ===================================

// var webrootPath = "../Web/wwwroot";
// var webrootPath = "./dist/web";
// var webrootPathCopy = webrootPath + "/b";
// var tempPath = "_temp";

//=================================== Method ===================================

var tsCompiler = function(
    pathArr,
    tsconfigPath,
    sroucemapPostfix,
    targetPath,
    isUglify) {

    return gulp.src(pathArr)
        .pipe(sourcemaps.init())
        .pipe(ts(ts.createProject(tsconfigPath)))
        .js
        //.pipe(uglify())
        .pipe(sourcemaps.write("./", {
            includeContent: false,
            sourceRoot: function(file) {
                var arr = file.relative.split("/");
                var prefix = "";
                for (var i = 0; i < arr.length; i++) {
                    prefix += "../";
                }
                return prefix + sroucemapPostfix;
            }
        }))
        .pipe(gulp.dest(targetPath));
};

var getCopyFilesPipe = (sourcePatten, targetPath) => {

    return gulp.src(sourcePatten)
        .pipe(gulp.dest(targetPath));

};

//=================================== Tasks ===================================

gulp.task("clean", (cb) => {

    rimraf("./_temp", () => {
        rimraf("./test", () => {
            rimraf("./dist", cb);
        });
    });

});

gulp.task("copyAssetsToDist", () => {

    var m = merge();

    var webAsset = gulp.src([
        "./src/web/**/*.html",
        "./src/web/**/*.css",
    ]).pipe(gulp.dest("./dist/node/web/"));
    m.add(webAsset);

    var clientAsset = gulp.src([
        "./src/client/**/*.html",
        "./src/client/**/*.css",
    ]).pipe(gulp.dest("./dist/system/script/client/"));
    m.add(clientAsset);

    var angular2 = gulp.src([
        "./node_modules/angular2/**/*.js",
        "./node_modules/angular2/**/*.js.map"
    ]).pipe(gulp.dest("./dist/system/scripts/node_modules/angular2/"));
    m.add(angular2);

    var system = gulp.src("./node_modules/systemjs/dist/**/*.*")
        .pipe(gulp.dest("./dist/system/scripts/node_modules/systemjs/dist/"));
    m.add(system);

    var rxjs = gulp.src("./node_modules/rxjs/**/*.js")
        .pipe(gulp.dest("./dist/system/scripts/node_modules/rxjs/"));
    m.add(rxjs);

    var es6Shim = gulp.src("./node_modules/es6-shim/**/*.js")
        .pipe(gulp.dest("./dist/system/scripts/node_modules/es6-shim/"));
    m.add(es6Shim);

    return m;

});

gulp.task("copyTestToDist", () => {

    var m = merge();

    var all = gulp.src([
        "./test/**/*",
        "!./test/node/common.test{,/**/*}",
        "!./test/node/web.test{,/**/*}",
        "!./test/system/scripts/client.test{,/**/*}",
    ]).pipe(gulp.dest("./dist"));
    m.add(all);

    return m;

});

gulp.task('ts_compile_es6_test', () => {

    var m = merge();

    var tsWeb = tsCompiler(
        [
            "./src/web/**/*.ts",
        ],
        "tsconfig_es6_commonjs.json",
        "src/web",
        "./test/node/web",
        false
    );
    m.add(tsWeb);

    var tsCommon = tsCompiler(
        [
            "./src/common/**/*.ts",
        ],
        "tsconfig_es6_commonjs.json",
        "src/common",
        "./test/node/common",
        false
    );
    m.add(tsCommon);

    var tsCommonTest = tsCompiler(
        [
            "./src/common.test/**/*.ts",
        ],
        "tsconfig_es6_commonjs.json",
        "src/common.test",
        "./test/node/common.test",
        false
    );
    m.add(tsCommonTest);

    var tsClient = tsCompiler(
        [
            "./src/client/**/*.ts",
        ],
        "tsconfig_es6_commonjs.json",
        "src/client",
        "./test/system/scripts/client",
        false
    );
    m.add(tsClient);

    var tsClientTest = tsCompiler(
        [
            "./src/client.test/**/*.ts",
        ],
        "tsconfig_es6_commonjs.json",
        "src/client.test",
        "./test/system/scripts/client.test",
        false
    );
    m.add(tsClientTest);

    var tsClientCommon = tsCompiler(
        [
            "./src/common/**/*.ts",
        ],
        "tsconfig_es6_commonjs.json",
        "src/common",
        "./test/system/scripts/common",
        false
    );
    m.add(tsClientCommon);

    return m;

});

gulp.task('ts_compile_es6_dist', () => {

    var m = merge();

    var tsWeb = tsCompiler(
        [
            "./src/web/**/*.ts",
        ],
        "tsconfig_es6_commonjs.json",
        "src/web",
        "./dist/node/web",
        false
    );
    m.add(tsWeb);

    var tsCommon = tsCompiler(
        [
            "./src/common/**/*.ts",
        ],
        "tsconfig_es6_commonjs.json",
        "src/common",
        "./dist/node/common",
        false
    );
    m.add(tsCommon);

    var tsClient = tsCompiler(
        [
            "./src/client/**/*.ts",
        ],
        "tsconfig_es6_systemjs.json",
        "src/client",
        "./dist/system/scripts/client",
        false
    );
    m.add(tsClient);

    var tsClientCommon = tsCompiler(
        [
            "./src/common/**/*.ts",
        ],
        "tsconfig_es6_systemjs.json",
        "src/common",
        "./dist/system/scripts/common",
        false
    );
    m.add(tsClientCommon);

    return m;

    

});

gulp.task("test_node", function() {

    return gulp.src(
        [
            "./test/**/*.spec.js"
        ], {
            read: false
        })
        .pipe(mocha({
            reporter: "spec"
        }));

});

gulp.task("default", (cb) => {
    runSequence(
        "clean",
        [
            "ts_compile_es6_test",
            "ts_compile_es6_dist",
            "copyAssetsToDist",
        ],
        [
            "test_node",
        ],
        cb
    );
});

gulp.task("server", () => {

    var serverfilePath = "./dist/node/web/server.js";

    nodemon({
        script: serverfilePath,
        ext: "html js",
        env: {
            "NODE_ENV": 'development',
            "port": 1236
        }
        //ignore: ["ignored.js"],
        //tasks: ["lint"] ,
    }).on("restart", () => {
        console.log("restarted!")
    });

});



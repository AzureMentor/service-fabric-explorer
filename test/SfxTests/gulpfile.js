//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

/// <reference path="../../src/sfx/app/scripts/common/constants.ts" />
/// <binding BeforeBuild="build" />

var gulp = require("gulp");
var plugins = require("gulp-load-plugins")({
    pattern: ["*", "!protractor", "!bower", "!typescript"],
    camelize: true,
    lazy: true
});

//-----------------------------------------------------------------------------
// Paths
//-----------------------------------------------------------------------------

// Base paths
var paths = {
    webroot: "wwwroot/"
};

// Specs
paths.specs = {
    ut: {
        src: "App/ut/**/*.ts",
        tsConfig: "App/ut/tsconfig.json",
        target: "ut.specs.js",
        dest: paths.webroot
    }
};

//-----------------------------------------------------------------------------
// Build tasks
//-----------------------------------------------------------------------------

gulp.task("build-ut", function () {
    return buildSpec(paths.specs.ut);
});

function buildSpec(path) {
    var tsProject = plugins.typescript.createProject(path.tsConfig, { outFile: path.target });

    return tsProject.src()
        .pipe(plugins.sourcemaps.init())
        .pipe(tsProject())
        .pipe(plugins.sourcemaps.write(".", { includeContent: true }))
        .pipe(gulp.dest(path.dest));
}

//-----------------------------------------------------------------------------
// Clean tasks
//-----------------------------------------------------------------------------
gulp.task("clean", function (done) {
    plugins.del.sync([paths.webroot, "results"]);
    done();
});

gulp.task("clean-build", gulp.parallel("clean", "build-ut"));

//-----------------------------------------------------------------------------
// Watch tasks
//-----------------------------------------------------------------------------
gulp.task("watch-test", gulp.series("clean-build", function (done) {
    gulp.watch(paths.specs.ut.src, ["build-ut"]);
    done();
}));

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

// For debugging purposes
gulp.task("karma", function (done) {
    launchKarma(false, done);
});

// Run unit tests
gulp.task("ut", gulp.series("build-ut", function (done) {
    launchKarma(true, done, ["Chrome", "IE"], ["spec", "html"]);    
}));

gulp.task("automation:unittests", gulp.series("build-ut", function (done){
    launchKarma(true, done, ["Chrome_without_security"], ["spec", "junit"]);
}));

function launchKarma(singleRun, done, browsers, reporters) {
    new plugins.karma.Server({
        configFile: __dirname + "/karma.conf.js",
        browsers: browsers,
        reporters: reporters,
        singleRun: singleRun
    }, function (err) {
        done();
        process.exit(err ? 1 : 0);
    }).start();

    done();
}
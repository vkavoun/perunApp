"use strict";

var gulp = require("gulp");
var compass = require("gulp-sass");
var esperanto = require("esperanto");
var map = require("vinyl-map");
var jetpack = require("fs-jetpack");

var utils = require("./utils");

var projectDir = jetpack;
var srcDir = projectDir.cwd("./app");
var destDir = projectDir.cwd("./build");

var paths = {
    jsCodeToTranspile: [
        "app/**/*.js",
        "!app/node_modules/**",
        "!app/bower_components/**",
        "!app/vendor/**"
    ],
    toCopy: [
        "app/node_modules/**",
        "app/bower_components/**",
        "app/vendor/**",
        "app/**/*.html"
    ],
}

// -------------------------------------
// Tasks
// -------------------------------------

gulp.task("clean", function(callback) {
    return destDir.dirAsync(".", { empty: true });
});


var copyTask = function () {
    projectDir.copy("resources/icon.png", destDir.path("icon.png"), { overwrite: true });

    return projectDir.copyAsync("app", destDir.path(), {
        overwrite: true,
        matching: paths.toCopy
    });
};
gulp.task("copy", ["clean"], copyTask);
gulp.task("copy-watch", copyTask);


var transpileTask = function () {
    return gulp.src(paths.jsCodeToTranspile)
    .pipe(map(function(code, filename) {
        try {
            var transpiled = esperanto.toAmd(code.toString(), { strict: true });
        } catch (err) {
            throw new Error(err.message + " " + filename);
        }
        return transpiled.code;
    }))
    .pipe(gulp.dest(destDir.path()));
};
gulp.task("transpile", ["clean"], transpileTask);
gulp.task("transpile-watch", transpileTask);


var sassTask =function() {
    return gulp.src("./app/styles/*.scss")
        .pipe(compass({
            config_file: "./compass-config.rb",
            css: "./build/styles",
            sass: "./app/styles"
        })).pipe(gulp.dest(destDir.path("styles")));
};

gulp.task("compass", ["clean"], sassTask);
gulp.task("compass-watch", sassTask);


// Add and customize OS-specyfic and target-specyfic stuff.
gulp.task("finalize", ["clean"], function () {
    var manifest = srcDir.read("package.json", "json");
    switch (utils.getEnvName()) {
        case "production":
            // Hide dev toolbar if doing a release.
            manifest.window.toolbar = false;
            break;
        case "test":
            // Add "-test" suffix to name, so NW.js will write all
            // data like cookies and locaStorage into separate place.
            manifest.name += "-test";
            // Change the main entry to spec runner.
            manifest.main = "spec.html";
            break;
        case "development":
            // Add "-dev" suffix to name, so NW.js will write all
            // data like cookies and locaStorage into separate place.
            manifest.name += "-dev";
            break;
    }
    destDir.write("package.json", manifest);

    var configFilePath = projectDir.path("config/env_" + utils.getEnvName() + ".json");
    destDir.copy(configFilePath, "env_config.json");
});


gulp.task("watch", function () {
    gulp.watch(paths.jsCodeToTranspile, ["transpile-watch"]);
    gulp.watch(paths.toCopy, ["copy-watch"]);
    gulp.watch("app/**/*.scss", ["compass-watch"]);
});


gulp.task("build", ["transpile", "compass", "copy", "finalize"]);

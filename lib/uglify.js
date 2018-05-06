const Uglify = require("uglify-js");

const logger = require("./utils/logger");

const file = require("./utils/file");

const fs = require("fs");

const path = require("path");

const Zip = require("../lib/zip");

const CachingVersion = require("./caching-version");

const zip = new Zip();

const U = function (params, config) {

    this.params = params;

    this.config = config.uglify || {};

    this.versionCacheTarget = path.join(config.cacheFolder, path.basename(this.config.out) + ".json");

    this.cachingVersion = new CachingVersion(this.versionCacheTarget);

    this.input = [];

    this.task = [];

};

const proto = {

    constructor: U

};

proto.js = function () {

    this.input = file.eachReadFile(this.config.cwd);

};

proto.findInSpecify = function (str) {

    let specify = (this.config.concat || {}).specify || [];

    return specify.find((item) => {

        for (let key in item) {

            if (item[key].indexOf(str) > -1) return true;
        }

    });

};

proto.mapConcatFiles = function () {

    let name = "main";

    let config = this.config;

    this.concat = {};

    let normal = {};

    name = (config.concat || {}).name || "main";

    normal[name] = [];

    if (config.concat) {

        this.concat.specify = config.concat.specify || [];

        this.concat.specify.push(normal);
    }

    this.input.forEach((input) => {

        if (!config.concat) return;

        let except = config.except || [];

        if (except.indexOf(input.name) > -1 || except.indexOf(input.dir) > -1) return;

        if (this.findInSpecify(input.name + ".js") || this.findInSpecify(input.dir)) return;

        normal[name].push(input.dir);

    });

};

proto.filterByCacheVersion = function () {

    for (let pos = 0; pos <= this.task.length; pos ++) {

        let isModify = false;

        if(this.task[pos] === void 0) return;

        let taskName = Object.keys(this.task[pos]);

        this.task[pos][taskName].forEach((src) => {

            if (this.cachingVersion.isModify(src)) {

                isModify = true;

            }

        });
        if (!isModify) {

            this.task.splice(pos--, 1);

        }

    }

}

proto.getTask = function () {

    let config = this.config;

    if (config.concat) {

        for (let pos in this.concat.specify) {

            let specify = this.concat.specify[pos];

            for (let src in specify) {

                specify[src].forEach((child, index) => {

                    let originalPath = (this.input.find((input) => {

                        if (input.name + ".js" === child || input.name === child || input.dir === child) {

                            return true;

                        }
                    }) || {}).dir;

                    if (originalPath) specify[src][index] = originalPath;

                });

            }
        }

        this.task = this.config.concat.specify;

    }
    else {

        this.input.forEach((input) => {

            let src = input.dir;

            let out = path.join(this.config.out, src.split(this.config.cwd)[1]);

            this.task.push({

                [out]: [src]

            });

        });

    }

    let increment = this.params.increment;

    if (increment) {

        this.filterByCacheVersion();

    }
};

proto.minify = function (target, data, list) {

    let result = Uglify.minify(data);

    this.writeln(result, target, list);

};

proto.readSrcFilesSync = function () {

    if (this.task.length === 0) {

        logger.info("Finished build:js,no files has been processed!");

        return;
    }

    this.task.forEach((specify) => {

        let arr = Object.keys(specify);

        let target = arr[0];

        if (!path.isAbsolute(target)) {

            target = path.join(this.config.out, arr[0] + ".js");

        }

        let readData = {};

        let list = specify[arr[0]];

        list.forEach((src) => {

            readData[path.basename(src)] = fs.readFileSync(src, "utf8");

        });

        this.minify(target, readData, list);

    });

}

proto.writeln = function (result, out, list) {

    if (result.error) {

        logger.error("Error in " + path.basename(out) + " >>>>>\n" + result.error);

        process.exit();

    }
    if (result.code) {

        if (!fs.existsSync(path.dirname(out))) file.mkdirSync(path.resolve(path.dirname(out)));

        fs.writeFileSync(out, result.code, "utf8");

        list.forEach((cwd) => {

            this.cachingVersion.update(cwd);

        });

        logger.log(JSON.stringify(list) + "--> " + out);
    
        if(this.config.zip){
        
            zip.folder(this.config.out,path.join(path.dirname(this.config.out),this.config.zip.target));
            
            //file.rmdirSync(this.config.out);
        
        }

    }

};

proto.work = function () {

    logger.info("Starting build:js,hold on...");

    this.startTime = Date.now();

    this.getTask();

    this.readSrcFilesSync(this.task);

    if(this.task.length !== 0){

        logger.info("Uglify successful,use " + (Date.now() - this.startTime) + "ms");

    }

};

proto.start = async function () {

    this.js();

    this.mapConcatFiles();

    this.work();

};

U.prototype = proto;

module.exports = function (config) {

    return function (params) {

        let u = new U(params, config);

        u.start();

    };
};
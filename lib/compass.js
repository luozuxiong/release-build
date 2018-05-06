const exec = require("child_process").exec;

const file = require("./utils/file");

const logger = require("./utils/logger");

const Zip = require("../lib/zip");

const path = require("path");

const Compass = function (params,config) {

    this.params = params;

    this.config = config.compass;

    this.zip = new Zip(config);


};

var proto = {
    
    constructor : Compass
    
};

proto.getArvg = function() {

    var
        watch = this.params.watch || false,

        force = this.params.increment || false,

        style = this.params.mode || this.config.mode,

        arvgs = "";

    if(watch) arvgs += " watch";

    else {

       arvgs += "compile ";

       arvgs += force ? " --force " : " ";

    }

    arvgs += " --output-style " + style;

    return arvgs;
}

proto.start = function() {

    let bin = "compass ";

    let execOpts = {

      cwd : this.config.cwd

    };

    this.start = Date.now();

    logger.info("Starting compass:sass ...");

    console.log(bin + this.getArvg())

    exec(bin + this.getArvg(),execOpts,this.callback.bind(this));
};

proto.callback = function (error, stdout, stderr) {

    if(error){

        logger.error(error);

        process.exit();
    }
    else {

        logger.log(stdout);

        logger.info("Finished compass:sass,after " + (Date.now() - this.start) + "ms!");

        if(this.config.zip){

            this.zip.folder(path.join(this.config.cwd,"stylesheets"),this.config.zip.target);

        }
        else{

            file.copySync(path.join(this.config.cwd,"stylesheets") ,path.join(this.config.out,"stylesheets"));

        }

    }

}

Compass.prototype = proto;

module.exports = function (config) {

    return function(params){

        var compass = new Compass(params,config);

        compass.start();
    }
};
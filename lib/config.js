const path = require("path");

const fs = require("fs");

const logger = require("./utils/logger");

const root = process.cwd().indexOf("bin") > -1 ? path.resolve(process.cwd(),"..") : process.cwd();

const public = path.join(root,"public");

const release = path.join(root,"release");

const cacheFolder = path.join(root,".release-cache");

let client = {};

try{
    let dir = path.join(root,"release.json");
    
    client = JSON.parse(fs.readFileSync(dir,"utf8"));
}
catch (ex) {
    logger.info("not found release config !");
}

let config = {

    root : root,
    
    public : public,
    
    release : release,

    cacheFolder : cacheFolder,
    
    compass : {

        mode : "expanded",

        cwd : path.join(public,"css"),

        out : path.join(release,"css"),

        zip : {
            target : path.join(release,"css.zip")
        }
    },
    uglify : {

        cwd : path.join(public,"javascript"),

        out : path.join(release,"javascript"),

        zip : {
            
            target : path.join(release,"js.zip")
            
        }
    },

    image : {

        cwd : path.join(public,"images"),

        out : path.join(release,"images"),

        type : "{jpg,png}",

        quality : "65-80"
    }
};

config.compass = Object.assign(config.compass,(client.compass || {}));

config.uglify = Object.assign(config.uglify,(client.uglify || {}));

config.image = Object.assign(config.image,(client.image || {}));

module.exports = config;
const path = require("path");

const imagemin = require('imagemin');

const imageminJpegtran = require('imagemin-jpegtran');

const imageminPngquant = require('imagemin-pngquant');

const Zip = require("../lib/zip");

const logger = require("./utils/logger");

zip = new Zip();

class Image {

    constructor(params, config) {

        this.config = config.image || {};

        this.initialize();
    
    
    
    }

    initialize() {

        this.src = path.join(this.config.cwd, ("/*." + this.config.type));

    }

    start() {

        logger.info("Task -> image min start,hold on..");

        let start = Date.now();

        imagemin([this.src], this.config.out, {

            plugins: [

                imageminJpegtran(),

                imageminPngquant({quality: this.config.quality})
            ]

        }).then(images => {

            images.forEach(img => {

                let src = path.join(this.config.cwd,img.path.split(this.config.out)[1]);

                logger.log(src + " --> " + img.path);

            });

            if(this.config.zip){
                
                zip.folder(this.config.out,path.join(path.dirname(this.config.out),this.config.zip.target));
                
            }
            
            logger.info("Task image min finished "+ (Date.now() - start) +"ms!");


        }).catch(err => {

            logger.error(err);

            process.exit();

        });

    }

}

module.exports = function (config) {

    return function (params) {

        let image = new Image(params, config);

        image.start();
    }

}
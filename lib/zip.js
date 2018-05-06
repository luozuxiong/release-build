const fs = require("fs");

const path = require("path");

const archiver = require("archiver");

const file = require("./utils/file");

const logger = require("./utils/logger");

class Zip {

    constructor() {
        
    
    }

    createArchive(stream,src){

        let start = Date.now();

        let archive = archiver('zip', {
        
            zlib: { level: 1 }
        
        });
        stream.on("close", () => {
        
            logger.info("Zip folder " + src +" successful! " + (Date.now() - start) + "ms");
        
        });
    
        archive.on('error', function (err) {
        
            logger.error(err);
        
            process.exit();
        
        });
    
       archive.pipe(stream);

       return archive;
    }
    
    createWriteStream (dist){
        
        let distFolder = path.resolve(dist,"..");
        
        if(fs.existsSync(distFolder)) file.mkdirSync(distFolder);
        
        return fs.createWriteStream(dist);
        
    }
    
    folder(src,dist) {
        
        let stream = this.createWriteStream(dist);
        
        let archive = this.createArchive(stream,src);
        
        this.working(archive,src);
        
    }
    
    working(archive,src) {
        
        archive.directory(src,path.basename(src));

        archive.finalize();
    }
}

module.exports = function (  ) {
    
    let zip = new Zip();
    
    return zip;
    
};
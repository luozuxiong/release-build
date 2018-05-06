const file = require( "./utils/file" );

const fs = require( "fs" );

const path = require( "path" );

const logger = require( "./utils/logger" );

const queryString = require("querystring");

class CachingVersion {
    
    constructor( target ) {
        
        this.target = target;
        
        this.initialize();
        
    }
    
    initialize() {
        
        let dirname = path.dirname( this.target );
        
        if(!fs.existsSync( dirname )) file.mkdirSync( dirname );
        
        if(!fs.existsSync(this.target)) fs.writeFileSync(this.target,"{}","utf8");
        
    }

    getVersionStr (data,src){

        let query = (data[path.basename(src)].split("?") || [] )[1];

        let params = queryString.parse(query);

        return params.v;

    }

    getTime (date) {

        return (new Date(date)).getTime();

    }

    update( src ) {

        let

            fileName = path.basename(src),

            stat = fs.statSync(src),

            versionStr = this.getTime(stat.mtime);
        
        let cacheData = fs.readFileSync(this.target);
        
        try{
            
            if(Buffer.isBuffer(cacheData)) cacheData =  cacheData.toString();
            
            cacheData = JSON.parse(cacheData)
        }
        catch (e){

            cacheData = {};

        }
        if(!cacheData[fileName] || this.getVersionStr(cacheData,src) != versionStr){

            cacheData[fileName] = src + "?v=" + versionStr;

        }
        fs.writeFileSync(this.target,JSON.stringify(cacheData),"utf-8");
    }
    
    isModify (src){

        let cacheData = fs.readFileSync(this.target);

        let stat = fs.statSync(src);

        try{
        
            if(Buffer.isBuffer(cacheData)) cacheData =  cacheData.toString();
        
            cacheData = JSON.parse(cacheData)
        }
        catch (e){
            cacheData = {};
        }

        return this.getVersionStr(cacheData,src) != this.getTime(stat.mtime);

    }
};

module.exports = function ( target ) {
    
    const caching = new CachingVersion( target );
    
    return caching;
    
};
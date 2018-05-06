const fs = require( "fs" );

const path = require( "path" );

const though2 = require( "through2" );

const file = {
    
    eachReadFile( path , options ) {
        
        options = options || {};
        
        let ext = options.ext || ".js";
        
        return this.each( path , ext , options.filter , this.readDir );
        
    } ,
    
    each( dir , ext , filter , readFn ) {
        
        readFn = this.readDir || readFn;
        
        let data = readFn( dir );
        
        let results = [];
        
        for (let i in data) {
            
            let file = data[ i ];
            
            if(fs.statSync( path.join( dir , file ) ).isFile() && (ext === "*" || (file.indexOf( ext ) > - 1))) {
                
                if(typeof filter === "function" && ! (filter( path.join( dir , file ) ))) continue;
                
                results.push( {
                    
                    name : file.replace( ext , "" ) ,
                    
                    dir : path.join( dir , file )
                    
                } );
                
            }
            else if(fs.statSync( path.join( dir , file ) ).isDirectory()) {
                
                let fs = arguments.callee( dir + "/" + file , ext , filter , readFn );
                
                results = results.concat( fs );
                
            }
        }
        return results;
    } ,
    readDir( dir ) {
        
        return fs.readdirSync( dir );
        
    } ,
    mkdirSync( dirname ) {
        
        if(fs.existsSync( dirname )) {
            
            return true;
            
        } else {
            
            if(this.mkdirSync( path.dirname( dirname ) )) {
                
                fs.mkdirSync( dirname );
                
                return true;
                
            }
        }
    } ,
    
    copySync( src , dist , options ) {
        
        options = options || {};
        
        this.eachReadFile( src , {
            
            ext : "*" ,
            
            filter : options.filter || null
            
        } ).forEach( input => {
            
            let target = path.join( dist , input.dir.split( src )[ 1 ] );
            
            let targetPath = path.dirname( target );
            
            if(! fs.existsSync( targetPath )) this.mkdirSync( targetPath );
            
            fs.createReadStream( input.dir )
                .pipe( though2( function ( chunk , enc , callback ) {
                    this.push( chunk );
                    callback();
                } ) )
                .pipe( fs.createWriteStream( target ) );
            
            return input.dir;
            
        } );
        
    } ,
    rmdirSync( src ) {
        
        this.eachReadFile( src , {
            
            ext : "*"
            
        } ).forEach( target => {
            
            fs.unlinkSync( target.dir );
            
            if(fs.readdirSync( path.dirname( target.dir ) )) fs.rmdirSync( path.dirname( target.dir ) );
            
        } );
        
        fs.rmdirSync( src );
        
    }
};

module.exports = file;
#!/usr/bin/env node

const fs = require( "fs" );

const program = require( 'commander' );

const appInfos = require( './../package.json' );

const config = require( "../lib/config" );

const compass = require( "../lib/compass" );

const uglify = require( "../lib/uglify" );

const imagemin = require( "../lib/image-min" );

program.version( 'v' + appInfos.version )
    .description( 'output the version number' );

/**
 * compass command
 */
program
    .command( 'css' )
    
    .option( "-m --mode [mode]" , "Compile mode" )
    
    .option( "-i --increment [increment]" , "Build by increment" )
    
    .option( "-w --watch [watch]" , "Watching sass file,if changed,compiling" )
    
    .description( 'build css' )
    
    .action( compass( config ) );

/**
 * uglify command
 */
program
    .command( 'javascript' )
    
    .alias( 'js' )
    
    .option( "-i --increment [increment]" , "Build by increment" )
    
    .description( 'build js' )
    
    .action( uglify( config ) );

/**
 * image min
 */

program
    .command( 'image' )
    
    .description( 'build image' )
    
    .action( imagemin( config ) );

/**
 * build all
 */

program
    
    .command( "all" )
    
    .description( 'build css,js,image' )
    
    .option( "-m --mode [mode]" , "Compile mode" )
    
    .option( "-w --watch [watch]" , "Watching sass file,if changed,compiling" )
    
    .option( "-i --increment [increment]" , "Build by increment" )
    
    .action( params => {
        
        compass(config)(params);
        
        uglify(config)(params);
        
        imagemin(config)(params);
    
    } );

program.parse( process.argv );
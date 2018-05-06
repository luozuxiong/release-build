# release-build
Front-end resource packing tool

## Install 

Firstly,ensure compass is already installed.        

Then install the package from npm (you'll need at least Node.js 7.6.0).

`
    npm install build-release -g
`

## Usage

### Release/Compile css

`release css`

### Release javascript

`release js`

### Image min

`release image`

### Release all

`release all`

### release.json
Of course, you can also add the configuration file. We named it release.json., just like this.  
``` json
{
     "urlArgs": "1.0.0",
     "compass" : {
       "zip" : false
     },
     "uglify": {
       "concat": {
         "name": "core/main.min",
         "specify": [
           {
             "core/base.min": ["about.js"]
           }
         ],
         "except": [
           "product"
         ],
         "name-mangle" : true
       },
       "zip" : {
         "target" : "js.zip"
       }
     },
     "image" : {
       "quality" : "65-80",
       "zip" : {
         "target" : "image.zip"
       }
     }
   }```

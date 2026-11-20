// Upstream tests hard-code DevEco's macOS TypeScript path. Only redirect that
// exact dependency to the compiler's locked TypeScript package on Linux.
const Module=require('node:module'),path=require('node:path');
const original=Module._resolveFilename;
Module._resolveFilename=function(id,...rest){
 if(id==='/Applications/DevEco-Studio.app/Contents/tools/hvigor/hvigor/node_modules/typescript')id=path.resolve(process.env.PROJECT_X||path.join(__dirname,'../../project_x'),'node_modules/typescript');
 return original.call(this,id,...rest);
};

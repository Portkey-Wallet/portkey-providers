const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', '..', '/', 'dist');

const bridgeContent = fs
  .readFileSync(path.join(distPath, 'bridge-content.js'))
  .toString();

// wrap the inpage content in a variable declaration
const code = `const bridgeBundle = ${JSON.stringify(bridgeContent)}`;

fs.writeFileSync(path.join(distPath, 'bridge-bundle.js'), code, 'ascii');
console.log('bridge-script.js generated succesfully');

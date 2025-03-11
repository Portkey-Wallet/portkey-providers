const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', '..', 'dist');

const files = fs.readdirSync(distPath);

const inpageFiles = files.filter(file => file.endsWith('inpage-content.js'));

inpageFiles.forEach(file => {
  const inpageContent = fs.readFileSync(path.join(distPath, file)).toString();

  const bundleFileName = file.replace('inpage-content.js', 'inpage-bundle.js');

  const code = `const inpageBundle = ${JSON.stringify(inpageContent)}`;
  fs.writeFileSync(path.join(distPath, bundleFileName), code, 'ascii');
  console.log(`${bundleFileName} generated successfully`);
});

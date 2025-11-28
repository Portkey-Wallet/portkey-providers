import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', '..', 'dist');
const indexFilePath = path.join(__dirname, 'index.js');

const files = fs.readdirSync(distPath);
const bundleFiles = files.filter(file => file.endsWith('-bundle.js'));

bundleFiles.forEach(file => {
  const bundleContent = fs.readFileSync(path.join(distPath, file)).toString();
  const indexContent = fs.readFileSync(indexFilePath).toString();

  const combinedContent = `${bundleContent}\n${indexContent}`;

  const outputFileName = `raw-index-${file}`;
  const outputPath = path.join(distPath, outputFileName);

  fs.writeFileSync(outputPath, combinedContent, 'utf8');
  console.log(`${outputFileName} generated successfully`);
});

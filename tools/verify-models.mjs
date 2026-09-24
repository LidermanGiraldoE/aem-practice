import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const files = [
  'component-definition.json',
  'component-models.json',
  'component-filters.json',
];

files.forEach((relativePath) => {
  const filePath = path.join(root, relativePath);
  try {
    JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Invalid generated model file: ${relativePath}`);
    console.error(error.message);
    process.exitCode = 1;
  }
});

if (!process.exitCode) {
  console.log('Generated Universal Editor model files are valid.');
}

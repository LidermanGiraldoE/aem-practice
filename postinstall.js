import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const requiredPaths = [
  'scripts/__dropins__',
  'scripts/vendor/htm',
  'scripts/vendor/swiper',
  'scripts/vendor/tailwind-variants',
];

const missingPaths = requiredPaths.filter((relativePath) => (
  !fs.existsSync(path.resolve(process.cwd(), relativePath))
));

if (missingPaths.length > 0) {
  console.error(`Missing vendored drop-ins or libraries: ${missingPaths.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('Vendored drop-ins and libraries are present.');
}

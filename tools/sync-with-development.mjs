import { execFileSync } from 'node:child_process';

const currentBranch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
let developmentExists = true;
try {
  execFileSync('git', ['show-ref', '--verify', '--quiet', 'refs/heads/development'], {
    stdio: 'ignore',
  });
} catch {
  developmentExists = false;
}

if (!developmentExists && currentBranch !== 'development') {
  console.log(`Branch ${currentBranch} is not development. No files were changed.`);
}

console.log('Development sync check completed without modifying the working tree.');

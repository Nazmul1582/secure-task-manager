import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['server.js', 'scripts', 'src'];
const files = [];

function collectFiles(path) {
  const stats = statSync(path);

  if (stats.isDirectory()) {
    for (const entry of readdirSync(path)) {
      collectFiles(join(path, entry));
    }

    return;
  }

  if (path.endsWith('.js')) {
    files.push(path);
  }
}

for (const root of roots) {
  collectFiles(root);
}

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status);
  }
}


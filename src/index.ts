#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TAG_PREFIX, cwd, encoding } from './config.ts';
import { exec } from './exec.ts';
import { getParentTagHash } from './parent-tag.ts';

// Get current commit.
const origCommit = exec(`git rev-parse HEAD`);

// Ensure there is a package.json file.
const pkgJsonPath = resolve(cwd, 'package.json');
if (!existsSync(pkgJsonPath)) {
  console.error('No package.json file found!');
  process.exit(1);
}

// Extract the upcoming version.
const pkgJsonRaw = readFileSync(pkgJsonPath, { encoding });
const pkgJson = JSON.parse(pkgJsonRaw);
const { version } = pkgJson;
const tagName = `${TAG_PREFIX}${version}`;

if (!version) {
  console.error('Package has no version!');
  process.exit(1);
}

// Remove the prepare script if present. The file will be reset later to its original state.
if (pkgJson.scripts?.prepare) {
  const indent = pkgJsonRaw.match(/\n(\s+)/)?.[1] ?? '  ';
  const trailingNewLine = pkgJsonRaw.endsWith('\n') ? '\n' : '';

  delete pkgJson.scripts.prepare;
  writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, indent) + trailingNewLine);
}

// Find commit hash of previous tag.
const parentTagHash = getParentTagHash(version);

// Clean index.
exec(`git rm --cached -rf .`);

// Add files.
const filesInPackage = JSON.parse(exec(`npm pack --dry-run --json`))[0].files.map(
  (f: { path: string }) => f.path,
);
exec(`git add -f ${filesInPackage.join(' ')}`);

// Create tree.
const tree = exec(`git write-tree`);

// console.log('Written tree object as', tree);

// Create commit.
const commit = exec(
  `git commit-tree ${tree} -p ${origCommit} ${
    parentTagHash ? `-p ${parentTagHash}` : ''
  } -m "${tagName} @ ${origCommit}"`,
);

// console.log('Committed tree as', commit);

// Create version tag.
exec(`git tag "${tagName}" --annotate --message "${tagName} @ ${origCommit}" ${commit}`);

console.log('Tagged commit', commit, 'as', tagName);

// Create source tag.
exec(`git tag "${tagName}-src" --no-sign ${origCommit}`);

console.log('Tagged commit', origCommit, 'as', `${tagName}-src`);

// Restore state.
exec(`git reset`);

writeFileSync(pkgJsonPath, pkgJsonRaw, { encoding });

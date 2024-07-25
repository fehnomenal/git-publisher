import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import SemVer from 'semver/classes/semver.js';
import versionLowerThan from 'semver/functions/lt.js';
import reverseSortVersion from 'semver/functions/rsort.js';
import { TAG_PREFIX, cwd, encoding } from './config.ts';
import { exec } from './exec.ts';

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
const parentTagHash = (() => {
  // Get all tags as semver objects.
  const versions = exec(`git tag --list ${TAG_PREFIX}*`)
    .split('\n')
    .filter(Boolean)
    .map((t) => new SemVer(t.slice(TAG_PREFIX.length)));

  // Filter based on the currently publishing version.
  const nextVersion = new SemVer(version);
  const previousVersions = versions.filter((v) => versionLowerThan(v, nextVersion));

  // Find the latest previous version and build the correct tag name.
  const parentTagName = reverseSortVersion(previousVersions).map((v) => `${TAG_PREFIX}${v}`)[0];

  // If there was a tag find the hash of the corresponding commit.
  return parentTagName && exec(`git rev-list -n 1 ${parentTagName}`);
})();

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

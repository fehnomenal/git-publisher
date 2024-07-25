import SemVer from 'semver/classes/semver.js';
import versionLowerThan from 'semver/functions/lt.js';
import reverseSortVersion from 'semver/functions/rsort.js';
import { TAG_PREFIX } from './config.ts';
import { exec } from './exec.ts';

export const getParentTagHash = (version: string) => {
  // Get all tags as semver objects.
  const versions = exec(`git tag --list '${TAG_PREFIX}*'`)
    .split('\n')
    .filter(Boolean)
    .map((t) => new SemVer(t.slice(TAG_PREFIX.length)));

  const nextVersion = new SemVer(version);

  // Filter based on the currently publishing version.
  const previousVersions = versions.filter((v) => versionLowerThan(v, nextVersion));

  // Find the latest previous version and build the correct tag name.
  const parentTagName = reverseSortVersion(previousVersions).map((v) => `${TAG_PREFIX}${v}`)[0];

  // If there was a tag find the hash of the corresponding commit.
  return parentTagName && exec(`git rev-list -n 1 ${parentTagName}`);
};

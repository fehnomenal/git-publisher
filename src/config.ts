import { execSync } from 'node:child_process';

export const TAG_PREFIX = 'v';

export const encoding: BufferEncoding = 'utf-8';

export const cwd = execSync(`git rev-parse --show-toplevel`, { encoding }).trim();

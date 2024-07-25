import { execSync } from 'node:child_process';
import { cwd, encoding } from './config.ts';

export const exec = (command: string) => execSync(command, { cwd, encoding }).trim();

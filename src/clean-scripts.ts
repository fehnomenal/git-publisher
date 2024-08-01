const scriptsToDelete = [
  // NPM: https://docs.npmjs.com/cli/v10/using-npm/scripts#life-cycle-operation-order
  'prepublish',
  'preprepare',
  'prepare',
  'postprepare',

  // Yarn: https://yarnpkg.com/advanced/lifecycle-scripts#prepack-and-postpack
  'prepack',
  'postpack',

  // PNPM: https://github.com/pnpm/pnpm/blob/cb006df38cb0f102250745329ef79b7765bbab08/exec/prepare-package/src/index.ts#L16-L20
  'prepublish',
  'prepack',
  'publish',

  // Bun: https://github.com/oven-sh/bun/blob/e585f900c9c8c6b97d8ec36c941f7cb0de38685f/src/install/lockfile.zig#L2917-L2921
  'preprepare',
  'prepare',
  'postprepare',
];

export const cleanScriptsIfNecessary = (pkgJsonScripts: Record<string, unknown> | undefined) => {
  if (!pkgJsonScripts) {
    return false;
  }

  let scriptRemoved = false;

  for (const script of scriptsToDelete) {
    if (pkgJsonScripts[script]) {
      delete pkgJsonScripts[script];

      scriptRemoved = true;
    }
  }

  return scriptRemoved;
};

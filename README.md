# @fehnomenal/git-publisher

Tired of needing to have an account to publish node modules?

Why not use the git repository of the code to also serve the built code?

Inspired by [npm2git](https://conduitry.dev/npm2git) but adjusted to my personal opinions:

The script will attach the files that would be packaged with `npm pack` to "external" commits and tag them with the schema `v${VERSION}` where `${VERSION}` is the current version string of your `package.json`.
Each of those commits will have the "source" commit and commit of the previously published version as its parents. Additionally, the "source" commit is tagged with `v${VERSION}-src`.

// TODO: Example with image of git log.

> In the meantime look at this repo. This shit publishes itself.

## Installation

Choose the one for your package manager.

```sh
npm install -D 'github:fehnomenal/git-publisher#semver:v1.0.3'
```

```sh
yarn install -D 'github:fehnomenal/git-publisher#semver:v1.0.3'
```

```sh
pnpm install -D 'github:fehnomenal/git-publisher#semver:v1.0.3'
```

```sh
bun add -D 'github:fehnomenal/git-publisher#semver:v1.0.3'
```

## Usage

Set as a `script` in your `package.json`. For example:

```json
{
  "scripts": {
    "publish": "release-git"
  }
}
```

Build your package and bump the `version` accordingly.
Then call the `publish` (or however you named it) script and push tags.

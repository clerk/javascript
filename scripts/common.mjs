import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { peerDependencies } = require('../packages/elements/package.json');

export const constants = {
  ChangesetConfigFile: '.changeset/config.json',
  ElementsPackageJson: 'packages/elements/package.json',
  ElementsPeerDependencies: peerDependencies,
};

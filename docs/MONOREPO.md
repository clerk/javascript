# Monorepo setup

The current monorepo setup is based on:
- [Lerna](https://github.com/lerna/lerna) used mostly for task running and versioning.
- [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) used for package linking.

## A note on commit messages 
The processes required for Lerna to manage releases and changelogs is done through the [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## TODOs / Next steps
- Add [turborepo](https://turborepo.org/docs/guides/migrate-from-lerna) for performance optimizations.
- Add GitHub releases using the `--create-release` option.
- Document the process for `beta` and `pre` versions.
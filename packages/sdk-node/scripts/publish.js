const { argv } = require('process');
const utils = require('util');
const exec = utils.promisify(require('child_process').exec);

async function publish(publishType) {
  if (!publishType || !publishType.match(/major|minor|patch/)) {
    console.error(
      'Invalid publish type: Available types are major|minor|patch'
    );
    process.exit(1);
  }

  try {
    /* 1.  Make sure the bump type is correct */
    await exec(`npm version ${publishType} --git-tag-version=false`);

    /* 2.  Build and test with the correct version. Building the library will also update the src/info.ts file */
    await exec('yarn build');
    await exec('yarn test');

    /* 3.  Git actions */
    await exec('git add -A');
    await exec(`git commit -am "build: ${require('../package.json').version}"`);
    await exec(`git tag -a v${require('../package.json').version} -m 'v${require('../package.json').version}'`);
    await exec('git push && git push --tags');

    /* 4. Publish to npm */
    await exec('npm publish');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

publish(argv[2]);

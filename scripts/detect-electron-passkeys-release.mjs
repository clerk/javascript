import { execFileSync } from 'child_process';
import { appendFileSync, readdirSync, readFileSync } from 'fs';

const packageJsonPath = 'packages/electron-passkeys/package.json';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf-8' }).trim();
}

function commitExists(ref) {
  try {
    git(['cat-file', '-e', `${ref}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}

function hasDiff(before, sha, file) {
  try {
    execFileSync('git', ['diff', '--quiet', before, sha, '--', file], { stdio: 'ignore' });
    return false;
  } catch (error) {
    if (error.status === 1) {
      return true;
    }

    throw error;
  }
}

function readPackageVersion(content) {
  return JSON.parse(content).version;
}

function getPendingChangesetCount() {
  return readdirSync('.changeset').filter(file => file.endsWith('.md') && file !== 'README.md').length;
}

function setOutput(name, value) {
  const line = `${name}=${value}\n`;

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, line);
  } else {
    process.stdout.write(line);
  }
}

const sha = process.env.SHA || git(['rev-parse', 'HEAD']);
let before = process.env.BEFORE || '';

if (!before || /^0+$/.test(before) || !commitExists(before)) {
  before = `${sha}^`;
}

const currentVersion = readPackageVersion(readFileSync(packageJsonPath, 'utf-8'));
setOutput('version', currentVersion);

const pendingChangesets = getPendingChangesetCount();
if (pendingChangesets > 0) {
  console.log('Pending changesets found; skipping native production build until the Changesets release PR is merged.');
  setOutput('needs_native', 'false');
  process.exit(0);
}

if (!hasDiff(before, sha, packageJsonPath)) {
  console.log('No @clerk/electron-passkeys package.json change detected.');
  setOutput('needs_native', 'false');
  process.exit(0);
}

const previousVersion = readPackageVersion(git(['show', `${before}:${packageJsonPath}`]));

if (previousVersion === currentVersion) {
  console.log('No @clerk/electron-passkeys version change detected.');
  setOutput('needs_native', 'false');
  process.exit(0);
}

console.log(`Detected @clerk/electron-passkeys version change: ${previousVersion} -> ${currentVersion}`);
setOutput('needs_native', 'true');

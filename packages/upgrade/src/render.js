import * as readline from 'node:readline';

import chalk from 'chalk';

export function renderHeader() {
  console.log('');
  console.log(chalk.magenta.bold('>> Clerk Upgrade CLI <<'));
  console.log('');
}

export function renderText(message, color) {
  const colorFn = chalk[color] || (s => s);
  console.log(colorFn(message));
}

export function renderSuccess(message) {
  console.log(chalk.green(`✅ ${message}`));
}

export function renderError(message) {
  console.error(chalk.red(`⛔ ${message}`));
}

export function renderWarning(message) {
  console.log(chalk.yellow(`⚠️ ${message}`));
}

export function renderNewline() {
  console.log('');
}

export function renderConfig({ sdk, currentVersion, fromVersion, toVersion, versionName, dir, packageManager }) {
  console.log(`⚙️ ${chalk.bold('Upgrade config')}`);
  const versionSuffix = currentVersion ? ` ${chalk.gray(`(v${currentVersion})`)}` : '';
  console.log(`Clerk SDK: ${chalk.green(`@clerk/${sdk}`)}${versionSuffix}`);
  if (fromVersion && toVersion) {
    const versionLabel = versionName ? ` ${chalk.gray(`(${versionName})`)}` : '';
    console.log(`Upgrade: ${chalk.green(`v${fromVersion}`)} → ${chalk.green(`v${toVersion}`)}${versionLabel}`);
  }
  console.log(`Directory: ${chalk.green(dir)}`);
  if (packageManager) {
    console.log(`Package manager: ${chalk.green(packageManager)}`);
  }
  console.log('');
}

export async function promptConfirm(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(`${message} (y/n): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

export async function promptSelect(message, options) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(message);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}) ${opt.label}`);
  });

  return new Promise(resolve => {
    rl.question('Enter number: ', answer => {
      rl.close();
      const index = parseInt(answer, 10) - 1;
      if (index >= 0 && index < options.length) {
        resolve(options[index].value);
      } else {
        resolve(null);
      }
    });
  });
}

export async function promptText(message, defaultValue = '') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = defaultValue ? `${message} [${defaultValue}]: ` : `${message}: `;

  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer || defaultValue);
    });
  });
}

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function createSpinner(label) {
  let frameIndex = 0;
  let interval = null;
  let currentLabel = label;

  const start = () => {
    interval = setInterval(() => {
      process.stdout.write(`\r${spinnerFrames[frameIndex]} ${currentLabel}`);
      frameIndex = (frameIndex + 1) % spinnerFrames.length;
    }, 80);
  };

  start();

  return {
    update(newLabel) {
      currentLabel = newLabel;
    },
    stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
        process.stdout.write('\r\x1b[K');
      }
    },
    success(message) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      process.stdout.write(`\r\x1b[K${message}\n`);
    },
    error(message) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      process.stdout.write(`\r\x1b[K${message}\n`);
    },
  };
}

export function renderCodemodResults(transform, result) {
  console.log(`  ${result.ok ?? 0} file(s) modified, ${chalk.red(`  ${result.error ?? 0} errors`)}`);
  console.log('');
}

export function renderScanResults(results, docsUrl) {
  if (results.length === 0) {
    renderSuccess('No breaking changes detected!');
    console.log('');
    return;
  }

  renderWarning(`Found ${results.length} potential issue(s) to review:`);
  console.log('');

  for (const item of results) {
    console.log(chalk.bold(`- ${item.title}`));
    if (item.warning) {
      console.log(chalk.yellow('(warning - may not require action)'));
    }
    console.log(chalk.gray(`Found ${item.instances.length} instance(s):`));
    for (const inst of item.instances) {
      console.log(chalk.gray(`  ${inst.file}:${inst.position.line}:${inst.position.column}`));
    }
    const link = docsUrl && item.docsAnchor ? `${docsUrl}#${item.docsAnchor}` : null;
    if (link) {
      console.log(chalk.dim(`Migration guide: ${link}`));
    }
    console.log('');
  }
}

export function renderComplete(sdk, docsUrl) {
  console.log(chalk.green.bold(`✅ Upgrade complete for @clerk/${sdk}`));
  console.log('');
  console.log(`Review the changes above and test your application before deployment.`);
  console.log(chalk.dim(`For more information, see the migration guide: ${docsUrl}`));
}

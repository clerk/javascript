import * as readline from 'node:readline';

import chalk from 'chalk';

const gradientColors = ['#5ee7df', '#b490ca'];

const hexToRgb = hex => {
  const value = hex.replace('#', '');
  const chunk = value.length === 3 ? value.split('').map(char => char + char) : value.match(/.{2}/g);
  return chunk.map(part => parseInt(part, 16));
};

const interpolate = (start, end, t) => Math.round(start + (end - start) * t);

const applyGradient = text => {
  if (!text) {
    return '';
  }

  const rgb = gradientColors.map(hexToRgb);
  const maxIndex = text.length - 1 || 1;
  const segmentCount = rgb.length - 1;

  return text
    .split('')
    .map((char, index) => {
      const progress = index / maxIndex;
      const segment = Math.min(Math.floor(progress * segmentCount), segmentCount - 1);
      const localT = segmentCount === 0 ? 0 : progress * segmentCount - segment;
      const [r1, g1, b1] = rgb[segment];
      const [r2, g2, b2] = rgb[segment + 1] || rgb[segment];
      const r = interpolate(r1, r2, localT);
      const g = interpolate(g1, g2, localT);
      const b = interpolate(b1, b2, localT);
      return chalk.rgb(r, g, b)(char);
    })
    .join('');
};

export function renderHeader() {
  console.log('');
  const heading = [
    ' █▀▀ █   █▀▀ █▀█ █▄▀   █ █ █▀█ █▀▀ █▀█ ▄▀█ █▀▄ █▀▀',
    ' █▄▄ █▄▄ ██▄ █▀▄ █ █   █▄█ █▀▀ █▄█ █▀▄ █▀█ █▄▀ ██▄',
  ];

  heading.forEach(line => console.log(applyGradient(line)));
  console.log('');
  console.log("Hello friend! We're excited to help you upgrade Clerk modules. Before we get started, a couple");
  console.log('questions...');
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
  console.log(`🔧 ${chalk.bold('Upgrade config')}`);
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

export async function promptConfirm(message, defaultYes = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    const prompt = defaultYes ? `${message} (Y/n): ` : `${message} (y/N): `;
    rl.question(prompt, answer => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      if (!normalized) {
        resolve(defaultYes);
        return;
      }
      resolve(normalized === 'y' || normalized === 'yes');
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
      process.stdout.write(`\r\x1b[K${chalk.green('✓')} ${message}\n`);
    },
    error(message) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      process.stdout.write(`\r\x1b[K${chalk.red('✗')} ${message}\n`);
    },
  };
}

export function renderCodemodResults(transform, result) {
  console.log(`  ${result.ok ?? 0} file(s) modified, ${chalk.red(`  ${result.error ?? 0} errors`)}`);
  console.log('');
}

export function renderScanResults(results, docsUrl) {
  if (results.length === 0) {
    console.log(chalk.green('✓ No breaking changes detected!'));
    console.log('');
    return;
  }

  console.log(chalk.yellow.bold(`Found ${results.length} potential issue(s) to review:`));
  console.log('');

  for (const item of results) {
    console.log(chalk.bold(item.title));
    if (item.warning) {
      console.log(chalk.yellow('(warning - may not require action)'));
    }
    console.log(chalk.gray(`Found ${item.instances.length} instance(s):`));
    for (const inst of item.instances) {
      console.log(chalk.gray(`  ${inst.file}:${inst.position.line}:${inst.position.column}`));
    }
    const link = docsUrl && item.docsAnchor ? `${docsUrl}#${item.docsAnchor}` : null;
    if (link) {
      console.log(chalk.blue(`→ View in migration guide: ${link}`));
    }
    console.log('');
  }
}

export function renderComplete(sdk, docsUrl) {
  console.log(chalk.green.bold(`✅ Upgrade complete for @clerk/${sdk}`));
  console.log('');
  console.log(`Review the changes above and test your application before deployment.`);
  console.log(chalk.gray(`For more information, see the migration guide: ${docsUrl}`));
}

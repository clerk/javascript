import * as readline from 'node:readline';

// ANSI color codes
const colors = process.env.NO_COLOR
  ? {
      reset: '',
      bold: '',
      red: '',
      green: '',
      yellow: '',
      blue: '',
      magenta: '',
      gray: '',
    }
  : {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      gray: '\x1b[90m',
    };

export function renderHeader() {
  console.log('');
  console.log(`${colors.magenta}${colors.bold}>> Clerk Upgrade CLI <<${colors.reset}`);
  console.log('');
}

export function renderText(message, color) {
  const colorCode = colors[color] || '';
  console.log(`${colorCode}${message}${colors.reset}`);
}

export function renderSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

export function renderError(message) {
  console.error(`${colors.red}✗ ${message}${colors.reset}`);
}

export function renderWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

export function renderNewline() {
  console.log('');
}

export function renderConfig({ sdk, currentVersion, fromVersion, toVersion, versionName, dir, packageManager }) {
  console.log(
    `Clerk SDK: ${colors.green}@clerk/${sdk}${colors.reset}${currentVersion ? ` ${colors.gray}(v${currentVersion})${colors.reset}` : ''}`,
  );
  if (fromVersion && toVersion) {
    const versionLabel = versionName ? ` ${colors.gray}(${versionName})${colors.reset}` : '';
    console.log(
      `Upgrade: ${colors.green}v${fromVersion}${colors.reset} → ${colors.green}v${toVersion}${colors.reset}${versionLabel}`,
    );
  }
  console.log(`Directory: ${colors.green}${dir}${colors.reset}`);
  if (packageManager) {
    console.log(`Package manager: ${colors.green}${packageManager}${colors.reset}`);
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
        process.stdout.write('\r\x1b[K'); // Clear the line
      }
    },
    success(message) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      process.stdout.write(`\r\x1b[K${colors.green}✓${colors.reset} ${message}\n`);
    },
    error(message) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      process.stdout.write(`\r\x1b[K${colors.red}✗${colors.reset} ${message}\n`);
    },
  };
}

export function renderCodemodResults(transform, result) {
  console.log(`  ${result.ok ?? 0} file(s) modified, ${colors.red}  ${result.error ?? 0} errors${colors.reset}`);
  console.log('');
}

export function renderManualInterventionSummary(stats) {
  if (!stats) {
    return;
  }

  const userButtonCount = stats.userbuttonAfterSignOutPropsRemoved || 0;
  const hideSlugCount = stats.hideSlugRemoved || 0;
  const beforeEmitCount = stats.beforeEmitTransformed || 0;

  if (!userButtonCount && !hideSlugCount && !beforeEmitCount) {
    return;
  }

  console.log(`${colors.yellow}${colors.bold}Manual intervention may be required:${colors.reset}`);

  if (userButtonCount > 0) {
    console.log(`${colors.yellow}• Removed ${userButtonCount} UserButton sign-out redirect prop(s)${colors.reset}`);
    console.log(`${colors.gray}  To configure sign-out redirects:${colors.reset}`);
    console.log(`${colors.gray}  - Global: Add afterSignOutUrl to <ClerkProvider>${colors.reset}`);
    console.log(`${colors.gray}  - Per-button: Use <SignOutButton redirectUrl="...">${colors.reset}`);
    console.log(`${colors.gray}  - Programmatic: clerk.signOut({ redirectUrl: "..." })${colors.reset}`);
  }

  if (hideSlugCount > 0) {
    console.log(`${colors.yellow}• Removed ${hideSlugCount} hideSlug prop(s)${colors.reset}`);
    console.log(`${colors.gray}  Slugs are now managed in the Clerk Dashboard.${colors.reset}`);
  }

  if (beforeEmitCount > 0) {
    console.log(
      `${colors.yellow}• Transformed ${beforeEmitCount} setActive({ beforeEmit }) → setActive({ navigate })${colors.reset}`,
    );
    console.log(`${colors.gray}  The callback now receives an object with session property.${colors.reset}`);
  }

  console.log('');
}

export function renderScanResults(results, docsUrl) {
  if (results.length === 0) {
    console.log(`${colors.green}✓ No breaking changes detected!${colors.reset}`);
    console.log('');
    return;
  }

  console.log(`${colors.yellow}${colors.bold}Found ${results.length} potential issue(s) to review:${colors.reset}`);
  console.log('');

  for (const item of results) {
    console.log(`${colors.bold}${item.title}${colors.reset}`);
    if (item.warning) {
      console.log(`${colors.yellow}(warning - may not require action)${colors.reset}`);
    }
    console.log(`${colors.gray}Found ${item.instances.length} instance(s):${colors.reset}`);
    for (const inst of item.instances) {
      console.log(`${colors.gray}  ${inst.file}:${inst.position.line}:${inst.position.column}${colors.reset}`);
    }
    const link = docsUrl && item.docsAnchor ? `${docsUrl}#${item.docsAnchor}` : null;
    if (link) {
      console.log(`${colors.blue}→ View in migration guide: ${link}${colors.reset}`);
    }
    console.log('');
  }
}

export function renderComplete(sdk, docsUrl) {
  console.log('');
  console.log(`${colors.green}${colors.bold}✓ Upgrade complete for @clerk/${sdk}${colors.reset}`);
  console.log('');
  console.log(`Review the changes above and test your application before deployment.`);
  console.log(`${colors.gray}For more information, see the migration guide: ${docsUrl}${colors.reset}`);
}

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// if we end up storing anything else in this file, will need to extract this type
// however, this is the only place it's used at the moment.
interface ClerkConfigFile {
  telemetryNoticeVersion: string;
}

// If we make significant changes to how telemetry is collected in the future, bump this version.
const TELEMETRY_NOTICE_VERSION = '1';

function telemetryNotice() {
  console.log('╭────────────────────────────────────────────────────────────────╮');
  console.log('│ Attention: Clerk now collects telemetry data from its          │');
  console.log('│ SDKs when connected to development instances.                  │');
  console.log('│                                                                │');
  console.log("│ The data collected is used to inform Clerk's product roadmap.  │");
  console.log('│ To learn more, including how to opt-out from telemetry, visit: │');
  console.log('│                                                                │');
  console.log('│ https://beta.clerk.com/docs/telemetry.                         │');
  console.log('╰────────────────────────────────────────────────────────────────╯');
}

// Adapted from https://github.com/sindresorhus/env-paths
function getConfigDir(name: string) {
  const homedir = os.homedir();
  const macos = () => path.join(homedir, 'Library', 'Preferences', name);
  const win = () => {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const { APPDATA = path.join(homedir, 'AppData', 'Roaming') } = process.env;
    return path.join(APPDATA, name, 'Config');
  };
  const linux = () => {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const { XDG_CONFIG_HOME = path.join(homedir, '.config') } = process.env;
    return path.join(XDG_CONFIG_HOME, name);
  };
  switch (process.platform) {
    case 'darwin':
      return macos();
    case 'win32':
      return win();
    default:
      return linux();
  }
}

async function notifyAboutTelemetry() {
  const configDir = getConfigDir('clerk');
  const configFile = path.join(configDir, 'config.json');

  await fs.mkdir(configDir, { recursive: true });

  let config: ClerkConfigFile = { telemetryNoticeVersion: '0' };
  try {
    config = JSON.parse(await fs.readFile(configFile, 'utf8'));
  } catch (err) {
    // File can't be read and parsed, continue
  }

  if (parseInt(config.telemetryNoticeVersion, 10) >= parseInt(TELEMETRY_NOTICE_VERSION)) {
    return;
  }

  config.telemetryNoticeVersion = TELEMETRY_NOTICE_VERSION;

  telemetryNotice();

  await fs.writeFile(configFile, JSON.stringify(config, null, '\t'));
}

export default async function notify() {
  try {
    await notifyAboutTelemetry();
  } catch {
    // Do nothing, we don't want to log errors around a telemetry notice.
  }
}

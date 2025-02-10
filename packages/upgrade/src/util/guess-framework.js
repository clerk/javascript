import { createHash, randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { readPackageSync } from 'read-pkg';
import tempDir from 'temp-dir';

import SDKS from '../constants/sdks.js';

function md5(data) {
  return createHash('md5').update(data).digest('hex');
}

// Telemetry Note
// --------------
// We collect fully anonymous telemetry as part of this tool. The only data we send is which
// breaking changes were detected in your app scan. This data helps us to know what the most often
// encountered issues are so that we can prioritize documentation and support for these areas.
// We do not send any information from your source code or any PII as part of the telemetry.

export default function guessFrameworks(dir, disableTelemetry) {
  let pkg;
  try {
    pkg = readPackageSync({ cwd: dir });
  } catch {
    const tmpPath = path.join(tempDir, 'clerk-upgrade-uuid');
    let uuid;

    if (!disableTelemetry) {
      // if there's no package.json, create a uuid in tempfile so that multiple runs on the same app can be consolidated
      if (fs.existsSync(tmpPath)) {
        uuid = fs.readFileSync(tmpPath, 'utf8');
      } else {
        uuid = randomUUID();
        fs.writeFileSync(tmpPath, uuid);
      }
    }
    return { guesses: [], _uuid: uuid };
  }

  // if there is a package.json
  const _uuid = md5(JSON.stringify(pkg));

  // no guessing if there are no deps
  if (!pkg.dependencies && !pkg.devDependencies) {
    return { guesses: [], _uuid };
  }
  const deps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
  const devDeps = pkg.devDependencies ? Object.keys(pkg.devDependencies) : [];

  return {
    _uuid,
    guesses: SDKS.reduce((m, { label, value }) => {
      if (deps.includes(label) || devDeps.includes(label)) {
        m.push({ label, value });
      }
      return m;
    }, []),
  };
}

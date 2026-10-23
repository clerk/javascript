import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ERROR_CHARS = 300;

function flakesFromReport(report) {
  return report.run.results
    .filter(result => result.status === 'flaky')
    .map(result => ({
      platform: result.platform,
      file: result.file,
      title: result.titlePath.join(' › '),
      error: result.attempts.find(attempt => attempt.status === 'failed')?.error?.message ?? '',
    }));
}

function normalizeError(message) {
  const normalized = message
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<email>')
    .replace(/\b(user|sess|ins|app|org)_[A-Za-z0-9]+/g, '$1_<id>')
    .replace(/after launch [0-9a-f]+/g, 'after launch <id>')
    .replace(/; passes: \d+;.*$/s, '')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.length > ERROR_CHARS ? `${normalized.slice(0, ERROR_CHARS)}…` : normalized;
}

const slackText = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const mostCommon = counts => [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];

function flakyMessage(records) {
  const tests = new Map();
  for (const record of records) {
    for (const flake of record.flakes) {
      const key = `${flake.file}\n${flake.title}`;
      const test = tests.get(key) ?? { file: flake.file, title: flake.title, platforms: new Set(), errors: new Map() };
      const error = normalizeError(flake.error);
      test.platforms.add(flake.platform);
      test.errors.set(error, (test.errors.get(error) ?? 0) + 1);
      tests.set(key, test);
    }
  }
  if (tests.size === 0) {
    return '';
  }

  const runUrl = records.find(record => record.runUrl)?.runUrl;
  const count = tests.size === 1 ? '1 flaky test' : `${tests.size} flaky tests`;
  const lines = [
    `:warning: Expo E2E had ${count} on the Version packages pull request${runUrl ? ` · <${runUrl}|View the run>` : ''}`,
  ];
  const sorted = [...tests.values()].sort((a, b) => a.file.localeCompare(b.file) || a.title.localeCompare(b.title));
  for (const test of sorted) {
    const platforms = [...test.platforms].sort().join(', ');
    lines.push(`• \`${test.file.replace(/^specs\/features\//, '')}\` ${slackText(test.title)} · ${platforms}`);
    const error = mostCommon(test.errors);
    if (error !== '') {
      lines.push(`  first attempt failed: ${slackText(error)}`);
    }
  }
  return lines.join('\n');
}

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

const byDirectory = (a, b) => path.dirname(a).localeCompare(path.dirname(b), 'en', { numeric: true });

function recordStep(runsDir, outFile, env) {
  const reports = fs.existsSync(runsDir)
    ? fs
        .globSync('*/e2e*/report.json', { cwd: runsDir })
        .sort(byDirectory)
        .map(file => readJson(path.join(runsDir, file)))
    : [];
  const runUrl =
    env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID
      ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
      : null;
  const record = {
    runUrl,
    commit: env.GITHUB_SHA || (reports[0]?.run.vcs?.commit ?? null),
    flakes: reports.flatMap(flakesFromReport),
  };
  fs.writeFileSync(outFile, `${JSON.stringify(record, null, 2)}\n`);
  return record;
}

function readRecords(dir) {
  return fs
    .globSync('**/*.json', { cwd: dir })
    .sort(byDirectory)
    .map(file => {
      const record = readJson(path.join(dir, file));
      if (!Array.isArray(record?.flakes)) {
        throw new Error(`${file} is not a record of flaky tests`);
      }
      return record;
    });
}

function main(argv, env, log = console.log) {
  const [step, ...rest] = argv;
  if (step === 'record' && rest.length === 2) {
    const record = recordStep(rest[0], rest[1], env);
    log(`Recorded ${record.flakes.length} flaky tests in ${rest[1]}.`);
    return 0;
  }
  if (step === 'message' && rest.length === 1) {
    const message = flakyMessage(readRecords(rest[0]));
    if (message !== '') {
      log(message);
    }
    return 0;
  }
  log('usage: verify-flaky.mjs record <runsDir> <outFile> | message <dir>');
  return 2;
}

export { flakesFromReport, flakyMessage, main, normalizeError };

if (process.argv[1] !== undefined && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2), process.env));
}

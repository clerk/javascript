import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MOST_TESTS = 10;
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

function digestMessage(records, { runs, hours }) {
  const tests = new Map();
  for (const record of records) {
    for (const flake of record.flakes) {
      const key = `${flake.file}\n${flake.title}`;
      const test = tests.get(key) ?? {
        file: flake.file,
        title: flake.title,
        total: 0,
        platforms: new Map(),
        runs: new Set(),
        errors: new Map(),
        latestRunUrl: null,
      };
      const error = normalizeError(flake.error);
      test.total += 1;
      test.platforms.set(flake.platform, (test.platforms.get(flake.platform) ?? 0) + 1);
      test.runs.add(record.runUrl ?? record);
      test.errors.set(error, (test.errors.get(error) ?? 0) + 1);
      test.latestRunUrl = record.runUrl ?? test.latestRunUrl;
      tests.set(key, test);
    }
  }
  if (tests.size === 0) {
    return '';
  }

  const sorted = [...tests.values()].sort(
    (a, b) => b.total - a.total || a.file.localeCompare(b.file) || a.title.localeCompare(b.title),
  );
  const lines = [`:warning: Expo E2E had flaky tests in ${runs} Version packages runs over the last ${hours} hours`];
  for (const test of sorted.slice(0, MOST_TESTS)) {
    const platforms = [...test.platforms.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([platform, count]) => `${platform} ×${count}`)
      .join(', ');
    const parts = [
      `• \`${test.file.replace(/^specs\/features\//, '')}\` ${slackText(test.title)}`,
      `${test.runs.size} of ${runs} runs`,
      platforms,
    ];
    if (test.latestRunUrl !== null) {
      parts.push(`<${test.latestRunUrl}|latest run>`);
    }
    lines.push(parts.join(' · '));
    const error = mostCommon(test.errors);
    if (error !== '') {
      lines.push(`  first attempt failed: ${slackText(error)}`);
    }
  }
  if (sorted.length > MOST_TESTS) {
    lines.push(`…and ${sorted.length - MOST_TESTS} more`);
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
  const flag = name => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : undefined);
  if (step === 'record' && rest.length === 2) {
    const record = recordStep(rest[0], rest[1], env);
    log(`Recorded ${record.flakes.length} flaky tests in ${rest[1]}.`);
    return 0;
  }
  const runs = Number(flag('--runs'));
  const hours = Number(flag('--hours'));
  if (step === 'digest' && rest[0] !== undefined && Number.isInteger(runs) && Number.isInteger(hours)) {
    const message = digestMessage(readRecords(rest[0]), { runs, hours });
    if (message !== '') {
      log(message);
    }
    return 0;
  }
  log('usage: verify-flaky.mjs record <runsDir> <outFile> | digest <dir> --runs <n> --hours <h>');
  return 2;
}

export { digestMessage, flakesFromReport, main, normalizeError };

if (process.argv[1] !== undefined && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2), process.env));
}

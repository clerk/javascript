import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const MIB = 1024 * 1024;

const LIMITS = {
  zipBytes: 160 * MIB,
  manifestBytes: 16 * 1024,
  files: 50,
  videos: 1,
  imageBytes: 10 * MIB,
  videoBytes: 100 * MIB,
  totalBytes: 150 * MIB,
  pr: 9_999_999,
  tests: 10_000,
};

const ARTIFACT = 'verify-evidence';
const MANIFEST_FILE = 'manifest.json';
const SESSION_WORKFLOW = '.github/workflows/verify-remote.yml';
const MANIFEST_VERSION = 1;

const SHAPE = {
  run: /^r\d{8}-\d{6}-[0-9a-f]{4}$/,
  device: /^[A-Za-z0-9][A-Za-z0-9 ._()-]{0,63}$/,
  commit: /^[0-9a-f]{40}$/,
  sha256: /^[0-9a-f]{64}$/,
  fileName: /^[A-Za-z0-9][A-Za-z0-9._-]{0,95}\.(png|jpg|mp4)$/,
  repo: /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}\/[A-Za-z0-9._-]{1,100}$/,
  runId: /^[1-9]\d{0,19}$/,
  actor: /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}(\[bot\])?$/,
};

const MANIFEST_KEYS = ['v', 'pr', 'run', 'platform', 'device', 'commit', 'passed', 'flaky', 'total', 'files'];
const FILE_KEYS = ['name', 'bytes', 'sha256'];

class Refused extends Error {}
class Failed extends Error {}

function refuse(message) {
  throw new Refused(message);
}

const isVideo = name => name.endsWith('.mp4');

function sessionRunMismatch(run, repo) {
  if (run.event !== 'workflow_dispatch') {
    return 'it was not started by a dispatch';
  }
  if (run.path !== SESSION_WORKFLOW) {
    return `it is not a run of ${SESSION_WORKFLOW}`;
  }
  if (run.headRepo !== repo) {
    return 'it ran for another repository';
  }
  return null;
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const EOCD_BYTES = 22;
const CENTRAL_BYTES = 46;
const LOCAL_BYTES = 30;
const UINT32_MAX = 0xffffffff;
const UNIX = 3;
const S_IFMT = 0o170000;
const S_IFREG = 0o100000;

function endOfCentralDirectory(zip) {
  for (let at = zip.length - EOCD_BYTES; at >= Math.max(0, zip.length - EOCD_BYTES - 0xffff); at -= 1) {
    if (zip.readUInt32LE(at) === EOCD_SIGNATURE && at + EOCD_BYTES + zip.readUInt16LE(at + 20) === zip.length) {
      return at;
    }
  }
  return refuse('the artifact is not a zip archive');
}

function listZip(zip) {
  if (zip.length > LIMITS.zipBytes) {
    refuse(`the archive is over ${LIMITS.zipBytes} bytes`);
  }
  if (zip.length < EOCD_BYTES) {
    refuse('the artifact is not a zip archive');
  }
  const end = endOfCentralDirectory(zip);
  const count = zip.readUInt16LE(end + 10);
  const directoryBytes = zip.readUInt32LE(end + 12);
  const directoryAt = zip.readUInt32LE(end + 16);
  if (zip.readUInt16LE(end + 4) !== 0 || zip.readUInt16LE(end + 6) !== 0 || zip.readUInt16LE(end + 8) !== count) {
    refuse('the archive spans disks');
  }
  if (count === 0xffff || directoryBytes === UINT32_MAX || directoryAt === UINT32_MAX) {
    refuse('the archive is zip64');
  }
  if (count > LIMITS.files + 1) {
    refuse(`the archive has more than ${LIMITS.files + 1} entries`);
  }
  if (directoryAt + directoryBytes !== end) {
    refuse('the archive has bytes between its directory and its end record');
  }

  const entries = [];
  let at = directoryAt;
  for (let i = 0; i < count; i += 1) {
    if (at + CENTRAL_BYTES > end || zip.readUInt32LE(at) !== CENTRAL_SIGNATURE) {
      refuse('the archive directory is malformed');
    }
    const madeBy = zip.readUInt16LE(at + 4);
    const flags = zip.readUInt16LE(at + 8);
    const method = zip.readUInt16LE(at + 10);
    const crc = zip.readUInt32LE(at + 16);
    const compressedBytes = zip.readUInt32LE(at + 20);
    const bytes = zip.readUInt32LE(at + 24);
    const nameBytes = zip.readUInt16LE(at + 28);
    const extraBytes = zip.readUInt16LE(at + 30);
    const commentBytes = zip.readUInt16LE(at + 32);
    const attributes = zip.readUInt32LE(at + 38);
    const localAt = zip.readUInt32LE(at + 42);
    const next = at + CENTRAL_BYTES + nameBytes + extraBytes + commentBytes;
    if (next > end) {
      refuse('the archive directory is malformed');
    }
    const name = zip.toString('latin1', at + CENTRAL_BYTES, at + CENTRAL_BYTES + nameBytes);
    if (name !== MANIFEST_FILE && !SHAPE.fileName.test(name)) {
      refuse(`entry ${i + 1} has a name that is not allowed (a path, a directory, or another kind of file)`);
    }
    if ((flags & 0x0041) !== 0) {
      refuse(`entry ${i + 1} is encrypted`);
    }
    if (method !== 0 && method !== 8) {
      refuse(`entry ${i + 1} uses a compression method other than stored or deflate`);
    }
    if (compressedBytes === UINT32_MAX || bytes === UINT32_MAX || localAt === UINT32_MAX) {
      refuse(`entry ${i + 1} is zip64`);
    }
    const mode = attributes >>> 16;
    if ((attributes & 0x10) !== 0 || (madeBy >>> 8 === UNIX && (mode & S_IFMT) !== 0 && (mode & S_IFMT) !== S_IFREG)) {
      refuse(`entry ${i + 1} is not a regular file (a symbolic link, a directory, or a device)`);
    }
    if (
      bytes > (name === MANIFEST_FILE ? LIMITS.manifestBytes : isVideo(name) ? LIMITS.videoBytes : LIMITS.imageBytes)
    ) {
      refuse(`entry ${i + 1} is over the size cap for its kind`);
    }
    if (method === 0 && compressedBytes !== bytes) {
      refuse(`entry ${i + 1} is stored with two different sizes`);
    }
    if (entries.some(other => other.name.toLowerCase() === name.toLowerCase())) {
      refuse(`entry ${i + 1} repeats a name`);
    }
    entries.push({ name, method, crc, compressedBytes, bytes, localAt, nameBytes });
    at = next;
  }
  if (at !== end) {
    refuse('the archive directory is malformed');
  }
  if (entries.reduce((sum, entry) => sum + entry.bytes, 0) > LIMITS.totalBytes + LIMITS.manifestBytes) {
    refuse(`the archive unpacks to more than ${LIMITS.totalBytes} bytes`);
  }
  return { entries, directoryAt };
}

function readEntry(zip, entry, directoryAt) {
  const at = entry.localAt;
  if (at + LOCAL_BYTES > directoryAt || zip.readUInt32LE(at) !== LOCAL_SIGNATURE) {
    refuse('an entry does not start where the directory says');
  }
  const nameBytes = zip.readUInt16LE(at + 26);
  const dataAt = at + LOCAL_BYTES + nameBytes + zip.readUInt16LE(at + 28);
  if (
    nameBytes !== entry.nameBytes ||
    zip.toString('latin1', at + LOCAL_BYTES, at + LOCAL_BYTES + nameBytes) !== entry.name
  ) {
    refuse('an entry has one name in the directory and another beside its bytes');
  }
  if (dataAt + entry.compressedBytes > directoryAt) {
    refuse('an entry runs past the directory');
  }
  const packed = zip.subarray(dataAt, dataAt + entry.compressedBytes);
  let data;
  try {
    data =
      entry.method === 0
        ? Buffer.from(packed)
        : zlib.inflateRawSync(packed, { maxOutputLength: Math.max(entry.bytes, 1) });
  } catch {
    return refuse('an entry is corrupt, or inflates past the size the directory declares');
  }
  if (data.length !== entry.bytes) {
    refuse('an entry does not inflate to the size the directory declares');
  }
  if (zlib.crc32(data) !== entry.crc) {
    refuse('an entry fails its checksum');
  }
  return data;
}

function record(value, keys, what) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    refuse(`${what} is not an object`);
  }
  const own = Object.keys(value);
  if (own.length !== keys.length || own.some(key => !keys.includes(key))) {
    refuse(`${what} must have exactly the keys ${keys.join(', ')}`);
  }
  return value;
}

function whole(value, min, max, what) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    refuse(`${what} must be a whole number from ${min} to ${max}`);
  }
  return value;
}

function shaped(value, pattern, what) {
  if (typeof value !== 'string' || !pattern.test(value)) {
    refuse(`${what} is missing or malformed`);
  }
  return value;
}

function parseManifest(text) {
  if (Buffer.byteLength(text) > LIMITS.manifestBytes) {
    refuse(`the manifest is over ${LIMITS.manifestBytes} bytes`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return refuse('the manifest is not JSON');
  }
  const raw = record(parsed, MANIFEST_KEYS, 'the manifest');
  if (raw.v !== MANIFEST_VERSION) {
    refuse(`the manifest is not version ${MANIFEST_VERSION}`);
  }
  if (raw.platform !== 'ios' && raw.platform !== 'android') {
    refuse('platform must be ios or android');
  }
  if (!Array.isArray(raw.files) || raw.files.length < 1 || raw.files.length > LIMITS.files) {
    refuse(`files must be a list of 1 to ${LIMITS.files}`);
  }
  const files = raw.files.map((entry, i) => {
    const file = record(entry, FILE_KEYS, `file ${i + 1}`);
    const name = shaped(file.name, SHAPE.fileName, `the name of file ${i + 1}`);
    return {
      name,
      bytes: whole(file.bytes, 1, isVideo(name) ? LIMITS.videoBytes : LIMITS.imageBytes, `the size of file ${i + 1}`),
      sha256: shaped(file.sha256, SHAPE.sha256, `the sha256 of file ${i + 1}`),
    };
  });
  if (new Set(files.map(file => file.name.toLowerCase())).size !== files.length) {
    refuse('two files have the same name');
  }
  if (files.filter(file => isVideo(file.name)).length > LIMITS.videos) {
    refuse(`at most ${LIMITS.videos} video`);
  }
  if (files.reduce((sum, file) => sum + file.bytes, 0) > LIMITS.totalBytes) {
    refuse(`the files are over ${LIMITS.totalBytes} bytes in all`);
  }
  const manifest = {
    v: MANIFEST_VERSION,
    pr: whole(raw.pr, 1, LIMITS.pr, 'pr'),
    run: shaped(raw.run, SHAPE.run, 'run'),
    platform: raw.platform,
    device: shaped(raw.device, SHAPE.device, 'device'),
    commit: shaped(raw.commit, SHAPE.commit, 'commit'),
    passed: whole(raw.passed, 0, LIMITS.tests, 'passed'),
    flaky: whole(raw.flaky, 0, LIMITS.tests, 'flaky'),
    total: whole(raw.total, 1, LIMITS.tests, 'total'),
    files,
  };
  if (manifest.passed + manifest.flaky < 1 || manifest.passed + manifest.flaky > manifest.total) {
    refuse('passed and flaky must count at least one test and at most total');
  }
  return manifest;
}

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPG = Buffer.from([0xff, 0xd8, 0xff]);

function hasItsOwnLeadingBytes(name, data) {
  if (name.endsWith('.png')) {
    return data.subarray(0, PNG.length).equals(PNG);
  }
  if (name.endsWith('.jpg')) {
    return data.subarray(0, JPG.length).equals(JPG);
  }
  return data.length >= 12 && data.toString('latin1', 4, 8) === 'ftyp';
}

function validateBundle(zip) {
  const { entries, directoryAt } = listZip(zip);
  const manifestEntry = entries.find(entry => entry.name === MANIFEST_FILE);
  if (manifestEntry === undefined) {
    refuse(`the archive has no ${MANIFEST_FILE}`);
  }
  const manifest = parseManifest(readEntry(zip, manifestEntry, directoryAt).toString('utf8'));
  if (entries.length !== manifest.files.length + 1) {
    refuse('the archive and its manifest name different files');
  }
  const files = manifest.files.map((file, i) => {
    const entry = entries.find(candidate => candidate.name === file.name);
    if (entry === undefined) {
      return refuse('the archive and its manifest name different files');
    }
    if (entry.bytes !== file.bytes) {
      refuse(`file ${i + 1} is not the size its manifest declares`);
    }
    const data = readEntry(zip, entry, directoryAt);
    if (createHash('sha256').update(data).digest('hex') !== file.sha256) {
      refuse(`file ${i + 1} does not have the sha256 its manifest declares`);
    }
    if (!hasItsOwnLeadingBytes(file.name, data)) {
      refuse(`file ${i + 1} does not start with the bytes of its type`);
    }
    return { name: file.name, data };
  });
  return { manifest, files };
}

function pullRequestMismatch(pull, session) {
  if (pull?.state !== 'open') {
    return 'it is not open';
  }
  if (pull.head?.repo?.full_name !== session.repo || pull.base?.repo?.full_name !== session.repo) {
    return 'its branch is in another repository';
  }
  if (pull.head.ref !== session.headBranch) {
    return 'its branch is not the branch the session ran on';
  }
  return null;
}

function commitNotListed(commits, session) {
  if (!commits.includes(session.startedOn)) {
    return 'the commit the session started on';
  }
  if (!commits.includes(session.runCommit)) {
    return 'the commit the verify run was made at';
  }
  return null;
}

const evidenceMarkers = platform => ({
  start: `<!-- verify-evidence:${platform} -->`,
  end: `<!-- /verify-evidence:${platform} -->`,
});

const BLOCK_LINE_START = 'verify run `';
const NEWER_COMMITS = 'The pull request has newer commits.';

const sessionRunUrl = (repo, runId) => `https://github.com/${repo}/actions/runs/${runId}`;

function evidenceBlock(manifest, session, onDisk = file => file.name) {
  const { start, end } = evidenceMarkers(manifest.platform);
  const flaky = manifest.flaky === 0 ? '' : `, ${manifest.flaky} flaky (passed only on a retry),`;
  const since = session.pullHead === manifest.commit ? '' : ` ${NEWER_COMMITS}`;
  const line = `${BLOCK_LINE_START}${manifest.run}\`, as reported by [the session](${sessionRunUrl(session.repo, session.runId)}) that \`${session.actor}\` started: ${manifest.passed} of ${manifest.total} passed${flaky} on \`${manifest.device}\` at \`${manifest.commit.slice(0, 12)}\`.${since}`;
  const media = manifest.files.flatMap(file => [
    '',
    `![${isVideo(file.name) ? file.name : file.name.replace(/\.[a-z0-9]+$/, '')}](./${onDisk(file)})`,
  ]);
  return [start, '', line, ...media, '', end].join('\n');
}

function withNewerCommitsNote(old, { start, end }) {
  const lines = old.replaceAll('\r\n', '\n').split('\n');
  const at = lines.findIndex(line => line.trimStart().startsWith(BLOCK_LINE_START));
  lines[at] = `${lines[at].trimEnd()} ${NEWER_COMMITS}`;
  return `${start}${lines.join('\n')}${end}`;
}

function fencedCode(text) {
  const fences = [];
  let open = null;
  let inHtmlComment = false;
  for (let at = 0; at <= text.length; ) {
    const newline = text.indexOf('\n', at);
    const lineEnd = newline === -1 ? text.length : newline;
    const line = text.slice(at, lineEnd).replace(/\r$/, '');
    const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (open === null && (inHtmlComment || /^ {0,3}<!--/.test(line))) {
      inHtmlComment = !line.includes('-->');
    } else if (fence !== null) {
      const [, ticks, rest] = fence;
      if (open === null && !(ticks[0] === '`' && rest.includes('`'))) {
        open = { char: ticks[0], length: ticks.length, at };
      } else if (open !== null && ticks[0] === open.char && ticks.length >= open.length && rest.trim() === '') {
        fences.push([open.at, lineEnd]);
        open = null;
      }
    }
    if (newline === -1) {
      break;
    }
    at = newline + 1;
  }
  if (open !== null) {
    fences.push([open.at, text.length]);
  }
  return { fences, neverCloses: open !== null };
}

function linesThatAre(text, marker) {
  const { fences } = fencedCode(text);
  const found = [];
  for (let at = text.indexOf(marker); at !== -1; at = text.indexOf(marker, at + marker.length)) {
    const end = at + marker.length;
    const startsItsLine = at === 0 || text[at - 1] === '\n';
    const endsItsLine = end === text.length || text[end] === '\n' || text.startsWith('\r\n', end);
    if (startsItsLine && endsItsLine && !fences.some(([from, to]) => at > from && at < to)) {
      found.push(at);
    }
  }
  return found;
}

function withEvidenceBlock(body, platform, lines) {
  const { start, end } = evidenceMarkers(platform);
  const starts = linesThatAre(body, start);
  const ends = linesThatAre(body, end);
  const newline = body.includes('\r\n') ? '\r\n' : '\n';
  const block = lines.replaceAll('\n', newline);
  if (starts.length === 0 && ends.length === 0) {
    if (fencedCode(body).neverCloses) {
      return { ok: false, why: 'ends inside a code fence that is never closed' };
    }
    const gap = body === '' ? '' : body.endsWith('\n') ? newline : `${newline}${newline}`;
    return { ok: true, body: `${body}${gap}${block}`, was: 'added', old: null };
  }
  if (starts.length !== 1 || ends.length !== 1) {
    return { ok: false, why: `has the start marker ${starts.length} times and the end marker ${ends.length} times` };
  }
  if (ends[0] < starts[0]) {
    return { ok: false, why: 'has the end marker before the start marker' };
  }
  const old = body.slice(starts[0] + start.length, ends[0]);
  if (!old.trimStart().startsWith(BLOCK_LINE_START)) {
    return { ok: false, why: 'has text between the markers that is not an evidence block' };
  }
  return {
    ok: true,
    body: `${body.slice(0, starts[0])}${block}${body.slice(ends[0] + end.length)}`,
    was: 'replaced',
    old,
  };
}

function settings(env) {
  const repo = shaped(env.REPO, SHAPE.repo, 'REPO');
  const runId = shaped(env.RUN_ID, SHAPE.runId, 'RUN_ID');
  const work = env.WORK;
  if (typeof work !== 'string' || !path.isAbsolute(work)) {
    refuse('WORK must be an absolute path');
  }
  return { repo, runId, work, filesDir: path.join(work, 'files'), manifestFile: path.join(work, MANIFEST_FILE) };
}

async function downloadArtifact({ fetch, api, token, repo, runId }) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'verify-attach',
    Authorization: `Bearer ${token}`,
  };
  const listed = await fetch(`${api}/repos/${repo}/actions/runs/${runId}/artifacts?name=${ARTIFACT}&per_page=100`, {
    headers,
  });
  if (listed.status !== 200) {
    throw new Failed(`GitHub answered ${listed.status} to the list of artifacts`);
  }
  const artifacts = ((await listed.json()).artifacts ?? []).filter(
    artifact => artifact.name === ARTIFACT && artifact.expired !== true && Number.isSafeInteger(artifact.id),
  );
  if (artifacts.length === 0) {
    return null;
  }
  const artifact = artifacts.reduce((newest, candidate) => (candidate.id > newest.id ? candidate : newest));
  if (!(artifact.size_in_bytes <= LIMITS.zipBytes)) {
    refuse(`the archive is over ${LIMITS.zipBytes} bytes`);
  }
  const download = await fetch(`${api}/repos/${repo}/actions/artifacts/${artifact.id}/zip`, { headers });
  if (download.status !== 200 || download.body === null) {
    throw new Failed(`GitHub answered ${download.status} to the download of the artifact`);
  }
  const chunks = [];
  let bytes = 0;
  for await (const chunk of download.body) {
    bytes += chunk.length;
    if (bytes > LIMITS.zipBytes) {
      refuse(`the archive is over ${LIMITS.zipBytes} bytes`);
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function fetchStep({ env, say, fetch, zipFile }) {
  const { repo, runId, work, filesDir, manifestFile } = settings(env);
  const mismatch = sessionRunMismatch({ event: env.RUN_EVENT, path: env.RUN_PATH, headRepo: env.RUN_HEAD_REPO }, repo);
  if (mismatch !== null) {
    say(
      'notice',
      `Run ${runId} is not a borrowed-device session of this repository (${mismatch}), so nothing is published.`,
    );
    return false;
  }
  const zip =
    zipFile !== undefined
      ? fs.readFileSync(zipFile)
      : await downloadArtifact({
          fetch,
          api: (env.GITHUB_API_URL ?? 'https://api.github.com').replace(/\/$/, ''),
          token: env.GITHUB_TOKEN ?? '',
          repo,
          runId,
        });
  if (zip === null) {
    say('notice', `Run ${runId} handed off no evidence.`);
    return false;
  }
  const { manifest, files } = validateBundle(zip);
  if (fs.existsSync(work) && fs.readdirSync(work).length > 0) {
    throw new Failed('WORK must be a new or empty directory');
  }
  fs.mkdirSync(filesDir, { recursive: true });
  for (const file of files) {
    fs.writeFileSync(path.join(filesDir, file.name), file.data, { flag: 'wx', mode: 0o600 });
  }
  fs.writeFileSync(manifestFile, JSON.stringify(manifest), { flag: 'wx', mode: 0o600 });
  say(
    'notice',
    `Run ${runId} handed off the evidence of verify run ${manifest.run} for pull request #${manifest.pr}: ${files.length} files.`,
  );
  return true;
}

function realGh(args, { cwd, stdoutFile }) {
  const out = stdoutFile === undefined ? 'pipe' : fs.openSync(stdoutFile, 'w', 0o600);
  try {
    const result = spawnSync('gh', args, {
      cwd,
      stdio: ['ignore', out, 'pipe'],
      env: { ...process.env, GH_PROMPT_DISABLED: '1', NO_COLOR: '1' },
      encoding: 'utf8',
    });
    return {
      status: result.error === undefined ? result.status : 127,
      stderr: result.error === undefined ? result.stderr : String(result.error.message),
    };
  } finally {
    if (typeof out === 'number') {
      fs.closeSync(out);
    }
  }
}

const printable = text =>
  text
    .replace(/[^\x20-\x7e\n]/g, '?')
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(0, 20)
    .map(line => `gh: ${line.slice(0, 300)}`)
    .join('\n');

const bodyOf = pull => (typeof pull?.body === 'string' ? pull.body : '');

const quoted = arg => (/^[A-Za-z0-9_./:=@-]+$/.test(arg) ? arg : `'${arg.replaceAll("'", `'\\''`)}'`);

const unguessable = () => randomBytes(8).toString('hex');

const COMMITS_PER_PAGE = 100;
const COMMIT_PAGES = 3;
const MOST_COMMITS_GITHUB_LISTS = 250;

function publishStep({ env, say, gh = realGh, dryRun = false, pullFile, commitsFile, nonce = unguessable }) {
  const { repo, runId, work, filesDir, manifestFile } = settings(env);
  const startedOn = shaped(env.HEAD_SHA, SHAPE.commit, 'HEAD_SHA');
  const actor = shaped(env.RUN_ACTOR, SHAPE.actor, 'RUN_ACTOR');
  const headBranch = env.HEAD_BRANCH;
  if (typeof headBranch !== 'string' || headBranch === '') {
    refuse('HEAD_BRANCH is missing');
  }
  const manifest = parseManifest(fs.readFileSync(manifestFile, 'utf8'));
  const prefix = `evidence-${nonce()}`;
  const onDisk = file => `${prefix}-${manifest.files.indexOf(file) + 1}${path.extname(file.name)}`;
  for (const file of manifest.files) {
    const stat = fs.lstatSync(path.join(filesDir, file.name));
    if (!stat.isFile() || stat.size !== file.bytes) {
      refuse('a file is not the one the first step wrote');
    }
    fs.renameSync(path.join(filesDir, file.name), path.join(filesDir, onDisk(file)));
  }

  const pullJson = path.join(work, 'pull.json');
  const readPull = () => {
    if (pullFile === undefined) {
      const read = gh(['api', `repos/${repo}/pulls/${manifest.pr}`], { cwd: work, stdoutFile: pullJson });
      if (read.status !== 0) {
        throw new Failed(`gh could not read pull request #${manifest.pr}\n${printable(read.stderr)}`);
      }
    }
    try {
      return JSON.parse(fs.readFileSync(pullFile ?? pullJson, 'utf8'));
    } catch {
      throw new Failed(`what GitHub returned for pull request #${manifest.pr} is not JSON`);
    }
  };
  const readCommits = () => {
    const shas = [];
    for (let page = 1; page <= COMMIT_PAGES; page += 1) {
      const pageJson = commitsFile ?? path.join(work, `commits-${page}.json`);
      if (commitsFile === undefined) {
        const read = gh(
          ['api', `repos/${repo}/pulls/${manifest.pr}/commits?per_page=${COMMITS_PER_PAGE}&page=${page}`],
          { cwd: work, stdoutFile: pageJson },
        );
        if (read.status !== 0) {
          throw new Failed(`gh could not read the commits of pull request #${manifest.pr}\n${printable(read.stderr)}`);
        }
      }
      let listed;
      try {
        listed = JSON.parse(fs.readFileSync(pageJson, 'utf8'));
      } catch {
        listed = null;
      }
      if (!Array.isArray(listed)) {
        throw new Failed(`what GitHub returned for the commits of pull request #${manifest.pr} is not a list`);
      }
      shas.push(...listed.map(commit => commit?.sha).filter(sha => typeof sha === 'string'));
      if (commitsFile !== undefined || listed.length < COMMITS_PER_PAGE) {
        break;
      }
    }
    return shas;
  };
  const notThisRun = why => {
    say(
      'notice',
      `Pull request #${manifest.pr} is not the pull request of run ${runId} (${why}), so nothing is published.`,
    );
    return 'refused';
  };

  const session = { repo, headBranch, startedOn, runCommit: manifest.commit };
  let pull = readPull();
  const mismatch = pullRequestMismatch(pull, session);
  if (mismatch !== null) {
    return notThisRun(mismatch);
  }
  const notListed = commitNotListed(readCommits(), session);
  if (notListed !== null && pull.commits > MOST_COMMITS_GITHUB_LISTS) {
    say(
      'notice',
      `Pull request #${manifest.pr} has ${pull.commits} commits and GitHub lists only the first ${MOST_COMMITS_GITHUB_LISTS}, which do not hold ${notListed}, so run ${runId} cannot be checked against it and nothing is published.`,
    );
    return 'refused';
  }
  if (notListed !== null) {
    return notThisRun(`${notListed} is not one of its commits`);
  }
  let next = null;
  for (let attempt = 0; attempt < 2 && next === null; attempt += 1) {
    const body = bodyOf(pull);
    const head = pull.head.sha;
    const block = evidenceBlock(manifest, { repo, runId, actor, pullHead: head }, onDisk);
    const edit = withEvidenceBlock(body, manifest.platform, block);
    if (!edit.ok) {
      throw new Failed(
        `the description of pull request #${manifest.pr} ${edit.why}, so the evidence has no one place to go`,
      );
    }
    const held =
      edit.old !== null &&
      !edit.old.includes('](./') &&
      edit.old.includes(`\`${manifest.run}\``) &&
      edit.old.includes(`(${sessionRunUrl(repo, runId)})`);
    const lacksTheNote = held && head !== manifest.commit && !edit.old.includes(NEWER_COMMITS);
    if (held && !lacksTheNote) {
      say('notice', `The description of pull request #${manifest.pr} already holds verify run ${manifest.run}.`);
      return 'already there';
    }
    const placed = lacksTheNote
      ? {
          body: withEvidenceBlock(
            body,
            manifest.platform,
            withNewerCommitsNote(edit.old, evidenceMarkers(manifest.platform)),
          ).body,
          files: [],
        }
      : { body: edit.body, files: manifest.files };
    pull = readPull();
    const movedSince = pullRequestMismatch(pull, session);
    if (movedSince !== null) {
      return notThisRun(movedSince);
    }
    if (bodyOf(pull) === body && pull.head.sha === head) {
      next = placed;
    }
  }
  if (next === null) {
    throw new Failed(
      `pull request #${manifest.pr} changed twice while the evidence was being placed, so nothing was written`,
    );
  }

  const bodyFile = path.join(work, 'body.md');
  fs.writeFileSync(bodyFile, next.body, { mode: 0o600 });
  const args = [
    'pr',
    'edit',
    String(manifest.pr),
    '--repo',
    repo,
    '--body-file',
    bodyFile,
    ...next.files.flatMap(file => ['--attach', `./${onDisk(file)}`]),
  ];
  if (dryRun) {
    say('plain', `would run, in ${filesDir}:\ngh ${args.map(quoted).join(' ')}`);
    return 'dry run';
  }
  const edited = gh(args, { cwd: filesDir });
  if (edited.status !== 0) {
    throw new Failed(`gh pr edit failed for pull request #${manifest.pr}\n${printable(edited.stderr)}`);
  }
  if (next.files.length === 0) {
    say(
      'notice',
      `Noted in the description of pull request #${manifest.pr} that it has newer commits than verify run ${manifest.run}.`,
    );
    return 'noted';
  }
  say(
    'notice',
    `Put verify run ${manifest.run} in the description of pull request #${manifest.pr}: ${manifest.files.length} files.`,
  );
  return 'published';
}

const workflowCommand = (kind, text) =>
  `::${kind} title=verify-attach::${text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')}`;

async function main(argv, env, log = console.log) {
  const say = (kind, text) => log(kind === 'plain' ? text : workflowCommand(kind, text));
  const [step, ...rest] = argv;
  const flag = name => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : undefined);
  try {
    if (step === 'fetch') {
      const found = await fetchStep({ env, say, fetch, zipFile: flag('--zip') });
      if (env.GITHUB_OUTPUT) {
        fs.appendFileSync(env.GITHUB_OUTPUT, `found=${found ? 'true' : 'false'}\n`);
      }
      return 0;
    }
    if (step === 'publish') {
      publishStep({
        env,
        say,
        dryRun: rest.includes('--dry-run'),
        pullFile: flag('--pull'),
        commitsFile: flag('--commits'),
      });
      return 0;
    }
    log('usage: verify-attach.mjs fetch [--zip <file>] | publish [--dry-run] [--pull <file> --commits <file>]');
    return 2;
  } catch (error) {
    if (error instanceof Refused) {
      say('error', `The evidence was refused: ${error.message}. Nothing is published.`);
    } else if (error instanceof Failed) {
      say('error', `${error.message}`);
    } else {
      say(
        'error',
        `verify-attach stopped on an unexpected ${error instanceof Error ? error.name : 'error'}. Nothing more is published.`,
      );
    }
    return 1;
  }
}

export {
  ARTIFACT,
  LIMITS,
  Refused,
  downloadArtifact,
  evidenceBlock,
  evidenceMarkers,
  fetchStep,
  listZip,
  main,
  parseManifest,
  publishStep,
  pullRequestMismatch,
  sessionRunMismatch,
  validateBundle,
  withEvidenceBlock,
  workflowCommand,
};

if (process.argv[1] !== undefined && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(await main(process.argv.slice(2), process.env));
}

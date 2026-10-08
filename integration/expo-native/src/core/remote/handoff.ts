import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Platform } from '../types.ts';

export const HANDOFF_VERSION = 1 as const;

export const HANDOFF = {
  artifact: 'verify-evidence',
  directory: 'evidence',
  staging: 'evidence.partial',
  manifestFile: 'manifest.json',
} as const;

const MIB = 1024 * 1024;

export const HANDOFF_LIMITS = {
  manifestBytes: 16 * 1024,
  files: 50,
  videos: 1,
  imageBytes: 10 * MIB,
  videoBytes: 100 * MIB,
  totalBytes: 150 * MIB,
  chunkBytes: MIB,
  chunkBodyBytes: 1_500_000,
  pr: 9_999_999,
  tests: 10_000,
} as const;

export interface HandoffFile {
  readonly name: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface HandoffManifest {
  readonly v: typeof HANDOFF_VERSION;
  readonly pr: number;
  readonly run: string;
  readonly platform: Platform;
  readonly device: string;
  readonly commit: string;
  readonly passed: number;
  readonly flaky: number;
  readonly total: number;
  readonly files: readonly HandoffFile[];
}

const SHAPE = {
  run: /^r\d{8}-\d{6}-[0-9a-f]{4}$/,
  device: /^[A-Za-z0-9][A-Za-z0-9 ._()-]{0,63}$/,
  commit: /^[0-9a-f]{40}$/,
  sha256: /^[0-9a-f]{64}$/,
  fileName: /^[A-Za-z0-9][A-Za-z0-9._-]{0,95}\.(png|jpg|mp4)$/,
} as const;

const MANIFEST_KEYS = ['v', 'pr', 'run', 'platform', 'device', 'commit', 'passed', 'flaky', 'total', 'files'];
const FILE_KEYS = ['name', 'bytes', 'sha256'];

export class HandoffRefused extends Error {
  readonly status: 400 | 409 | 413;
  readonly have: number | undefined;
  constructor(status: 400 | 409 | 413, message: string, have?: number) {
    super(message);
    this.status = status;
    this.have = have;
  }
}

const refuse = (message: string): never => {
  throw new HandoffRefused(400, message);
};

function record(value: unknown, keys: readonly string[], what: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return refuse(`${what} is not an object`);
  const extra = Object.keys(value).filter((key) => !keys.includes(key));
  if (extra.length > 0 || Object.keys(value).length !== keys.length) return refuse(`${what} must have exactly the keys ${keys.join(', ')}`);
  return value as Record<string, unknown>;
}

function whole(value: unknown, min: number, max: number, what: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) return refuse(`${what} must be a whole number from ${min} to ${max}`);
  return value;
}

function shaped(value: unknown, pattern: RegExp, what: string): string {
  if (typeof value !== 'string' || !pattern.test(value)) return refuse(`${what} is missing or malformed`);
  return value;
}

export const isVideo = (name: string): boolean => name.endsWith('.mp4');

export function parseHandoffManifest(text: string): HandoffManifest {
  if (Buffer.byteLength(text) > HANDOFF_LIMITS.manifestBytes) refuse(`the manifest is over ${HANDOFF_LIMITS.manifestBytes} bytes`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return refuse('the manifest is not JSON');
  }
  const raw = record(parsed, MANIFEST_KEYS, 'the manifest');
  if (raw.v !== HANDOFF_VERSION) refuse(`manifest version ${String(raw.v)} is not ${HANDOFF_VERSION}`);
  if (raw.platform !== 'ios' && raw.platform !== 'android') refuse('platform must be ios or android');
  if (!Array.isArray(raw.files) || raw.files.length < 1 || raw.files.length > HANDOFF_LIMITS.files) refuse(`files must be a list of 1 to ${HANDOFF_LIMITS.files}`);
  const files = (raw.files as unknown[]).map((entry, i): HandoffFile => {
    const file = record(entry, FILE_KEYS, `file ${i + 1}`);
    const name = shaped(file.name, SHAPE.fileName, `the name of file ${i + 1}`);
    return { name, bytes: whole(file.bytes, 1, isVideo(name) ? HANDOFF_LIMITS.videoBytes : HANDOFF_LIMITS.imageBytes, `the size of ${name}`), sha256: shaped(file.sha256, SHAPE.sha256, `the sha256 of ${name}`) };
  });
  if (new Set(files.map((file) => file.name.toLowerCase())).size !== files.length) refuse('two files have the same name');
  if (files.filter((file) => isVideo(file.name)).length > HANDOFF_LIMITS.videos) refuse(`at most ${HANDOFF_LIMITS.videos} video`);
  if (files.reduce((sum, file) => sum + file.bytes, 0) > HANDOFF_LIMITS.totalBytes) refuse(`the files are over ${HANDOFF_LIMITS.totalBytes} bytes in all`);
  const manifest: HandoffManifest = {
    v: HANDOFF_VERSION,
    pr: whole(raw.pr, 1, HANDOFF_LIMITS.pr, 'pr'),
    run: shaped(raw.run, SHAPE.run, 'run'),
    platform: raw.platform as Platform,
    device: shaped(raw.device, SHAPE.device, 'device'),
    commit: shaped(raw.commit, SHAPE.commit, 'commit'),
    passed: whole(raw.passed, 0, HANDOFF_LIMITS.tests, 'passed'),
    flaky: whole(raw.flaky, 0, HANDOFF_LIMITS.tests, 'flaky'),
    total: whole(raw.total, 1, HANDOFF_LIMITS.tests, 'total'),
    files,
  };
  if (manifest.passed + manifest.flaky < 1 || manifest.passed + manifest.flaky > manifest.total) refuse('passed and flaky must count at least one test and at most total');
  return manifest;
}

export const MOST_COMMITS_GITHUB_LISTS = 250;

export interface PullRequestView {
  readonly state: string;
  readonly headRepo: string | null;
  readonly headRef: string;
  readonly commits: readonly string[];
  readonly commitCount: number;
}

export interface PullRequestMismatch {
  readonly why: string;
  readonly fix: string;
}

const ITS_OWN_PULL_REQUEST =
  "it accepts only the open pull request of the session's branch, and only when the commit the session started on and the commit of the run are both commits of that pull request; git push, then {cli} run again and attach, or after a rewrite of the branch's history {cli} down and {cli} up first";
const FEWER_COMMITS = `it can check a commit only against the first ${MOST_COMMITS_GITHUB_LISTS} commits of a pull request; squash or rebase the branch to ${MOST_COMMITS_GITHUB_LISTS} commits or fewer, git push, then {cli} down, {cli} up, run again and attach, or run {cli} attach on a machine whose gh can attach`;

export function pullRequestMismatch(pull: PullRequestView, session: { readonly repo: string; readonly headBranch: string; readonly startedOn: string; readonly runCommit: string }): PullRequestMismatch | null {
  const refused = (why: string): PullRequestMismatch => ({ why, fix: ITS_OWN_PULL_REQUEST });
  if (pull.state !== 'open') return refused(`it is ${pull.state}`);
  if (pull.headRepo !== session.repo) return refused(`its branch is in ${pull.headRepo ?? 'a deleted fork'}, not in ${session.repo}`);
  if (pull.headRef !== session.headBranch) return refused(`its branch is ${pull.headRef} and the session runs on ${session.headBranch}`);
  for (const [what, commit] of [['the session started on', session.startedOn], ['the run was made at', session.runCommit]] as const) {
    if (pull.commits.includes(commit)) continue;
    if (pull.commitCount > MOST_COMMITS_GITHUB_LISTS) {
      return { why: `it has ${pull.commitCount} commits, GitHub lists only the first ${MOST_COMMITS_GITHUB_LISTS}, and ${what} ${commit.slice(0, 12)}, which is not among those`, fix: FEWER_COMMITS };
    }
    return refused(`${what} ${commit.slice(0, 12)}, which is not one of its commits`);
  }
  return null;
}

const sha256File = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex');

export function describeFile(name: string, path: string): HandoffFile {
  return { name, bytes: statSync(path).size, sha256: sha256File(path) };
}

export interface EvidenceReceiver {
  begin(body: string | null): { readonly ok: true };
  chunk(body: string | null): { readonly ok: true; readonly bytes: number };
  commit(): { readonly ok: true; readonly run: string; readonly files: number; readonly bytes: number };
  held(): string | null;
}

export function evidenceReceiver(work: string): EvidenceReceiver {
  const staging = join(work, HANDOFF.staging);
  const kept = join(work, HANDOFF.directory);
  let receiving: { readonly manifest: HandoffManifest; readonly sizes: Map<string, number> } | null = null;
  let heldRun: string | null = null;

  return {
    begin(body) {
      if (body === null) throw new HandoffRefused(413, `the manifest is over ${HANDOFF_LIMITS.manifestBytes} bytes`);
      const manifest = parseHandoffManifest(body);
      rmSync(staging, { recursive: true, force: true });
      mkdirSync(staging, { recursive: true });
      writeFileSync(join(staging, HANDOFF.manifestFile), `${JSON.stringify(manifest)}\n`);
      receiving = { manifest, sizes: new Map(manifest.files.map((file) => [file.name, 0])) };
      return { ok: true };
    },

    chunk(body) {
      if (receiving === null) throw new HandoffRefused(409, 'no hand-off has begun');
      if (body === null) throw new HandoffRefused(413, `a chunk request is at most ${HANDOFF_LIMITS.chunkBodyBytes} bytes`);
      let raw: Record<string, unknown>;
      try {
        raw = record(JSON.parse(body), ['name', 'offset', 'data'], 'the chunk');
      } catch (error) {
        throw error instanceof HandoffRefused ? error : new HandoffRefused(400, 'the chunk is not JSON');
      }
      const declared = receiving.manifest.files.find((file) => file.name === raw.name);
      if (declared === undefined) throw new HandoffRefused(400, 'the manifest names no such file');
      const have = receiving.sizes.get(declared.name)!;
      if (raw.offset !== have) throw new HandoffRefused(409, `${declared.name} is at ${have} bytes`, have);
      if (typeof raw.data !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw.data)) throw new HandoffRefused(400, 'data must be base64');
      const data = Buffer.from(raw.data, 'base64');
      if (data.length === 0 || data.length > HANDOFF_LIMITS.chunkBytes) throw new HandoffRefused(413, `a chunk holds 1 to ${HANDOFF_LIMITS.chunkBytes} bytes`);
      if (have + data.length > declared.bytes) throw new HandoffRefused(413, `${declared.name} would pass the ${declared.bytes} bytes its manifest declares`);
      appendFileSync(join(staging, declared.name), data);
      receiving.sizes.set(declared.name, have + data.length);
      return { ok: true, bytes: have + data.length };
    },

    commit() {
      if (receiving === null) throw new HandoffRefused(409, 'no hand-off has begun');
      const { manifest, sizes } = receiving;
      for (const file of manifest.files) {
        if (sizes.get(file.name) !== file.bytes) throw new HandoffRefused(409, `${file.name} has ${sizes.get(file.name)} of ${file.bytes} bytes`);
        if (sha256File(join(staging, file.name)) !== file.sha256) throw new HandoffRefused(409, `${file.name} does not have the sha256 its manifest declares`);
      }
      rmSync(kept, { recursive: true, force: true });
      renameSync(staging, kept);
      receiving = null;
      heldRun = manifest.run;
      return { ok: true, run: manifest.run, files: manifest.files.length, bytes: manifest.files.reduce((sum, file) => sum + file.bytes, 0) };
    },

    held: () => (heldRun !== null && existsSync(kept) ? heldRun : null),
  };
}

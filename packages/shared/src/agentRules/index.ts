import { isAgentEnvironment } from '../utils/runtimeEnvironment';

export type ClerkAgentRulesSdk =
  | 'astro'
  | 'backend'
  | 'chrome-extension'
  | 'clerk-js'
  | 'electron'
  | 'expo'
  | 'express'
  | 'fastify'
  | 'hono'
  | 'nextjs'
  | 'nuxt'
  | 'react'
  | 'react-router'
  | 'tanstack-react-start'
  | 'vue';

export interface FileSystemAdapter {
  existsSync: (path: string) => boolean;
  readFileSync: (path: string, options: { encoding: BufferEncoding }) => string;
  writeFileSync: (path: string, data: string, options: { encoding: BufferEncoding; mode?: number }) => void;
  mkdirSync?: (path: string, options: { recursive: boolean }) => void;
  unlinkSync?: (path: string) => void;
}

export interface PathAdapter {
  dirname: (path: string) => string;
  join: (...paths: string[]) => string;
  parse: (path: string) => { root: string };
  resolve: (...paths: string[]) => string;
}

export interface WriteClerkAgentRulesOptions {
  cwd: string;
  dryRun?: boolean;
  force?: boolean;
  fs: FileSystemAdapter;
  path: PathAdapter;
  sdks: ClerkAgentRulesSdk[];
}

export type WriteClerkAgentRulesResult = {
  targetDir: string;
  agentsMd: 'created' | 'updated' | 'unchanged' | 'skipped' | 'disabled';
  files: string[];
};

const GENERIC_ID = 'clerk-agent-rules';
const GENERIC_START = '<!-- BEGIN:clerk-agent-rules -->';
const GENERIC_END = '<!-- END:clerk-agent-rules -->';

const SDK_LABELS: Record<ClerkAgentRulesSdk, string> = {
  astro: 'Astro',
  backend: 'Backend',
  'chrome-extension': 'Chrome Extension',
  'clerk-js': 'ClerkJS',
  electron: 'Electron',
  expo: 'Expo',
  express: 'Express',
  fastify: 'Fastify',
  hono: 'Hono',
  nextjs: 'Next.js',
  nuxt: 'Nuxt',
  react: 'React',
  'react-router': 'React Router',
  'tanstack-react-start': 'TanStack React Start',
  vue: 'Vue',
};

const SDK_NOTES: Partial<Record<ClerkAgentRulesSdk, string[]>> = {
  nextjs: ['Middleware lives in `proxy.ts` and uses `clerkMiddleware()`. `authMiddleware()` is gone.'],
};

const uniqueSdks = (sdks: ClerkAgentRulesSdk[]) => [...new Set(sdks)].sort();

const detectEol = (content: string) => (content.includes('\r\n') ? '\r\n' : '\n');
const normalizeEol = (content: string, eol: string) => content.replace(/\r?\n/g, eol);

export const isClerkAgentRulesSdk = (value: string): value is ClerkAgentRulesSdk =>
  Object.prototype.hasOwnProperty.call(SDK_LABELS, value);

export const clerkAgentRulesSdks = Object.keys(SDK_LABELS) as ClerkAgentRulesSdk[];

export const CLERK_SDK_PLUGIN_START = '<!-- BEGIN:clerk-plugin -->';
export const CLERK_SDK_PLUGIN_END = '<!-- END:clerk-plugin -->';

const PLUGIN_SECTION = `### Clerk plugin

The Clerk plugin gives agents Clerk's skills and MCP server. If it is not installed, tell the user they can install it. Do not run the command yourself:

\`\`\`sh
npx plugins add clerk/skills
\`\`\`

Install steps for each tool: https://clerk.com/docs/guides/ai/overview
Source: https://github.com/clerk/skills

Ask the user before calling any Clerk tool that creates or changes something in their Clerk account.`;

export function renderClerkSdkPluginBlock(eol = '\n') {
  return normalizeEol(
    `${CLERK_SDK_PLUGIN_START}

${PLUGIN_SECTION}

### Docs

Start at https://clerk.com/docs/llms.txt. Add \`.md\` to any docs URL to get Markdown.

${CLERK_SDK_PLUGIN_END}`,
    eol,
  );
}

export function renderClerkAgentRulesBlock(eol = '\n') {
  return normalizeEol(
    `${GENERIC_START}

## Clerk: your training data is out of date

Read the Clerk sections below before touching auth code. Only use Clerk APIs that exist in the installed package's types. Clerk docs: https://clerk.com/docs.md

The Clerk SDK writes this block. Commit it with your work.

${PLUGIN_SECTION}

${GENERIC_END}`,
    eol,
  );
}

const sdkBlockId = (sdk: ClerkAgentRulesSdk, appDir = '') => `${GENERIC_ID}:${sdk}${appDir ? `:${appDir}` : ''}`;

export function renderClerkSdkAgentRulesBlock(
  sdk: ClerkAgentRulesSdk,
  eol = '\n',
  {
    appDir = '',
    agentsMdPath = `node_modules/@clerk/${sdk}/AGENTS.md`,
  }: { appDir?: string; agentsMdPath?: string } = {},
) {
  const id = sdkBlockId(sdk, appDir);
  const notes = [
    `Read \`${agentsMdPath}\` before writing auth code.`,
    'Clerk Elements is removed. Never use it.',
    ...(SDK_NOTES[sdk] ?? []),
  ];

  return normalizeEol(
    `<!-- BEGIN:${id} -->

### Clerk + ${SDK_LABELS[sdk]}${appDir ? ` in \`${appDir}\`` : ''}

${notes.map(note => `- ${note}`).join('\n')}

<!-- END:${id} -->`,
    eol,
  );
}

function upsertMarkedBlock(
  content: string,
  block: string,
  start: string,
  end: string,
  eol: string,
  insertAfter?: string,
) {
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end, startIndex + start.length);

  if (startIndex !== -1 && endIndex !== -1) {
    return content.slice(0, startIndex) + block + content.slice(endIndex + end.length);
  }

  if (startIndex !== -1) {
    return content;
  }

  if (insertAfter) {
    const insertIndex = content.indexOf(insertAfter);
    if (insertIndex !== -1) {
      const afterIndex = insertIndex + insertAfter.length;
      return `${content.slice(0, afterIndex).trimEnd()}${eol}${eol}${block}${content.slice(afterIndex)}`;
    }
  }

  return `${content.trimEnd()}${eol}${eol}${block}${eol}`;
}

const blockStart = (id: string) => `<!-- BEGIN:${id} -->`;
const blockEnd = (id: string) => `<!-- END:${id} -->`;

const listBlockIds = (content: string) =>
  [...content.matchAll(/<!-- BEGIN:(clerk-agent-rules(?::\S+)?) -->/g)].map(match => match[1]);

function removeBlock(content: string, id: string, eol: string) {
  const startIndex = content.indexOf(blockStart(id));
  const endIndex = content.indexOf(blockEnd(id), startIndex);
  if (startIndex === -1 || endIndex === -1) {
    return content;
  }

  const before = content.slice(0, startIndex).trimEnd();
  const after = content.slice(endIndex + blockEnd(id).length).trimStart();
  return before && after ? `${before}${eol}${eol}${after}` : `${before}${after}${before || after ? eol : ''}`;
}

const AGENT_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  '.claude',
  '.codex',
  '.cursor',
  '.cursorrules',
  '.gemini',
  '.github/copilot-instructions.md',
  '.opencode',
  '.windsurf',
  '.windsurfrules',
];

function isDisabledInPackageJson(fs: FileSystemAdapter, path: PathAdapter, dir: string) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), { encoding: 'utf8' }));
    return pkg?.clerk?.agentsMd === false;
  } catch {
    return false;
  }
}

function isWorkspaceRoot(fs: FileSystemAdapter, path: PathAdapter, dir: string) {
  if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
    return true;
  }
  try {
    return !!JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), { encoding: 'utf8' })).workspaces;
  } catch {
    return false;
  }
}

function findAppDirs(fs: FileSystemAdapter, path: PathAdapter, cwd: string) {
  let current = path.resolve(cwd);
  const root = path.parse(current).root;
  const dirs: string[] = [];

  while (current !== root) {
    if (fs.existsSync(path.join(current, 'package.json'))) {
      dirs.push(current);
      if (isWorkspaceRoot(fs, path, current)) {
        return dirs;
      }
    } else if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return [...dirs, current];
    }

    current = path.dirname(current);
  }

  return dirs.slice(0, 1);
}

function findAgentFileDirs(fs: FileSystemAdapter, path: PathAdapter, dirs: string[]) {
  let current = dirs[0];
  const root = path.parse(current).root;
  const repoDirs: string[] = [];

  while (current !== root) {
    repoDirs.push(current);
    if (fs.existsSync(path.join(current, '.git'))) {
      return repoDirs;
    }
    current = path.dirname(current);
  }

  return dirs;
}

const relativeDir = (rootDir: string, dir: string) =>
  dir === rootDir ? '' : dir.slice(rootDir.length + 1).replace(/\\/g, '/');

function findSdkAgentsMd(fs: FileSystemAdapter, path: PathAdapter, sdk: ClerkAgentRulesSdk, dirs: string[]) {
  const rootDir = dirs[dirs.length - 1];
  const installDir = dirs.find(dir => fs.existsSync(path.join(dir, 'node_modules', '@clerk', sdk, 'package.json')));
  const prefix = relativeDir(rootDir, installDir ?? dirs[0]);
  return `${prefix ? `${prefix}/` : ''}node_modules/@clerk/${sdk}/AGENTS.md`;
}

export function writeClerkAgentRules(options: WriteClerkAgentRulesOptions): WriteClerkAgentRulesResult {
  const { dryRun = false, force = false, fs, path, sdks } = options;
  const dirs = findAppDirs(fs, path, options.cwd);
  if (dirs.length === 0) {
    return { targetDir: path.resolve(options.cwd), agentsMd: 'skipped', files: [] };
  }

  const appDir = dirs[0];
  const rootDir = dirs[dirs.length - 1];
  const appKey = relativeDir(rootDir, appDir);
  const agentsPath = path.join(rootDir, 'AGENTS.md');
  const agentsExists = fs.existsSync(agentsPath);
  const existing = agentsExists ? fs.readFileSync(agentsPath, { encoding: 'utf8' }) : '';
  const eol = detectEol(existing);

  const disabledDir = dirs.find(dir => isDisabledInPackageJson(fs, path, dir));
  if (disabledDir) {
    const ids =
      disabledDir === rootDir ? listBlockIds(existing) : clerkAgentRulesSdks.map(sdk => sdkBlockId(sdk, appKey));
    let next = ids.reduce((content, id) => removeBlock(content, id, eol), existing);
    if (listBlockIds(next).every(id => id === GENERIC_ID)) {
      next = removeBlock(next, GENERIC_ID, eol);
    }
    if (next === existing) {
      return { targetDir: rootDir, agentsMd: 'disabled', files: [] };
    }
    if (!dryRun) {
      if (next.trim() || !fs.unlinkSync) {
        fs.writeFileSync(agentsPath, next, { encoding: 'utf8', mode: 0o644 });
      } else {
        fs.unlinkSync(agentsPath);
      }
    }
    return { targetDir: rootDir, agentsMd: 'disabled', files: [agentsPath] };
  }

  const hasAgentFiles = findAgentFileDirs(fs, path, dirs).some(dir =>
    AGENT_FILES.some(file => fs.existsSync(path.join(dir, file))),
  );
  if (!force && !isAgentEnvironment() && !hasAgentFiles) {
    return { targetDir: rootDir, agentsMd: 'skipped', files: [] };
  }

  const stateDir = path.join(rootDir, 'node_modules', '.cache', 'clerk', 'agent-rules');
  const statePath = (id: string) => path.join(stateDir, encodeURIComponent(id));
  const wasRemoved = (id: string) => !force && !existing.includes(blockStart(id)) && fs.existsSync(statePath(id));

  if (wasRemoved(GENERIC_ID)) {
    return { targetDir: rootDir, agentsMd: 'skipped', files: [] };
  }

  let next = upsertMarkedBlock(existing, renderClerkAgentRulesBlock(eol), GENERIC_START, GENERIC_END, eol);
  const written = [GENERIC_ID];

  for (const sdk of uniqueSdks(sdks)) {
    const id = sdkBlockId(sdk, appKey);
    if (wasRemoved(id)) {
      continue;
    }
    const lastEnd = [...next.matchAll(/<!-- END:clerk-agent-rules(?::\S+)? -->/g)].pop()?.[0];
    const block = renderClerkSdkAgentRulesBlock(sdk, eol, {
      appDir: appKey,
      agentsMdPath: findSdkAgentsMd(fs, path, sdk, dirs),
    });
    next = upsertMarkedBlock(next, block, blockStart(id), blockEnd(id), eol, lastEnd);
    written.push(id);
  }

  const agentsMd = agentsExists ? (next === existing ? 'unchanged' : 'updated') : 'created';

  if (!dryRun) {
    if (agentsMd !== 'unchanged') {
      fs.writeFileSync(agentsPath, next, { encoding: 'utf8', mode: 0o644 });
    }
    for (const id of written) {
      if (!fs.existsSync(statePath(id))) {
        fs.mkdirSync?.(stateDir, { recursive: true });
        fs.writeFileSync(statePath(id), '', { encoding: 'utf8', mode: 0o644 });
      }
    }
  }

  return { targetDir: rootDir, agentsMd, files: agentsMd === 'unchanged' ? [] : [agentsPath] };
}

export function logClerkAgentRulesResult({ agentsMd, files }: WriteClerkAgentRulesResult) {
  if (files.length === 0) {
    return;
  }

  if (agentsMd === 'disabled') {
    console.log(
      `[Clerk]: Removed the Clerk section from ${files.join(' and ')} because package.json sets "clerk": { "agentsMd": false }.`,
    );
    return;
  }

  console.log(
    `[Clerk]: Updated ${files.join(' and ')} for AI coding agents. To turn this off for everyone, add "clerk": { "agentsMd": false } to package.json. To turn it off on this machine, remove the Clerk section from AGENTS.md or set CLERK_AGENTS_MD=false.`,
  );
}

export function logClerkAgentRulesError(error: unknown) {
  const reason = error instanceof Error ? error.message : String(error);
  console.warn(
    `[Clerk]: Could not update AGENTS.md for AI coding agents: ${reason}. Set CLERK_AGENTS_MD=false to turn this off.`,
  );
}

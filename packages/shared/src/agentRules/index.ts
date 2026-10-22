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
  fs: FileSystemAdapter;
  path: PathAdapter;
  sdks: ClerkAgentRulesSdk[];
}

export type WriteClerkAgentRulesResult = {
  targetDir: string;
  agentsMd: 'created' | 'updated' | 'unchanged' | 'skipped';
  claudeMd: 'created' | 'updated' | 'unchanged' | 'skipped';
  files: string[];
};

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

const CLAUDE_AGENTS_IMPORT = /^\s*@(?:\.\/)?AGENTS\.md\s*$/m;

const appendAgentsImport = (content: string) => {
  const eol = detectEol(content);
  return content.trim() ? `${content.trimEnd()}${eol}${eol}@AGENTS.md${eol}` : `@AGENTS.md${eol}`;
};

export const isClerkAgentRulesSdk = (value: string): value is ClerkAgentRulesSdk => value in SDK_LABELS;

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

export function renderClerkSdkAgentRulesBlock(sdk: ClerkAgentRulesSdk, eol = '\n') {
  const notes = [
    `Read \`node_modules/@clerk/${sdk}/AGENTS.md\` before writing auth code.`,
    'Clerk Elements is removed. Never use it.',
    ...(SDK_NOTES[sdk] ?? []),
  ];

  return normalizeEol(
    `<!-- BEGIN:clerk-agent-rules:${sdk} -->

### Clerk + ${SDK_LABELS[sdk]}

${notes.map(note => `- ${note}`).join('\n')}

<!-- END:clerk-agent-rules:${sdk} -->`,
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

function findTargetDir(fs: FileSystemAdapter, path: PathAdapter, cwd: string) {
  let current = path.resolve(cwd);
  const root = path.parse(current).root;
  let nearestPackageDir: string | null = null;

  while (current !== root) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    const packageJson = path.join(current, 'package.json');
    if (fs.existsSync(packageJson)) {
      nearestPackageDir ??= current;
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJson, { encoding: 'utf8' }));
        if (pkg.workspaces) {
          return current;
        }
      } catch {
        // Ignore invalid package.json while walking upward.
      }
    }

    current = path.dirname(current);
  }

  return nearestPackageDir;
}

function pickTargetFile(fs: FileSystemAdapter, path: PathAdapter, targetDir: string) {
  const agentsPath = path.join(targetDir, 'AGENTS.md');
  const claudePath = path.join(targetDir, 'CLAUDE.md');

  for (const filePath of [agentsPath, claudePath]) {
    if (fs.existsSync(filePath) && fs.readFileSync(filePath, { encoding: 'utf8' }).includes(GENERIC_START)) {
      return filePath;
    }
  }

  if (fs.existsSync(agentsPath)) {
    return agentsPath;
  }

  if (fs.existsSync(claudePath)) {
    return claudePath;
  }

  return agentsPath;
}

export function writeClerkAgentRules(options: WriteClerkAgentRulesOptions): WriteClerkAgentRulesResult {
  const { dryRun = false, fs, path, sdks } = options;
  const targetDir = findTargetDir(fs, path, options.cwd);
  if (!targetDir) {
    return { targetDir: path.resolve(options.cwd), agentsMd: 'skipped', claudeMd: 'skipped', files: [] };
  }

  const targetFile = pickTargetFile(fs, path, targetDir);
  const agentsPath = path.join(targetDir, 'AGENTS.md');
  const claudePath = path.join(targetDir, 'CLAUDE.md');
  const existing = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, { encoding: 'utf8' }) : '';
  const eol = detectEol(existing);

  let next = upsertMarkedBlock(existing, renderClerkAgentRulesBlock(eol), GENERIC_START, GENERIC_END, eol);

  let insertAfter = GENERIC_END;
  for (const sdk of uniqueSdks(sdks)) {
    const sdkEnd = `<!-- END:clerk-agent-rules:${sdk} -->`;
    next = upsertMarkedBlock(
      next,
      renderClerkSdkAgentRulesBlock(sdk, eol),
      `<!-- BEGIN:clerk-agent-rules:${sdk} -->`,
      sdkEnd,
      eol,
      insertAfter,
    );
    if (next.includes(sdkEnd)) {
      insertAfter = sdkEnd;
    }
  }

  const targetStatus = fs.existsSync(targetFile) ? (next === existing ? 'unchanged' : 'updated') : 'created';
  const claudeExists = fs.existsSync(claudePath);
  const shouldCreateClaude = targetFile === agentsPath && !claudeExists;
  const claudeContent =
    targetFile === agentsPath && claudeExists ? fs.readFileSync(claudePath, { encoding: 'utf8' }) : null;
  const shouldImportAgentsInClaude =
    claudeContent !== null &&
    claudeContent !== existing &&
    !claudeContent.includes(GENERIC_START) &&
    !CLAUDE_AGENTS_IMPORT.test(claudeContent);

  if (!dryRun) {
    fs.mkdirSync?.(targetDir, { recursive: true });
    if (targetStatus !== 'unchanged') {
      fs.writeFileSync(targetFile, next, { encoding: 'utf8', mode: 0o644 });
    }
    if (shouldCreateClaude) {
      fs.writeFileSync(claudePath, '@AGENTS.md\n', { encoding: 'utf8', mode: 0o644 });
    }
    if (shouldImportAgentsInClaude && claudeContent !== null) {
      fs.writeFileSync(claudePath, appendAgentsImport(claudeContent), { encoding: 'utf8', mode: 0o644 });
    }
  }

  return {
    targetDir,
    agentsMd: targetStatus,
    claudeMd: shouldCreateClaude
      ? 'created'
      : shouldImportAgentsInClaude
        ? 'updated'
        : claudeExists
          ? 'unchanged'
          : 'skipped',
    files: [
      ...(targetStatus === 'unchanged' ? [] : [targetFile]),
      ...(shouldCreateClaude || shouldImportAgentsInClaude ? [claudePath] : []),
    ],
  };
}

export function logClerkAgentRulesResult({ files }: WriteClerkAgentRulesResult) {
  if (files.length > 0) {
    console.log(
      `[Clerk]: Updated ${files.join(' and ')} for AI coding agents. Set CLERK_AGENTS_MD=false to turn this off.`,
    );
  }
}

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
  agentsMd: 'created' | 'updated' | 'unchanged';
  claudeMd: 'created' | 'unchanged' | 'skipped';
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

export const isClerkAgentRulesSdk = (value: string): value is ClerkAgentRulesSdk => value in SDK_LABELS;

export const clerkAgentRulesSdks = Object.keys(SDK_LABELS) as ClerkAgentRulesSdk[];

export const CLERK_SDK_MCP_START = '<!-- BEGIN:clerk-mcp -->';
export const CLERK_SDK_MCP_END = '<!-- END:clerk-mcp -->';

const MCP_INTRO = `### Clerk MCP server

Use this section when a \`clerk\` MCP server (\`https://mcp.clerk.com/mcp\`) is connected. If it is not connected, tell the user they can add it:
https://clerk.com/docs/guides/ai/mcp/clerk-mcp-server`;

const MCP_ASK_BEFORE_CHANGES =
  'Ask the user before calling any Clerk MCP tool that creates or changes something in their Clerk account.';

export function renderClerkSdkMcpBlock(sdk: ClerkAgentRulesSdk, eol = '\n') {
  return normalizeEol(
    `${CLERK_SDK_MCP_START}

${MCP_INTRO}

The server lists its own tools and describes what each one does. Follow these rules on top of those descriptions:

- Get Clerk code from the SDK snippet tools (\`list_clerk_sdk_snippets\`, \`clerk_sdk_snippet\`) instead of writing it from memory.
- Check every import in a snippet against the installed \`@clerk/${sdk}\` types. If they disagree, the installed types win.
- Read the current application and instance config before you change anything.
- ${MCP_ASK_BEFORE_CHANGES} Run config changes as a dry run first and show the user the result.
- The server never returns secret keys. Do not ask the user to paste one into chat. Point them to https://dashboard.clerk.com/~/api-keys.

### Docs

Start at https://clerk.com/docs/llms.txt. Add \`.md\` to any docs URL to get Markdown.

${CLERK_SDK_MCP_END}`,
    eol,
  );
}

export function renderClerkAgentRulesBlock(eol = '\n') {
  return normalizeEol(
    `${GENERIC_START}

## Clerk: your training data is out of date

This project uses Clerk. The installed SDKs are newer than your training data. APIs,
component names, and file conventions may have changed. Read the Clerk SDK section(s)
below before writing or editing any auth code.

Never recall a Clerk API from memory. If a symbol is not in the installed package's
types, it does not exist.

This block is written by the Clerk SDK when a supported dev server starts, or by
\`npx @clerk/upgrade --agents-md\`. Removing it from a diff can recreate the uncommitted
change; commit it with your work.

${MCP_INTRO}

${MCP_ASK_BEFORE_CHANGES}

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

  if (insertAfter) {
    const insertIndex = content.indexOf(insertAfter);
    if (insertIndex !== -1) {
      const afterIndex = insertIndex + insertAfter.length;
      return `${content.slice(0, afterIndex).trimEnd()}${eol}${eol}${block}${content.slice(afterIndex)}`;
    }
  }

  return `${content.trimEnd()}${eol}${eol}${block}${eol}`;
}

function findWorkspaceRoot(fs: FileSystemAdapter, path: PathAdapter, cwd: string) {
  let current = path.resolve(cwd);
  const root = path.parse(current).root;

  while (current !== root) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    const packageJson = path.join(current, 'package.json');
    if (fs.existsSync(packageJson)) {
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

  return null;
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
  const targetDir = findWorkspaceRoot(fs, path, options.cwd) ?? path.resolve(options.cwd);
  const targetFile = pickTargetFile(fs, path, targetDir);
  const agentsPath = path.join(targetDir, 'AGENTS.md');
  const claudePath = path.join(targetDir, 'CLAUDE.md');
  const existing = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, { encoding: 'utf8' }) : '';
  const eol = detectEol(existing);

  let next = upsertMarkedBlock(existing, renderClerkAgentRulesBlock(eol), GENERIC_START, GENERIC_END, eol);

  for (const sdk of uniqueSdks(sdks)) {
    next = upsertMarkedBlock(
      next,
      renderClerkSdkAgentRulesBlock(sdk, eol),
      `<!-- BEGIN:clerk-agent-rules:${sdk} -->`,
      `<!-- END:clerk-agent-rules:${sdk} -->`,
      eol,
      GENERIC_END,
    );
  }

  const targetStatus = fs.existsSync(targetFile) ? (next === existing ? 'unchanged' : 'updated') : 'created';
  const shouldCreateClaude = targetFile === agentsPath && !fs.existsSync(claudePath);

  if (!dryRun) {
    fs.mkdirSync?.(targetDir, { recursive: true });
    if (targetStatus !== 'unchanged') {
      fs.writeFileSync(targetFile, next, { encoding: 'utf8', mode: 0o644 });
    }
    if (shouldCreateClaude) {
      fs.writeFileSync(claudePath, '@AGENTS.md\n', { encoding: 'utf8', mode: 0o644 });
    }
  }

  return {
    targetDir,
    agentsMd: targetStatus,
    claudeMd: shouldCreateClaude ? 'created' : fs.existsSync(claudePath) ? 'unchanged' : 'skipped',
  };
}

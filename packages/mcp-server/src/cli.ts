import { spawn } from 'node:child_process';

const MCP_SERVER_URL = 'https://remote-mcp-server-staging.colinclerk.workers.dev/mcp';

const args = ['-y', 'mcp-remote@latest', MCP_SERVER_URL, ...process.argv.slice(2)];
const child = spawn('npx', args, { stdio: 'inherit' });

child.on('exit', code => process.exit(code ?? 0));

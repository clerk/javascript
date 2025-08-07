import { execSync } from 'node:child_process';

export default function cli() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args[0] !== 'add') {
    console.log('Usage: npx @clerk/ui add [...packages]');
    process.exit(1);
  }

  const packageNames = args.slice(1);

  for (const packageName of packageNames) {
    if (!packageName.trim()) {
      continue;
    }

    console.log(`Adding ${packageName} component...`);

    const url = new URL(`r/${packageName}.json`, 'https://clerk.com');

    execSync(`npx -y shadcn@latest add ${url.toString()}`);
  }
}

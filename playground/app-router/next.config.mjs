import fs from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const getPath = () => path.join(process.cwd(), '.clerk', '.tmp', 'accountless.json');

function updateGitignore() {
  // Check if .git/ exists in the root directory
  // const gitDir = path.join(process.cwd(), '.git');
  // if (fs.existsSync(gitDir)) {
  //   console.log('.git directory found.');

  const gitignorePath = path.join(process.cwd(), '.gitignore');

  // Check if .gitignore exists, otherwise create it
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '');
    console.log('.gitignore created.');
  } else {
    console.log('.gitignore found.');
  }

  // Check if `.clerk/` entry exists in .gitignore
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  if (!gitignoreContent.includes('.clerk/')) {
    fs.appendFileSync(gitignorePath, '\n.clerk/\n');
    console.log('.clerk/ added to .gitignore.');
  } else {
    console.log('.clerk/ is already ignored.');
  }
  // } else {
  //   console.log('.git directory not found. Skipping .gitignore update.');
  // }
}

export default async (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    experimental: {
      // appDir: true,
      typedRoutes: true,
      // serverActions: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    env: {},
  };

  return nextConfig;

  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
    return nextConfig;
  }

  try {
    const PATH = getPath();
    await mkdir(path.dirname(PATH), { recursive: true });
    updateGitignore();

    let one = 'null';
    try {
      one = await readFile(PATH, { encoding: 'utf-8' });
    } catch {}

    const config = JSON.parse(one);

    nextConfig.env.CLERK_SECRET_KEY = config.secret_key;
    nextConfig.env.NEXT_PUBLIC_CLERK_CLAIM_TOKEN = config.claim_token;
    nextConfig.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = config.publishable_key;

    console.log('-----config', config, PATH);

    if (!config) {
      const res = await fetch('https://api.clerkstage.dev/v1/accountless_applications', {
        method: 'POST',
      }).then(res => res.json());

      await writeFile(PATH, JSON.stringify(res), {
        encoding: 'utf8',
        mode: '0777',
        flag: 'w',
      });

      console.log('---res', res);
      nextConfig.env.CLERK_SECRET_KEY = res.secret_key;
      nextConfig.env.NEXT_PUBLIC_CLERK_CLAIM_TOKEN = res.claim_token;
      nextConfig.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = res.publishable_key;
    }

    // nextConfig.env.CLERK_SECRET_KEY = res.secret_key;
    // nextConfig.env.NEXT_PUBLIC_CLERK_CLAIM_TOKEN = res.claim_token;
    // nextConfig.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = res.publishable_key;
  } catch (e) {
    console.log('--dwadawda', e);
  }

  return nextConfig;
};

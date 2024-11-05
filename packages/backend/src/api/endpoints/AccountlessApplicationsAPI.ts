import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { AccountlessApplication } from '../resources/AccountlessApplication';
import { AbstractAPI } from './AbstractApi';

const basePath = '/accountless_applications';

const getPath = () => path.join(process.cwd(), 'node_modules', '.cache', 'clerkjs', 'ephemeral.json');

export class AccountlessApplicationAPI extends AbstractAPI {
  public async createAccountlessApplication() {
    return this.request<AccountlessApplication>({
      method: 'POST',
      path: basePath,
    });
  }

  public async store(obj: AccountlessApplication) {
    const PATH = getPath();
    await mkdir(path.dirname(PATH), { recursive: true });

    const content = JSON.stringify(obj);

    await writeFile(PATH, content, {
      encoding: 'utf8',
      mode: '0777',
      flag: 'w',
    });
  }

  public async read(): Promise<AccountlessApplication | null> {
    try {
      const PATH = getPath();
      // if (fs.existsSync(PATH)) {
      const config = JSON.parse(await readFile(PATH, { encoding: 'utf-8' }));

      // if (config.expiresAt < now()) {
      //   return null;
      // }

      // @ts-ignore
      return new AccountlessApplication(config.publishableKey, config.secretKey, config.claimToken);
      // }
    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        return null;
      }

      throw error;
    }
  }
}

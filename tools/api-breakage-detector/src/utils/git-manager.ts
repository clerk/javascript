import { execSync } from 'child_process';

/**
 * Handles Git operations for the API breakage detector
 */
export class GitManager {
  constructor(private workspaceRoot: string) {}

  async getCurrentBranch(): Promise<string> {
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.workspaceRoot,
        encoding: 'utf8',
      }).trim();
      return branch;
    } catch (error) {
      throw new Error(`Failed to get current branch: ${error}`);
    }
  }

  async checkoutBranch(branch: string): Promise<void> {
    try {
      execSync(`git checkout ${branch}`, {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      });
    } catch (error) {
      throw new Error(`Failed to checkout branch ${branch}: ${error}`);
    }
  }

  async getLastCommit(branch: string): Promise<string> {
    try {
      const commit = execSync(`git rev-parse ${branch}`, {
        cwd: this.workspaceRoot,
        encoding: 'utf8',
      }).trim();
      return commit;
    } catch (error) {
      throw new Error(`Failed to get last commit for ${branch}: ${error}`);
    }
  }

  async hasUncommittedChanges(): Promise<boolean> {
    try {
      const status = execSync('git status --porcelain', {
        cwd: this.workspaceRoot,
        encoding: 'utf8',
      }).trim();
      return status.length > 0;
    } catch (error) {
      throw new Error(`Failed to check Git status: ${error}`);
    }
  }

  async stashChanges(): Promise<string> {
    try {
      const stashName = `api-breakage-detector-${Date.now()}`;
      execSync(`git stash push -m "${stashName}"`, {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      });
      return stashName;
    } catch (error) {
      throw new Error(`Failed to stash changes: ${error}`);
    }
  }

  async popStash(stashName: string): Promise<void> {
    try {
      // Find the stash by name and pop it
      const stashList = execSync('git stash list', {
        cwd: this.workspaceRoot,
        encoding: 'utf8',
      });

      const stashIndex = stashList.split('\n').findIndex(line => line.includes(stashName));

      if (stashIndex >= 0) {
        execSync(`git stash pop stash@{${stashIndex}}`, {
          cwd: this.workspaceRoot,
          stdio: 'pipe',
        });
      }
    } catch (error) {
      console.warn(`Failed to pop stash ${stashName}:`, error);
    }
  }

  async fetchBranch(branch: string): Promise<void> {
    try {
      execSync(`git fetch origin ${branch}`, {
        cwd: this.workspaceRoot,
        stdio: 'pipe',
      });
    } catch (error) {
      console.warn(`Failed to fetch branch ${branch}:`, error);
    }
  }
}

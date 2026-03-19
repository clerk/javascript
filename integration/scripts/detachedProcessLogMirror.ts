import { readFile } from 'node:fs/promises';

type DetachedProcessLogMirrorOptions = {
  stdoutFilePath?: string;
  stderrFilePath?: string;
  log: (msg: string) => void;
  intervalInMs?: number;
};

type FileReadState = {
  contentsLength: number;
  hasLoggedReadError: boolean;
};

const readNewLogOutput = async (filePath: string, label: string, log: (msg: string) => void, state: FileReadState) => {
  try {
    const contents = await readFile(filePath, 'utf8');
    if (contents.length < state.contentsLength) {
      state.contentsLength = 0;
    }
    if (contents.length === state.contentsLength) {
      return;
    }

    const nextChunk = contents.slice(state.contentsLength);
    state.contentsLength = contents.length;
    state.hasLoggedReadError = false;

    nextChunk
      .split(/\r?\n/)
      .map(line => line.trimEnd())
      .filter(Boolean)
      .forEach(line => log(`${label} ${line}`));
  } catch (error) {
    const readError = error as NodeJS.ErrnoException;
    if (readError.code === 'ENOENT') {
      return;
    }
    if (!state.hasLoggedReadError) {
      log(`${label} Failed to read ${filePath}: ${readError.message}`);
      state.hasLoggedReadError = true;
    }
  }
};

export const startDetachedProcessLogMirror = (opts: DetachedProcessLogMirrorOptions) => {
  const { stdoutFilePath, stderrFilePath, log, intervalInMs = 1000 } = opts;
  const stdoutState: FileReadState = { contentsLength: 0, hasLoggedReadError: false };
  const stderrState: FileReadState = { contentsLength: 0, hasLoggedReadError: false };
  let isReading = false;
  let isStopped = false;

  const flush = async () => {
    await Promise.all([
      stdoutFilePath ? readNewLogOutput(stdoutFilePath, '[stdout]', log, stdoutState) : Promise.resolve(),
      stderrFilePath ? readNewLogOutput(stderrFilePath, '[stderr]', log, stderrState) : Promise.resolve(),
    ]);
  };

  const timer = setInterval(() => {
    if (isStopped || isReading) {
      return;
    }
    isReading = true;
    void flush().finally(() => {
      isReading = false;
    });
  }, intervalInMs);

  timer.unref?.();

  return {
    stop: async () => {
      isStopped = true;
      clearInterval(timer);

      while (isReading) {
        await new Promise(resolve => setTimeout(resolve, 25));
      }

      await flush();
    },
  };
};

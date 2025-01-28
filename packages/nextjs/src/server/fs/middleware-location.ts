import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './utils';

function hasSrcAppDir() {
  const { existsSync } = nodeFsOrThrow();
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();

  const projectWithAppSrc = path.join(cwd(), 'src', 'app');

  return !!existsSync(projectWithAppSrc);
}

function suggestMiddlewareLocation() {
  const suggestionMessage = (to?: 'src/', from?: 'src/app/' | 'app/') =>
    `Clerk: clerkMiddleware() was not run, your middleware file might be misplaced. Move your middleware file to ./${to || ''}middleware.ts. Currently located at ./${from || ''}middleware.ts`;

  const { existsSync } = nodeFsOrThrow();
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();

  const projectWithAppSrcPath = path.join(cwd(), 'src', 'app');
  const projectWithAppPath = path.join(cwd(), 'app');

  if (existsSync(projectWithAppSrcPath)) {
    if (existsSync(path.join(projectWithAppSrcPath, 'middleware.ts'))) {
      return suggestionMessage('src/', 'src/app/');
    }

    if (existsSync(path.join(cwd(), 'middleware.ts'))) {
      return suggestionMessage('src/');
    }

    // default error
    return undefined;
  }

  if (existsSync(projectWithAppPath)) {
    if (existsSync(path.join(projectWithAppPath, 'middleware.ts'))) {
      return suggestionMessage(undefined, 'app/');
    }
    // default error
    return undefined;
  }

  return undefined;
}

export { suggestMiddlewareLocation, hasSrcAppDir };

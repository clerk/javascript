import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './utils';

function hasSrcAppDir() {
  const { existsSync } = nodeFsOrThrow();
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();

  const projectWithAppSrc = path.join(cwd(), 'src', 'app');

  return !!existsSync(projectWithAppSrc);
}

function suggestMiddlewareLocation() {
  const fileExtensions = ['ts', 'js'] as const;
  const suggestionMessage = (extension: (typeof fileExtensions)[number], to?: 'src/', from?: 'src/app/' | 'app/') =>
    `Clerk: clerkMiddleware() was not run, your middleware file might be misplaced. Move your middleware file to ./${to || ''}middleware.${extension}. Currently located at ./${from || ''}middleware.${extension}`;

  const { existsSync } = nodeFsOrThrow();
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();

  const projectWithAppSrcPath = path.join(cwd(), 'src', 'app');
  const projectWithAppPath = path.join(cwd(), 'app');

  if (existsSync(projectWithAppSrcPath)) {
    for (const fileExtension of fileExtensions) {
      if (existsSync(path.join(projectWithAppSrcPath, `middleware.${fileExtension}`))) {
        return suggestionMessage(fileExtension, 'src/', 'src/app/');
      }

      if (existsSync(path.join(cwd(), `middleware.${fileExtension}`))) {
        return suggestionMessage(fileExtension, 'src/');
      }
    }

    // default error
    return undefined;
  }

  if (existsSync(projectWithAppPath)) {
    for (const fileExtension of fileExtensions) {
      if (existsSync(path.join(projectWithAppPath, `middleware.${fileExtension}`))) {
        return suggestionMessage(fileExtension, undefined, 'app/');
      }
    }
    // default error
    return undefined;
  }

  return undefined;
}

export { suggestMiddlewareLocation, hasSrcAppDir };

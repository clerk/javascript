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
  const suggestionMessage = (
    extension: (typeof fileExtensions)[number],
    to: 'src/' | '',
    from: 'src/app/' | 'app/' | '',
  ) =>
    `Clerk: clerkMiddleware() was not run, your middleware file might be misplaced. Move your middleware file to ./${to}middleware.${extension}. Currently located at ./${from}middleware.${extension}`;

  const { existsSync } = nodeFsOrThrow();
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();

  const projectWithAppSrcPath = path.join(cwd(), 'src', 'app');
  const projectWithAppPath = path.join(cwd(), 'app');

  const checkMiddlewareLocation = (
    basePath: string,
    to: 'src/' | '',
    from: 'src/app/' | 'app/' | '',
  ): string | undefined => {
    for (const fileExtension of fileExtensions) {
      if (existsSync(path.join(basePath, `middleware.${fileExtension}`))) {
        return suggestionMessage(fileExtension, to, from);
      }
    }
    return undefined;
  };

  if (existsSync(projectWithAppSrcPath)) {
    return (
      checkMiddlewareLocation(projectWithAppSrcPath, 'src/', 'src/app/') || checkMiddlewareLocation(cwd(), 'src/', '')
    );
  }

  if (existsSync(projectWithAppPath)) {
    return checkMiddlewareLocation(projectWithAppPath, '', 'app/');
  }

  return undefined;
}

export { suggestMiddlewareLocation, hasSrcAppDir };

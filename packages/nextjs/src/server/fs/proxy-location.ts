import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './utils';

function hasSrcAppDir() {
  const { existsSync } = nodeFsOrThrow();
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();

  const projectWithAppSrc = path.join(cwd(), 'src', 'app');

  return !!existsSync(projectWithAppSrc);
}

function suggestProxyLocation() {
  const fileExtensions = ['ts', 'js'] as const;
  const suggestionMessage = (
    extension: (typeof fileExtensions)[number],
    to: 'src/' | '',
    from: 'src/app/' | 'app/' | '',
  ) =>
    `Clerk: clerkMiddleware() was not run, your proxy file might be misplaced. Move your proxy file to ./${to}proxy.${extension}. Currently located at ./${from}proxy.${extension}`;

  const { existsSync } = nodeFsOrThrow();
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();

  const projectWithAppSrcPath = path.join(cwd(), 'src', 'app');
  const projectWithAppPath = path.join(cwd(), 'app');

  const checkProxyLocation = (
    basePath: string,
    to: 'src/' | '',
    from: 'src/app/' | 'app/' | '',
  ): string | undefined => {
    for (const fileExtension of fileExtensions) {
      if (existsSync(path.join(basePath, `proxy.${fileExtension}`))) {
        return suggestionMessage(fileExtension, to, from);
      }
    }
    return undefined;
  };

  if (existsSync(projectWithAppSrcPath)) {
    return checkProxyLocation(projectWithAppSrcPath, 'src/', 'src/app/') || checkProxyLocation(cwd(), 'src/', '');
  }

  if (existsSync(projectWithAppPath)) {
    return checkProxyLocation(projectWithAppPath, '', 'app/');
  }

  return undefined;
}

export { suggestProxyLocation, hasSrcAppDir };

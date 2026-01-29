import { isNext16OrHigher, middlewareFileReference } from '../../utils/sdk-versions';
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
  // Next.js 16+ supports both middleware.ts (Edge runtime) and proxy.ts (Node.js runtime)
  const fileNames = isNext16OrHigher ? ['middleware', 'proxy'] : ['middleware'];

  const suggestionMessage = (
    fileName: string,
    extension: (typeof fileExtensions)[number],
    to: 'src/' | '',
    from: 'src/app/' | 'app/' | '',
  ) =>
    `Clerk: clerkMiddleware() was not run, your ${middlewareFileReference} file might be misplaced. Move your ${middlewareFileReference} file to ./${to}${fileName}.${extension}. Currently located at ./${from}${fileName}.${extension}`;

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
    for (const fileName of fileNames) {
      for (const fileExtension of fileExtensions) {
        if (existsSync(path.join(basePath, `${fileName}.${fileExtension}`))) {
          return suggestionMessage(fileName, fileExtension, to, from);
        }
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

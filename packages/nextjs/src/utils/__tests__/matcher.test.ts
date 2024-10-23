import { pathToRegexp } from '@clerk/shared/pathToRegexp';

const createMatcher = (config: { matcher: string[] }) => (path: string) => {
  return config.matcher.some(matcher => {
    return pathToRegexp(matcher).test(path);
  });
};

describe('nextjs matcher', () => {
  /**
   * 🚨🚨🚨🚨
   * This is the matcher we document for clerkMiddleware.
   * Any change made to the matcher here needs to be reflected in the documentation, the dashboard
   * and vice versa.
   * 🚨🚨🚨🚨
   */
  const config = {
    matcher: [
      // Skip Next.js internals and all static files, unless found in search params
      '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
      // Always run for API routes
      '/(api|trpc)(.*)',
    ],
  };

  const match = createMatcher(config);

  it.each([
    // Skip nextjs internals
    '/_next', //
    '/_next/',
    '/_next/static/',
    '/_next/static',
    '/_next/images',
    '/favicon.ico',
    // Skip android manifest file
    '/site.webmanifest',
    // Skip normal files
    '/file.js',
    '/img.jpeg',
    '/img.jpg',
    '/img.png',
    '/img.jpg?param=1',
    // We can't cover this case without extremely complex regex
    // '/img.jpg?param=img.jpg',
  ])('skips the middleware for "%s"', async path => {
    expect(match(path)).toBe(false);
  });

  it.each([
    // Always protect /api and /trpc
    '/api/', //
    '/api',
    '/api/endpoint',
    '/api/endpoint.json',
    '/trpc',
    '/trpc/',
    '/trpc/endpoint',
    '/trpc/endpoint.json',
    '/trpc/endpoint.action',
    // Paths with file extensions are not files without `.`
    '/somethingjpg',
    // Always protect jsons
    '/file.json',
    '/file.json/',
    '/a/b.json',
    // Sanity checks for paths
    '/',
    '/path',
    '/path/',
    '/nested/path',
    '/nested/path/multiple/levels',
    // Paths with slugs containing `.` are not files
    '/slug-123',
    '/sl.ug-123',
    '/sl.ug',
    '/clerk.com',
    // Paths containing search params are not files, even if they contain a file extension
    '/download?filename=1.jpg',
    '/download/?filename=1.jpg',
    '/download?test=1&filename=1.jpg',
    '/download?filename=1.jpg&test=1',
    '/download?filename=1.png&test=1',
  ])('triggers the middleware for "%s"', path => {
    expect(match(path)).toBe(true);
  });
});

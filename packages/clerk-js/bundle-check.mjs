//@ts-check
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pipeline } from 'node:stream';
import zlib from 'node:zlib';

import { chromium } from '@playwright/test';

/**
 * This script generates a CLI report detailing the gzipped size of JavaScript resources loaded by `clerk-js` for a
 * given configuration. This is useful to ensure that the total amount of loaded JavaScript does not exceed the
 * anticipated amount for a particular invocation.
 *
 * Note: The publishable key embedded in this script isn't anything special; any publishable key will do, so feel free
 * to replace it with another key should the current one stop working.
 */

/**
 * The base HTML file that each case will be executed against. Loads `clerk-js` from the local server in addition to
 * creating an instance of `VirtualRouter`.
 * @param {string} script The case-specific code to execute, typically to mount a component like `SignIn`.
 */
function template(script) {
  return `
<!DOCTYPE html>
<html>
    <body>
        <div id="app"></div>
        <script
          type="text/javascript"
          src="/clerk.browser.js"
          data-clerk-publishable-key="pk_test_Zmx1ZW50LWxhYnJhZG9yLTM0LmNsZXJrLmFjY291bnRzLmRldiQ"
        ></script>
        <script type="text/javascript">
        class VirtualRouter {
            name = 'VirtualRouter';
            mode = 'virtual';

            #url;
            #listeners = new Set();

            constructor(path) {
                const origin = typeof window === 'undefined' ? 'https://clerk.dummy' : window.location.origin;

                this.#url = new URL(path ?? '/', origin);
            }

            push(path) {
                const newUrl = new URL(this.#url.toString());
                newUrl.pathname = path;

                this.#url = newUrl;
                this.emit();
            }

            replace(path) {
                this.push(path);
            }

            shallowPush(path) {
                this.push(path);
            }

            pathname() {
                return this.#url.pathname;
            }

            searchParams() {
                return this.#url.searchParams;
            }

            subscribe(listener) {
                this.#listeners.add(listener);

                return () => this.#listeners.delete(listener);
            }

            emit() {
                this.#listeners.forEach(listener => listener(this.#url));
            }

            getSnapshot() {
                return this.#url;
            }
        }
        window.VIRTUAL_ROUTER = new VirtualRouter('/');
        </script>
        <script type="text/javascript">${script}</script>
    </body>
</html>
`;
}

function signIn() {
  const script = `
window.Clerk.load({ router: window.VIRTUAL_ROUTER }).then(() => {
  window.Clerk.mountSignIn(document.getElementById("app"), {});
});
`;
  return template(script);
}

function signUp() {
  const script = `
window.Clerk.load({ router: window.VIRTUAL_ROUTER }).then(() => {
  window.Clerk.mountSignUp(document.getElementById("app"), {});
});
`;
  return template(script);
}

/**
 * Map of URL routes to functions that return the HTML content of the page. This script will generate a report for each
 * of the routes defined here.
 */
const routes = {
  '/sign-in': signIn(),
  '/sign-up': signUp(),
};

const SERVER_ROOT = path.resolve('./dist');

const server = http
  .createServer((req, res) => {
    const onError = err => {
      if (err) {
        res.end();
        console.error(err);
      }
    };

    // This should never happen, and is only here to appease TypeScript. `req.url` is always defined for incoming
    // messages received by the HTTP server.
    if (!req.url) {
      throw new Error('Unable to determine URL from request.');
    }

    if (req.url in routes) {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(routes[req.url]);
      return;
    }

    const filePath = path.resolve(SERVER_ROOT, `.${req.url}`);
    // This is here to prevent GitHub from complaining about a security vulnerability.
    if (!filePath.startsWith(SERVER_ROOT)) {
      res.writeHead(403, { 'content-type': 'text/plain' });
      res.end('403 Forbidden\n');
      console.error(`Attempted to access ${filePath}, which is outsite of SERVER_ROOT directory ${SERVER_ROOT}.`);
      return;
    }
    const extname = path.extname(filePath);
    if (fs.existsSync(filePath) && (extname === '.js' || extname === '.css')) {
      const contentType = extname === '.js' ? 'text/javascript' : 'text/css';
      res.writeHead(200, { 'content-encoding': 'gzip', 'content-type': contentType, vary: 'Accept-Encoding' });
      // We specifically use gzip here since that's the bundle size we really care about.
      pipeline(fs.createReadStream(filePath), zlib.createGzip(), res, onError);
    } else {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('404 Not Found\n');
    }
  })
  .listen(4000);

const byteFormatter = Intl.NumberFormat('en', {
  notation: 'compact',
  style: 'unit',
  unit: 'byte',
  unitDisplay: 'narrow',
});
/**
 * Format bytes into a human-readable string with appropriate units
 * @param {number} bytes
 */
function formatFileSize(bytes) {
  return byteFormatter.format(bytes);
}

/**
 * Generate and print a table detailing the scripts loaded and their response sizes.
 * @param {string} url
 * @param {{ url: string; sizes: { responseBodySize: number; }; }[]} responses
 */
function report(url, responses) {
  // Start with a new line for readability
  console.log('\n' + url);

  // We only care about JavaScript files loaded from localhost. This removes stuff like favicon and API calls.
  const matchingFiles = responses.filter(r => {
    return r.url.startsWith('http://localhost:4000') && r.url.endsWith('.js');
  });

  const data = Object.fromEntries(
    matchingFiles.map(r => {
      const [, path] = r.url.split('4000/');
      return [path, { size: formatFileSize(r.sizes.responseBodySize) }];
    }),
  );

  // Calculate a total size of all matching resources.
  data['(total)'] = {
    size: formatFileSize(
      matchingFiles.reduce((a, b) => {
        return a + b.sizes.responseBodySize;
      }, 0),
    ),
  };

  console.table(data);
}

/**
 * Loads the given `url` in `browser`, capturing all HTTP requests that occur.
 * @param {import('@playwright/test').Browser} browser
 * @param {string} url
 */
async function getResponseSizes(browser, url) {
  const page = await browser.newPage();

  /** @type {Promise<{ url: string, sizes: { responseBodySize: number } }>[]} */
  const promises = [];

  page.on('response', res => {
    promises.push(
      res
        .request()
        .sizes()
        .then(sizes => {
          return { url: res.url(), sizes };
        }),
    );
    return res;
  });

  await page.goto(`http://localhost:4000${url}`);
  // Instead of waiting for a specific element, we simply wait for the network to be idle. This is because there aren't
  // any elements that exist reliably in every test case.
  await page.waitForLoadState('networkidle');
  const sizes = await Promise.all(promises);
  await page.close();

  return sizes;
}

(async () => {
  const browser = await chromium.launch();

  const testUrls = Object.keys(routes);
  for (const url of testUrls) {
    const sizes = await getResponseSizes(browser, url);
    report(url, sizes);
  }

  await browser.close();
  server.close();
})();

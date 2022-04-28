import React from 'react';

function isStaging(frontendApi: string): boolean {
  return (
    frontendApi.endsWith('.lclstage.dev') ||
    frontendApi.endsWith('.stgstage.dev') ||
    frontendApi.endsWith('.clerkstage.dev')
  );
}

const getScriptUrl = (frontendApi: string, libVersion: string) => {
  const major = libVersion.includes('alpha') ? 'next' : isStaging(frontendApi) ? 'staging' : libVersion.split('.')[0];
  return `https://${frontendApi}/npm/@clerk/clerk-js@${major}/dist/clerk.browser.js`;
};

const createInterstitialHTMLString = (frontendApi: string, libVersion: string, debugData: any) => {
  return `
    <head>
        <meta charset="UTF-8" />
    </head>
    <body>
        <script>
            window.__clerk_debug = ${JSON.stringify(debugData || {})};
            window.startClerk = async () => {
                const Clerk = window.Clerk;
                try {
                    await Clerk.load();
                    window.location.reload();
                } catch (err) {
                    console.error('Clerk: ', err);
                }
            };
            (() => {
                const script = document.createElement('script');
                script.setAttribute('data-clerk-frontend-api', '${frontendApi}');
                script.async = true;
                script.src = '${getScriptUrl(frontendApi, libVersion)}';
                script.addEventListener('load', startClerk);
                document.body.appendChild(script);
            })();
        </script>
    </body>
`;
};

export function Interstitial(opts: { frontendApi: string; version: string; debugData: any }) {
  return (
    <html
      dangerouslySetInnerHTML={{ __html: createInterstitialHTMLString(opts.frontendApi, opts.version, opts.debugData) }}
    />
  );
}

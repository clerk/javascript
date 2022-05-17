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
                function formRedirect(){
                    const form = '<form method="get" action="" name="redirect"></form>';
                    document.body.innerHTML = document.body.innerHTML + form;

                    const searchParams = new URLSearchParams(window.location.search);
                    for (let paramTuple of searchParams) {
                        const input = document.createElement("input");
                        input.type = "hidden";
                        input.name = paramTuple[0];
                        input.value = paramTuple[1];
                        document.forms.redirect.appendChild(input);
                    }
                    const url = new URL(window.location.origin + window.location.pathname + window.location.hash);
                    window.history.pushState({}, '', url);

                    document.forms.redirect.action = window.location.pathname + window.location.hash;
                    document.forms.redirect.submit();
                }

                const Clerk = window.Clerk;
                try {
                    await Clerk.load();
                    if(window.location.href.indexOf("#") === -1){
                      window.location.href = window.location.href;
                    } else if (window.navigator.userAgent.toLowerCase().includes("firefox/")){
                        formRedirect();
                    } else {
                        window.location.reload();
                    }
                } catch (err) {
                    console.error('Clerk: ', err);
                }
            };
            (() => {
                const script = document.createElement('script');
                script.setAttribute('data-clerk-frontend-api', '${frontendApi}');
                script.async = true;
                script.src = '${getScriptUrl(frontendApi, libVersion)}';
                script.crossOrigin = 'anonymous';
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

export const fixtures = [
  {
    name: 'Basic await transform',
    source: `
import { auth } from '@clerk/nextjs/server';

export function any() {
    const { userId } = auth();
    return new Response(JSON.stringify({ userId }));
}

export function another() {
    return true;
}
    `,
    output: `
import { auth } from '@clerk/nextjs/server';

export async function any() {
    const { userId } = await auth();
    return new Response(JSON.stringify({ userId }));
}

export function another() {
    return true;
}
    `,
  },
  {
    name: 'Arrow function await transform',
    source: `
'use server';

import { patchCommunication, postSMSTemplate } from '@/app/api/instances';
import { Instance } from '@/app/api/types/instances';
import { Template } from '@/app/api/types/templates';
import { auth } from '@clerk/nextjs/server';

export const toggleSMSTemplate = async (
  instanceId: string,
  template: Template,
) => {
  const { getToken } = auth();

  return await postSMSTemplate(instanceId, template, {
    token: await getToken(),
  });
};`,
    output: `
'use server';

import { patchCommunication, postSMSTemplate } from '@/app/api/instances';
import { Instance } from '@/app/api/types/instances';
import { Template } from '@/app/api/types/templates';
import { auth } from '@clerk/nextjs/server';

export const toggleSMSTemplate = async (
  instanceId: string,
  template: Template,
) => {
  const { getToken } = await auth();

  return await postSMSTemplate(instanceId, template, {
    token: await getToken(),
  });
};`,
  },
  {
    name: 'auth().protect -> await auth.protect()',
    source: `
import { auth } from '@clerk/nextjs/server';

export function GET() {
    const { userId } = auth().protect(
        (has) => has({ role: 'admin' }) || has({ role: 'org:editor' }),
    );
    return new Response(JSON.stringify({ userId }));
}
    `,
    output: `
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = await auth.protect(
        (has) => has({ role: 'admin' }) || has({ role: 'org:editor' }),
    );
    return new Response(JSON.stringify({ userId }));
}
    `,
  },
  {
    name: 'Basic clerkMiddleware()',
    source: `
  import {
      clerkMiddleware,
      createRouteMatcher
  } from "@clerk/nextjs/server"

  const isPublicRoute = createRouteMatcher(["/", "/contact"])

  export default clerkMiddleware((auth, req) => {
      auth().protect(); // for any other route, require auth
  })
      `,
    output: `
  import {
      clerkMiddleware,
      createRouteMatcher
  } from "@clerk/nextjs/server"

  const isPublicRoute = createRouteMatcher(["/", "/contact"])

  export default clerkMiddleware(async (auth, req) => {
      await auth.protect(); // for any other route, require auth
  })
      `,
  },
  {
    name: 'Complex clerkMiddleware()',
    source: `
  import {
      clerkMiddleware,
      createRouteMatcher
  } from "@clerk/nextjs/server"
  import createMiddleware from "next-intl/middleware"

  const intlMiddleware = createMiddleware({
      locales: ["en", "de"],
      defaultLocale: "en",
  })

  const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"])

  export default clerkMiddleware((auth, request) => {
      if (isDashboardRoute(request)) auth().protect()

      return intlMiddleware(request)
  })
      `,
    output: `
  import {
      clerkMiddleware,
      createRouteMatcher
  } from "@clerk/nextjs/server"
  import createMiddleware from "next-intl/middleware"

  const intlMiddleware = createMiddleware({
      locales: ["en", "de"],
      defaultLocale: "en",
  })

  const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"])

  export default clerkMiddleware(async (auth, request) => {
      if (isDashboardRoute(request)) await auth.protect()

      return intlMiddleware(request)
  })
  `,
  },
  {
    name: 'Complex clerkMiddleware() with protect being destructured from auth()',
    source: `
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(
  (auth, req) => {
    const { protect, sessionClaims } = auth();

    protect();
  },
);
`,
    output: `
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(
  async (auth, req) => {
    const {
      sessionClaims
    } = await auth();

    await auth.protect();
  },
);
`,
  },
  {
    name: 'Does not transform other imports',
    source: `
  import { auth } from '@some/other/module';

  export function any() {
      const { IBauthed } = auth();
      return new Response(JSON.stringify({ IBauthed }));
  }
      `,
    output: '',
  },
];

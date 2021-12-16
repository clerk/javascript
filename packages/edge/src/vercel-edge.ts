import {
  INTERSTITIAL_METHOD,
  INTERSTITIAL_URL,
  SDK_USER_AGENT,
} from "./consts/interstitial";
import { NextRequest, NextFetchEvent, NextResponse } from "next/server";
import { API_KEY, AuthStatus, Session, Base } from "@clerk/backend-core";

type Middleware = (
  req: NextRequest,
  event: NextFetchEvent
) => Response | void | Promise<Response | void>;

/** 
 * 
 * Required implementations for the runtime:
 * 1. Import Key
 * 2. Verify Signature
 * 3. Decode Base64
 * 4. Fetch Interstitial
 * 
 */

const importKey = async (jwk: JsonWebKey, algorithm: Algorithm) => {
  return await crypto.subtle.importKey("jwk", jwk, algorithm, true, ["verify"]);
};

const verifySignature = async (
  algorithm: Algorithm,
  key: CryptoKey,
  signature: Uint8Array,
  data: Uint8Array
) => {
  return await crypto.subtle.verify(algorithm, key, signature, data);
};

const decodeBase64 = (base64: string) => atob(base64);

async function fetchInterstitial() {
  const response = await fetch(INTERSTITIAL_URL, {
    method: INTERSTITIAL_METHOD,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "user-agent": SDK_USER_AGENT,
    },
  });

  return response.text();
}

/** Base initialization */

const vercelEdgeBase = new Base(importKey, verifySignature, decodeBase64);

/** Export standalone verifySessionToken */

export const verifySessionToken = vercelEdgeBase.verifySessionToken;

/** Export middleware wrapper */

export type NextRequestWithSession = NextRequest & { session: Session };

export function withSession(handler: Middleware) {
  return async function clerkAuth(req: NextRequest, event: NextFetchEvent) {
    const { status, session, interstitial } = await vercelEdgeBase.getAuthState(
      {
        cookieToken: req.cookies["__session"],
        clientUat: req.cookies["__client_uat"],
        headerToken: req.headers.get("authorization"),
        origin: req.headers.get("origin"),
        host: req.headers.get("host"),
        forwardedPort: req.headers.get("x-forwarded-port"),
        forwardedHost: req.headers.get("x-forwarded-host"),
        referrer: req.headers.get("referrer"),
        fetchInterstitial,
      }
    );

    if (status === AuthStatus.SignedOut) {
      handler(req, event);
    }

    if (status === AuthStatus.Interstitial) {
      return new NextResponse(interstitial, {
        headers: { "Content-Type": "text/html" },
        status: 401,
      });
    }

    if (status === AuthStatus.SignedIn) {
      // @ts-ignore
      req.session = session;
      handler(req, event);
    }
  };
}

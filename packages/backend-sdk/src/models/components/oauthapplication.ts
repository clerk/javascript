/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

export const OAuthApplicationObject = {
  OauthApplication: 'oauth_application',
} as const;
export type OAuthApplicationObject = ClosedEnum<typeof OAuthApplicationObject>;

export type OAuthApplication = {
  object: OAuthApplicationObject;
  id: string;
  instanceId: string;
  name: string;
  clientId: string;
  public: boolean;
  scopes: string;
  redirectUris: Array<string>;
  /**
   * Deprecated: Use redirect_uris instead.
   *
   * @remarks
   *
   * @deprecated field: This will be removed in a future release, please migrate away from it as soon as possible.
   */
  callbackUrl: string;
  authorizeUrl: string;
  tokenFetchUrl: string;
  userInfoUrl: string;
  discoveryUrl: string;
  tokenIntrospectionUrl: string;
  /**
   * Unix timestamp of creation.
   *
   * @remarks
   */
  createdAt: number;
  /**
   * Unix timestamp of last update.
   *
   * @remarks
   */
  updatedAt: number;
};

/** @internal */
export const OAuthApplicationObject$inboundSchema: z.ZodNativeEnum<typeof OAuthApplicationObject> =
  z.nativeEnum(OAuthApplicationObject);

/** @internal */
export const OAuthApplicationObject$outboundSchema: z.ZodNativeEnum<typeof OAuthApplicationObject> =
  OAuthApplicationObject$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OAuthApplicationObject$ {
  /** @deprecated use `OAuthApplicationObject$inboundSchema` instead. */
  export const inboundSchema = OAuthApplicationObject$inboundSchema;
  /** @deprecated use `OAuthApplicationObject$outboundSchema` instead. */
  export const outboundSchema = OAuthApplicationObject$outboundSchema;
}

/** @internal */
export const OAuthApplication$inboundSchema: z.ZodType<OAuthApplication, z.ZodTypeDef, unknown> = z
  .object({
    object: OAuthApplicationObject$inboundSchema,
    id: z.string(),
    instance_id: z.string(),
    name: z.string(),
    client_id: z.string(),
    public: z.boolean(),
    scopes: z.string(),
    redirect_uris: z.array(z.string()),
    callback_url: z.string(),
    authorize_url: z.string(),
    token_fetch_url: z.string(),
    user_info_url: z.string(),
    discovery_url: z.string(),
    token_introspection_url: z.string(),
    created_at: z.number().int(),
    updated_at: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      instance_id: 'instanceId',
      client_id: 'clientId',
      redirect_uris: 'redirectUris',
      callback_url: 'callbackUrl',
      authorize_url: 'authorizeUrl',
      token_fetch_url: 'tokenFetchUrl',
      user_info_url: 'userInfoUrl',
      discovery_url: 'discoveryUrl',
      token_introspection_url: 'tokenIntrospectionUrl',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    });
  });

/** @internal */
export type OAuthApplication$Outbound = {
  object: string;
  id: string;
  instance_id: string;
  name: string;
  client_id: string;
  public: boolean;
  scopes: string;
  redirect_uris: Array<string>;
  callback_url: string;
  authorize_url: string;
  token_fetch_url: string;
  user_info_url: string;
  discovery_url: string;
  token_introspection_url: string;
  created_at: number;
  updated_at: number;
};

/** @internal */
export const OAuthApplication$outboundSchema: z.ZodType<OAuthApplication$Outbound, z.ZodTypeDef, OAuthApplication> = z
  .object({
    object: OAuthApplicationObject$outboundSchema,
    id: z.string(),
    instanceId: z.string(),
    name: z.string(),
    clientId: z.string(),
    public: z.boolean(),
    scopes: z.string(),
    redirectUris: z.array(z.string()),
    callbackUrl: z.string(),
    authorizeUrl: z.string(),
    tokenFetchUrl: z.string(),
    userInfoUrl: z.string(),
    discoveryUrl: z.string(),
    tokenIntrospectionUrl: z.string(),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      instanceId: 'instance_id',
      clientId: 'client_id',
      redirectUris: 'redirect_uris',
      callbackUrl: 'callback_url',
      authorizeUrl: 'authorize_url',
      tokenFetchUrl: 'token_fetch_url',
      userInfoUrl: 'user_info_url',
      discoveryUrl: 'discovery_url',
      tokenIntrospectionUrl: 'token_introspection_url',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OAuthApplication$ {
  /** @deprecated use `OAuthApplication$inboundSchema` instead. */
  export const inboundSchema = OAuthApplication$inboundSchema;
  /** @deprecated use `OAuthApplication$outboundSchema` instead. */
  export const outboundSchema = OAuthApplication$outboundSchema;
  /** @deprecated use `OAuthApplication$Outbound` instead. */
  export type Outbound = OAuthApplication$Outbound;
}

export function oAuthApplicationToJSON(oAuthApplication: OAuthApplication): string {
  return JSON.stringify(OAuthApplication$outboundSchema.parse(oAuthApplication));
}

export function oAuthApplicationFromJSON(jsonString: string): SafeParseResult<OAuthApplication, SDKValidationError> {
  return safeParse(
    jsonString,
    x => OAuthApplication$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'OAuthApplication' from JSON`,
  );
}

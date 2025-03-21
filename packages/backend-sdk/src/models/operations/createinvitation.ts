/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { ClosedEnum } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';

/**
 * The slug of the email template to use for the invitation email.
 */
export const TemplateSlug = {
  Invitation: 'invitation',
  WaitlistInvitation: 'waitlist_invitation',
} as const;
/**
 * The slug of the email template to use for the invitation email.
 */
export type TemplateSlug = ClosedEnum<typeof TemplateSlug>;

/**
 * Required parameters
 */
export type CreateInvitationRequestBody = {
  /**
   * The email address the invitation will be sent to
   */
  emailAddress: string;
  /**
   * Metadata that will be attached to the newly created invitation.
   *
   * @remarks
   * The value of this property should be a well-formed JSON object.
   * Once the user accepts the invitation and signs up, these metadata will end up in the user's public metadata.
   */
  publicMetadata?: { [k: string]: any } | undefined;
  /**
   * Optional URL which specifies where to redirect the user once they click the invitation link.
   *
   * @remarks
   * This is only required if you have implemented a [custom flow](https://clerk.com/docs/authentication/invitations#custom-flow) and you're not using Clerk Hosted Pages or Clerk Components.
   */
  redirectUrl?: string | undefined;
  /**
   * Optional flag which denotes whether an email invitation should be sent to the given email address.
   *
   * @remarks
   * Defaults to `true`.
   */
  notify?: boolean | null | undefined;
  /**
   * Whether an invitation should be created if there is already an existing invitation for this email address, or it's claimed by another user.
   */
  ignoreExisting?: boolean | null | undefined;
  /**
   * The number of days the invitation will be valid for. By default, the invitation expires after 30 days.
   */
  expiresInDays?: number | null | undefined;
  /**
   * The slug of the email template to use for the invitation email.
   */
  templateSlug?: TemplateSlug | undefined;
};

/** @internal */
export const TemplateSlug$inboundSchema: z.ZodNativeEnum<typeof TemplateSlug> = z.nativeEnum(TemplateSlug);

/** @internal */
export const TemplateSlug$outboundSchema: z.ZodNativeEnum<typeof TemplateSlug> = TemplateSlug$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace TemplateSlug$ {
  /** @deprecated use `TemplateSlug$inboundSchema` instead. */
  export const inboundSchema = TemplateSlug$inboundSchema;
  /** @deprecated use `TemplateSlug$outboundSchema` instead. */
  export const outboundSchema = TemplateSlug$outboundSchema;
}

/** @internal */
export const CreateInvitationRequestBody$inboundSchema: z.ZodType<CreateInvitationRequestBody, z.ZodTypeDef, unknown> =
  z
    .object({
      email_address: z.string(),
      public_metadata: z.record(z.any()).optional(),
      redirect_url: z.string().optional(),
      notify: z.nullable(z.boolean().default(true)),
      ignore_existing: z.nullable(z.boolean().default(false)),
      expires_in_days: z.nullable(z.number().int()).optional(),
      template_slug: TemplateSlug$inboundSchema.optional(),
    })
    .transform(v => {
      return remap$(v, {
        email_address: 'emailAddress',
        public_metadata: 'publicMetadata',
        redirect_url: 'redirectUrl',
        ignore_existing: 'ignoreExisting',
        expires_in_days: 'expiresInDays',
        template_slug: 'templateSlug',
      });
    });

/** @internal */
export type CreateInvitationRequestBody$Outbound = {
  email_address: string;
  public_metadata?: { [k: string]: any } | undefined;
  redirect_url?: string | undefined;
  notify: boolean | null;
  ignore_existing: boolean | null;
  expires_in_days?: number | null | undefined;
  template_slug?: string | undefined;
};

/** @internal */
export const CreateInvitationRequestBody$outboundSchema: z.ZodType<
  CreateInvitationRequestBody$Outbound,
  z.ZodTypeDef,
  CreateInvitationRequestBody
> = z
  .object({
    emailAddress: z.string(),
    publicMetadata: z.record(z.any()).optional(),
    redirectUrl: z.string().optional(),
    notify: z.nullable(z.boolean().default(true)),
    ignoreExisting: z.nullable(z.boolean().default(false)),
    expiresInDays: z.nullable(z.number().int()).optional(),
    templateSlug: TemplateSlug$outboundSchema.optional(),
  })
  .transform(v => {
    return remap$(v, {
      emailAddress: 'email_address',
      publicMetadata: 'public_metadata',
      redirectUrl: 'redirect_url',
      ignoreExisting: 'ignore_existing',
      expiresInDays: 'expires_in_days',
      templateSlug: 'template_slug',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace CreateInvitationRequestBody$ {
  /** @deprecated use `CreateInvitationRequestBody$inboundSchema` instead. */
  export const inboundSchema = CreateInvitationRequestBody$inboundSchema;
  /** @deprecated use `CreateInvitationRequestBody$outboundSchema` instead. */
  export const outboundSchema = CreateInvitationRequestBody$outboundSchema;
  /** @deprecated use `CreateInvitationRequestBody$Outbound` instead. */
  export type Outbound = CreateInvitationRequestBody$Outbound;
}

export function createInvitationRequestBodyToJSON(createInvitationRequestBody: CreateInvitationRequestBody): string {
  return JSON.stringify(CreateInvitationRequestBody$outboundSchema.parse(createInvitationRequestBody));
}

export function createInvitationRequestBodyFromJSON(
  jsonString: string,
): SafeParseResult<CreateInvitationRequestBody, SDKValidationError> {
  return safeParse(
    jsonString,
    x => CreateInvitationRequestBody$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'CreateInvitationRequestBody' from JSON`,
  );
}

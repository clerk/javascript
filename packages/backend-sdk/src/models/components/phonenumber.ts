/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from 'zod';
import { remap as remap$ } from '../../lib/primitives.js';
import { safeParse } from '../../lib/schemas.js';
import { catchUnrecognizedEnum, ClosedEnum, OpenEnum, Unrecognized } from '../../types/enums.js';
import { Result as SafeParseResult } from '../../types/fp.js';
import { SDKValidationError } from '../errors/sdkvalidationerror.js';
import {
  IdentificationLink,
  IdentificationLink$inboundSchema,
  IdentificationLink$Outbound,
  IdentificationLink$outboundSchema,
} from './identificationlink.js';

/**
 * String representing the object's type. Objects of the same type share the same value.
 *
 * @remarks
 */
export const PhoneNumberObject = {
  PhoneNumber: 'phone_number',
} as const;
/**
 * String representing the object's type. Objects of the same type share the same value.
 *
 * @remarks
 */
export type PhoneNumberObject = ClosedEnum<typeof PhoneNumberObject>;

export const AdminVerificationPhoneNumberStatus = {
  Verified: 'verified',
} as const;
export type AdminVerificationPhoneNumberStatus = ClosedEnum<typeof AdminVerificationPhoneNumberStatus>;

export const AdminVerificationStrategy = {
  Admin: 'admin',
} as const;
export type AdminVerificationStrategy = OpenEnum<typeof AdminVerificationStrategy>;

export type VerificationAdmin = {
  status: AdminVerificationPhoneNumberStatus;
  strategy: AdminVerificationStrategy;
  attempts: number | null;
  expireAt: number | null;
  verifiedAtClient?: string | null | undefined;
};

export const OTPVerificationStatus = {
  Unverified: 'unverified',
  Verified: 'verified',
  Failed: 'failed',
  Expired: 'expired',
} as const;
export type OTPVerificationStatus = ClosedEnum<typeof OTPVerificationStatus>;

export const OTPVerificationStrategy = {
  PhoneCode: 'phone_code',
  EmailCode: 'email_code',
  ResetPasswordEmailCode: 'reset_password_email_code',
} as const;
export type OTPVerificationStrategy = OpenEnum<typeof OTPVerificationStrategy>;

export type VerificationOTP = {
  status: OTPVerificationStatus;
  strategy: OTPVerificationStrategy;
  attempts: number | null;
  expireAt: number | null;
  verifiedAtClient?: string | null | undefined;
};

export type PhoneNumberVerification = VerificationOTP | VerificationAdmin;

/**
 * Success
 */
export type PhoneNumber = {
  id?: string | undefined;
  /**
   * String representing the object's type. Objects of the same type share the same value.
   *
   * @remarks
   */
  object: PhoneNumberObject;
  phoneNumber: string;
  reservedForSecondFactor?: boolean | undefined;
  defaultSecondFactor?: boolean | undefined;
  reserved: boolean;
  verification: VerificationOTP | VerificationAdmin | null;
  linkedTo: Array<IdentificationLink>;
  backupCodes?: Array<string> | null | undefined;
  /**
   * Unix timestamp of creation
   *
   * @remarks
   */
  createdAt: number;
  /**
   * Unix timestamp of creation
   *
   * @remarks
   */
  updatedAt: number;
};

/** @internal */
export const PhoneNumberObject$inboundSchema: z.ZodNativeEnum<typeof PhoneNumberObject> =
  z.nativeEnum(PhoneNumberObject);

/** @internal */
export const PhoneNumberObject$outboundSchema: z.ZodNativeEnum<typeof PhoneNumberObject> =
  PhoneNumberObject$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PhoneNumberObject$ {
  /** @deprecated use `PhoneNumberObject$inboundSchema` instead. */
  export const inboundSchema = PhoneNumberObject$inboundSchema;
  /** @deprecated use `PhoneNumberObject$outboundSchema` instead. */
  export const outboundSchema = PhoneNumberObject$outboundSchema;
}

/** @internal */
export const AdminVerificationPhoneNumberStatus$inboundSchema: z.ZodNativeEnum<
  typeof AdminVerificationPhoneNumberStatus
> = z.nativeEnum(AdminVerificationPhoneNumberStatus);

/** @internal */
export const AdminVerificationPhoneNumberStatus$outboundSchema: z.ZodNativeEnum<
  typeof AdminVerificationPhoneNumberStatus
> = AdminVerificationPhoneNumberStatus$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AdminVerificationPhoneNumberStatus$ {
  /** @deprecated use `AdminVerificationPhoneNumberStatus$inboundSchema` instead. */
  export const inboundSchema = AdminVerificationPhoneNumberStatus$inboundSchema;
  /** @deprecated use `AdminVerificationPhoneNumberStatus$outboundSchema` instead. */
  export const outboundSchema = AdminVerificationPhoneNumberStatus$outboundSchema;
}

/** @internal */
export const AdminVerificationStrategy$inboundSchema: z.ZodType<AdminVerificationStrategy, z.ZodTypeDef, unknown> =
  z.union([z.nativeEnum(AdminVerificationStrategy), z.string().transform(catchUnrecognizedEnum)]);

/** @internal */
export const AdminVerificationStrategy$outboundSchema: z.ZodType<
  AdminVerificationStrategy,
  z.ZodTypeDef,
  AdminVerificationStrategy
> = z.union([z.nativeEnum(AdminVerificationStrategy), z.string().and(z.custom<Unrecognized<string>>())]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace AdminVerificationStrategy$ {
  /** @deprecated use `AdminVerificationStrategy$inboundSchema` instead. */
  export const inboundSchema = AdminVerificationStrategy$inboundSchema;
  /** @deprecated use `AdminVerificationStrategy$outboundSchema` instead. */
  export const outboundSchema = AdminVerificationStrategy$outboundSchema;
}

/** @internal */
export const VerificationAdmin$inboundSchema: z.ZodType<VerificationAdmin, z.ZodTypeDef, unknown> = z
  .object({
    status: AdminVerificationPhoneNumberStatus$inboundSchema,
    strategy: AdminVerificationStrategy$inboundSchema,
    attempts: z.nullable(z.number().int()),
    expire_at: z.nullable(z.number().int()),
    verified_at_client: z.nullable(z.string()).optional(),
  })
  .transform(v => {
    return remap$(v, {
      expire_at: 'expireAt',
      verified_at_client: 'verifiedAtClient',
    });
  });

/** @internal */
export type VerificationAdmin$Outbound = {
  status: string;
  strategy: string;
  attempts: number | null;
  expire_at: number | null;
  verified_at_client?: string | null | undefined;
};

/** @internal */
export const VerificationAdmin$outboundSchema: z.ZodType<VerificationAdmin$Outbound, z.ZodTypeDef, VerificationAdmin> =
  z
    .object({
      status: AdminVerificationPhoneNumberStatus$outboundSchema,
      strategy: AdminVerificationStrategy$outboundSchema,
      attempts: z.nullable(z.number().int()),
      expireAt: z.nullable(z.number().int()),
      verifiedAtClient: z.nullable(z.string()).optional(),
    })
    .transform(v => {
      return remap$(v, {
        expireAt: 'expire_at',
        verifiedAtClient: 'verified_at_client',
      });
    });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace VerificationAdmin$ {
  /** @deprecated use `VerificationAdmin$inboundSchema` instead. */
  export const inboundSchema = VerificationAdmin$inboundSchema;
  /** @deprecated use `VerificationAdmin$outboundSchema` instead. */
  export const outboundSchema = VerificationAdmin$outboundSchema;
  /** @deprecated use `VerificationAdmin$Outbound` instead. */
  export type Outbound = VerificationAdmin$Outbound;
}

export function verificationAdminToJSON(verificationAdmin: VerificationAdmin): string {
  return JSON.stringify(VerificationAdmin$outboundSchema.parse(verificationAdmin));
}

export function verificationAdminFromJSON(jsonString: string): SafeParseResult<VerificationAdmin, SDKValidationError> {
  return safeParse(
    jsonString,
    x => VerificationAdmin$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'VerificationAdmin' from JSON`,
  );
}

/** @internal */
export const OTPVerificationStatus$inboundSchema: z.ZodNativeEnum<typeof OTPVerificationStatus> =
  z.nativeEnum(OTPVerificationStatus);

/** @internal */
export const OTPVerificationStatus$outboundSchema: z.ZodNativeEnum<typeof OTPVerificationStatus> =
  OTPVerificationStatus$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OTPVerificationStatus$ {
  /** @deprecated use `OTPVerificationStatus$inboundSchema` instead. */
  export const inboundSchema = OTPVerificationStatus$inboundSchema;
  /** @deprecated use `OTPVerificationStatus$outboundSchema` instead. */
  export const outboundSchema = OTPVerificationStatus$outboundSchema;
}

/** @internal */
export const OTPVerificationStrategy$inboundSchema: z.ZodType<OTPVerificationStrategy, z.ZodTypeDef, unknown> = z.union(
  [z.nativeEnum(OTPVerificationStrategy), z.string().transform(catchUnrecognizedEnum)],
);

/** @internal */
export const OTPVerificationStrategy$outboundSchema: z.ZodType<
  OTPVerificationStrategy,
  z.ZodTypeDef,
  OTPVerificationStrategy
> = z.union([z.nativeEnum(OTPVerificationStrategy), z.string().and(z.custom<Unrecognized<string>>())]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace OTPVerificationStrategy$ {
  /** @deprecated use `OTPVerificationStrategy$inboundSchema` instead. */
  export const inboundSchema = OTPVerificationStrategy$inboundSchema;
  /** @deprecated use `OTPVerificationStrategy$outboundSchema` instead. */
  export const outboundSchema = OTPVerificationStrategy$outboundSchema;
}

/** @internal */
export const VerificationOTP$inboundSchema: z.ZodType<VerificationOTP, z.ZodTypeDef, unknown> = z
  .object({
    status: OTPVerificationStatus$inboundSchema,
    strategy: OTPVerificationStrategy$inboundSchema,
    attempts: z.nullable(z.number().int()),
    expire_at: z.nullable(z.number().int()),
    verified_at_client: z.nullable(z.string()).optional(),
  })
  .transform(v => {
    return remap$(v, {
      expire_at: 'expireAt',
      verified_at_client: 'verifiedAtClient',
    });
  });

/** @internal */
export type VerificationOTP$Outbound = {
  status: string;
  strategy: string;
  attempts: number | null;
  expire_at: number | null;
  verified_at_client?: string | null | undefined;
};

/** @internal */
export const VerificationOTP$outboundSchema: z.ZodType<VerificationOTP$Outbound, z.ZodTypeDef, VerificationOTP> = z
  .object({
    status: OTPVerificationStatus$outboundSchema,
    strategy: OTPVerificationStrategy$outboundSchema,
    attempts: z.nullable(z.number().int()),
    expireAt: z.nullable(z.number().int()),
    verifiedAtClient: z.nullable(z.string()).optional(),
  })
  .transform(v => {
    return remap$(v, {
      expireAt: 'expire_at',
      verifiedAtClient: 'verified_at_client',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace VerificationOTP$ {
  /** @deprecated use `VerificationOTP$inboundSchema` instead. */
  export const inboundSchema = VerificationOTP$inboundSchema;
  /** @deprecated use `VerificationOTP$outboundSchema` instead. */
  export const outboundSchema = VerificationOTP$outboundSchema;
  /** @deprecated use `VerificationOTP$Outbound` instead. */
  export type Outbound = VerificationOTP$Outbound;
}

export function verificationOTPToJSON(verificationOTP: VerificationOTP): string {
  return JSON.stringify(VerificationOTP$outboundSchema.parse(verificationOTP));
}

export function verificationOTPFromJSON(jsonString: string): SafeParseResult<VerificationOTP, SDKValidationError> {
  return safeParse(
    jsonString,
    x => VerificationOTP$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'VerificationOTP' from JSON`,
  );
}

/** @internal */
export const PhoneNumberVerification$inboundSchema: z.ZodType<PhoneNumberVerification, z.ZodTypeDef, unknown> = z.union(
  [z.lazy(() => VerificationOTP$inboundSchema), z.lazy(() => VerificationAdmin$inboundSchema)],
);

/** @internal */
export type PhoneNumberVerification$Outbound = VerificationOTP$Outbound | VerificationAdmin$Outbound;

/** @internal */
export const PhoneNumberVerification$outboundSchema: z.ZodType<
  PhoneNumberVerification$Outbound,
  z.ZodTypeDef,
  PhoneNumberVerification
> = z.union([z.lazy(() => VerificationOTP$outboundSchema), z.lazy(() => VerificationAdmin$outboundSchema)]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PhoneNumberVerification$ {
  /** @deprecated use `PhoneNumberVerification$inboundSchema` instead. */
  export const inboundSchema = PhoneNumberVerification$inboundSchema;
  /** @deprecated use `PhoneNumberVerification$outboundSchema` instead. */
  export const outboundSchema = PhoneNumberVerification$outboundSchema;
  /** @deprecated use `PhoneNumberVerification$Outbound` instead. */
  export type Outbound = PhoneNumberVerification$Outbound;
}

export function phoneNumberVerificationToJSON(phoneNumberVerification: PhoneNumberVerification): string {
  return JSON.stringify(PhoneNumberVerification$outboundSchema.parse(phoneNumberVerification));
}

export function phoneNumberVerificationFromJSON(
  jsonString: string,
): SafeParseResult<PhoneNumberVerification, SDKValidationError> {
  return safeParse(
    jsonString,
    x => PhoneNumberVerification$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PhoneNumberVerification' from JSON`,
  );
}

/** @internal */
export const PhoneNumber$inboundSchema: z.ZodType<PhoneNumber, z.ZodTypeDef, unknown> = z
  .object({
    id: z.string().optional(),
    object: PhoneNumberObject$inboundSchema,
    phone_number: z.string(),
    reserved_for_second_factor: z.boolean().optional(),
    default_second_factor: z.boolean().optional(),
    reserved: z.boolean(),
    verification: z.nullable(
      z.union([z.lazy(() => VerificationOTP$inboundSchema), z.lazy(() => VerificationAdmin$inboundSchema)]),
    ),
    linked_to: z.array(IdentificationLink$inboundSchema),
    backup_codes: z.nullable(z.array(z.string())).optional(),
    created_at: z.number().int(),
    updated_at: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      phone_number: 'phoneNumber',
      reserved_for_second_factor: 'reservedForSecondFactor',
      default_second_factor: 'defaultSecondFactor',
      linked_to: 'linkedTo',
      backup_codes: 'backupCodes',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
    });
  });

/** @internal */
export type PhoneNumber$Outbound = {
  id?: string | undefined;
  object: string;
  phone_number: string;
  reserved_for_second_factor?: boolean | undefined;
  default_second_factor?: boolean | undefined;
  reserved: boolean;
  verification: VerificationOTP$Outbound | VerificationAdmin$Outbound | null;
  linked_to: Array<IdentificationLink$Outbound>;
  backup_codes?: Array<string> | null | undefined;
  created_at: number;
  updated_at: number;
};

/** @internal */
export const PhoneNumber$outboundSchema: z.ZodType<PhoneNumber$Outbound, z.ZodTypeDef, PhoneNumber> = z
  .object({
    id: z.string().optional(),
    object: PhoneNumberObject$outboundSchema,
    phoneNumber: z.string(),
    reservedForSecondFactor: z.boolean().optional(),
    defaultSecondFactor: z.boolean().optional(),
    reserved: z.boolean(),
    verification: z.nullable(
      z.union([z.lazy(() => VerificationOTP$outboundSchema), z.lazy(() => VerificationAdmin$outboundSchema)]),
    ),
    linkedTo: z.array(IdentificationLink$outboundSchema),
    backupCodes: z.nullable(z.array(z.string())).optional(),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .transform(v => {
    return remap$(v, {
      phoneNumber: 'phone_number',
      reservedForSecondFactor: 'reserved_for_second_factor',
      defaultSecondFactor: 'default_second_factor',
      linkedTo: 'linked_to',
      backupCodes: 'backup_codes',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PhoneNumber$ {
  /** @deprecated use `PhoneNumber$inboundSchema` instead. */
  export const inboundSchema = PhoneNumber$inboundSchema;
  /** @deprecated use `PhoneNumber$outboundSchema` instead. */
  export const outboundSchema = PhoneNumber$outboundSchema;
  /** @deprecated use `PhoneNumber$Outbound` instead. */
  export type Outbound = PhoneNumber$Outbound;
}

export function phoneNumberToJSON(phoneNumber: PhoneNumber): string {
  return JSON.stringify(PhoneNumber$outboundSchema.parse(phoneNumber));
}

export function phoneNumberFromJSON(jsonString: string): SafeParseResult<PhoneNumber, SDKValidationError> {
  return safeParse(
    jsonString,
    x => PhoneNumber$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PhoneNumber' from JSON`,
  );
}

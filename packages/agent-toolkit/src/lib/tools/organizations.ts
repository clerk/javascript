import { z } from 'zod';

import { ClerkTool } from '../clerk-tool';
import { prunePrivateData } from '../utils';

const getOrganizationParameters = z.object({
  organizationId: z
    .string()
    .optional()
    .describe('(string, optional): The ID of the organization to retrieve. Required if slug is not provided.'),
  slug: z
    .string()
    .optional()
    .describe(
      '(string, optional): The slug of the organization to retrieve. Required if organizationId is not provided.',
    ),
  includeMembersCount: z
    .boolean()
    .optional()
    .describe('(boolean, optional): Whether to include the members count for the organization.'),
});

const getOrganization = ClerkTool({
  name: 'getOrganization',
  description: `
    Retrieves a single organization by ID or slug.
    Use this tool when you need detailed information about a specific organization.

    You must provide either an organizationId OR a slug to identify the organization.

    Example use cases:
    1. Displaying organization details on a profile page
    2. Checking if an organization exists before performing operations on it
    3. Retrieving organization metadata for application-specific functionality
  `,
  parameters: getOrganizationParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof getOrganizationParameters>) => {
    const organizationId = (context.orgId || params.organizationId) as string; // TODO: Is it safe to assume this is a string?

    if (!organizationId && !params.slug) {
      throw new Error('Either organizationId or slug must be provided');
    }

    const res = await clerkClient.api.organizations.get({
      ...params,
      organizationId,
    });

    return prunePrivateData(context, res);
  },
});

const createOrganizationParameters = z.object({
  name: z.string().describe('(string): The name of the new organization. Required.'),
  slug: z
    .string()
    .optional()
    .describe(
      '(string, optional): A URL-friendly identifier for the organization. If not provided, created from the name.',
    ),
  createdBy: z
    .string()
    .optional()
    .describe(
      '(string, optional): The user ID of the user creating the organization. Defaults to the current authenticated user.',
    ),
  maxAllowedMemberships: z
    .number()
    .optional()
    .describe('(number, optional): Maximum number of members allowed in the organization.'),
  publicMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe('(Record<string,any>, optional): Public metadata for the organization.'),
  privateMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe('(Record<string,any>, optional): Private metadata for the organization (backend-only).'),
});

const createOrganization = ClerkTool({
  name: 'createOrganization',
  description: `
    Creates a new organization in your Clerk instance.
    Use this tool when you need to programmatically create organizations.

    A name is required to create an organization. Other fields like slug,
    maxAllowedMemberships, and metadata are optional.

    Example use cases:
    1. Creating organizations during user onboarding
    2. Building a self-service organization creation flow
    3. Migrating organizations from another system
  `,
  parameters: createOrganizationParameters,

  execute:
    (clerkClient, context) =>
    async ({ createdBy, ...restParams }: z.infer<typeof createOrganizationParameters>) => {
      // Use provided createdBy or fall back to context userId
      const createParamsWithUser =
        createdBy || context.userId ? { ...restParams, createdBy: createdBy || context.userId } : restParams;
      const res = await clerkClient.api.organizations.create(createParamsWithUser);

      return prunePrivateData(context, res);
    },
});

const updateOrganizationParameters = z.object({
  organizationId: z.string().describe('(string): The ID of the organization to update. Required.'),
  name: z.string().optional().describe('(string, optional): New name for the organization.'),
  slug: z.string().optional().describe('(string, optional): New slug for the organization.'),
  maxAllowedMemberships: z.number().optional().describe('(number, optional): New maximum number of members allowed.'),
  publicMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe('(Record<string,any>, optional): New public metadata for the organization.'),
  privateMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe('(Record<string,any>, optional): New private metadata for the organization (backend-only).'),
});

const updateOrganization = ClerkTool({
  name: 'updateOrganization',
  description: `
    Updates an existing organization's attributes.
    Use this tool when you need to modify core organization information (NOT metadata).

    Only the fields you provide will be updated; others remain unchanged.
    For updating just metadata, consider using updateOrganizationMetadata instead.

    Example use cases:
    1. Updating an organization's name or slug
    2. Changing the maximum allowed memberships
    3. Updating multiple organization attributes at once
  `,
  parameters: updateOrganizationParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof updateOrganizationParameters>) => {
    const { organizationId, ...requestBody } = params;
    const res = await clerkClient.api.organizations.update({
      organizationId: context.orgId || organizationId,
      requestBody,
    });

    return prunePrivateData(context, res);
  },
});

const updateOrganizationMetadataParameters = z.object({
  organizationId: z.string().describe('(string): The ID of the organization to update. Required.'),
  publicMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      '(Record<string,any>, optional): The public metadata to set or update. Use null values to remove specific keys.',
    ),
  privateMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      '(Record<string,any>, optional): The private metadata to set or update. Backend-only data. Use null values to remove specific keys.',
    ),
});

const updateOrganizationMetadata = ClerkTool({
  name: 'updateOrganizationMetadata',
  description: `
    Updates the metadata associated with an organization by merging existing values with the provided parameters.
    Use this tool when you need to store or update organization-specific data without changing other attributes.

    Important characteristics:
    1. A "deep" merge is performed - any nested JSON objects will be merged recursively
    2. You can remove metadata keys at any level by setting their value to null
    3. Public metadata is visible to the frontend
    4. Private metadata is only accessible on the backend

    Example use cases:
    1. Storing organization preferences or settings
    2. Keeping track of organization-specific application state
    3. Adding custom attributes to organizations
  `,
  parameters: updateOrganizationMetadataParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof updateOrganizationMetadataParameters>) => {
    const { organizationId, ...requestBody } = params;
    const res = await clerkClient.api.organizations.mergeMetadata({
      organizationId: context.orgId || organizationId,
      requestBody,
    });

    return prunePrivateData(context, res);
  },
});

const deleteOrganizationParameters = z.object({
  organizationId: z.string().describe('(string): The ID of the organization to delete. Required.'),
});

const deleteOrganization = ClerkTool({
  name: 'deleteOrganization',
  description: `
    Permanently deletes an organization from your Clerk instance.
    Use this tool when you need to remove an organization completely.

    WARNING: This action is irreversible. All organization data, memberships,
    and invitations will be permanently deleted.

    Example use cases:
    1. Implementing organization cleanup flows
    2. Allowing users to delete their own organizations
    3. Administrative operations to remove unwanted organizations
  `,
  parameters: deleteOrganizationParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof deleteOrganizationParameters>) => {
    const res = await clerkClient.api.organizations.delete(context.orgId || params.organizationId);
    return prunePrivateData(context, res);
  },
});

const createOrganizationMembershipParameters = z.object({
  organizationId: z.string().describe('(string): The ID of the organization to add the member to. Required.'),
  userId: z.string().describe('(string): The ID of the user to add as a member. Required.'),
  role: z.string().describe('(string): The role to assign to the user in the organization. Required.'),
});

const createOrganizationMembership = ClerkTool({
  name: 'createOrganizationMembership',
  description: `
    Adds a user to an organization with a specified role.
    Use this tool when you need to programmatically add members to an organization.

    This creates an immediate membership without requiring an invitation process.
    The specified role determines what permissions the user will have in the organization.

    Example use cases:
    1. Adding users to organizations during onboarding
    2. Building administrative interfaces for member management
    3. Migrating memberships from another system
  `,
  parameters: createOrganizationMembershipParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof createOrganizationMembershipParameters>) => {
    const res = await clerkClient.api.organizationMemberships.create({
      organizationId: context.orgId || params.organizationId,
      requestBody: {
        role: params.role,
        userId: context.userId || params.userId,
      },
    });

    return prunePrivateData(context, res);
  },
});

const updateOrganizationMembershipParameters = z.object({
  organizationId: z.string().describe('(string): The ID of the organization containing the membership. Required.'),
  userId: z.string().describe('(string): The ID of the user whose membership is being updated. Required.'),
  role: z.string().describe('(string): The new role to assign to the user. Required.'),
});

const updateOrganizationMembership = ClerkTool({
  name: 'updateOrganizationMembership',
  description: `
    Updates a user's role within an organization.
    Use this tool when you need to change a member's role or permissions.

    This updates an existing membership relationship between a user and an organization.
    The new role will replace the current role and change the user's permissions accordingly.

    Example use cases:
    1. Promoting or demoting users within an organization
    2. Building role management interfaces
    3. Implementing admin-level controls for organization management
  `,
  parameters: updateOrganizationMembershipParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof updateOrganizationMembershipParameters>) => {
    const { organizationId, userId, ...requestBody } = params;
    const res = await clerkClient.api.organizationMemberships.update({
      organizationId: context.orgId || organizationId,
      userId,
      requestBody,
    });

    return prunePrivateData(context, res);
  },
});

const updateOrganizationMembershipMetadataParameters = z.object({
  organizationId: z.string().describe('(string): The ID of the organization containing the membership. Required.'),
  userId: z.string().describe('(string): The ID of the user whose membership metadata is being updated. Required.'),
  publicMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      '(Record<string,any>, optional): The public metadata to set or update. Use null values to remove specific keys.',
    ),
  privateMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      '(Record<string,any>, optional): The private metadata to set or update. Backend-only data. Use null values to remove specific keys.',
    ),
});

const updateOrganizationMembershipMetadata = ClerkTool({
  name: 'updateOrganizationMembershipMetadata',
  description: `
    Updates the metadata associated with a user's membership in an organization.
    Use this tool when you need to store or update membership-specific data.

    Important characteristics:
    1. A "deep" merge is performed - any nested JSON objects will be merged recursively
    2. You can remove metadata keys at any level by setting their value to null
    3. Public metadata is visible to the frontend
    4. Private metadata is only accessible on the backend

    Example use cases:
    1. Storing member-specific preferences or settings within an organization
    2. Adding custom attributes to track member activity or status
    3. Customizing a user's experience within a specific organization
  `,
  parameters: updateOrganizationMembershipMetadataParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof updateOrganizationMembershipMetadataParameters>) => {
    const { organizationId, userId, ...requestBody } = params;
    const res = await clerkClient.api.organizationMemberships.updateMetadata({
      organizationId: context.orgId || params.organizationId,
      userId,
      requestBody,
    });

    return prunePrivateData(context, res);
  },
});

const deleteOrganizationMembershipParameters = z.object({
  organizationId: z.string().describe('(string): The ID of the organization to remove the member from. Required.'),
  userId: z.string().describe('(string): The ID of the user to remove from the organization. Required.'),
});

const deleteOrganizationMembership = ClerkTool({
  name: 'deleteOrganizationMembership',
  description: `
    Removes a user from an organization.
    Use this tool when you need to revoke a user's membership in an organization.

    This permanently breaks the membership relationship between the user and organization.
    The user will immediately lose access to organization resources.

    Example use cases:
    1. Removing users who have left the organization
    2. Building membership management interfaces with removal capability
    3. Implementing self-service leave organization functionality
  `,
  parameters: deleteOrganizationMembershipParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof deleteOrganizationMembershipParameters>) => {
    const res = await clerkClient.api.organizationMemberships.delete({
      ...params,
      userId: context.userId || params.userId,
    });
    return prunePrivateData(context, res);
  },
});

const createOrganizationInvitationParameters = z.object({
  organizationId: z.string().describe('(string): The ID of the organization to create an invitation for. Required.'),
  emailAddress: z.string().describe('(string): Email address to send the invitation to. Required.'),
  role: z.string().describe('(string): Role to assign to the user upon accepting the invitation. Required.'),
  inviterUserId: z
    .string()
    .optional()
    .describe(
      '(string, optional): User ID of the person sending the invitation. Defaults to the current authenticated user.',
    ),
  redirectUrl: z
    .string()
    .optional()
    .describe('(string, optional): URL to redirect users to after they accept the invitation.'),
  publicMetadata: z
    .record(z.string(), z.any())
    .optional()
    .describe('(Record<string,any>, optional): Public metadata for the invitation.'),
});

const createOrganizationInvitation = ClerkTool({
  name: 'createOrganizationInvitation',
  description: `
    Creates an invitation to join an organization for a specified email address.
    Use this tool when you need to invite new members to an organization.

    The invited email will receive an email invitation to join the organization.
    You can specify the role the user will have upon accepting the invitation.

    Example use cases:
    1. Building invite flows for organization member management
    2. Implementing team expansion functionality
    3. Creating administrative tools for organization growth
  `,
  parameters: createOrganizationInvitationParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof createOrganizationInvitationParameters>) => {
    const { inviterUserId, ...inviteParams } = params;

    // Use provided inviterUserId or fall back to context userId
    const inviteParamsWithUser =
      inviterUserId || context.userId
        ? { ...inviteParams, inviterUserId: inviterUserId || context.userId }
        : inviteParams;

    const res = await clerkClient.api.organizationInvitations.create(inviteParamsWithUser);

    return prunePrivateData(context, res);
  },
});

const revokeOrganizationInvitationParameters = z.object({
  organizationId: z.string().describe('(string): The ID of the organization containing the invitation. Required.'),
  invitationId: z.string().describe('(string): The ID of the invitation to revoke. Required.'),
  requestingUserId: z
    .string()
    .optional()
    .describe(
      '(string, optional): User ID of the person revoking the invitation. Defaults to the current authenticated user.',
    ),
});

const revokeOrganizationInvitation = ClerkTool({
  name: 'revokeOrganizationInvitation',
  description: `
    Revokes a pending invitation to an organization.
    Use this tool when you need to cancel an invitation before it's accepted.

    This immediately invalidates the invitation, preventing the recipient
    from using it to join the organization.

    Example use cases:
    1. Canceling invitations sent by mistake
    2. Building invitation management interfaces with revocation capability
    3. Implementing security measures to quickly revoke access
  `,
  parameters: revokeOrganizationInvitationParameters,
  execute: (clerkClient, context) => async (params: z.infer<typeof revokeOrganizationInvitationParameters>) => {
    const { requestingUserId, ...revokeParams } = params;
    // Use provided requestingUserId or fall back to context userId
    const revokeParamsWithUser =
      requestingUserId || context.userId
        ? { ...revokeParams, requestingUserId: requestingUserId || context.userId }
        : revokeParams;

    const res = await clerkClient.api.organizationInvitations.revoke(revokeParamsWithUser);
    return prunePrivateData(context, res);
  },
});

export const organizations = {
  getOrganization,
  createOrganization,
  updateOrganization,
  updateOrganizationMetadata,
  deleteOrganization,
  createOrganizationMembership,
  updateOrganizationMembership,
  updateOrganizationMembershipMetadata,
  deleteOrganizationMembership,
  createOrganizationInvitation,
  revokeOrganizationInvitation,
} as const satisfies Record<string, ClerkTool>;

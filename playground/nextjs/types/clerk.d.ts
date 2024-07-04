interface OrganizationPublicMetadata {
  stripeSubscriptionId: string;
  stripeProductId: string;
  paidUntil: Date;
}

interface ClerkAuthorization {
  plan: 'user:free' | 'org:pro';
  permission: 'org:posts:read' | 'org:posts:edit' | 'org:posts:delete';
  role: 'lolo' | 'admin' | 'basic_member';
}

// type ClerkRoleKey = 'mama';
// type ClerkPermissionKey = 'lala21';

// declare global {
//   type CustomRoleKey = 'mama';
//   type CustomPermissionKey = 'lala';

//   interface OrganizationPublicMetadata {
//     stripeSubscriptionId: string;
//     stripeProductId: string;
//     paidUntil: Date;
//   }
// }

// export {};

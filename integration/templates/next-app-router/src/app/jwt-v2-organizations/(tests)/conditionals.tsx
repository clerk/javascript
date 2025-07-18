export function Conditionals({
  hasImpersonationRead,
  hasMagicLinksCreate,
  hasMagicLinksCreateUnscoped,
  hasMagicLinksRead,
  hasImpersonationManage,
  hasAdminRole,
  hasManagerRole,
  hasImpersonationReaderRole,
  hasImpersonationReaderRoleUnscoped,
  role,
  hasImpersonationFeature,
  hasMagicLinksFeature,
}: {
  hasImpersonationRead: boolean;
  hasMagicLinksCreate: boolean;
  hasMagicLinksCreateUnscoped: boolean;
  hasMagicLinksRead: boolean;
  hasImpersonationManage: boolean;
  hasAdminRole: boolean;
  hasManagerRole: boolean;
  hasImpersonationReaderRole: boolean;
  hasImpersonationReaderRoleUnscoped: boolean;
  role: string | null | undefined;
  hasImpersonationFeature: boolean;
  hasMagicLinksFeature: boolean;
}) {
  return (
    <>
      <pre>
        {`has({ permission: "org:impersonation:read" }) -> `}
        {hasImpersonationRead ? 'true' : 'false'}
      </pre>

      <pre>
        {`has({ permission: "org:magic_links:create" }) -> `}
        {hasMagicLinksCreate ? 'true' : 'false'}
      </pre>

      <pre>
        {`has({ permission: "magic_links:create" }) -> `}
        {hasMagicLinksCreateUnscoped ? 'true' : 'false'}
      </pre>

      <pre>
        {`has({ permission: "org:magic_links:read" }) -> `}
        {hasMagicLinksRead ? 'true' : 'false'}
      </pre>

      <pre>
        {`has({ permission: "org:impersonation:manage" }) -> `}
        {hasImpersonationManage ? 'true' : 'false'}
      </pre>

      <pre>
        {`has({ role: "org:admin" }) -> `}
        {hasAdminRole ? 'true' : 'false'}
      </pre>

      <pre>
        {`has({ role: "org:manager" }) -> `}
        {hasManagerRole ? 'true' : 'false'}
      </pre>

      <pre>
        {`has({ role: "org:impersonation_reader" }) -> `}
        {hasImpersonationReaderRole ? 'true' : 'false'}
      </pre>

      <pre>
        {`has({ role: "impersonation_reader" }) -> `}
        {hasImpersonationReaderRoleUnscoped ? 'true' : 'false'}
      </pre>

      <pre>
        {`role -> `}
        {role}
      </pre>

      <pre>
        {`has({ feature: "org:impersonation" }) -> `}
        {hasImpersonationFeature ? 'true' : 'false'}
      </pre>

      <pre>
        {`has({ feature: "org:magic_links" }) -> `}
        {hasMagicLinksFeature ? 'true' : 'false'}
      </pre>
    </>
  );
}

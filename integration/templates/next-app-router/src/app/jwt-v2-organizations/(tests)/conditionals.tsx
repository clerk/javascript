export function Conditionals({
  hasImpersonationRead,
  hasMagicLinksCreate,
  hasMagicLinksRead,
  hasImpersonationManage,
  hasAdminRole,
  hasManagerRole,
  hasImpersonationReaderRole,
  role,
  hasImpersonationFeature,
  hasMagicLinksFeature,
}: {
  hasImpersonationRead: boolean;
  hasMagicLinksCreate: boolean;
  hasMagicLinksRead: boolean;
  hasImpersonationManage: boolean;
  hasAdminRole: boolean;
  hasManagerRole: boolean;
  hasImpersonationReaderRole: boolean;
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

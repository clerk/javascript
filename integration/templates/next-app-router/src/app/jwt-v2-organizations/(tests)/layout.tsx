import { ClientJWT } from '../client-jwt';
import { RoleSelector } from '../role-selector';
import { ServerJWT } from '../server-jwt';

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
      }}
    >
      <aside
        style={{
          flex: '0 0 300px',
        }}
      >
        <RoleSelector />
        <ServerJWT />
        <ClientJWT />
      </aside>
      <div style={{ flex: '1 1 auto' }}>{children}</div>
    </div>
  );
}

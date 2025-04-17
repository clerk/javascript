import { ClientJWT } from '../client-jwt';
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
        <ServerJWT />
        <ClientJWT />
      </aside>
      <div style={{ flex: '1 1 auto' }}>{children}</div>
    </div>
  );
}

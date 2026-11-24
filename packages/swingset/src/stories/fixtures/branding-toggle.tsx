import { Field } from '@clerk/mosaic/components/field';
import { Switch } from '@clerk/mosaic/components/switch';
import type { ReactNode } from 'react';
import { useState } from 'react';

export function BrandingToggle({ children }: { children: (renderBranding: boolean) => ReactNode }) {
  const [renderBranding, setRenderBranding] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)', width: '100%' }}>
      <div style={{ justifySelf: 'center' }}>
        <Field.Root orientation='horizontal'>
          <Switch
            checked={renderBranding}
            onChange={event => setRenderBranding(event.currentTarget.checked)}
          />
          <Field.Content>
            <Field.Label>Secured by Clerk</Field.Label>
          </Field.Content>
        </Field.Root>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>{children(renderBranding)}</div>
    </div>
  );
}

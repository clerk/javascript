import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { Badge } from '../../components/badge';
import { Card } from '../../components/card';
import { themeProps } from '../../props';
import { styles } from './auth.styles';

interface AuthIdentityPreviewProps {
  identifier: string;
}

export function AuthIdentityPreview({ identifier }: AuthIdentityPreviewProps) {
  return (
    <Card.Description xstyle={styles.identity}>
      <Badge
        color='neutral'
        dir='ltr'
        title={identifier}
        {...themeProps('auth-identity')}
      >
        {identifier}
      </Badge>
    </Card.Description>
  );
}

export function emphasizeIdentifier(text: string, identifier: string | undefined, node?: ReactNode): ReactNode {
  const at = identifier ? text.indexOf(identifier) : -1;
  if (!identifier || at < 0) {
    return text;
  }
  return (
    <>
      {text.slice(0, at)}
      {node ?? <strong {...stylex.props(styles.identifierText)}>{identifier}</strong>}
      {text.slice(at + identifier.length)}
    </>
  );
}

import * as stylex from '@stylexjs/stylex';

import { Card } from '../../../components/card';
import { styles } from '../sign-in.styles';

export function SignInLogo({ logo }: { logo?: { src: string; alt: string } }) {
  return logo ? (
    <Card.Media>
      <img
        src={logo.src}
        alt={logo.alt}
        {...stylex.props(styles.logo)}
      />
    </Card.Media>
  ) : null;
}

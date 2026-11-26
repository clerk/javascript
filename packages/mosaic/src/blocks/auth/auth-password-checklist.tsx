import * as stylex from '@stylexjs/stylex';

import { Icon } from '../../components/icon';
import { VisuallyHidden } from '../../components/visually-hidden';
import { CheckmarkSmall } from '../../icons/glyphs/checkmark-small';
import { styles } from './auth-password-checklist.styles';

export interface AuthPasswordRule {
  id: string;
  label: string;
  met: boolean;
}

export type AuthPasswordChecklistVariant = 'list' | 'draw' | 'chips';

export function AuthPasswordChecklist({
  rules,
  showMissed,
  metLabel,
  variant = 'list',
}: {
  rules: readonly AuthPasswordRule[];
  showMissed: boolean;
  metLabel: string;
  variant?: AuthPasswordChecklistVariant;
}) {
  return (
    <ul {...stylex.props(variant === 'chips' ? styles.chips : styles.list)}>
      {rules.map(rule => (
        <li
          key={rule.id}
          {...stylex.props(
            styles.row,
            variant === 'chips' && styles.chip,
            rule.met && styles.rowMet,
            variant === 'chips' && rule.met && styles.chipMet,
            showMissed && !rule.met && styles.rowMissed,
          )}
        >
          {variant === 'draw' ? <DrawMark met={rule.met} /> : <SwapMark met={rule.met} />}
          {rule.label}
          {rule.met ? <VisuallyHidden>{metLabel}</VisuallyHidden> : null}
        </li>
      ))}
    </ul>
  );
}

function SwapMark({ met }: { met: boolean }) {
  return (
    <span
      aria-hidden
      {...stylex.props(styles.icon)}
    >
      <span {...stylex.props(styles.mark, styles.ring, met ? styles.hidden : styles.shown)} />
      <span {...stylex.props(styles.mark, styles.check, met ? styles.shown : styles.hidden)}>
        <Icon
          glyph={CheckmarkSmall}
          size='sm'
        />
      </span>
    </span>
  );
}

function DrawMark({ met }: { met: boolean }) {
  return (
    <span
      aria-hidden
      {...stylex.props(styles.icon, styles.drawCircle, met && styles.drawCircleMet)}
    >
      <span {...stylex.props(styles.drawCheck, met ? styles.drawCheckMet : styles.drawCheckUnmet)}>
        <Icon
          glyph={CheckmarkSmall}
          size='sm'
        />
      </span>
    </span>
  );
}

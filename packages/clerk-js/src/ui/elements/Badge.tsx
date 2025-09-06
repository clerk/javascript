import { Badge, descriptors, localizationKeys } from '../customizables';
import type { InternalTheme, PropsOfComponent, ThemableCssProp } from '../styledSystem';

const overlayStyles = (t: InternalTheme): ThemableCssProp => [
  {
    background: `linear-gradient(${t.colors.$borderAlpha25}, ${t.colors.$borderAlpha25}),${t.colors.$colorBackground}`,
    borderColor: t.colors.$colorForeground,
    boxShadow: 'none',
    outline: `${t.space.$px} solid ${t.colors.$colorBackground}`,
    pointerEvents: 'none',
    position: 'absolute',
    right: `calc(${t.space.$2x5} * -1)`,
    top: '-35%',
    ':after': {
      border: `${t.space.$px} solid ${t.colors.$borderAlpha150}`,
      borderRadius: t.radii.$lg,
      content: '""',
      display: 'block',
      height: '100%',
      inset: 0,
      padding: t.space.$px,
      position: 'absolute',
      width: '100%',
    },
  },
];

export type LastAuthenticationStrategyBadgeProps = PropsOfComponent<typeof Badge> & { overlay?: boolean };
export const LastAuthenticationStrategyBadge = ({ sx, overlay, ...props }: LastAuthenticationStrategyBadgeProps) => (
  <Badge
    {...props}
    elementDescriptor={descriptors.lastAuthenticationStrategyBadge}
    localizationKey={localizationKeys('lastAuthenticationStrategy')}
    sx={[
      t => ({
        background: t.colors.$borderAlpha25,
        borderRadius: t.radii.$lg,
      }),
      overlay && overlayStyles,
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
  />
);

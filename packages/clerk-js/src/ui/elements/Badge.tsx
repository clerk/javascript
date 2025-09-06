import { Badge, descriptors, localizationKeys } from '../customizables';
import type { InternalTheme, PropsOfComponent, ThemableCssProp } from '../styledSystem';

export type LastAuthenticationStrategyBadgeProps = PropsOfComponent<typeof Badge> & { overlay?: boolean };
export const LastAuthenticationStrategyBadge = ({ sx, overlay, ...props }: LastAuthenticationStrategyBadgeProps) => {
  const overlayStyles = (t: InternalTheme): ThemableCssProp => [
    {
      background: `linear-gradient(${t.colors.$borderAlpha25}),${t.colors.$colorBackground}`,
      borderColor: t.colors.$colorForeground,
      boxShadow: 'none',
      outline: `${t.space.$px} solid ${t.colors.$colorBackground}`,
      position: 'absolute',
      top: '-35%',
      right: `calc(${t.space.$2x5} * -1)`,
      ':after': {
        border: `${t.space.$px} solid ${t.colors.$borderAlpha150}`,
        borderRadius: t.radii.$lg,
        content: '""',
        display: 'block',
        height: '100%',
        padding: t.space.$px,
        position: 'absolute',
        width: '100%',
      },
    },
  ];

  return (
    <Badge
      elementDescriptor={descriptors.lastAuthenticationStrategyBadge}
      localizationKey={localizationKeys('lastAuthenticationStrategy')}
      {...props}
      sx={[
        t => ({
          background: t.colors.$borderAlpha25,
          borderRadius: t.radii.$lg,
        }),
        overlay && overlayStyles,
        sx,
      ]}
    />
  );
};

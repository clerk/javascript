import type { Badge } from '../customizables';
import { descriptors, localizationKeys, Span } from '../customizables';
import { common, type PropsOfComponent } from '../styledSystem';

export type LastAuthenticationStrategyBadgeProps = PropsOfComponent<typeof Badge> & { overlay?: boolean };
export const LastAuthenticationStrategyBadge = ({
  sx,
  overlay,
  ...props
}: LastAuthenticationStrategyBadgeProps): JSX.Element => {
  return (
    <Span
      {...props}
      elementDescriptor={descriptors.lastAuthenticationStrategyBadge}
      localizationKey={localizationKeys('lastAuthenticationStrategy')}
      sx={[
        t => ({
          ...common.textVariants(t).caption,
          background: `linear-gradient(${t.colors.$borderAlpha25}, transparent), ${t.colors.$colorBackground}`,
          border: `${t.space.$px} solid ${t.colors.$borderAlpha150}`,
          borderRadius: t.radii.$lg,
          color: t.colors.$colorMutedForeground,
          height: t.space.$4x5,
          paddingInline: t.space.$1x5,
          whiteSpace: 'nowrap',
          boxShadow: `0 0 0 1px ${t.colors.$colorBackground}`,
          ...(overlay && {
            position: 'absolute',
            right: -1,
            top: -1,
            transform: `translate(${t.space.$2x5}, -50%)`,
            pointerEvents: 'none',
          }),
        }),
        sx,
      ]}
    />
  );
};

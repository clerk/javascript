import { Badge, descriptors, localizationKeys } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

export type LastAuthenticationStrategyBadgeProps = PropsOfComponent<typeof Badge>;
export const LastAuthenticationStrategyBadge = ({ sx, ...props }: LastAuthenticationStrategyBadgeProps) => {
  return (
    <Badge
      elementDescriptor={descriptors.lastAuthenticationStrategyBadge}
      localizationKey={localizationKeys('lastAuthenticationStrategy')}
      {...props}
      sx={t => ({
        backgroundColor: t.colors.$borderAlpha25,
        borderRadius: t.radii.$lg,
        ...sx,
      })}
    />
  );
};

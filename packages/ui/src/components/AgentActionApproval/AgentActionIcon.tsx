import type { ComponentType } from 'react';

import { Flex, Icon } from '@/ui/customizables';

type AgentActionIconTone = 'neutral' | 'success' | 'danger';

export function AgentActionIcon({ icon, tone = 'neutral' }: { icon: ComponentType; tone?: AgentActionIconTone }) {
  return (
    <Flex
      center
      sx={theme => ({
        alignSelf: 'center',
        width: theme.sizes.$13,
        height: theme.sizes.$13,
        borderRadius: theme.radii.$circle,
        borderWidth: theme.borderWidths.$normal,
        borderStyle: theme.borderStyles.$solid,
        borderColor:
          tone === 'success'
            ? theme.colors.$success500
            : tone === 'danger'
              ? theme.colors.$danger500
              : theme.colors.$borderAlpha150,
        backgroundColor:
          tone === 'success'
            ? theme.colors.$successAlpha50
            : tone === 'danger'
              ? theme.colors.$dangerAlpha50
              : theme.colors.$neutralAlpha50,
      })}
    >
      <Icon
        icon={icon}
        size='lg'
        aria-hidden
        sx={theme => ({
          color:
            tone === 'success'
              ? theme.colors.$success500
              : tone === 'danger'
                ? theme.colors.$danger500
                : theme.colors.$neutralAlpha600,
        })}
      />
    </Flex>
  );
}

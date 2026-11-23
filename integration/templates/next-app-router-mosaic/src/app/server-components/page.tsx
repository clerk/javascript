import { Avatar } from '@clerk/mosaic/components/avatar';
import { Badge } from '@clerk/mosaic/components/badge';
import { Icon } from '@clerk/mosaic/components/icon';
import { Panel } from '@clerk/mosaic/components/panel';
import { External } from '@clerk/mosaic/icons/glyphs/external';

export default function Page() {
  return (
    <Panel.Root>
      <Panel.Title>Server rendered</Panel.Title>
      <Panel.Sections>
        <Avatar.Root>
          <Avatar.Fallback>AC</Avatar.Fallback>
        </Avatar.Root>
        <Badge>New</Badge>
        <span data-testid='external-icon'>
          <Icon glyph={External} />
        </span>
      </Panel.Sections>
    </Panel.Root>
  );
}

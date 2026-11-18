import { Avatar } from '@clerk/mosaic/components/avatar';
import { Badge } from '@clerk/mosaic/components/badge';
import { Panel } from '@clerk/mosaic/components/panel';

export default function Page() {
  return (
    <Panel.Root>
      <Panel.Title>Server rendered</Panel.Title>
      <Panel.Sections>
        <Avatar.Root>
          <Avatar.Fallback>AC</Avatar.Fallback>
        </Avatar.Root>
        <Badge>New</Badge>
      </Panel.Sections>
    </Panel.Root>
  );
}

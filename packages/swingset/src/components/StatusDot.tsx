import { Badge } from '@/components/ui/badge';
import type { StoryStatus, WipSubstatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const dotColor: Record<StoryStatus, string> = {
  stable: 'bg-emerald-500',
  wip: 'bg-amber-400',
  todo: 'bg-neutral-400',
};

const statusLabel: Record<StoryStatus, string> = {
  stable: 'Stable',
  wip: 'Work in progress',
  todo: 'To do',
};

// A substatus only ever refines a wip entry; a stable one's is ignored.
function substatusFor(status: StoryStatus, substatus?: WipSubstatus) {
  return status === 'wip' ? substatus : undefined;
}

export function StatusDot({
  status,
  substatus,
  className,
}: {
  status: StoryStatus;
  substatus?: WipSubstatus;
  className?: string;
}) {
  const refinement = substatusFor(status, substatus);
  const label = statusLabel[status] + (refinement ? `: ${refinement}` : '');
  return (
    <span
      title={label}
      className={cn('size-1.5 shrink-0 rounded-full', dotColor[status], className)}
    >
      <span className='sr-only'>{label}</span>
    </span>
  );
}

export function StatusBadge({
  status,
  substatus,
  className,
}: {
  status: StoryStatus;
  substatus?: WipSubstatus;
  className?: string;
}) {
  const refinement = substatusFor(status, substatus);
  return (
    <Badge
      variant='outline'
      className={cn('text-muted-foreground font-mono', className)}
    >
      <span
        aria-hidden='true'
        className={cn('size-1.5 shrink-0 rounded-full', dotColor[status])}
      />
      {/* One text child, so the Badge's flex gap separates only the dot from the text. */}
      <span>
        <span className='font-bold'>{status}</span>
        {refinement ? <span className='font-normal'>{`: ${refinement}`}</span> : null}
      </span>
    </Badge>
  );
}

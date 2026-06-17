'use client';

import { Badge } from '@/components/ui/badge';
import type { StoryMeta } from '@/lib/types';

import { KnobControl } from './KnobControl';
import { usePlayground } from './PlaygroundContext';

interface ExtraProp {
  name: string;
  type: string;
  default?: string;
}

interface PropTableProps {
  meta: StoryMeta;
  extra?: ExtraProp[];
}

const SX_ROW: ExtraProp = { name: 'sx', type: 'StyleRule | (theme) => StyleRule' };

export function PropTable({ meta, extra = [] }: PropTableProps) {
  const playground = usePlayground();
  const variants = meta.styles?._variants ?? {};
  const defaults = meta.styles?._defaultVariants ?? {};

  const rows = [
    ...Object.entries(variants).map(([name, options]) => {
      const keys = Object.keys(options);
      const isBoolean = keys.every(k => k === 'true' || k === 'false');
      const type = isBoolean ? 'boolean' : keys.map(k => `'${k}'`).join(' | ');
      const def = defaults[name];
      const defDisplay =
        def !== undefined ? (isBoolean ? String(def as boolean) : `'${String(def as string)}'`) : undefined;
      return { name, type, default: defDisplay };
    }),
    ...extra,
    SX_ROW,
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => {
          // The default is a static cell; the Value column is the live control. Variant
          // props get a knob there; non-variant rows (sx, extra) have no control.
          const knob = playground?.knobs[row.name];
          return (
            <tr key={row.name}>
              <td>
                <Badge
                  variant='secondary'
                  className='font-mono'
                >
                  {row.name}
                </Badge>
              </td>
              <td>
                <code>{row.type}</code>
              </td>
              <td>{row.default !== undefined ? <code>{row.default}</code> : '—'}</td>
              <td>
                {knob && playground ? (
                  <KnobControl
                    id={`prop-${row.name}`}
                    def={knob}
                    value={playground.values[row.name]}
                    onChange={v => playground.setValue(row.name, v)}
                  />
                ) : (
                  '—'
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

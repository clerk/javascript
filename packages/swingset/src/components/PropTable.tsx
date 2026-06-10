import type { StoryMeta } from '@/lib/types';

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
  const variants = meta.styles?._variants ?? {};
  const defaults = meta.styles?._defaultVariants ?? {};

  const rows = [
    ...Object.entries(variants).map(([name, options]) => {
      const keys = Object.keys(options);
      const isBoolean = keys.every(k => k === 'true' || k === 'false');
      const type = isBoolean ? 'boolean' : keys.map(k => `'${k}'`).join(' | ');
      const def = defaults[name];
      const defDisplay = def !== undefined ? (isBoolean ? String(def) : `'${String(def)}'`) : undefined;
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
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.name}>
            <td>
              <code>{row.name}</code>
            </td>
            <td>
              <code>{row.type}</code>
            </td>
            <td>{row.default !== undefined ? <code>{row.default}</code> : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

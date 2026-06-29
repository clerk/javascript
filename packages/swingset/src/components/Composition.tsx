'use client';

import Link from 'next/link';

export interface CompositionPiece {
  /** Display name of the piece (e.g. `Destructive`). */
  name: string;
  /** Route to the piece's page in swingset (e.g. `/blocks/destructive`). */
  href: string;
  /** Which Mosaic layer the piece lives in (e.g. `Blocks`, `Components`, `Primitives`). */
  layer: string;
}

// Mosaic layers, high → low. Drives the order the composition groups render in.
// Plural to match the sidebar group names.
const LAYER_ORDER = ['AIO', 'Panels', 'Sections', 'Blocks', 'Components', 'Primitives'];

function layerRank(layer: string): number {
  const i = LAYER_ORDER.indexOf(layer);
  return i === -1 ? LAYER_ORDER.length : i;
}

/**
 * The linked pieces shown inside a `<Story>`'s attached "Composition" footer, sorted
 * and grouped by Mosaic layer. Each piece links to its own page.
 */
export function CompositionPanel({ pieces }: { pieces: CompositionPiece[] }) {
  const groups = new Map<string, CompositionPiece[]>();
  for (const piece of pieces) {
    if (!groups.has(piece.layer)) {
      groups.set(piece.layer, []);
    }
    groups.get(piece.layer)?.push(piece);
  }

  const sortedLayers = Array.from(groups.keys()).sort((a, b) => layerRank(a) - layerRank(b) || a.localeCompare(b));

  return (
    <div className='flex flex-col gap-4 p-3'>
      {sortedLayers.map(layer => (
        <section
          key={layer}
          className='flex flex-col gap-2'
        >
          <div className='text-brand text-[10px] font-semibold uppercase tracking-widest'>{layer}</div>
          {groups
            .get(layer)
            ?.slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(piece => (
              <Link
                key={piece.href}
                href={piece.href}
                className='text-muted-foreground hover:text-foreground font-mono text-xs'
              >
                {`<${piece.name} />`}
              </Link>
            ))}
        </section>
      ))}
    </div>
  );
}

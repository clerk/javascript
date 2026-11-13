import { MosaicGlyph } from '@/components/marketing/mosaic-glyph';

export function HeroMicrographic() {
  return (
    <div
      data-hero-eyebrow
      className='tag-2 mt-4 inline-grid text-gray-500 dark:text-gray-400'
    >
      <div className='flex items-center justify-between gap-2'>
        <span className='inline-flex items-center gap-1.5'>
          <span aria-hidden='true'>[</span>
          <MosaicGlyph className='text-purple-500 dark:text-purple-400' />
          <span className='text-purple-500 dark:text-purple-400'>Clerk UI</span>
          <span aria-hidden='true'>]</span>
        </span>
        <span className='inline-block rounded-[1px] bg-yellow-500 px-1 leading-[10px] text-gray-950'>Beta</span>
      </div>
    </div>
  );
}

import { OG_DEFAULTS, type OgVariantId } from '../og-config';
import { OgCapture } from './og-capture';

type Params = Promise<Record<string, string | string[] | undefined>>;

const text = (value: string | string[] | undefined) => (typeof value === 'string' ? value : undefined);

export default async function Page({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const variant = (text(params.variant) ?? 'og') as OgVariantId;
  return (
    <OgCapture
      variant={variant}
      options={{
        caption: text(params.caption) ?? OG_DEFAULTS.caption,
        loopSeconds: Number(text(params.loop) ?? OG_DEFAULTS.loopSeconds),
        swaySteps: Number(text(params.steps) ?? OG_DEFAULTS.swaySteps),
        swayGain: Number(text(params.gain) ?? OG_DEFAULTS.swayGain),
        ripple: Number(text(params.ripple) ?? OG_DEFAULTS.ripple),
        beta: text(params.beta) !== '0',
      }}
    />
  );
}

import { defineConfig } from 'tsup';

export default defineConfig(_overrideOptions => {
  const uiRetheme = process.env.CLERK_RETHEME === '1' || process.env.CLERK_RETHEME === 'true';

  return {
    entry: {
      index: uiRetheme ? 'src/index.retheme.ts' : 'src/index.ts',
      'en-US': uiRetheme ? 'src/en-US.retheme.ts' : 'src/en-US.ts',
      'ar-SA': 'src/ar-SA.ts',
      'cs-CZ': 'src/cs-CZ.ts',
      'da-DK': 'src/da-DK.ts',
      'de-DE': 'src/de-DE.ts',
      'el-GR': 'src/el-GR.ts',
      'es-ES': 'src/es-ES.ts',
      'fr-FR': 'src/fr-FR.ts',
      'he-IL': 'src/he-IL.ts',
      'it-IT': 'src/it-IT.ts',
      'ja-JP': 'src/ja-JP.ts',
      'ko-KR': 'src/ko-KR.ts',
      'nb-NO': 'src/nb-NO.ts',
      'nl-NL': 'src/nl-NL.ts',
      'pl-PL': 'src/pl-PL.ts',
      'pt-BR': 'src/pt-BR.ts',
      'pt-PT': 'src/pt-PT.ts',
      'ro-RO': 'src/ro-RO.ts',
      'ru-RU': 'src/ru-RU.ts',
      'sk-SK': 'src/sk-SK.ts',
      'sv-SE': 'src/sv-SE.ts',
      'tr-TR': 'src/tr-TR.ts',
      'uk-UA': 'src/uk-UA.ts',
      'vi-VN': 'src/vi-VN.ts',
      'zh-CN': 'src/zh-CN.ts',
      'zh-TW': 'src/zh-TW.ts',
    },
    format: ['cjs', 'esm'],
    bundle: true,
    clean: true,
    minify: false,
    sourcemap: true,
    dts: true,
    splitting: false,
  };
});

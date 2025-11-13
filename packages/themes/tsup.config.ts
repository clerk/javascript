import { cp, mkdir, readdir } from 'fs/promises';
import { extname, join } from 'path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/**/*.{ts,tsx}'],
  format: ['cjs', 'esm'],
  bundle: false,
  clean: true,
  minify: false,
  sourcemap: false,
  dts: true,
  target: 'es2020',
  onSuccess: async () => {
    // Ensure dist/themes directory exists
    await mkdir('./dist/themes', { recursive: true });

    // Copy all CSS files from src/themes to dist/themes
    try {
      const files = await readdir('./src/themes');
      const cssFiles = files.filter(file => extname(file) === '.css');

      for (const cssFile of cssFiles) {
        await cp(join('./src/themes', cssFile), join('./dist/themes', cssFile));
        console.log(`✓ Copied ${cssFile}`);
      }
    } catch (error) {
      // Handle specific errors gracefully, log unexpected ones
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        // Directory doesn't exist or no CSS files found, that's ok
        console.log('ℹ No themes directory or CSS files found, skipping copy');
      } else {
        // Log unexpected errors to avoid hiding real issues
        console.warn('⚠ Warning: Failed to copy CSS files:', error);
      }
    }
  },
});

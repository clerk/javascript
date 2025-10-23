import { resolve } from 'node:path';

export const templates = {
  // __dirname and __filename are defined only in CJS files
  // If /integration becomes a module in the future, use these helpers:
  // 'next-app-router': fileURLToPath(new URL('./next-app-router', import.meta.url)),
  'next-app-router': resolve(__dirname, './next-app-router'),
  'next-app-router-quickstart': resolve(__dirname, './next-app-router-quickstart'),
  'react-cra': resolve(__dirname, './react-cra'),
  'react-vite': resolve(__dirname, './react-vite'),
  'express-vite': resolve(__dirname, './express-vite'),
  'elements-next': resolve(__dirname, './elements-next'),
  'astro-node': resolve(__dirname, './astro-node'),
  'astro-hybrid': resolve(__dirname, './astro-hybrid'),
  'expo-web': resolve(__dirname, './expo-web'),
  'tanstack-react-start': resolve(__dirname, './tanstack-react-start'),
  'vue-vite': resolve(__dirname, './vue-vite'),
  'nuxt-node': resolve(__dirname, './nuxt-node'),
  'react-router-node': resolve(__dirname, './react-router-node'),
  'react-router-library': resolve(__dirname, './react-router-library'),
  'custom-flows-react-vite': resolve(__dirname, './custom-flows-react-vite'),
} as const;

if (new Set([...Object.values(templates)]).size !== Object.values(templates).length) {
  throw new Error('Duplicate template paths');
}

export type Template = keyof typeof templates;

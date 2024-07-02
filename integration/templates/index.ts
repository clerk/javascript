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
  'remix-node': resolve(__dirname, './remix-node'),
  'elements-next': resolve(__dirname, './elements-next'),
  'astro-node': resolve(__dirname, './astro-node'),
  'expo-web': resolve(__dirname, './expo-web'),
} as const;

if (new Set([...Object.values(templates)]).size !== Object.values(templates).length) {
  throw new Error('Duplicate template paths');
}

export type Template = keyof typeof templates;

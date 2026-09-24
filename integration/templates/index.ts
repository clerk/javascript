import { resolve } from 'node:path';

export const templates = {
  'next-app-router': resolve(import.meta.dirname, './next-app-router'),
  'next-cache-components': resolve(import.meta.dirname, './next-cache-components'),
  'next-app-router-quickstart': resolve(import.meta.dirname, './next-app-router-quickstart'),
  'next-app-router-bundled-ui': resolve(import.meta.dirname, './next-app-router-bundled-ui'),
  'next-app-router-quickstart-v6': resolve(import.meta.dirname, './next-app-router-quickstart-v6'),
  'react-vite': resolve(import.meta.dirname, './react-vite'),
  'express-vite': resolve(import.meta.dirname, './express-vite'),
  'fastify-vite': resolve(import.meta.dirname, './fastify-vite'),
  'hono-vite': resolve(import.meta.dirname, './hono-vite'),
  'elements-next': resolve(import.meta.dirname, './elements-next'),
  'astro-node': resolve(import.meta.dirname, './astro-node'),
  'astro-hybrid': resolve(import.meta.dirname, './astro-hybrid'),
  'expo-web': resolve(import.meta.dirname, './expo-web'),
  'tanstack-react-start': resolve(import.meta.dirname, './tanstack-react-start'),
  'vue-vite': resolve(import.meta.dirname, './vue-vite'),
  'nuxt-node': resolve(import.meta.dirname, './nuxt-node'),
  'react-router-node': resolve(import.meta.dirname, './react-router-node'),
  'react-router-library': resolve(import.meta.dirname, './react-router-library'),
  'custom-flows-react-vite': resolve(import.meta.dirname, './custom-flows-react-vite'),
  'chrome-extension-vite': resolve(import.meta.dirname, './chrome-extension-vite'),
  'electron-vite': resolve(import.meta.dirname, './electron-vite'),
} as const;

if (new Set([...Object.values(templates)]).size !== Object.values(templates).length) {
  throw new Error('Duplicate template paths');
}

export type Template = keyof typeof templates;

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontSize: {
        '3xl': '1.953rem',
        '4xl': '2.441rem',
        '5xl': '3.052rem',
      },

      fontFamily: {
        serif: ['Lora', ...defaultTheme.fontFamily.serif],
      },

      colors: {
        newGray: {
          '25': '#FAFAFB',
          '50': '#F7F7F8',
          '100': '#EEEEF0',
          '150': '#E3E3E7',
          '200': '#D9D9DE',
          '300': '#B7B8C2',
          '400': '#9394A1',
          '500': '#747686',
          '600': '#5E5F6E',
          '700': '#42434D',
          '750': '#373840',
          '800': '#2F3037',
          '850': '#27272D',
          '900': '#212126',
          '950': '#131316',
        },
      }
    },
  },
};

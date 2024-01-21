import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        foreground: 'rgb(var(--foreground-rgb))',
        background: 'rgb(var(--background-rgb))',

        secondary: 'rgba(0, 0, 0, 0.1)',
        tertiary: 'rgba(255, 255, 255, 0.1)',

        black: '#131316',

        gray: {
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

        purple: {
          '050': '#F4F2FF',
          '100': '#EAE8FF',
          '200': '#D7D4FF',
          '300': '#BAB1FF',
          '400': '#9785FF',
          '500': '#6C47FF',
          '600': '#6430F7',
          '700': '#561EE3',
          '800': '#4818BF',
          '900': '#3C169C',
          '950': '#230B6A',
          DEFAULT: '#6C47FF',
        },

        sky: {
          '050': '#EBFDFF',
          '100': '#CCF9FF',
          '200': '#9FF1FF',
          '300': '#5DE3FF',
          '400': '#3AD4FD',
          '500': '#00AEE3',
          '600': '#0089BE',
          '700': '#056D99',
          '800': '#0E597C',
          '900': '#104A69',
          '950': '#043048',
          DEFAULT: '#6C47FF',
        },

        debug: '#FF0000', // Used for UI debugging
      },

      fontFamily: {
        // sans: ['var(--font-inter)'],
        // mono: ['var(--font-roboto-mono)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;

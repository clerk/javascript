import type { Preview } from '@storybook/react';
import React from 'react';
// @ts-ignore - workspace package import
import { ClerkProvider } from '@clerk/clerk-react';
import type { Appearance } from '@clerk/types';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  argTypes: {
    // Color Variables
    colorPrimary: {
      description: 'Primary color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorPrimaryForeground: {
      description: 'Primary foreground color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorBackground: {
      description: 'Background color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorInputBackground: {
      description: 'Input background color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorText: {
      description: 'Text color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorTextSecondary: {
      description: 'Secondary text color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorDanger: {
      description: 'Danger color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorSuccess: {
      description: 'Success color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorWarning: {
      description: 'Warning color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorNeutral: {
      description: 'Neutral color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },

    // Typography Variables
    fontFamily: {
      description: 'Font family',
      control: { type: 'text' },
      table: { category: 'Appearance - Typography' },
    },
    fontSize: {
      description: 'Font size',
      control: { type: 'text' },
      table: { category: 'Appearance - Typography' },
    },
    fontWeight: {
      description: 'Font weight',
      control: { type: 'select' },
      options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
      table: { category: 'Appearance - Typography' },
    },

    // Layout Variables
    borderRadius: {
      description: 'Border radius',
      control: { type: 'text' },
      table: { category: 'Appearance - Layout' },
    },
    spacingUnit: {
      description: 'Spacing unit',
      control: { type: 'text' },
      table: { category: 'Appearance - Layout' },
    },
  },
  args: {
    // Default values for appearance variables
    colorPrimary: '#2F3037',
    colorPrimaryForeground: '#FFFFFF',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorText: '#1F2937',
    colorTextSecondary: '#6B7280',
    colorDanger: '#DC2626',
    colorSuccess: '#16A34A',
    colorWarning: '#F59E0B',
    colorNeutral: '#9CA3AF',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: '400',
    borderRadius: '0.375rem',
    spacingUnit: '1rem',
  },
  decorators: [
    (Story, context) => {
      const {
        colorPrimary,
        colorPrimaryForeground,
        colorBackground,
        colorInputBackground,
        colorText,
        colorTextSecondary,
        colorDanger,
        colorSuccess,
        colorWarning,
        colorNeutral,
        fontFamily,
        fontSize,
        fontWeight,
        borderRadius,
        spacingUnit,
      } = context.args;

      // Build appearance object with individual variables
      const appearance: Appearance = {
        variables: {
          colorPrimary,
          colorPrimaryForeground,
          colorBackground,
          colorInputBackground,
          colorText,
          colorTextSecondary,
          colorDanger,
          colorSuccess,
          colorWarning,
          colorNeutral,
          fontFamily,
          fontSize,
          fontWeight,
          borderRadius,
          spacingUnit,
        },
      };

      return React.createElement(
        ClerkProvider,
        {
          publishableKey: 'pk_test_dG91Y2hlZC1sYWR5YmlyZC0yMy5jbGVyay5hY2NvdW50cy5kZXYk',
          appearance: appearance,
        },
        React.createElement(
          'div',
          {
            style: { maxWidth: '400px', margin: '0 auto', padding: '20px' },
          },
          React.createElement(Story),
        ),
      );
    },
  ],
};

export default preview;

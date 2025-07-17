// @ts-ignore - workspace package import
import { ClerkProvider } from '@clerk/clerk-react';
import type { Appearance } from '@clerk/types';
import type { Preview } from '@storybook/react';
import React from 'react';

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
      description: 'Primary color used throughout the components',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorPrimaryForeground: {
      description: 'Text color appearing on top of primary background',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorForeground: {
      description: 'Default text color',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorBackground: {
      description: 'Background color for the card container',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorInput: {
      description: 'Background color for all input elements',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorInputForeground: {
      description: 'Text color inside input elements',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorMuted: {
      description: 'Background color for elements of lower importance',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorMutedForeground: {
      description: 'Text color for elements of lower importance',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorDanger: {
      description: 'Color used to indicate errors or destructive actions',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorSuccess: {
      description: 'Color used to indicate successful actions or positive results',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorWarning: {
      description: 'Color used for potentially destructive actions or when attention is required',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorNeutral: {
      description: 'Neutral color used for borders, backgrounds, and hovered elements',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorBorder: {
      description: 'Base border color used in the components',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    colorShadow: {
      description: 'Base shadow color used in the components',
      control: { type: 'color' },
      table: { category: 'Appearance - Colors' },
    },
    // Typography Variables
    fontFamily: {
      description: 'Default font family for all components',
      control: { type: 'text' },
      table: { category: 'Appearance - Typography' },
    },
    fontFamilyButtons: {
      description: 'Font family for all buttons',
      control: { type: 'text' },
      table: { category: 'Appearance - Typography' },
    },
    fontSize: {
      description: 'Base font size (md value for calculating other scales)',
      control: { type: 'text' },
      table: { category: 'Appearance - Typography' },
    },
    // Layout Variables
    borderRadius: {
      description: 'Base border radius (md value for calculating other scales)',
      control: { type: 'text' },
      table: { category: 'Appearance - Layout' },
    },
    spacing: {
      description: 'Base spacing for margins, paddings, and gaps',
      control: { type: 'text' },
      table: { category: 'Appearance - Layout' },
    },
  },
  args: {
    // Default values for appearance variables
    colorPrimary: '#2F3037',
    colorPrimaryForeground: '#FFFFFF',
    colorBackground: '#FFFFFF',
    colorInput: '#FFFFFF',
    colorInputForeground: '#212126',
    colorForeground: '#212126',
    colorMutedForeground: '#747686',
    colorDanger: '#EF4444',
    colorSuccess: '#22C543',
    colorWarning: '#F36B16',
    colorNeutral: '#000000',
    fontFamily: 'inherit',
    fontFamilyButtons: 'inherit',
    fontSize: '0.8125rem',
    borderRadius: '0.375rem',
    spacing: '1rem',
  },
  decorators: [
    (Story, context) => {
      const {
        colorPrimary,
        colorPrimaryForeground,
        colorBackground,
        colorInput,
        colorInputForeground,
        colorForeground,
        colorMuted,
        colorMutedForeground,
        colorDanger,
        colorSuccess,
        colorWarning,
        colorNeutral,
        colorBorder,
        colorShadow,
        fontFamily,
        fontFamilyButtons,
        fontSize,
        borderRadius,
        spacing,
      } = context.args;

      // Build appearance object with individual variables
      const appearance: Appearance = {
        variables: {
          colorPrimary,
          colorPrimaryForeground,
          colorBackground,
          colorInput,
          colorInputForeground,
          colorForeground,
          colorMuted,
          colorMutedForeground,
          colorDanger,
          colorSuccess,
          colorWarning,
          colorNeutral,
          colorBorder,
          colorShadow,
          fontFamily,
          fontFamilyButtons,
          fontSize,
          borderRadius,
          spacing,
        },
      };

      return React.createElement(
        ClerkProvider,
        {
          publishableKey: 'pk_test_dG91Y2hlZC1sYWR5YmlyZC0yMy5jbGVyay5hY2NvdW50cy5kZXYk',
          appearance: appearance,
        } as any,
        React.createElement(
          'div',
          {
            style: { fontFamily: 'sans-serif' },
          },
          React.createElement(Story),
        ),
      );
    },
  ],
};

export default preview;

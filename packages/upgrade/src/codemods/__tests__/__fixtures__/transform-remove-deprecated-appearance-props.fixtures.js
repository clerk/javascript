export const fixtures = [
  {
    name: 'Renames baseTheme to theme in JSX appearance',
    source: `
      <SignIn appearance={{ baseTheme: dark }} />
    `,
    output: `
      <SignIn appearance={{ theme: dark }} />
    `,
  },
  {
    name: 'Renames baseTheme and variable keys when appearance object is referenced',
    source: `
      const appearance = {
        baseTheme: [dark, light],
        variables: {
          colorText: '#000',
          colorTextSecondary: '#111',
          colorInputText: '#222',
          colorInputBackground: '#333',
          colorTextOnPrimaryBackground: '#444',
          spacingUnit: '1rem',
        },
      };

      <SignUp appearance={appearance} />
    `,
    output: `
      const appearance = {
        theme: [dark, light],
        variables: {
          colorForeground: '#000',
          colorMutedForeground: '#111',
          colorInputForeground: '#222',
          colorInput: '#333',
          colorPrimaryForeground: '#444',
          spacing: '1rem',
        },
      };

      <SignUp appearance={appearance} />
    `,
  },
  {
    name: 'Handles string literal keys',
    source: `
      const appearance = {
        'baseTheme': dark,
        variables: {
          'colorText': '#000',
        },
      };

      <SignIn appearance={appearance} />
    `,
    output: `
      const appearance = {
        "theme": dark,
        variables: {
          "colorForeground": '#000',
        },
      };

      <SignIn appearance={appearance} />
    `,
  },
];

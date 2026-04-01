export const fixtures = [
  {
    name: 'Renames layout inside JSX appearance prop',
    source: `
      <SignIn appearance={{ layout: { socialButtonsPlacement: 'top' } }} />
    `,
    output: `
      <SignIn appearance={{ options: { socialButtonsPlacement: 'top' } }} />
    `,
  },
];

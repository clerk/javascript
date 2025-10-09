export const fixtures = [
  {
    name: 'Basic import transform',
    source: `
import { ClerkProvider } from "@clerk/clerk-react"
        `,
    output: `
import { ClerkProvider } from "@clerk/react"
`,
  },
  {
    name: 'Basic legacy import',
    source: `
import { useSignIn, useSignUp } from "@clerk/clerk-react"
        `,
    output: `
import { useSignIn, useSignUp } from "@clerk/react/legacy"
`,
  },
  {
    name: 'Basic legacy import (@clerk/clerk-expo)',
    source: `
import { useSignIn, useSignUp } from "@clerk/clerk-expo"
        `,
    output: `
import { useSignIn, useSignUp } from "@clerk/expo/legacy"
`,
  },
  {
    name: 'Basic legacy import (@clerk/nextjs)',
    source: `
import { useSignIn, useSignUp } from "@clerk/nextjs"
        `,
    output: `
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy"
`,
  },
  {
    name: 'Basic legacy import (@clerk/react-router)',
    source: `
import { useSignIn, useSignUp } from "@clerk/react-router"
        `,
    output: `
import { useSignIn, useSignUp } from "@clerk/react-router/legacy"
`,
  },
  {
    name: 'Basic legacy import (@clerk/tanstack-react-start)',
    source: `
import { useSignIn, useSignUp } from "@clerk/tanstack-react-start"
        `,
    output: `
import { useSignIn, useSignUp } from "@clerk/tanstack-react-start/legacy"
`,
  },
  {
    name: 'Mixed legacy imports',
    source: `
import { ClerkProvider, useSignIn, useSignUp } from "@clerk/clerk-react"
        `,
    output: `
import { ClerkProvider } from "@clerk/react";
import { useSignIn, useSignUp } from "@clerk/react/legacy";
`,
  },
];

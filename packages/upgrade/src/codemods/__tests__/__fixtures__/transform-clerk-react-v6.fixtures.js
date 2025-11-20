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
  {
    name: 'Maintains up-to-date imports',
    source: `
import { ClerkProvider } from "@clerk/clerk-react"
import { useSignIn, useSignUp } from "@clerk/react/legacy"
        `,
    output: `
import { ClerkProvider } from "@clerk/react"
import { useSignIn, useSignUp } from "@clerk/react/legacy"
`,
  },
  {
    name: 'Handles require statements',
    source: `
const { ClerkProvider } = require("@clerk/clerk-react")
        `,
    output: `
const { ClerkProvider } = require("@clerk/react")
`,
  },
  {
    name: 'Rewrites require statements to legacy imports',
    source: `
const { useSignIn, useSignUp } = require("@clerk/clerk-react")
        `,
    output: `
const { useSignIn, useSignUp } = require("@clerk/react/legacy")
`,
  },
  {
    name: 'Rewrites mixed require statements to legacy imports',
    source: `
const { useSignIn, useSignUp, ClerkProvider } = require("@clerk/clerk-react")
        `,
    output: `
const {
  ClerkProvider
} = require("@clerk/react")

const {
  useSignIn,
  useSignUp
} = require("@clerk/react/legacy");
`,
  },
  {
    name: 'Updates require to new package without object destructuring',
    source: `
const clerk = require("@clerk/clerk-react")
        `,
    output: `
const clerk = require("@clerk/react")
`,
  },
];

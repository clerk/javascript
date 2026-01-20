export const fixtures = [
  {
    name: 'Transforms Protect import in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect role="admin">
    <AdminPanel />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show :when="{ role: 'admin' }">
    <AdminPanel />
  </Show>
</template>`,
  },
  {
    name: 'Transforms SignedIn in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { SignedIn } from "@clerk/vue"
</script>

<template>
  <SignedIn>
    <Dashboard />
  </SignedIn>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show when="signed-in">
    <Dashboard />
  </Show>
</template>`,
  },
  {
    name: 'Transforms SignedOut in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { SignedOut } from "@clerk/vue"
</script>

<template>
  <SignedOut>
    <LoginPrompt />
  </SignedOut>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show when="signed-out">
    <LoginPrompt />
  </Show>
</template>`,
  },
  {
    name: 'Transforms Protect with permission in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect permission="org:billing:manage">
    <BillingSettings />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show :when="{ permission: 'org:billing:manage' }">
    <BillingSettings />
  </Show>
</template>`,
  },
  {
    name: 'Transforms Protect with feature in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect feature="premium">
    <PremiumContent />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show :when="{ feature: 'premium' }">
    <PremiumContent />
  </Show>
</template>`,
  },
  {
    name: 'Transforms Protect with plan in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect plan="pro">
    <ProFeatures />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show :when="{ plan: 'pro' }">
    <ProFeatures />
  </Show>
</template>`,
  },
  {
    name: 'Transforms Protect with multiple auth props in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect role="admin" permission="org:read">
    <AdminContent />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show :when="{ permission: 'org:read', role: 'admin' }">
    <AdminContent />
  </Show>
</template>`,
  },
  {
    name: 'Transforms Protect with condition in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect :condition="(has) => has({ role: 'admin' })">
    <AdminContent />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show :when="(has) => has({ role: 'admin' })">
    <AdminContent />
  </Show>
</template>`,
  },
  {
    name: 'Transforms Protect with fallback in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect role="admin" fallback="<Unauthorized />">
    <AdminContent />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show :when="{ role: 'admin' }" fallback="<Unauthorized />">
    <AdminContent />
  </Show>
</template>`,
  },
  {
    name: 'Transforms self-closing Protect in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect role="admin" />
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show :when="{ role: 'admin' }" />
</template>`,
  },
  {
    name: 'Transforms self-closing SignedIn in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { SignedIn } from "@clerk/vue"
</script>

<template>
  <SignedIn />
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show when="signed-in" />
</template>`,
  },
  {
    name: 'Transforms SignedOut with fallback in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { SignedOut } from "@clerk/vue"
</script>

<template>
  <SignedOut :fallback="loadingComponent">
    <LoginForm />
  </SignedOut>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show when="signed-out" :fallback="loadingComponent">
    <LoginForm />
  </Show>
</template>`,
  },
  {
    name: 'Transforms multiple components in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect, SignedIn, SignedOut } from "@clerk/vue"
</script>

<template>
  <div>
    <SignedIn>
      <Dashboard />
    </SignedIn>
    <SignedOut>
      <LoginForm />
    </SignedOut>
    <Protect role="admin">
      <AdminPanel />
    </Protect>
  </div>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue";
</script>

<template>
  <div>
    <Show when="signed-in">
      <Dashboard />
    </Show>
    <Show when="signed-out">
      <LoginForm />
    </Show>
    <Show :when="{ role: 'admin' }">
      <AdminPanel />
    </Show>
  </div>
</template>`,
  },
  {
    name: 'Transforms ProtectProps type in Vue SFC',
    path: 'component.vue',
    source: `<script setup lang="ts">
import { Protect, ProtectProps } from "@clerk/vue"

const props = defineProps<ProtectProps>()
</script>

<template>
  <Protect role="admin">
    <Content />
  </Protect>
</template>`,
    output: `<script setup lang="ts">
import { Show, ShowProps } from "@clerk/vue"

const props = defineProps<ShowProps>()
</script>

<template>
  <Show :when="{ role: 'admin' }">
    <Content />
  </Show>
</template>`,
  },
  {
    name: 'Transforms Protect with dynamic binding in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"

const userRole = ref('admin')
</script>

<template>
  <Protect :role="userRole">
    <Content />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"

const userRole = ref('admin')
</script>

<template>
  <Show :when="{ role: userRole }">
    <Content />
  </Show>
</template>`,
  },
  {
    name: 'Does not transform non-.vue files',
    path: 'component.tsx',
    source: `import { Protect } from "@clerk/vue"

const App = () => (
  <Protect role="admin">
    <Content />
  </Protect>
)`,
    output: null,
  },
  {
    name: 'Does not transform non-clerk imports in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "./local-protect"
</script>

<template>
  <Protect role="admin">
    <Content />
  </Protect>
</template>`,
    output: null,
  },
  {
    name: 'Transforms Protect with no props to default signed-in',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect>
    <Content />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show when="signed-in">
    <Content />
  </Show>
</template>`,
  },
  {
    name: 'Transforms Nuxt import in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect, SignedIn } from "#clerk"
</script>

<template>
  <SignedIn>
    <Dashboard />
  </SignedIn>
  <Protect role="admin">
    <AdminPanel />
  </Protect>
</template>`,
    output: null, // #clerk is not @clerk/* so should not transform
  },
  {
    name: 'Preserves other attributes on Protect in Vue SFC',
    path: 'component.vue',
    source: `<script setup>
import { Protect } from "@clerk/vue"
</script>

<template>
  <Protect role="admin" class="my-class" data-testid="protected">
    <Content />
  </Protect>
</template>`,
    output: `<script setup>
import { Show } from "@clerk/vue"
</script>

<template>
  <Show :when="{ role: 'admin' }" class="my-class" data-testid="protected">
    <Content />
  </Show>
</template>`,
  },
];

<template>
  <Show :when="{ role: 'org:admin' }">
    <p>I am an admin</p>
    <template #fallback>
      <p>Not an admin</p>
    </template>
  </Show>
</template>

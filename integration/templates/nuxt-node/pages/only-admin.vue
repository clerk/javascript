<template>
  <Protect>
    <p>I am an admin</p>
    <template #fallback>
      <p>Not an admin</p>
    </template>
  </Protect>
</template>

<script setup lang="ts">
import { UserButton } from '@clerk/vue';

function onClick() {
  console.log('clicked')
}
</script>

<template>
  <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action label="signOut" />
        <UserButton.Action label="manageAccount" />
        <UserButton.Link label="Custom link" href="/profile">
          <template #labelIcon>
              <div>Icon</div>
            </template>
        </UserButton.Link>
        <UserButton.Action label="Custom click" @click="onClick">
            <template #labelIcon>
              <div>Icon</div>
            </template>
        </UserButton.Action>
      </UserButton.MenuItems>
  </UserButton>
</template>

<script setup lang="ts">
import { UserButton } from '@clerk/vue';
import { ref } from 'vue';

const isActionClicked = ref(false);
</script>

<template>
  <UserButton>
    <UserButton.MenuItems>
      <UserButton.Action label="signOut" />
      <UserButton.Action label="manageAccount" />
      <UserButton.Link
        label="Custom link"
        href="/profile"
      >
        <template #labelIcon>
          <div>Icon</div>
        </template>
      </UserButton.Link>
      <UserButton.Action
        label="Custom action"
        @click="isActionClicked = true"
      >
        <template #labelIcon>
          <div>Icon</div>
        </template>
      </UserButton.Action>
    </UserButton.MenuItems>
  </UserButton>
  <div>Is action clicked: {{ isActionClicked }}</div>
</template>

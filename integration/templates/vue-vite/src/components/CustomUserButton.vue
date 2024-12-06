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
        label="Custom page"
        open="terms"
      >
        <template #labelIcon>
          <div>Icon</div>
        </template>
      </UserButton.Action>
      <UserButton.Action
        label="Custom action"
        @click="isActionClicked = true"
      >
        <template #labelIcon>
          <div>Icon</div>
        </template>
      </UserButton.Action>
    </UserButton.MenuItems>
    <UserButton.UserProfilePage
      label="Terms"
      url="terms"
    >
      <template #labelIcon>
        <div>Icon</div>
      </template>
      <div>
        <h1>Custom Terms Page</h1>
        <p>This is the custom terms page</p>
      </div>
    </UserButton.UserProfilePage>
  </UserButton>
  <div>Is action clicked: {{ isActionClicked }}</div>
</template>

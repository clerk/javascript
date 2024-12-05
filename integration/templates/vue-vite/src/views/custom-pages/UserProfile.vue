<script setup lang="ts">
import { UserProfile } from '@clerk/vue';
</script>

<template>
  <UserProfile>
    <UserProfile.Page
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
    </UserProfile.Page>
    <UserProfile.Link
      label="Homepage"
      url="/"
    >
      <template #labelIcon>
        <div>Icon</div>
      </template>
    </UserProfile.Link>
    <UserProfile.Page label="security" />
  </UserProfile>
</template>

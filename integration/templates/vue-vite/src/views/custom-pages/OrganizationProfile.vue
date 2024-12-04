<script setup lang="ts">
import { OrganizationProfile } from '@clerk/vue';
</script>

<template>
  <OrganizationProfile>
    <OrganizationProfile.Page
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
    </OrganizationProfile.Page>
    <OrganizationProfile.Link
      label="Homepage"
      url="/"
    >
      <template #labelIcon>
        <div>Icon</div>
      </template>
    </OrganizationProfile.Link>
    <OrganizationProfile.Page label="security" />
  </OrganizationProfile>
</template>

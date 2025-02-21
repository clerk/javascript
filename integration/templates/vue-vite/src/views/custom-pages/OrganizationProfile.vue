<script setup lang="ts">
import { OrganizationProfile, OrganizationSwitcher } from '@clerk/vue';
</script>

<template>
  <OrganizationSwitcher>
    <OrganizationSwitcher.OrganizationProfilePage
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
    </OrganizationSwitcher.OrganizationProfilePage>
    <OrganizationSwitcher.OrganizationProfileLink
      label="Homepage"
      url="/"
    >
      <template #labelIcon>
        <div>Icon</div>
      </template>
    </OrganizationSwitcher.OrganizationProfileLink>
  </OrganizationSwitcher>
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
    <OrganizationProfile.Page label="general" />
  </OrganizationProfile>
</template>

<script setup lang="ts">
import { OrganizationProfile, OrganizationSwitcher } from '@clerk/vue';
import { useRoute } from 'vue-router';

// Added a dedicatedPage query param to conditionally render the OrganizationProfile
// as for some reason, the menu items in the OrganizationSwitcher
// goes out of bounds in test environment.
const route = useRoute();
const dedicatedPage = route.query.dedicatedPage === 'true';
</script>

<template>
  <OrganizationSwitcher>
    <OrganizationSwitcher.OrganizationProfilePage
      v-if="!dedicatedPage"
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
      v-if="!dedicatedPage"
      label="Homepage"
      url="/"
    >
      <template #labelIcon>
        <div>Icon</div>
      </template>
    </OrganizationSwitcher.OrganizationProfileLink>
  </OrganizationSwitcher>
  <OrganizationProfile v-if="dedicatedPage">
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

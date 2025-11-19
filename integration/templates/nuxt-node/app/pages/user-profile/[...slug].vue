<script setup>
const { data: user } = await useFetch('/api/me');
</script>

<template>
  <UserProfile path="/user-profile" />
  <ul>
    <li>First name: {{ user.firstName }}</li>
    <li>Email: {{ user.emailAddresses[0].emailAddress }}</li>
  </ul>
</template>

<template>
  <div>
    <button @click="clerk.openSignIn()">Login</button>
    <button @click="clerk.signOut()">Logout</button>
    <button @click="clerk.openUserProfile()">User</button>
    <pre>{{ user.user?.fullName ?? 'Not Loggedin' }}</pre>
  </div>
</template>

<script setup lang="ts">
import { useUser, useClerk } from '@clerk/clerk-vue'

const user = useUser()
const clerk = useClerk()

</script>

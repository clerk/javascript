<template>
  <div>
    <h1>Index Route</h1>
    <Show when="signedIn">
      <p>You are signed in!</p>
      <div>
        <p>View your profile here</p>
        <UserButton />
        <OrganizationSwitcher />
      </div>
      <div>
        <SignOutButton />
      </div>
    </Show>
    <Show when="signedOut">
      <p>You are signed out</p>

      <SignIn />
    </Show>
  </div>
</template>

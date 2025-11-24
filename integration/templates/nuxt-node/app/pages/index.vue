<template>
  <div>
    <h1>Index Route</h1>
    <SignedIn>
      <p>You are signed in!</p>
      <div>
        <p>View your profile here</p>
        <UserButton />
        <OrganizationSwitcher />
      </div>
      <div>
        <SignOutButton />
      </div>
    </SignedIn>
    <SignedOut>
      <p>You are signed out</p>

      <SignIn />
    </SignedOut>
  </div>
</template>

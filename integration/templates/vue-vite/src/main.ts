import { createApp } from 'vue';
import './assets/styles.css';
import App from './App.vue';
import { clerkPlugin } from '@clerk/vue';
import router from './router';

const app = createApp(App);
app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  __internal_clerkJSUrl: import.meta.env.VITE_CLERK_JS_URL,
  __internal_clerkUIUrl: import.meta.env.VITE_CLERK_UI_URL,
  __internal_clerkJSVersion: import.meta.env.VITE_CLERK_JS_VERSION,
  appearance: {
    options: {
      showOptionalFields: true,
    },
  },
});
app.use(router);
app.mount('#app');

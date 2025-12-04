import { createApp } from 'vue';
import './assets/styles.css';
import App from './App.vue';
import { clerkPlugin } from '@clerk/vue';
import router from './router';

const app = createApp(App);
app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  clerkJSUrl: import.meta.env.VITE_CLERK_JS_URL,
  clerkUiUrl: import.meta.env.VITE_CLERK_UI_URL,
  clerkJSVersion: import.meta.env.VITE_CLERK_JS_VERSION,
});
app.use(router);
app.mount('#app');

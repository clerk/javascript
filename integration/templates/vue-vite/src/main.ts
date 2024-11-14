import { createApp } from 'vue';
import './assets/styles.css';
import App from './App.vue';
import { clerkPlugin } from '@clerk/vue';
import router from './router';

const app = createApp(App);
app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
});
app.use(router);
app.mount('#app');

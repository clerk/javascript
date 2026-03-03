---
'@clerk/clerk-js': patch
'@clerk/expo': patch
---

- Prevent DOM-based captcha from hanging in React Native environments
- Make `expo-auth-session` and `expo-web-browser` optional via dynamic imports
- Re-export `RedirectToTasks` and `Show` control components

---
'@clerk/ui': patch
---

Stop instant password autofill polling when the field is absent or already visible. Resume detection when the field becomes empty again, and support browsers that do not recognize an autofill selector.

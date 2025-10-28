# MelodyFlow Android App

This is a minimal Android WebView application that loads a React music website from `app/src/main/assets/website.zip`.

## Preparing `website.zip`

The `website.zip` file is a compressed archive of the React music website. To prepare this file, you need to:

1.  Build your React application.
2.  Navigate to the build output directory (e.g., `build` or `dist`).
3.  Ensure that the `index.html` file is at the root of this directory.
4.  Zip the *contents* of the build directory, not the directory itself. The resulting zip file should have `index.html` at the root level.
5.  Place the resulting `website.zip` file in the `app/src/main/assets` directory of this Android project.

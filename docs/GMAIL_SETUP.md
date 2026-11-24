# Metadata-only Google connection

This connects the extension to a Google account but does not retrieve, display, or modify real mail. Gmail's metadata scope grants access across the mailbox; sender-specific restrictions would have to be enforced by the extension. Real-message privacy filtering is not ready. No client secret is needed or should be included.

1. Load the existing `dist` folder in `chrome://extensions` and copy the extension's 32-character ID from its details. Keep the folder path and Chrome profile stable so the unpacked extension ID remains the same.
2. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project and enable the Gmail API. Configure Google Auth Platform branding, audience, and a test user for the Gmail account if the app is in testing mode. Add the `https://www.googleapis.com/auth/gmail.metadata` scope to the data access configuration.
3. Create an OAuth client of type **Chrome Extension** and enter the extension ID as its item ID. Copy the public client ID. Do not create or add a client secret or private key.
4. Create `.env.local` in the project root containing `QUIET_INBOX_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com` with the actual client ID. This file is ignored by Git.
5. Run `npm run build` (or restart `npm run dev`), then reload the extension in `chrome://extensions`. Open Quiet Inbox and choose **Connect Gmail**, then review Google's consent screen. The client ID is a public application identifier and is embedded in the built manifest.

Disconnect asks Google to revoke the token and removes it from Chrome's token cache only after Google confirms revocation. Revocation may remove other permissions granted to the same Google Cloud project. If the extension cannot obtain a cached token or revocation fails, remove the app in your Google Account's third-party connections instead. The extension does not store access tokens in its own persistent storage.

Google may restrict testing-mode access and require verification or security assessment for public use of Gmail restricted scopes. The connection has not been tested with a real Google account. See [Google's credential setup](https://developers.google.com/workspace/guides/create-credentials) and [Gmail scope requirements](https://developers.google.com/workspace/gmail/api/auth/scopes).

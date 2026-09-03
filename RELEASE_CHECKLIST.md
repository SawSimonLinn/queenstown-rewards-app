# Production release checklist

Nothing in this checklist has been submitted or published — per your
instructions, that only happens with your explicit go-ahead, using your own
Apple/Google developer accounts.

## App icon and splash screen

| Item                                                                                                        | Status                                                                                     |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `assets/images/icon.png` (1024×1024)                                                                        | ⚠️ Present, correct size, but still the **stock Expo logo** — not real Queenstown branding |
| `assets/expo.icon` (iOS icon asset)                                                                         | ⚠️ Same — stock Expo icon                                                                  |
| `assets/images/android-icon-foreground.png` / `-background.png` / `-monochrome.png` (512×512 adaptive icon) | ⚠️ Present, correct sizes, stock Expo graphics                                             |
| `assets/images/splash-icon.png`                                                                             | ⚠️ Present, stock Expo logo                                                                |
| Splash background color (`#208AEF`)                                                                         | Placeholder — was never asked to match a real brand color                                  |

**Action needed:** replace all of the above with real Queenstown Rewards
branding before any store submission — I have not designed or generated any
of this myself, per "do not invent Queenstown's branding."

## Privacy policy

This app collects: email, name, location preference, camera access (QR
scanning only — no photos are taken or stored), and (if enabled) a push
notification token. Both app stores require a **real, hosted privacy policy
URL** before you can submit. I have not written one — that's a legal
document I shouldn't fabricate. A policy needs to cover, at minimum:

- [ ] What data is collected (see list above) and why
- [ ] That Supabase (a third-party processor) stores this data, and where
- [ ] How long data is retained, and how a user can request deletion
- [ ] That camera access is used only for QR scanning, nothing is uploaded
- [ ] Push notification opt-in/opt-out
- [ ] Contact information for privacy questions
- [ ] A hosted, publicly reachable URL (e.g. a page on your own site) to
      enter into both store listings

## App Store (iOS) metadata checklist

None of this content exists yet — checklist of what App Store Connect will
ask for:

- [ ] App name, subtitle (30 chars)
- [ ] Description, keywords
- [ ] Screenshots (6.9", 6.5" iPhone sizes at minimum; iPad if
      `supportsTablet` is enabled — currently disabled in `app.json`)
- [ ] App category, age rating questionnaire
- [ ] Support URL, marketing URL (optional)
- [ ] Privacy policy URL (see above)
- [ ] Privacy "nutrition label" (App Privacy details — data types collected,
      matches the list above)
- [ ] Apple Developer Program membership (paid, your account)
- [ ] `ios.bundleIdentifier` in `app.json` changed from the placeholder
      `com.example.queenstownrewards` to your real one

## Google Play metadata checklist

- [ ] App name, short description (80 chars), full description (4000 chars)
- [ ] Screenshots (phone required; tablet/other optional), feature graphic
      (1024×500)
- [ ] App category, content rating questionnaire
- [ ] Privacy policy URL (same one as above)
- [ ] Data safety form (data types collected/shared — matches the list above)
- [ ] Google Play Console account (one-time fee, your account)
- [ ] `android.package` in `app.json` changed from the placeholder
      `com.example.queenstownrewards` to your real one

## Production environment configuration

- [ ] `app.json` → `extra.eas.projectId` — currently a placeholder; run
      `eas init` (your Expo account) to get a real one
- [ ] `app.json` → `ios.bundleIdentifier` / `android.package` — currently
      placeholders, pick real ones (reverse-DNS of a domain you own)
- [ ] Confirm your Supabase project's **production** settings: email
      templates (registration/reset) point at real content, "Confirm email"
      set the way you want it for real users, Auth → URL Configuration
      includes `queenstownrewards://reset-password`
- [ ] `eas.json` (added this phase) has `development` / `preview` /
      `production` build profiles — review before first build
- [ ] Decide whether production uses the same Supabase project as
      development, or a separate one (currently: same project, no
      environment separation)

## EAS Build

`eas.json` is configured with three profiles. None of these have been run —
they require your own Expo account login.

```bash
npm install -g eas-cli   # if not already installed
eas login                # your Expo account
eas init                 # links this project, fills in extra.eas.projectId
eas build --profile development --platform ios      # or android
```

## iOS TestFlight

1. `eas build --profile production --platform ios` (needs Apple Developer
   Program membership linked to your Expo account)
2. `eas submit --platform ios` — uploads the build to App Store Connect
3. In App Store Connect → TestFlight, add internal/external testers
4. Testers install via the TestFlight app once Apple's automated review
   (usually a few hours to a day) passes

## Android internal testing

1. `eas build --profile production --platform android`
2. `eas submit --platform android` — uploads to Google Play Console
3. In Play Console → Testing → Internal testing, create a release, add
   testers by email
4. Testers install via the opt-in link Play Console generates

## Final production release checklist

- [ ] All automated tests pass (`npm test`)
- [ ] Manual device test script in `TESTING.md` completed on both iOS and
      Android
- [ ] Real branding (icon, splash, colors) in place
- [ ] Privacy policy written and hosted
- [ ] Store metadata (both stores) written and screenshots captured
- [ ] Bundle identifiers set to real values, EAS project initialized
- [ ] Supabase production settings reviewed (email templates, redirect URLs)
- [ ] TestFlight + Android internal testing both completed with real
      external testers, not just you
- [ ] You have explicitly approved submission — I will not run `eas submit`
      or anything equivalent without you asking for it directly

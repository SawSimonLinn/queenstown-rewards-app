# Testing

## Automated tests

```bash
npm test              # unit tests (fast, no network, safe to run anytime)
npm test -- --coverage
```

Covers: auth form validation (login/register/forgot/reset password schemas),
redemption error-code mapping (invalid/expired/wrong-location/already-redeemed/
ineligible/not-authenticated), the client-side eligibility rule
(`isRedeemable`), date/opening-hours formatting, and maps/phone URL building.

### Integration tests (real backend — read before running)

`scripts/integration-tests/redemption.mjs` exercises the actual Supabase
backend: authorization (a customer cannot create their own entitlement, read
QR codes directly, or call `confirm_redemption`), QR validation states
(invalid/expired/wrong-location), and — the one that matters most — **firing
two simultaneous redemption requests for the same QR code and asserting they
resolve to the same single redemption row**, which is the concrete proof that
the Phase 7 unique constraint prevents double-redemption under a race.

**This creates a real throwaway customer account and real rows in your live
Supabase project.** It does not run automatically and I have not run it
against your project — decide when you want to, then:

```bash
node scripts/integration-tests/redemption.mjs
```

Requires: the Phase 7 + Phase 9 migrations applied (including the seeded
`QSTOWN-TEST-VALID` / `QSTOWN-TEST-EXPIRED` QR codes), and your Supabase
project's "Confirm email" setting temporarily off (or the script exits with
an explanation — email-confirmed signups return no session to test with).

## Manual physical-device test script

Run through this on a real iPhone and a real Android phone via Expo Go
before considering a release build. Roughly the order features were built.

**Setup**

- [ ] `npx expo start`, scan the QR code, app loads with no red error screen

**Auth (Phase 6)**

- [ ] Register a new account → land on Home (or "check your email" if
      confirmation is required)
- [ ] Sign out → sign back in
- [ ] Force-quit and reopen the app → still signed in (persistent session)
- [ ] Forgot password → reset email arrives → link opens the app → set new
      password → lands signed in
- [ ] Try registering with a password under 8 characters → inline error
- [ ] Try registering with mismatched passwords → inline error

**Home / Burger of the Month / Locations / Specials (Phases 3–5, 10)**

- [ ] Home shows the current campaign, reward status, your location, specials
- [ ] Tap the campaign → detail screen with dates, terms, participating
      locations
- [ ] Locations tab → all 8 locations → tap one → hours, phone (dials),
      directions (opens Maps)
- [ ] Set a location as preferred → returns to the previous screen → Home
      reflects the new location
- [ ] Specials → See all → detail screen

**QR scanning + redemption (Phases 8–9)**

- [ ] Deny camera permission → clear explanation shown, no crash
- [ ] Grant permission → scan `QSTOWN-TEST-VALID` → pending screen
- [ ] As a staff test account → Profile → Pending redemptions → Confirm
- [ ] Back on the customer account → reward now shows "Used"
- [ ] Scan the same code again → "Already redeemed"
- [ ] Scan `QSTOWN-TEST-EXPIRED` → expired message
- [ ] Scan any unrelated QR code → invalid message
- [ ] Change preferred location, rescan the valid code → wrong-location
      message
- [ ] Start a scan, tap Cancel before and after reaching the pending screen →
      no crash, no dangling state

**Notifications (Phase 10)**

- [ ] Profile → enable notifications → grant permission
- [ ] Send test notification, background the app, tap it when it arrives →
      opens Specials

**Network failure**

- [ ] Turn on Airplane Mode, open the app → every screen shows its error
      state with a working "Try again", not a crash or infinite spinner

## Accessibility review (baseline pass — see notes)

- All interactive elements use `Pressable`/`Button`/`TextInput` with
  `accessibilityLabel` or visible text as their accessible name.
- `Button` and `TextField` enforce a 44pt minimum touch target
  (`MinTouchTarget` in `src/constants/theme.ts`).
- Small text links (Forgot password?, Create account, See all, etc.) got a
  12pt `hitSlop` in this phase after an audit found several under 44pt.
- Not yet verified: color contrast ratios against WCAG AA, since the brand
  palette (`Brand` in `src/constants/theme.ts`) is still placeholder —
  re-check contrast once real brand colors are supplied.
- Not yet tested: a full pass with VoiceOver (iOS) / TalkBack (Android)
  actually turned on, reading through each screen. Worth doing manually
  before release — this review was a code-level audit, not a live
  screen-reader run.

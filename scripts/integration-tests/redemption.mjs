#!/usr/bin/env node
// Integration tests for the Phase 9 redemption flow, run against a REAL
// Supabase project (there is no separate test project). This creates a
// real throwaway customer account and, if it succeeds, a real pending
// redemption row — do not run this against a project you can't afford to
// add test data to. It signs the test account out at the end but does NOT
// delete it (deleting auth users needs the service-role key, which this
// mobile app never has access to — see queenstown-rewards-admin for that).
//
// Usage:
//   node scripts/integration-tests/redemption.mjs
//
// Requires EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in the
// environment (already in this project's .env) and the Phase 7 + Phase 9
// migrations already applied, including the seeded QSTOWN-TEST-VALID and
// QSTOWN-TEST-EXPIRED QR codes.

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) {
    console.log(`  ok - ${name}`);
    passed++;
  } else {
    console.log(`  FAIL - ${name}${detail ? `: ${detail}` : ''}`);
    failed++;
  }
}

async function main() {
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });

  console.log('Signing up a throwaway test customer...');
  const testEmail = `qr-integration-test-${Date.now()}@example.com`;
  const testPassword = `Test-${Date.now()}-Pass!`;
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: { data: { full_name: 'Integration Test Customer' } },
  });
  if (signUpError) {
    console.error('Sign up failed:', signUpError.message);
    process.exit(1);
  }
  if (!signUpData.session) {
    console.error(
      'Sign up succeeded but returned no session — this Supabase project requires email' +
        ' confirmation, so these tests cannot proceed without a way to confirm the address.' +
        ' Disable "Confirm email" temporarily in Supabase Auth settings to run this suite,' +
        ' or adapt this script to confirm via the admin API.'
    );
    process.exit(1);
  }
  console.log(`Signed up and signed in as ${testEmail}\n`);

  // --- Authorization: RLS blocks direct writes a customer must never make ---
  console.log('Authorization checks (a customer must never be able to do these directly):');

  const { error: entitlementInsertError } = await supabase.from('monthly_entitlements').insert({
    profile_id: signUpData.user.id,
    campaign_id: '00000000-0000-0000-0000-000000000000',
    period_month: '2026-01-01',
    status: 'eligible',
  });
  check('cannot create their own entitlement', !!entitlementInsertError);

  const { data: qrRows } = await supabase.from('redemption_qr_codes').select('*');
  check('cannot read redemption QR codes directly', (qrRows ?? []).length === 0);

  const { error: confirmError } = await supabase.rpc('confirm_redemption', {
    p_redemption_id: '00000000-0000-0000-0000-000000000000',
  });
  check(
    'cannot call confirm_redemption (staff-only)',
    !!confirmError && confirmError.message.includes('NOT_AUTHORIZED')
  );

  // --- QR validation states ---
  console.log('\nQR validation states:');

  const { data: locations } = await supabase.from('locations').select('id, name').order('name');
  if (!locations || locations.length === 0) {
    console.error('No locations found — has the Phase 7 seed migration been run?');
    process.exit(1);
  }
  const firstLocationId = locations[0].id;
  const otherLocationId = locations[1]?.id ?? locations[0].id;

  const { error: invalidError } = await supabase.rpc('request_redemption', {
    p_token: 'NOT-A-REAL-TOKEN',
    p_location_id: firstLocationId,
  });
  check(
    'invalid QR token is rejected',
    !!invalidError && invalidError.message.includes('INVALID_QR')
  );

  const { error: expiredError } = await supabase.rpc('request_redemption', {
    p_token: 'QSTOWN-TEST-EXPIRED',
    p_location_id: firstLocationId,
  });
  check(
    'expired QR token is rejected',
    !!expiredError && expiredError.message.includes('EXPIRED_QR'),
    expiredError?.message
  );

  const { error: wrongLocationError } = await supabase.rpc('request_redemption', {
    p_token: 'QSTOWN-TEST-VALID',
    p_location_id: otherLocationId,
  });
  const wrongLocationExpected = otherLocationId !== firstLocationId;
  check(
    'wrong-location QR is rejected (when a second location exists)',
    !wrongLocationExpected ||
      (!!wrongLocationError && wrongLocationError.message.includes('WRONG_LOCATION')),
    wrongLocationError?.message
  );

  // --- Duplicate / simultaneous redemption ---
  console.log('\nDuplicate and simultaneous redemption attempts:');

  const [firstAttempt, secondAttempt] = await Promise.all([
    supabase.rpc('request_redemption', {
      p_token: 'QSTOWN-TEST-VALID',
      p_location_id: firstLocationId,
    }),
    supabase.rpc('request_redemption', {
      p_token: 'QSTOWN-TEST-VALID',
      p_location_id: firstLocationId,
    }),
  ]);

  const succeeded = [firstAttempt, secondAttempt].filter((r) => !r.error);
  check('at least one simultaneous request succeeds', succeeded.length >= 1);
  check(
    'both simultaneous requests resolve to the SAME redemption id (no duplicate row)',
    succeeded.length === 2 && succeeded[0].data.redemption_id === succeeded[1].data.redemption_id
  );

  const redemptionId = succeeded[0]?.data?.redemption_id;
  if (redemptionId) {
    const { error: thirdAttemptError } = await supabase.rpc('request_redemption', {
      p_token: 'QSTOWN-TEST-VALID',
      p_location_id: firstLocationId,
    });
    check('re-scanning the same code after a pending request is a safe no-op', !thirdAttemptError);

    const { error: cancelError } = await supabase.rpc('cancel_pending_redemption', {
      p_redemption_id: redemptionId,
    });
    check('the customer can cancel their own pending request', !cancelError, cancelError?.message);
  }

  await supabase.auth.signOut();

  console.log(`\n${passed} passed, ${failed} failed.`);
  console.log(
    `\nNote: test account ${testEmail} and its entitlement/redemption rows remain in the` +
      ' database (no service-role key available here to delete the auth user). Clean up' +
      ' manually via Supabase Dashboard → Authentication if desired.'
  );
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Integration test script crashed:', error);
  process.exit(1);
});

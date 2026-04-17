import { test, expect, chromium } from '@playwright/test';

// E2E: Verify transcriber publishes transcripts to meeting and parent chat
// - Runs headed (visible) so it can capture real microphone input
// - Grants microphone permission to the app origin
// - Prompts the tester to speak using a browser alert so real mic audio is captured

test('transcriber end-to-end (headed, real mic)', async () => {
  const base = 'http://localhost:3000';
  const chatPath = '/chat/c7d8f16d-2814-471b-b4c0-9bb38d63a588';

  // Launch a headed Chromium so the browser UI is visible for microphone consent
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // Grant microphone permission for the target origin
  await context.grantPermissions(['microphone'], { origin: base });

  const page = await context.newPage();

  // 1) Log in
  await page.goto(base);

  // Try common login field selectors; adapt if your app uses different names
  // Wait for either a visible login form or redirect to app
  try {
    await page.fill('input[name="email"]', 'demo@traco.co', { timeout: 3000 });
    await page.fill('input[name="password"]', 'traco123');
    // Click a login button by common texts
    const btn = await page.locator('button:has-text("Sign in")').first();
    if (await btn.count()) {
      await btn.click();
    } else {
      await page.click('button:has-text("Log in")').catch(() => {});
    }
  } catch (e) {
    // If login fields are not present, assume already logged in or single-signon
  }

  // wait for navigation / app shell
  await page.waitForLoadState('networkidle');

  // 2) Open the telegram group chat
  await page.goto(base + chatPath);
  await page.waitForLoadState('networkidle');

  // 3) Click `Start Meeting` button (text-based locator)
  const startBtn = page.locator('button:has-text("Start Meeting")').first();
  await expect(startBtn).toBeVisible({ timeout: 10000 });
  await startBtn.click();

  // Wait for meeting UI to initialize. Adjust selector if your app uses a different DOM.
  await page.waitForTimeout(2000);

  // 4) Remind user to talk to test microphone input (blocking alert so tester sees it)
  await page.evaluate(() => alert('Please speak into your microphone now. Click OK when you are ready to start the test.'));

  // Allow some time for the transcriber to pick up audio and post transcripts
  // The transcriber service typically posts simulated or real sentences like:
  const expectedPhrases = [
    'Hello everyone, welcome to the meeting.',
    'We will review the Q1 roadmap and blockers.',
    "Thanks — that's the update from my side.",
    'This is a test transcript from curl.'
  ];

  // 5) Verify transcripts show up in the meeting UI
  let foundInMeeting = false;
  for (const phrase of expectedPhrases) {
    try {
      await page.waitForSelector(`text=${phrase}`, { timeout: 30000 });
      foundInMeeting = true;
      break;
    } catch (e) {
      // continue
    }
  }

  expect(foundInMeeting).toBeTruthy();

  // 6) Verify transcripts also appear in parent chat (navigate back to chat view)
  await page.goto(base + chatPath);
  await page.waitForLoadState('networkidle');

  let foundInParent = false;
  for (const phrase of expectedPhrases) {
    try {
      await page.waitForSelector(`text=${phrase}`, { timeout: 15000 });
      foundInParent = true;
      break;
    } catch (e) {
      // continue
    }
  }

  expect(foundInParent).toBeTruthy();

  await context.close();
  await browser.close();
});

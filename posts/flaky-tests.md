---
title: "Flaky tests are just tests with commitment issues"
date: "2026-10-06"
icon: "item:r7"
excerpt: "Green on Monday, red on Tuesday, green again after a retry. Why Playwright tests get flaky and how I stopped gaslighting myself about it."
---

You know the feeling. You push. CI goes red. You panic, you open the logs, you change _absolutely nothing_, you press "Re-run" and... it's green. 🟢

Congratulations, you own a **flaky test**. It's like Schrödinger's cat, except the box is a GitHub Actions runner and the cat costs you 14 minutes every time you open it.

A flaky test isn't "a bit broken". It's a test that **doesn't trust you**. It passes or fails depending on the weather, the CPU, the mood of the backend and whether Mercury is in retrograde (okay, maybe not that one... probably).

And the worst part? After the third random red build, the whole team starts ignoring red builds. That's when real bugs walk straight into production wearing sunglasses. 🕶️

## Why tests get commitment issues

From what I've seen so far (QA internship + way too many evenings with Playwright), it's almost always one of these:

- **Timing**: the test is faster than the app. It clicks a button that isn't ready yet or checks a toast before it shows up.
- **Shared state**: test A creates a user, test B deletes "all users", test C cries. They pass alone and fail together, like a band before the breakup.
- **Test data**: two workers run in parallel and both try to register `julka@test.com`. Only one of them gets to be Julka.
- **The network**: a third-party API is slow today. Or down. Or rate-limiting you because you hit it 400 times in a minute (sorry).
- **The environment**: a smaller CPU in CI, a different viewport, a different timezone. "Works on my machine" is not a test strategy, sadly.

## Fix #1: stop sleeping on the job

This is the classic. I've written it. You've written it. Let's not talk about it.

```ts
// 🚫 the "it works on my machine" special
await page.click('#submit');
await page.waitForTimeout(3000);
expect(await page.locator('.toast').isVisible()).toBe(true);
```

Two problems. `waitForTimeout(3000)` is a guess: too short on a slow day, a waste of 3 seconds on a good day. And `isVisible()` checks **once, right now**, without waiting at all.

Playwright already knows how to wait. Let it:

```ts
// ✅ web-first assertion: retries until it's true (or times out)
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('status')).toHaveText('Saved!');
```

`await expect(locator)...` keeps re-checking until the condition is met or the timeout runs out. Actions like `click()` also auto-wait until the element is visible, enabled and stable. So the test waits exactly as long as it needs to, not one nap longer. 😴

If you need to wait for the **backend** and not the UI, start waiting **before** the click, otherwise the response may arrive while you're still tying your shoes:

```ts
const saved = page.waitForResponse(
  (r) => r.url().includes('/api/orders') && r.status() === 201,
);
await page.getByRole('button', { name: 'Order pizza' }).click();
await saved;
```

## Fix #2: every test lives alone (like a cat)

Playwright gives every test a fresh browser context by default: new cookies, new localStorage, a clean slate. Don't ruin it by making tests depend on each other.

- No "test 2 needs the user from test 1". If test 2 needs a user, test 2 **creates** a user (an API call in `beforeEach` is much faster than clicking through the UI).
- Unique test data, always:

```ts
const email = `julka+${test.info().workerIndex}-${Date.now()}@test.dev`;
```

- Log in once and reuse it with `storageState` instead of typing the password in every single test like a medieval monk copying a manuscript.

## Fix #3: catch the flake in the act

A flaky test that fails 1 in 20 runs is hard to debug because it's never failing when you look. So make it fail on purpose:

```bash
npx playwright test checkout.spec.ts --repeat-each=30 --workers=4
```

30 runs, 4 at a time. If it's flaky, it _will_ show up, and now you have a crime scene instead of a rumour. 🔎

Then turn on the trace, so a failure in CI comes with evidence:

```ts
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: { trace: 'on-first-retry' },
});
```

The trace viewer shows every action, a DOM snapshot before and after, the network and the console. It's basically a time machine, but for disappointment.

## About retries (the uncomfortable part)

Retries are a **smoke detector**, not a fire extinguisher. 🚒

If the HTML report says "flaky" (failed, then passed on retry), that's not a win, it's a ticket. Retries keep the pipeline moving today; the fix keeps it honest tomorrow. If you can't fix it right now, mark it (`test.fixme`) and write down why, instead of letting it randomly ruin everybody's afternoon.

## TL;DR for future me

- No `waitForTimeout`. Ever. (Okay, almost ever.)
- `await expect(locator)` instead of `expect(await ...)`.
- Role-based locators instead of `#div > div:nth-child(3) > span`.
- Every test creates its own data and cleans up its own mess.
- `--repeat-each` to reproduce, traces to understand, retries only to buy time.

A green build should mean "it works", not "it worked this time". Commitment issues are fine for anime love triangles. Not for tests. 💚

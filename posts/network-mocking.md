---
title: "page.route(): lying to my app for its own good"
date: "2026-10-13"
icon: "item:w8"
excerpt: "Mocking the network in Playwright: fake APIs, fake errors, fake slowness, and the one rule that keeps you from testing your own lies."
---

Today I'd like to talk about lying. Professionally. 🪄

Some tests need the backend to behave in very specific ways: return an empty list, explode with a 500, take 8 seconds to answer, return a pizza with a 300-character name. Real backends rarely do these things on request. They do them on Friday at 16:58, unprompted.

So instead of waiting for the universe to break things for me, I break them myself, in a controlled way, with `page.route()`.

## The basic trick

`page.route()` lets you catch requests from the browser before they leave and decide what happens to them: answer them yourself, change them or block them.

```ts
test('shows the menu from the API', async ({ page }) => {
  await page.route('**/api/products', (route) =>
    route.fulfill({
      json: [
        { id: 1, name: 'Margherita', price: 29 },
        { id: 2, name: 'Pepperoni of Chaos', price: 35 },
      ],
    }),
  );

  await page.goto('/menu');

  await expect(page.getByRole('heading', { name: 'Pepperoni of Chaos' })).toBeVisible();
});
```

The app asks for `/api/products`, Playwright answers with my JSON and the real server never even hears about it. Rude? Yes. Effective? Also yes.

Important detail that cost me an embarrassing amount of time: **register the route before `page.goto()`**. If the page fetches the data while loading, a route added afterwards is like bringing an umbrella home after the rain.

## The fun part: unhappy paths

This is where mocking really shines. Edge cases that are hard to set up for real become one-liners:

```ts
// the backend is having a bad day
await page.route('**/api/products', (route) =>
  route.fulfill({ status: 500, json: { message: 'Oven on fire' } }),
);
await page.goto('/menu');
await expect(page.getByRole('alert')).toContainText('Something went wrong');
```

```ts
// nobody ordered anything ever (sad)
await page.route('**/api/orders', (route) => route.fulfill({ json: [] }));
```

```ts
// the backend is thinking about its life choices
await page.route('**/api/products', async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await route.continue();
});
await page.goto('/menu');
await expect(page.getByText('Loading...')).toBeVisible();
```

Error states, empty states, loading spinners: the parts of the UI that get the least love and the most bugs. Now they get tests too. 💅

## Small lies instead of big ones

Sometimes I don't want to invent the whole response, just tweak one thing. `route.fetch()` gets the **real** response, and then I edit it:

```ts
await page.route('**/api/products', async (route) => {
  const response = await route.fetch();
  const products = await response.json();
  products[0].name = 'A'.repeat(300); // does the card layout survive?
  await route.fulfill({ response, json: products });
});
```

Real data, one tiny evil change. Perfect for checking how the layout handles absurdly long names (spoiler: it usually doesn't).

## Checking what the app sends

Mocking isn't only about responses. I can also check that the app sends the **right request**:

```ts
const orderRequest = page.waitForRequest('**/api/orders');
await page.getByRole('button', { name: 'Order' }).click();

const body = (await orderRequest).postDataJSON();
expect(body).toMatchObject({ pizzaId: 2, size: 'large' });
```

If someone breaks the payload, this test notices before the kitchen gets an order for "undefined, size null".

## Bonus: block the stuff you don't need

```ts
await page.route('**/*.{png,jpg,jpeg,webp}', (route) => route.abort());
```

Images, analytics, chat widgets: if they aren't what the test is about, block them. Faster tests and one less third party to blame for flakiness. (Related: [flaky tests have commitment issues](/posts/flaky-tests).)

## The one rule: don't mock what you're testing

Here's the trap. If I mock **everything**, I'm not testing the app anymore. I'm testing that my fake JSON matches my fake JSON. Congratulations, the lie is internally consistent. 🏆

My rule of thumb:

- **UI tests** with mocks: for edge cases, error states and anything that's hard to reproduce for real.
- **A few end-to-end tests** with the real backend: to prove the whole thing actually works together.
- **API tests** (Playwright's `request` fixture) for the backend itself, without the browser.

And if the mocks start to get big, `page.routeFromHAR()` can replay a recorded HAR file of real traffic, so the fake answers at least look like the real ones.

## TL;DR

- `page.route()` before `page.goto()`.
- `route.fulfill()` to answer, `route.fetch()` to tweak, `route.abort()` to block, `route.continue()` to let it pass.
- Mock the unhappy paths. That's where the bugs live.
- Never mock the thing you're actually testing.

Lying to your app is fine, as long as you never lie to yourself about what you tested. Very wise. I should put that on a mug. ☕

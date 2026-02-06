# Test Configuration for My Blog App

This project uses **Vitest** for unit testing with React Testing Library.

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- `lib/posts.test.ts` - Tests for post data fetching functions
- `components/Layout.test.tsx` - Tests for Layout component
- `components/Comments.test.tsx` - Tests for Comments component
- `src/app/page.test.tsx` - Tests for Home page
- `src/app/learning-journey/page.test.tsx` - Tests for Learning Journey page
- `src/app/posts/[id]/page.test.tsx` - Tests for Post detail page

## What's Tested

### Data Layer (`lib/posts.ts`)

- Fetching and sorting posts
- Handling missing files
- Filtering markdown files
- Converting markdown to HTML

### Components

- Layout rendering and navigation
- Comments integration
- Responsive styling

### Pages

- Home page post listing
- Learning Journey content
- Individual post rendering
- Error handling (404)

## Coverage

Run `npm run test:coverage` to see test coverage report.
Coverage reports are generated in the `coverage/` directory.

## Technologies

- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing utilities
- **jsdom** - Browser environment simulation
- **@testing-library/jest-dom** - Custom matchers for DOM testing

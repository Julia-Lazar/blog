---
title: "How I Built This Blog - Next.js, Markdown, and Animated Background"
date: "2025-12-08"
---

![Wooden Mask](/images/woodenmask.jpg)

Hello! Today I'd like to share how this blog you're reading came to life. It was a great project for learning Next.js, and along the way, I learned many interesting things about React, TypeScript, and integrating external code.

## Technology Stack

I decided on the following tech stack:

- **Next.js 14+** with App Router - modern React framework
- **TypeScript** - for type safety
- **Tailwind CSS** - rapid styling
- **Markdown** - simple format for writing posts
- **gray-matter** - parsing frontmatter in Markdown files

## Project Structure

The blog has a simple yet elegant structure:

```
my-app/
├── src/app/          # Application pages
├── components/       # React components
├── lib/             # Utility functions
├── posts/           # Posts in Markdown
└── public/images/   # Images
```

## Markdown Post System

One of the coolest things about this blog is that I write posts in pure Markdown! I created a simple system that:

1. Reads `.md` files from the `posts/` folder
2. Parses metadata (title, date) from frontmatter
3. Converts Markdown to HTML
4. Displays posts in a beautiful interface

Each post has a simple structure:

```markdown
---
title: "Post Title"
date: "2025-12-08"
---

Post content in Markdown...
```

## Adding Animated Background

The most exciting part of the project was adding the animated starry background! I found a beautiful effect on CodePen with moving stars and twinkling clouds.

### Animation Integration

The integration process looked like this:

1. **Adding CSS animations** - I created keyframes for background movement:

```css
@keyframes move-background {
  from {
    transform: translate3d(0px, 0px, 0px);
  }
  to {
    transform: translate3d(1000px, 0px, 0px);
  }
}
```

2. **Three background layers** - stars, twinkling points, and clouds:
   - `.stars` - static background with stars
   - `.twinkling` - animated layer of twinkling points (70s)
   - `.clouds` - slowly moving clouds (150s)

3. **Z-index optimization** - I ensured the background sits under the content but above the gradient

## Personalization - Deku and Jigglypuff

I wanted to add some personality to the blog, so I placed my favorite characters in the corners:

- **Deku (Wooden Mask)** in the bottom-left corner - with a gradient blend effect that makes it blend into the background
- **Jigglypuff** in the bottom-right corner - my favorite Pokemon!

I used Next.js `Image` component for optimization:

```tsx
<Image src="/images/deku.png" alt="Wooden Mask" width={200} height={200} />
```

## Layout Component

I created a reusable `Layout` component that wraps all pages and contains:

- Header with blog title
- Main content
- Footer
- Animated background
- Decorative images

Thanks to this, every page has a consistent look!

## Challenges and Solutions

### 1. Black Border Around the App

**Problem**: Default browser margins created a black border.  
**Solution**: Setting `margin: 0; padding: 0;` for `html` and `body`.

### 2. Blend Mode for Images

**Problem**: Deku's background didn't fit the color scheme.  
**Solution**: Using `mixBlendMode: 'multiply'` with a gradient.

### 3. Z-index Chaos

**Problem**: Elements were overlapping unpredictably.  
**Solution**: A well-thought-out z-index hierarchy:

- Background: z-index: 0-2
- Images: z-index: 10
- Content: z-index: 10 (relative)

## Gradient and Colors

I chose a pink-purple palette that looks delicate and professional:

```css
bg-gradient-to-br from-pink-100 via-purple-100 to-pink-50
```

All UI elements (buttons, headers, links) use the same palette for consistency.

## What's Next?

I'm planning to add:

- [ ] Post categories
- [ ] Search functionality
- [ ] Dark mode
- [ ] More animated elements
- [✅] Comment system
- [ ] RSS feed

## Summary

Building this blog was a fantastic learning experience! I learned:

- How to integrate external code (CodePen) into a Next.js project
- Working with Markdown files in React
- Creating CSS animations
- Managing complex layouts with position: fixed and z-index
- Optimizing images with Next.js Image

If you want to build a similar blog, I recommend starting with a simple version and gradually adding features. It's a great way to learn!

---

[**GitHub Repository**](https://github.com/Julia-Lazar/blog)

Do you have questions about technical details? Leave a comment! ✨

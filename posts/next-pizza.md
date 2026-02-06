---
title: "Building Next Pizza: My Journey with Next.js and React 🍕"
date: "2025-12-11"
---

---

![NextPizza App](/images/NexPizza.PNG)

**GitHub Repository**: [NextPizza](https://github.com/Julia-Lazar/NextPizza)
I have a full working demo od Next-Pizzaa app to display to you if needed.

I'm excited to share my latest project – **Next Pizza**, a pizza ordering web application that I've been working on. While it's still a work in progress, I wanted to document what I've built so far, but also be honest about my doubts, experiments, and learning process along the way.

## What is Next Pizza?

Next Pizza is a modern web application for browsing and ordering pizzas, sauces, and drinks. The app features:

- An interactive product catalog with detailed information
- A fully functional shopping cart system
- Smooth navigation between different product categories
- A clean, responsive interface with an orange-themed design

The project started as a relatively simple idea, but quickly turned into a playground for testing new tools, architectural decisions, and my own limits as a developer.

## Tech Stack

For this project, I chose to work with:

- **Next.js 14+** with the App Router
- **React** with functional components and hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Context API** for state management (shopping cart)
- **Storybook** for component development and documentation
- **Vitest** for unit testing
- **Git & GitHub** for version control

Some of these choices felt very natural, while others raised more questions than answers.

## Key Learnings & Reflections

Working on this project has been a valuable learning experience – not only technically, but also in terms of decision‑making.

### 1. State Management (Still a Struggle)

Managing global state is still something I actively wrestle with. Redux feels too complex for an application of this size, so I decided to stick with React's native **Context API**. While it works, I can feel its limitations and know that this is an area I need to deepen my understanding of.

### 2. Component Design

Creating reusable components like `CardTile` helped me better understand component composition and props. However, this also made me question how far to go with abstraction in a relatively small project.

### 3. Storybook – Useful or Overkill?

I added **Storybook** to the project, although I'm still not entirely sure if I truly need it here. The app doesn't have many components or visual variants, so I'm probably not using Storybook to its full potential.

Realistically, Storybook would shine much more in a larger, more ambitious project. And that led me to a new idea.

### 4. Future Idea: Recruitment App

I noticed that websites like _justjoin.it_ don't have a dedicated mobile app. That sparked an idea: building a recruitment app loosely inspired by their platform. This feels like a project where Storybook, design systems, and scalable component architecture would make much more sense.

### 5. Testing with Vitest & AI

I added unit tests across the entire application using **Vitest** – with some help from **GitHub Copilot**. To be completely honest: I roughly understand what I'm pasting in.

If I had to write these tests entirely from scratch, it would probably take me 3x longer. For now, I consciously use AI as a learning accelerator rather than pretending I don't. My goal is to gradually move from "assisted understanding" to real confidence.

### 6. UI/UX Details

Small UX decisions, like auto‑opening the cart when a product is added, showed me how impactful tiny details can be for the overall user experience.

### 7. Styling with Tailwind

Tailwind CSS continues to be my go‑to tool for fast iteration. It allows me to move quickly while keeping the UI consistent and readable.

## Work in Progress

Next Pizza is still evolving. Features I'm planning to add include:

- [x] Backend integration for real order processing
- [x] User authentication
- [ ] Order history
- [ ] Payment integration
- [ ] More product customization options

---

Building **Next Pizza** has been less about creating a perfect app and more about learning through experimentation, uncertainty, and iteration. This project reflects where I am right now as a developer – curious, sometimes unsure, but consistently moving forward.

**GitHub Repository**: [NextPizza](https://github.com/juliadmytrenko/NextPizza)

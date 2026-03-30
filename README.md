# 📝 Blog

A minimalist blog built with **Next.js** and **TypeScript**, focused on clean content rendering, readability, and good developer experience.

Posts are written in Markdown and rendered statically, with support for reading time estimation, comments, and a simple layout structure.

---

## ✨ Features

- ⚡ Built with **Next.js (App Router)**
- 🧠 Written in **TypeScript**
- 📰 Blog posts written in **Markdown**
- ⏱️ Automatic reading time calculation
- 💬 Comments component
- 🧩 Reusable layout and UI components
- 🧪 Component tests included
- 🎨 Styled with PostCSS

---

## 🛠 Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Markdown**
- **PostCSS**
- **Jest / Testing Library** (for component tests)

---

## 📂 Project Structure

```
.
├── src/app/ # Next.js app router pages
├── components/ # Reusable UI components
├── lib/ # Helpers (posts, reading time, etc.)
├── posts/ # Markdown blog posts
├── public/ # Static assets
├── TESTING.md # Testing documentation
└── README.md
```

---

## 🚀 Getting Started

Install dependencies:

```bash
npm install

npm run dev

```

### Open your browser at:

http://localhost:3000

## Giscus comments

The blog comments widget is powered by Giscus and can be configured with
public runtime variables:

```bash
NEXT_PUBLIC_GISCUS_REPO=Julia-Lazar/blog
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDORGyF4w
NEXT_PUBLIC_GISCUS_CATEGORY=General
# NEXT_PUBLIC_GISCUS_CATEGORY_ID=
NEXT_PUBLIC_GISCUS_MAPPING=pathname
NEXT_PUBLIC_GISCUS_THEME=preferred_color_scheme
NEXT_PUBLIC_GISCUS_LANG=pl
```

You can copy the values from `.env.example` and override them in `.env.local`
if the GitHub Discussions setup changes.

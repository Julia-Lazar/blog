# 📝 Blog

A minimalist, Markdown-first blog built with **Next.js** and **TypeScript**. It focuses on clean content rendering, readability, and a smooth developer experience.

Posts live in `posts/`, render statically, and include reading-time estimation plus a lightweight comments component. UI is composed from reusable components and styled with PostCSS.

---

## ✨ Features

- ⚡ **Next.js App Router** foundation
- 🧠 **TypeScript** throughout
- 📰 **Markdown** content pipeline
- ⏱️ **Automatic reading-time** calculation
- 💬 **Comments** component
- 🧩 **Reusable layouts & UI components**
- 🧪 **Component tests**
- 🎨 **PostCSS** styling

---

## 🛠 Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Markdown**
- **PostCSS**
- **Vitest / Testing Library**

---

## 📂 Project Structure

```
.
├── src/app/           # Next.js app router pages
├── components/        # Reusable UI components
├── lib/               # Helpers (posts, reading time, etc.)
├── posts/             # Markdown blog posts
├── public/            # Static assets
├── TESTING.md         # Testing documentation
└── README.md
```

---

## 🚀 Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open your browser at:

```
http://localhost:3000
```

---

## 🧪 Testing

See [TESTING.md](./TESTING.md) for the available test commands and expectations.

---

## 📦 Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

---

## 📄 License

This project is provided as-is for learning and customization.

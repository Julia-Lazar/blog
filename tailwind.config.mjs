/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // all app folder files
    "./components/**/*.{js,ts,jsx,tsx}", // all components
    "./app/styles/**/*.{css}", // include your markdown-styles.css
    "./app/styles/*.{css}", // include your markdown-styles.css
    // stop here
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // all app folder files
    "./components/**/*.{js,ts,jsx,tsx}", // all components
    "./src/app/styles/**/*.{css}", // include your markdown-styles.css
    "./src/app/styles/*.{css}", // include your markdown-styles.css
  ],
  theme: {
    extend: {
      colors: {
        // optional: define custom colors for your markdown
        pinkCustom: "#F472B6",
        neutralDark: "#111827",
        neutralLight: "#F9FAFB",
      },
    },
  },
  plugins: [
    // optional: typography plugin if you want prose classes
    require("@tailwindcss/typography"),
  ],
};

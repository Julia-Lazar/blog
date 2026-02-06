---
title: "NextPizza Update #2: Storybook, Unit Tests, and more 🍕"
date: "2026-01-29"
---

[**GitHub Repository**](https://github.com/Julia-Lazar/NextPizza)

## Backend integration, API, form validation, and more!

Hello!
At first, the application wasn’t displaying any data — there was no connection to the database, and the API returned nothing. After some investigation, I realized the issue wasn’t in the code itself but in the database state. Once I started the database server via MySQL Workbench, the API immediately began working as expected and the products loaded correctly.

This was a good reminder that MySQL Workbench effectively “wakes up” the local database server, allowing connections on localhost:3306. A small fix, but an important lesson in understanding the full development environment.

### What I learned during this project

- How to write a backend that isn’t that simple. The Prisma ORM helped me a lot with this. To be honest, I’m still learning Prisma, but I already have the basics behind me.

- I learned that hosting a database in the cloud is insanely expensive (at least for my student budget), so I’m using a local database on my own computer.

- I learned how to validate forms on the frontend as well as incoming data on the backend 🙂

- I configured Rapidoc, a tool for generating interactive API documentation that lets you easily view, understand, and test API endpoints directly in the browser.

- I fixed a whole bunch of small bugs and a few bigger ones.

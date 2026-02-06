import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

// Create fake posts data for testing
vi.mock("@/../lib/posts", () => ({
  getSortedPostsData: vi.fn(() => [
    { id: "first-post", title: "My First Post", date: "2024-01-15" },
    { id: "second-post", title: "My Second Post", date: "2024-01-10" },
  ]),
}));

// Replace Layout with a simple div for testing
vi.mock("@/../components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Replace Next.js Link with a simple anchor
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("Home Page", () => {
  it("shows the page title", () => {
    render(<Home />);

    // Check if "Latest Posts" appears
    expect(screen.getByText("Latest Posts")).toBeInTheDocument();
  });

  it("shows all posts", () => {
    render(<Home />);

    // Check if both post titles appear
    expect(screen.getByText("My First Post")).toBeInTheDocument();
    expect(screen.getByText("My Second Post")).toBeInTheDocument();
  });

  it("creates correct links to posts", () => {
    render(<Home />);

    // Find the link for first post
    const firstPostLink = screen.getByText("My First Post").closest("a");

    // Check if the link goes to the correct URL
    expect(firstPostLink).toHaveAttribute("href", "/posts/first-post");
  });
});

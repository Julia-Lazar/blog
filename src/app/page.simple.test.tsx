import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Home from "./page";

// Create fake posts data for testing
vi.mock("@/../lib/posts", () => ({
  getSortedPostsData: vi.fn(() => [
    {
      id: "first-post",
      title: "My First Post",
      date: "2024-01-15",
      readTime: "2 min read",
      readTimeMinutes: 2,
    },
    {
      id: "second-post",
      title: "My Second Post",
      date: "2024-01-10",
      readTime: "8 min read",
      readTimeMinutes: 8,
    },
    {
      id: "boredom",
      title: "Boredom",
      date: "2024-01-08",
      readTime: "4 min read",
      readTimeMinutes: 4,
    },
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
  it("shows sorting and filtering options", () => {
    render(<Home />);

    expect(screen.getByText("Browse the notebook your way")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Newest First" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Longest Read" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Featured Notes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Notebook Entries" }),
    ).toBeInTheDocument();
  });

  it("shows all posts", () => {
    render(<Home />);

    // Check if both post titles appear
    expect(screen.getByText("My First Post")).toBeInTheDocument();
    expect(screen.getByText("My Second Post")).toBeInTheDocument();
    expect(
      screen.getByText("How to deal with a little boredom and lack of motivation?"),
    ).toBeInTheDocument();
  });

  it("creates correct links to posts", () => {
    render(<Home />);

    // Find the link for first post
    const firstPostLink = screen.getByText("My First Post").closest("a");

    // Check if the link goes to the correct URL
    expect(firstPostLink).toHaveAttribute("href", "/posts/first-post");
  });

  it("sorts posts by reading time", () => {
    render(<Home />);

    const getPostLinks = () =>
      screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href")?.startsWith("/posts/"));

    expect(getPostLinks()[0]).toHaveAttribute("href", "/posts/first-post");

    fireEvent.click(screen.getByRole("button", { name: "Longest Read" }));

    expect(getPostLinks()[0]).toHaveAttribute("href", "/posts/second-post");
  });

  it("filters posts by entry type", () => {
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Notebook Entries" }));

    expect(screen.getByText("My Second Post")).toBeInTheDocument();
    expect(screen.queryByText("My First Post")).not.toBeInTheDocument();
    expect(
      screen.queryByText("How to deal with a little boredom and lack of motivation?"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Featured Notes" }));

    expect(screen.getByText("My First Post")).toBeInTheDocument();
    expect(
      screen.getByText("How to deal with a little boredom and lack of motivation?"),
    ).toBeInTheDocument();
    expect(screen.queryByText("My Second Post")).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Post, { generateStaticParams } from "./page";
import { notFound } from "next/navigation";

// Create fake post data for testing
vi.mock("../../../../lib/posts", () => ({
  getPostData: vi.fn(),
  getSortedPostsData: vi.fn(() => [
    { id: "post-1", title: "Post 1", date: "2024-01-01" },
    { id: "post-2", title: "Post 2", date: "2024-01-02" },
  ]),
}));

// Replace components with simple versions
vi.mock("../../../../components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("../../../../components/Comments", () => ({
  default: () => <div data-testid="comments">Comments Section</div>,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// Get the mock function so we can control what it returns
const mockGetPostData = vi.mocked(
  await import("../../../../lib/posts")
).getPostData;

describe("Post Page", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it("generates params for all posts", () => {
    // This function should return IDs of all posts
    const params = generateStaticParams();

    expect(params).toEqual([{ id: "post-1" }, { id: "post-2" }]);
  });

  it("shows post title and content", async () => {
    // Create fake post data
    mockGetPostData.mockResolvedValue({
      id: "test-post",
      title: "My Amazing Post",
      date: "2024-01-15",
      contentHtml: "<p>Post content here</p>",
    });

    // Render the post page
    const Component = await Post({
      params: Promise.resolve({ id: "test-post" }),
    });

    render(Component as React.ReactElement);

    // Check if title appears
    expect(screen.getByText("My Amazing Post")).toBeInTheDocument();
  });

  it("shows back button to home", async () => {
    mockGetPostData.mockResolvedValue({
      id: "test",
      title: "Test",
      date: "2024-01-01",
      contentHtml: "<p>Content</p>",
    });

    const Component = await Post({
      params: Promise.resolve({ id: "test" }),
    });

    render(Component as React.ReactElement);

    // Find the back link
    const backLink = screen.getByText(/Powrót/i).closest("a");

    // Check if it goes to home page
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("shows comments section", async () => {
    mockGetPostData.mockResolvedValue({
      id: "test",
      title: "Test",
      date: "2024-01-01",
      contentHtml: "<p>Content</p>",
    });

    const Component = await Post({
      params: Promise.resolve({ id: "test" }),
    });

    render(Component as React.ReactElement);

    // Check if comments appear
    expect(screen.getByTestId("comments")).toBeInTheDocument();
  });

  it("shows 404 when post does not exist", async () => {
    // Mock that post doesn't exist
    mockGetPostData.mockResolvedValue(null as any);

    await Post({
      params: Promise.resolve({ id: "missing" }),
    });

    // Check if notFound was called
    expect(notFound).toHaveBeenCalled();
  });
});

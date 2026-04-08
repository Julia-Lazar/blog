import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "./Layout";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("Layout Component", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("shows children content", () => {
    render(
      <Layout>
        <div>My Test Content</div>
      </Layout>,
    );

    expect(screen.getByText("My Test Content")).toBeInTheDocument();
  });

  it("shows the full header on the home page", () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    expect(
      screen.getByText(/Julia Lazar's miscellaneous blog/i),
    ).toBeInTheDocument();
  });

  it("shows the compact navigation on inner pages", () => {
    mockUsePathname.mockReturnValue("/learning-journey");

    render(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    expect(
      screen.queryByText(/Julia Lazar's miscellaneous blog/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Posts")).toBeInTheDocument();
    expect(screen.getByText("Learning Journey")).toBeInTheDocument();
    expect(screen.getByText("Tech Stack")).toBeInTheDocument();
  });

  it("shows footer with current year", () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    const currentYear = new Date().getFullYear();

    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`Copyright ${currentYear} Julia Lazar`, "i")),
    ).toBeInTheDocument();
  });
});

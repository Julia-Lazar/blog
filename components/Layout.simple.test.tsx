import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "./Layout";

describe("Layout Component", () => {
  it("shows children content", () => {
    render(
      <Layout>
        <div>My Test Content</div>
      </Layout>,
    );

    expect(screen.getByText("My Test Content")).toBeInTheDocument();
  });

  it("shows blog title", () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    expect(screen.getByText(/Julia's Tech Blog/i)).toBeInTheDocument();
  });

  it("shows navigation menu", () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Learning Journey")).toBeInTheDocument();
  });

  it("shows footer with current year", () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
    );

    const currentYear = new Date().getFullYear();

    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
    expect(screen.getByText(/Julia Lazar/i)).toBeInTheDocument();
  });
});

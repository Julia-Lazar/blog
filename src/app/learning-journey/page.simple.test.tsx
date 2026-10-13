import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LearningJourney from "./page";

// Replace Layout with a simple div
vi.mock("@/../components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("Learning Journey Page", () => {
  it("shows the main title", () => {
    render(<LearningJourney />);

    // Check if the page title is present
    expect(screen.getByText("My Learning Journey")).toBeInTheDocument();
  });

  it("shows all technologies", () => {
    render(<LearningJourney />);

    expect(
      screen.getByText("The stack I use the most in test automation"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Stuff I've worked with related to testing software"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The stack I use the most in frontend"),
    ).toBeInTheDocument();
    expect(screen.getByText("Playwright")).toBeInTheDocument();
    expect(screen.getByText("Cucumber")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getAllByText("TypeScript")).toHaveLength(2);
  });

  it("shows learning timeline", () => {
    render(<LearningJourney />);

    // every stop shows its year and title, the internship is the current one
    expect(screen.getByText("~2014")).toBeInTheDocument();
    expect(screen.getByText("First Steps")).toBeInTheDocument();
    expect(screen.getByText("Computer Science Studies")).toBeInTheDocument();
    expect(screen.getByText("Clean Code Principles")).toBeInTheDocument();
    expect(
      screen.getByText("9-Month Software Testing Internship"),
    ).toBeInTheDocument();
    expect(screen.getByText("Now playing")).toBeInTheDocument();
    expect(
      screen.queryByText(/Advanced Web Development/i),
    ).not.toBeInTheDocument();
  });

  it("lists what I'm learning now, testing first", () => {
    render(<LearningJourney />);

    expect(screen.getByText(/CI\/CD: pipelines/)).toBeInTheDocument();
    expect(screen.getByText(/Advanced testing techniques/)).toBeInTheDocument();
    expect(screen.getByText(/do with AI/)).toBeInTheDocument();
  });

  it("no longer has the About Me section", () => {
    render(<LearningJourney />);

    expect(screen.queryByText("About Me")).not.toBeInTheDocument();
  });
});

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

  it("shows About Me section", () => {
    render(<LearningJourney />);

    // Check for section heading and some content
    expect(screen.getByText("About Me")).toBeInTheDocument();
    expect(screen.getByText(/passionate developer/i)).toBeInTheDocument();
  });

  it("shows all technologies", () => {
    render(<LearningJourney />);

    expect(screen.getByText("My Core Tech Stack")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("shows learning timeline", () => {
    render(<LearningJourney />);

    // Check for timeline entries
    expect(screen.getByText(/2024 - Present/i)).toBeInTheDocument();
    expect(
      screen.getByText(/2018: Computer Science Studies/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/~2014: First Steps/i)).toBeInTheDocument();
  });

  it("mentions hobbies", () => {
    render(<LearningJourney />);

    // Check if hobbies are mentioned
    expect(screen.getByText(/video games/i)).toBeInTheDocument();
    expect(screen.getByText(/tennis/i)).toBeInTheDocument();
  });
});

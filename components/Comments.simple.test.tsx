import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import Comments from "./Comments";

vi.mock("@giscus/react", () => ({
  default: ({ id }: { id: string }) => (
    <div id={id} data-testid="giscus-mock" />
  ),
}));

describe("Comments Component", () => {
  it("renders without crashing", () => {
    const { container } = render(<Comments />);

    expect(container.querySelector(".mt-8")).toBeInTheDocument();
  });

  it("renders Giscus component", () => {
    const { container } = render(<Comments />);

    expect(container.querySelector("#comments")).toBeInTheDocument();
  });
});

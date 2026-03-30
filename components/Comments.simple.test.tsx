import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import Comments from "./Comments";

vi.mock("@giscus/react", () => ({
  default: (props: Record<string, string | undefined>) => (
    <div
      id={props.id}
      data-testid="giscus-mock"
      data-props={JSON.stringify(props)}
    />
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

  it("uses the current blog repository defaults", () => {
    const { getByTestId } = render(<Comments />);
    const props = JSON.parse(
      getByTestId("giscus-mock").getAttribute("data-props") ?? "{}",
    );

    expect(props.repo).toBe("Julia-Lazar/blog");
    expect(props.repoId).toBe("R_kgDORGyF4w");
    expect(props.category).toBe("General");
    expect(props.categoryId).toBeUndefined();
    expect(props.theme).toBe("preferred_color_scheme");
  });
});

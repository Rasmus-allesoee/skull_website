import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home vertical slice", () => {
  it("introduces the museum and labels the current phase", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "A visual archive of animal skulls.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Phase 2 · Vertical slice")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View the raccoon dog exhibit" }),
    ).toHaveAttribute("href", "/species/raccoon-dog");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Built as an exhibit and a reference.",
      }),
    ).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home foundation", () => {
  it("introduces the museum and labels the current phase", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "A visual archive of animal skulls.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Foundation · Phase 0/1")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Built as an exhibit and a reference.",
      }),
    ).toBeInTheDocument();
  });
});

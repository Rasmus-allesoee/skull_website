import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("museum home", () => {
  it("introduces the real collection and exposes catalog and taxonomy entry points", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "A visual archive of animal skulls.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explore the collection" }),
    ).toHaveAttribute("href", "/species");
    expect(
      screen
        .getAllByRole("link", { name: /Mammalia/i })
        .some(
          (link) => link.getAttribute("href") === "/taxonomy/class/mammals",
        ),
    ).toBe(true);
    expect(screen.getByText("13", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("18", { selector: "strong" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Follow class, order, and family.",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Featured specimen")).not.toBeInTheDocument();
  });
});

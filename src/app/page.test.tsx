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
    expect(screen.getByRole("link", { name: /Mammalia/i })).toHaveAttribute(
      "href",
      "/taxonomy/class/mammals",
    );
    expect(screen.getAllByText("1", { selector: "strong" })).toHaveLength(3);
    expect(
      screen.getByRole("heading", { name: "Raccoon dog", level: 2 }),
    ).toBeInTheDocument();
  });
});

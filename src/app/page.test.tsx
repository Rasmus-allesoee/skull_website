import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("museum home", () => {
  it("renders the static museum entrance, canonical counts, and destination hub", () => {
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

    const summary = screen.getByRole("region", {
      name: "Collection summary",
    });
    expect(within(summary).getByText("13")).toBeInTheDocument();
    expect(within(summary).getByText("18")).toBeInTheDocument();
    expect(within(summary).getByText("Published species")).toBeInTheDocument();
    expect(within(summary).getByText("Represented genera")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Explore the Species catalog" }),
    ).toHaveAttribute("href", "/species");
    expect(
      screen.getByRole("link", { name: "Open the collection map" }),
    ).toHaveAttribute("href", "/map");
    expect(
      screen.getByRole("link", { name: "Open the measurement reference" }),
    ).toHaveAttribute("href", "/methodology");
    expect(
      screen.getByRole("link", {
        name: "Open the skull preparation guide outline",
      }),
    ).toHaveAttribute("href", "/guides/skull-preparation");

    expect(
      screen.getByRole("heading", { name: "Skull Comparison" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Skull Comparison/i }),
    ).toBeNull();
  });

  it("server-renders six exact specimen links and removes the retired Home sections", () => {
    render(<Home />);

    const specimenLinks = screen.getAllByRole("link", {
      name: /^View .+, .+, specimen SPEC-/,
    });
    expect(specimenLinks).toHaveLength(6);
    for (const link of specimenLinks) {
      expect(link.getAttribute("href")).toMatch(
        /^\/species\/[a-z0-9-]+\/specimens\/SPEC-\d{4}$/,
      );
    }

    expect(screen.queryByText("Find a skull")).toBeNull();
    expect(screen.queryByText("Browse by class")).toBeNull();
    expect(screen.queryByText("Collection tree")).toBeNull();
    expect(screen.queryByText("Behind the collection")).toBeNull();
  });
});

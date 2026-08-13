import React from "react";

import axe from "axe-core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { getExhibit } from "@/data/collection";

import { Gallery } from "./Gallery";
import { MeasurementPanel } from "./MeasurementPanel";
import { PreparationTimeline } from "./PreparationTimeline";
import { SpecimenSelector } from "./SpecimenSelector";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const imageProps = { ...props };
    delete imageProps.priority;
    return React.createElement("img", imageProps);
  },
}));

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    },
  });
});

describe("exhibit components", () => {
  const exhibit = getExhibit("raccoon-dog")!;

  it("changes gallery view by buttons and arrow keys, then restores focus after zoom", async () => {
    const user = userEvent.setup();
    render(<Gallery assets={exhibit.media} commonName="Raccoon dog" />);

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/2 \/ 6 · Oblique/)).toBeInTheDocument();

    const gallery = screen.getByLabelText(/Use left and right arrow keys/i);
    gallery.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText(/3 \/ 6 · Frontal/)).toBeInTheDocument();

    const inspectButton = screen.getByRole("button", {
      name: "Inspect full view",
    });
    await user.click(inspectButton);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");
    await user.click(within(dialog).getByRole("button", { name: /zoom in/i }));
    expect(within(dialog).getByText("125%")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /close/i }));
    expect(inspectButton).toHaveFocus();
  });

  it("shows an explicit incomplete-media state", () => {
    render(
      <Gallery assets={exhibit.media.slice(0, 2)} commonName="Raccoon dog" />,
    );
    expect(
      screen.getByText(
        "Incomplete media set: 2 of 6 canonical views are available.",
      ),
    ).toBeInTheDocument();
  });

  it("marks the selected/default specimen and preserves missing measurement semantics", async () => {
    const user = userEvent.setup();
    render(
      <main>
        <SpecimenSelector
          taxon={exhibit.taxon}
          specimens={exhibit.specimens}
          selectedSpecimenId={exhibit.specimen.specimenId}
        />
        <MeasurementPanel specimen={exhibit.specimen} />
        <PreparationTimeline specimen={exhibit.specimen} />
      </main>,
    );

    expect(screen.getByRole("link", { name: /SPEC-0001/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await user.click(screen.getByText("Show additional recorded measurements"));
    expect(
      screen.getByText("Animal body mass").nextElementSibling,
    ).toHaveTextContent("Not recorded");
    expect(
      screen
        .getByRole("heading", { name: "From specimen to exhibit" })
        .closest("section"),
    ).toHaveTextContent("DefleshingMacerationDuration · Not recorded");
  });

  it("has no detectable axe violations in the interactive component group", async () => {
    const { container } = render(
      <main>
        <h1>Raccoon dog exhibit test</h1>
        <Gallery assets={exhibit.media} commonName="Raccoon dog" />
        <SpecimenSelector
          taxon={exhibit.taxon}
          specimens={exhibit.specimens}
          selectedSpecimenId={exhibit.specimen.specimenId}
        />
        <MeasurementPanel specimen={exhibit.specimen} />
        <PreparationTimeline specimen={exhibit.specimen} />
      </main>,
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

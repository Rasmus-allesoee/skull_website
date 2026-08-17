import React from "react";

import axe from "axe-core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { getExhibit } from "@/data/collection";
import { getEligibleSkullComparisons } from "@/data/comparison";
import { ScaleComparison } from "@/features/comparison/ScaleComparison";

import { CollectionRecord } from "./CollectionRecord";
import { Gallery } from "./Gallery";
import { MeasurementPanel } from "./MeasurementPanel";
import { PreparationTimeline } from "./PreparationTimeline";
import { SpecimenSelector } from "./SpecimenSelector";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const imageProps = { ...props };
    delete imageProps.priority;
    delete imageProps.quality;
    delete imageProps.unoptimized;
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
  const comparisonRecords = getEligibleSkullComparisons();
  const comparisonPrimary = comparisonRecords.find(
    (record) => record.specimenId === exhibit.specimen.specimenId,
  )!;
  const comparisonOptions = comparisonRecords.filter(
    (record) => record.id !== comparisonPrimary.id,
  );
  const defaultComparisonId = comparisonOptions.find(
    (record) => record.isDefault,
  )!.id;

  it("changes gallery view by buttons and arrow keys, then restores focus after zoom", async () => {
    const user = userEvent.setup();
    render(<Gallery assets={exhibit.media} commonName="Raccoon dog" />);

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/2 \/ 6 · Oblique/)).toBeInTheDocument();

    const gallery = screen.getByLabelText(/Use left and right arrow keys/i);
    gallery.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText(/3 \/ 6 · Frontal/)).toBeInTheDocument();

    const inspectButton = screen.getByRole("button", { name: "Inspect image" });
    await user.click(inspectButton);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");
    await user.click(within(dialog).getByRole("button", { name: /zoom in/i }));
    expect(within(dialog).getByText("150%")).toBeInTheDocument();
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
        <MeasurementPanel
          specimen={exhibit.specimen}
          comparisonPrimary={comparisonPrimary}
          comparisonOptions={comparisonOptions}
          defaultComparisonId={defaultComparisonId}
        />
        <CollectionRecord specimen={exhibit.specimen} />
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
        .getByRole("heading", { name: "Skull preparation" })
        .closest("section"),
    ).toHaveTextContent("DefleshingMacerationDuration · Not recorded");
    expect(screen.getByText("Owner").nextElementSibling).toHaveTextContent(
      "Rasmus",
    );
    expect(
      screen.getByText("Condition", { selector: "dt" }).nextElementSibling,
    ).toHaveTextContent("Good");

    await user.click(
      screen.getByRole("button", { name: "How age is estimated" }),
    );
    const ageDialog = screen.getByRole("dialog", { name: "Age-class guide" });
    expect(ageDialog).toHaveAttribute("open");
    expect(within(ageDialog).getByText("Old adult")).toBeInTheDocument();
    await user.click(within(ageDialog).getByRole("button", { name: /close/i }));

    await user.click(screen.getByText("Show additional recorded data"));
    expect(screen.getByText("Pathology").nextElementSibling).toHaveTextContent(
      "Not recorded",
    );
    expect(screen.getByText("Skeleton").nextElementSibling).toHaveTextContent(
      "Not recorded",
    );
  });

  it("renders alpha-bounded physical scale and updates the pair from the searchable selector", async () => {
    const user = userEvent.setup();
    const human = comparisonOptions[0]!;
    const redFox = {
      ...comparisonPrimary,
      id: "specimen:SPEC-0014",
      label: "Red fox",
      scientificName: "Vulpes vulpes",
      specimenId: "SPEC-0014",
      aliases: ["Rød ræv"],
      measurements: {
        ...comparisonPrimary.measurements,
        skullLength: {
          status: "measured" as const,
          value: 142,
          unit: "mm" as const,
        },
        skullWidth: {
          status: "measured" as const,
          value: 72,
          unit: "mm" as const,
        },
      },
    };
    render(
      <ScaleComparison
        primary={comparisonPrimary}
        options={[human, redFox]}
        defaultComparisonId={human.id}
      />,
    );

    expect(
      screen.queryByText(
        "Visible lateral skulls share one physical scale; transparent margins do not affect their size.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Representative adult-human reference; dimensions and mass are approximate and are not a universal human average.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Approximate source values make the resulting difference approximate.",
      ),
    ).toBeInTheDocument();

    const primarySubject = document.querySelector<HTMLElement>(
      '[data-comparison-id="specimen:SPEC-0001"]',
    )!;
    const humanSubject = document.querySelector<HTMLElement>(
      '[data-comparison-id="reference:adult-human-skull"]',
    )!;
    expect(
      Number.parseFloat(
        primarySubject.style.getPropertyValue("--relative-length"),
      ) /
        Number.parseFloat(
          humanSubject.style.getPropertyValue("--relative-length"),
        ),
    ).toBeCloseTo(116 / 182, 8);
    expect(screen.getByText("~66 mm shorter")).toBeInTheDocument();
    expect(screen.getByText("(0.64×)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Compare" }));
    const combobox = screen.getByRole("combobox", { name: "Search skulls" });
    await user.type(combobox, "vulpes");
    await user.keyboard("{Enter}");
    expect(
      document.querySelector('[data-comparison-id="specimen:SPEC-0014"]'),
    ).toBeInTheDocument();
    expect(screen.getByText("26 mm shorter")).toBeInTheDocument();
    expect(screen.getByText("(0.82×)")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Representative adult-human reference; dimensions and mass are approximate and are not a universal human average.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Approximate source values make the resulting difference approximate.",
      ),
    ).not.toBeInTheDocument();
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
        <MeasurementPanel
          specimen={exhibit.specimen}
          comparisonPrimary={comparisonPrimary}
          comparisonOptions={comparisonOptions}
          defaultComparisonId={defaultComparisonId}
        />
        <CollectionRecord specimen={exhibit.specimen} />
        <PreparationTimeline specimen={exhibit.specimen} />
      </main>,
    );
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

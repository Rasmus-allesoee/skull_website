import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { getEligibleSkullComparisons } from "@/data/comparison";
import { ComparisonWorkbench } from "@/features/comparison/ComparisonWorkbench";

import "./compare.css";

export const metadata = createPageMetadata({
  title: "Compare skulls",
  description:
    "Arrange calibrated skull photographs at one shared physical scale and compare recorded measurements across collection specimens.",
  path: "/compare",
});

export default function CompareSkullsPage() {
  return (
    <MuseumShell
      activePath="/compare"
      footerContext="Skull comparison · Calibrated relative scale"
      mainClassName="compare-page"
    >
      <ComparisonWorkbench records={getEligibleSkullComparisons()} />
    </MuseumShell>
  );
}

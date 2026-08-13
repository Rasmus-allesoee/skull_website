import Link from "next/link";

import type { SpecimenRecord, TaxonRecord } from "@/domain/content/types";

export function SpecimenSelector({
  taxon,
  specimens,
  selectedSpecimenId,
}: {
  taxon: TaxonRecord;
  specimens: SpecimenRecord[];
  selectedSpecimenId: string;
}) {
  return (
    <nav className="specimen-selector" aria-label="Specimen selector">
      <div>
        <p className="section-kicker">Physical specimen</p>
        <p>
          {specimens.length} published{" "}
          {specimens.length === 1 ? "skull" : "skulls"}
        </p>
      </div>
      <ul>
        {specimens.map((specimen) => {
          const isSelected = specimen.specimenId === selectedSpecimenId;
          return (
            <li key={specimen.specimenId}>
              <Link
                href={`/species/${taxon.slug}/specimens/${specimen.specimenId}`}
                aria-current={isSelected ? "page" : undefined}
              >
                <span>{specimen.specimenId}</span>
                <small>
                  {specimen.specimenId === taxon.defaultSpecimenId
                    ? "Default exhibit"
                    : "Specimen"}
                  {isSelected ? " · Selected" : ""}
                </small>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

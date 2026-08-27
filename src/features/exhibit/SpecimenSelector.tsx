import Link from "next/link";

import type { SpecimenRecord, TaxonRecord } from "@/domain/content/types";

export function SpecimenSelector({
  taxon,
  specimens,
  selectedSpecimenId,
  exactSpecimen = false,
}: {
  taxon: TaxonRecord;
  specimens: SpecimenRecord[];
  selectedSpecimenId: string;
  exactSpecimen?: boolean;
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
                scroll={false}
                aria-current={isSelected && exactSpecimen ? "page" : undefined}
              >
                <span>{specimen.specimenId}</span>
                <small>
                  {specimen.specimenId === taxon.defaultSpecimenId
                    ? "Default display"
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

import type { TaxonRecord } from "@/domain/content/types";

export function ScientificIdentification({ taxon }: { taxon: TaxonRecord }) {
  return (
    <>
      <i>{taxon.scientificName}</i>
      {taxon.identificationQualifier === "sp" ? " sp." : null}
    </>
  );
}

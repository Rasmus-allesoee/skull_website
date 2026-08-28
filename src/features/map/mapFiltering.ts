import type { CatalogModel } from "@/domain/catalog/queries";
import type { MapProjectionArtifact, MapRecord } from "@/domain/map/types";
import type { CatalogSearchDocument } from "@/domain/search/documents";
import { filterCatalog } from "@/features/catalog/catalogFiltering";

import type { MapState } from "./mapState";

export interface FilteredMapRecords {
  records: MapRecord[];
  mapped: MapRecord[];
  notMapped: MapRecord[];
}

export function filterMapRecords(
  catalog: CatalogModel,
  projection: MapProjectionArtifact,
  state: MapState,
  searchDocuments: CatalogSearchDocument[] | null,
): FilteredMapRecords {
  const allowedSpecimenIds = new Set(
    filterCatalog(catalog, state, searchDocuments).specimens.map(
      ({ specimen }) => specimen.specimenId,
    ),
  );
  const records = projection.records.filter((record) =>
    allowedSpecimenIds.has(record.specimenId),
  );
  const mapped = records.filter(
    (record) =>
      record.latitude !== null &&
      record.longitude !== null &&
      record.coordinatePrecision !== "unknown",
  );
  const notMapped = records.filter((record) => !mapped.includes(record));
  return { records, mapped, notMapped };
}

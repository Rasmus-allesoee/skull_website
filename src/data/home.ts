import { readFileSync } from "node:fs";
import path from "node:path";

import { getCatalog, getGeographicSpecimens } from "@/data/catalog";
import { getEligibleSkullComparisons } from "@/data/comparison";
import { getMeasurementReference } from "@/data/measurements";
import type { MediaAsset } from "@/domain/content/types";
import type { HomeMediaManifest } from "@/domain/home/types";

export interface HomeSpecimenCandidate {
  specimenId: string;
  commonName: string;
  scientificName: string;
  href: string;
  image: MediaAsset;
}

export interface HomeSpecimenState {
  id: string;
  specimens: HomeSpecimenCandidate[];
}

export function getHomePageModel() {
  const catalog = getCatalog();
  const geographicSpecimens = getGeographicSpecimens();
  const measurementReference = getMeasurementReference();
  const comparisons = getEligibleSkullComparisons();
  const homeMedia = getHomeMedia();
  const heroCandidates = catalog.specimens.flatMap((record) =>
    record.image
      ? [
          {
            specimenId: record.specimen.specimenId,
            commonName:
              record.taxon.names.english ?? record.taxon.scientificName,
            scientificName: record.taxon.scientificName,
            href: record.href,
            image: record.image,
          },
        ]
      : [],
  );

  return {
    catalog,
    geographicSpecimens,
    measurementReference,
    comparisons,
    homeMedia,
    heroStates: distributeHeroCandidates(heroCandidates),
  };
}

export function distributeHeroCandidates(
  candidates: HomeSpecimenCandidate[],
  requestedStateCount = 3,
): HomeSpecimenState[] {
  if (candidates.length === 0) return [];
  const stateCount = Math.max(
    1,
    Math.min(requestedStateCount, Math.ceil(candidates.length / 4)),
  );
  const states = Array.from({ length: stateCount }, (_, index) => ({
    id: `arrangement-${index + 1}`,
    specimens: [] as HomeSpecimenCandidate[],
  }));

  candidates
    .slice()
    .sort((first, second) =>
      first.specimenId.localeCompare(second.specimenId, "en", {
        numeric: true,
      }),
    )
    .forEach((candidate, index) => {
      states[index % stateCount]!.specimens.push(candidate);
    });

  return states;
}

function getHomeMedia(): HomeMediaManifest {
  return JSON.parse(
    readFileSync(
      path.join(process.cwd(), ".generated", "home-media-v1.json"),
      "utf8",
    ),
  ) as HomeMediaManifest;
}

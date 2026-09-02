import { readFileSync } from "node:fs";
import path from "node:path";

import { getCatalog } from "@/data/catalog";
import { getCollection } from "@/data/collection";
import type { CanonicalView, MediaAsset } from "@/domain/content/types";
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
  const collection = getCollection();
  const homeMedia = getHomeMedia();
  const heroCandidates = buildHeroCandidates(
    catalog.specimens,
    collection.media,
  );

  return {
    catalog,
    homeMedia,
    heroStates: distributeHeroCandidates(heroCandidates),
  };
}

const heroViewPreference: CanonicalView[] = [
  "frontal",
  "lateral",
  "oblique",
  "lateral",
  "lateral",
  "dorsal",
  "lateral",
  "mandible-dorsal",
  "lateral",
  "ventral",
];

function buildHeroCandidates(
  records: ReturnType<typeof getCatalog>["specimens"],
  media: MediaAsset[],
): HomeSpecimenCandidate[] {
  const sortedRecords = records
    .slice()
    .sort((first, second) =>
      first.specimen.specimenId.localeCompare(
        second.specimen.specimenId,
        "en",
        { numeric: true },
      ),
    );
  return sortedRecords.flatMap((record, index) => {
    const specimenMedia = media.filter(
      (asset) => asset.specimenId === record.specimen.specimenId,
    );
    const preferredView = heroViewPreference[index % heroViewPreference.length];
    const image =
      specimenMedia.find((asset) => asset.view === preferredView) ??
      specimenMedia.find((asset) => asset.view === "lateral") ??
      record.image;
    if (!image) return [];
    return [
      {
        specimenId: record.specimen.specimenId,
        commonName: record.taxon.names.english ?? record.taxon.scientificName,
        scientificName: record.taxon.scientificName,
        href: record.href,
        image,
      },
    ];
  });
}

export function distributeHeroCandidates(
  candidates: HomeSpecimenCandidate[],
  requestedStateCount = 3,
): HomeSpecimenState[] {
  if (candidates.length === 0) return [];
  const stateCount = Math.max(
    1,
    Math.min(requestedStateCount, candidates.length > 10 ? 3 : 1),
  );
  const visibleCount = Math.min(10, candidates.length);
  const stride = Math.max(1, Math.ceil(candidates.length / stateCount));
  const states = Array.from({ length: stateCount }, (_, index) => ({
    id: `arrangement-${index + 1}`,
    specimens: [] as HomeSpecimenCandidate[],
  }));

  const sortedCandidates = candidates.slice().sort((first, second) =>
    first.specimenId.localeCompare(second.specimenId, "en", {
      numeric: true,
    }),
  );

  states.forEach((state, stateIndex) => {
    for (let index = 0; index < visibleCount; index += 1) {
      state.specimens.push(
        sortedCandidates[
          (stateIndex * stride + index) % sortedCandidates.length
        ]!,
      );
    }
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

import { MuseumShell } from "@/components/MuseumShell";
import { createPageMetadata } from "@/config/metadata";
import { getCatalog } from "@/data/catalog";
import { getMapProjection } from "@/data/map";
import { MapExplorer } from "@/features/map/MapExplorer";

export const metadata = createPageMetadata({
  title: "Collection map",
  description:
    "Explore the reviewed public locations of photographed animal skull specimens through a searchable map and complete record list.",
  path: "/map",
});

export default function CollectionMapPage() {
  const projection = getMapProjection();
  return (
    <MuseumShell
      activePath="/map"
      footerContext="Collection map · Published public locations"
      mainClassName="map-page"
    >
      <MapExplorer catalog={getCatalog()} projection={projection} />
    </MuseumShell>
  );
}

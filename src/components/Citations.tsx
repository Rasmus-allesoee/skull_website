import type { ReactNode } from "react";
import type { Citation } from "@/domain/content/types";
export function CitationList({
  citations,
  headingId = "references-title",
  showHeading = true,
}: {
  citations: (Omit<Citation, "year"> & { year: number | null })[];
  headingId?: string;
  showHeading?: boolean;
}) {
  return (
    <section className="references" aria-labelledby={headingId}>
      {showHeading && <h3 id={headingId}>References</h3>}
      <ol>
        {citations.map((citation, index) => (
          <li id={`ref-${citation.key}`} key={citation.key} tabIndex={-1}>
            <span className="reference-number">{index + 1}</span>
            <p>
              {citation.authors} ({citation.year ?? "n.d."}).{" "}
              <cite>{citation.title}</cite>.{" "}
              <a href={citation.url} target="_blank" rel="noreferrer">
                Open source{" "}
                <span className="visually-hidden">(external link)</span>
              </a>
              . Accessed {citation.accessed}.
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function renderCitations(
  paragraph: string,
  citationNumber: Map<string, number>,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of paragraph.matchAll(/\[cite:([a-z0-9-]+)\]/g)) {
    const index = match.index ?? 0;
    nodes.push(paragraph.slice(cursor, index));
    const key = match[1] ?? "";
    const number = citationNumber.get(key);
    nodes.push(
      <sup key={`${key}-${index}`}>
        <a href={`#ref-${key}`} aria-label={`Reference ${number}`}>
          [{number}]
        </a>
      </sup>,
    );
    cursor = index + match[0].length;
  }
  nodes.push(paragraph.slice(cursor));
  return nodes;
}

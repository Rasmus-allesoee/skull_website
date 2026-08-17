import type { ReactNode } from "react";

import type { Citation, TaxonProfile } from "@/domain/content/types";

export function Profile({ profile }: { profile: TaxonProfile }) {
  const citationNumber = new Map(
    profile.citations.map((citation, index) => [citation.key, index + 1]),
  );

  return (
    <section
      className="profile content-section"
      aria-labelledby="profile-title"
    >
      <div className="section-heading">
        <p className="section-kicker">Cited profile</p>
        <h2 id="profile-title">Reading the specimen</h2>
        <p>{profile.summary}</p>
      </div>
      <div className="profile-sections">
        {profile.sections.map((section) =>
          section.heading === "References" ? (
            <CitationList key={section.heading} citations={profile.citations} />
          ) : (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>
                  {renderCitations(paragraph, citationNumber)}
                </p>
              ))}
            </section>
          ),
        )}
      </div>
    </section>
  );
}

function CitationList({ citations }: { citations: Citation[] }) {
  return (
    <section className="references" aria-labelledby="references-title">
      <h3 id="references-title">References</h3>
      <ol>
        {citations.map((citation, index) => (
          <li id={`ref-${citation.key}`} key={citation.key}>
            <span className="reference-number">{index + 1}</span>
            <p>
              {citation.authors} ({citation.year}).{" "}
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

function renderCitations(
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

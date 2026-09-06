import { CitationList, renderCitations } from "@/components/Citations";
import type { TaxonProfile } from "@/domain/content/types";

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

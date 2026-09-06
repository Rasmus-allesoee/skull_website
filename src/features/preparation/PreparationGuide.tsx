import Image from "next/image";
import type {
  GuideBlock,
  GuideMediaAsset,
  PreparationGuide as Guide,
} from "@/domain/guides/guide";
import { CitationList, renderCitations } from "@/components/Citations";
import { GuideContents } from "./GuideContents";
export function PreparationGuide({ guide }: { guide: Guide }) {
  const numbers = new Map(
    guide.metadata.citations.map((c, i) => [c.key, i + 1]),
  );
  const inline = (text: string) => renderCitations(text, numbers);
  const asset = (id: string) => guide.media.find((a) => a.assetId === id)!;
  function render(block: GuideBlock, index: number) {
    switch (block.kind) {
      case "paragraph":
        return <p key={index}>{inline(block.text)}</p>;
      case "heading": {
        const H = `h${block.level}` as "h2" | "h3" | "h4";
        return (
          <H key={index} id={block.id} tabIndex={-1}>
            {block.text}
            <a
              className="prep-heading-link"
              href={`#${block.id}`}
              aria-label={`Link to ${block.text}`}
            >
              #
            </a>
          </H>
        );
      }
      case "figure":
        return <GuideFigure key={index} asset={asset(block.asset)} />;
      case "list": {
        const L = block.ordered ? "ol" : "ul";
        return (
          <L key={index}>
            {block.items.map((item, i) => (
              <li key={i}>{inline(item)}</li>
            ))}
          </L>
        );
      }
      case "table":
        return (
          <div key={index} className="prep-table">
            <table>
              <caption className="visually-hidden">
                {guide.blocks
                  .slice(0, index)
                  .findLast((b) => b.kind === "heading")?.text ??
                  "Method comparison"}
              </caption>
              <thead>
                <tr>
                  {block.headers.map((h) => (
                    <th key={h} scope="col">
                      {inline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) =>
                      j === 0 ? (
                        <th key={j} scope="row">
                          {inline(cell)}
                        </th>
                      ) : (
                        <td key={j}>
                          <span className="prep-cell-label" aria-hidden="true">
                            {block.headers[j]}
                          </span>
                          {inline(cell)}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "aside":
        return (
          <aside key={index} className="prep-note">
            <p className="prep-note-title">{block.title}</p>
            {block.blocks.map(render)}
          </aside>
        );
      case "details":
        return (
          <details key={index} className="prep-details">
            <summary>{block.title}</summary>
            <div>{block.blocks.map(render)}</div>
          </details>
        );
    }
  }
  return (
    <>
      <section
        id="workflow"
        className="prep-workflow"
        aria-labelledby="workflow-title"
        tabIndex={-1}
      >
        <div className="prep-workflow-heading">
          <h2 id="workflow-title">The preparation process</h2>
          <p>Choose a stage or method to jump to its guide.</p>
        </div>
        <ol>
          {guide.metadata.stages.map((s, i) => (
            <li key={s.id}>
              <a className="prep-stage" href={`#${s.id}`}>
                <span className="prep-stage-image">
                  <Image
                    src={asset(s.asset).publicPath}
                    width={asset(s.asset).width}
                    height={asset(s.asset).height}
                    alt=""
                    sizes="(max-width: 640px) 100px, (max-width: 1000px) 30vw, 220px"
                  />
                  {asset(s.asset).provenance === "ai-illustration" && (
                    <span className="prep-image-label">AI illustration</span>
                  )}
                </span>
                <span className="prep-stage-title">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                  <span aria-hidden="true">↓</span>
                </span>
              </a>
              <ul className="prep-method-links">
                {s.methods.map((m) => (
                  <li key={m.id}>
                    <a href={`#${m.id}`}>{m.title}</a>
                  </li>
                ))}
              </ul>
              <p className="prep-outcome">{s.outcome}</p>
            </li>
          ))}
        </ol>
        <p className="prep-workflow-note">
          Defleshing → degreasing → optional whitening → dry assembly. If grease
          returns after drying, go back to degreasing.
        </p>
      </section>
      <GuideContents headings={guide.headings} />
      <article className="prep-article" aria-label="Detailed preparation guide">
        {guide.blocks.map(render)}
        <section id="references" tabIndex={-1} className="prep-references">
          <h2 id="prep-references-heading">References</h2>
          <p>
            One reference list for the complete guide. Collector notes describe
            personal practice. Historical preparation sources document methods;
            current product safety instructions take precedence. Source checks
            do not constitute an independent professional safety certification.
          </p>
          <CitationList
            citations={guide.metadata.citations}
            showHeading={false}
            headingId="prep-references-heading"
          />
        </section>
      </article>
    </>
  );
}
function GuideFigure({ asset }: { asset: GuideMediaAsset }) {
  return (
    <figure className={`prep-figure prep-figure-${asset.assetId}`}>
      <Image
        src={asset.publicPath}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        sizes="(max-width: 760px) 90vw, 720px"
      />
      <figcaption>
        {asset.caption}{" "}
        <span>
          {asset.provenance === "owner-photograph"
            ? "Photo: "
            : "Illustration: "}
          {asset.credit}.
        </span>
      </figcaption>
    </figure>
  );
}

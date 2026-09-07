import Image from "next/image";
import type { ReactNode } from "react";
import type {
  GuideBlock,
  GuideMediaAsset,
  PreparationGuide as Guide,
} from "@/domain/guides/guide";
import { CitationList } from "@/components/Citations";
import { GuideContents } from "./GuideContents";
export function PreparationGuide({ guide }: { guide: Guide }) {
  const numbers = new Map(
    guide.metadata.citations.map((c, i) => [c.key, i + 1]),
  );
  let citationOccurrence = 0;
  const inline = (text: string) => {
    const nodes: ReactNode[] = [];
    let cursor = 0;
    for (const match of text.matchAll(/\[cite:([a-z0-9-]+)\]/g)) {
      const index = match.index ?? 0;
      nodes.push(text.slice(cursor, index));
      const key = match[1]!;
      const number = numbers.get(key)!;
      const citation = guide.metadata.citations.find(
        (item) => item.key === key,
      )!;
      const popoverId = `prep-citation-${key}-${citationOccurrence++}`;
      nodes.push(
        <span className="prep-citation" key={popoverId}>
          <button
            type="button"
            popoverTarget={popoverId}
            aria-label={`Show reference ${number}`}
          >
            [{number}]
          </button>
          <span id={popoverId} popover="auto" className="prep-citation-popover">
            <span className="prep-citation-number">Reference {number}</span>
            <span>
              {citation.authors} ({citation.year ?? "n.d."}).{" "}
              <cite>{citation.title}</cite>.
            </span>
            <a href={citation.url} target="_blank" rel="noreferrer">
              Open source{" "}
              <span className="visually-hidden">(external link)</span>
            </a>
          </span>
        </span>,
      );
      cursor = index + match[0].length;
    }
    nodes.push(text.slice(cursor));
    return nodes;
  };
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
      case "disclosure": {
        const H = `h${block.level}` as "h3" | "h4";
        return (
          <details
            key={index}
            id={block.id}
            className="prep-method"
            data-guide-disclosure
          >
            <summary>
              <H>
                {block.title}
                <span className="prep-method-action" aria-hidden="true">
                  <span className="prep-method-open">Open guide +</span>
                  <span className="prep-method-close">Close guide −</span>
                </span>
              </H>
            </summary>
            <div className="prep-method-body">{block.blocks.map(render)}</div>
          </details>
        );
      }
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
              <p className="prep-outcome">
                <span>Move on when</span>
                {s.outcome}
              </p>
            </li>
          ))}
        </ol>
        <aside className="prep-workflow-note">
          <strong>The basic route</strong>
          <span>
            Defleshing → degreasing → optional whitening → dry assembly. If
            grease returns after drying, go back to degreasing.
          </span>
        </aside>
      </section>
      <GuideContents headings={guide.headings} />
      <article className="prep-article" aria-label="Detailed preparation guide">
        {guide.blocks.map(render)}
        <section id="references" tabIndex={-1} className="prep-references">
          <h2 id="prep-references-heading">References</h2>
          <p>Open any numbered citation in the guide to preview its source.</p>
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

import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  ...sanitizeHtml.defaults.allowedTags,
  "img",
  "section",
  "button",
  "svg",
  "path",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "div",
  "span",
  "a",
];

const ALLOWED_ATTRIBUTES = {
  ...sanitizeHtml.defaults.allowedAttributes,
  "*": ["class", "style", "id"],
  img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
  a: ["href", "target", "rel"],
  svg: ["viewBox", "xmlns", "width", "height", "fill", "stroke"],
  path: ["d", "fill", "stroke", "stroke-width"],
};

export function sanitizeSectionHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowVulnerableTags: true,
  });
}

type RawHtmlSectionProps = {
  html: string;
  className?: string;
};

export default function RawHtmlSection({ html, className }: RawHtmlSectionProps) {
  const clean = sanitizeSectionHtml(html);

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}

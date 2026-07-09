import RawHtmlSection from "@/components/RawHtmlSection";
import type { Section } from "@/lib/types";

export default function Footer({ section }: { section: Section }) {
  return <RawHtmlSection html={section.html_content} />;
}

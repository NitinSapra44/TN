import { getActiveSections } from "@/lib/sections";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RawHtmlSection from "@/components/RawHtmlSection";

export const revalidate = 3600;

export default async function Home() {
  const sections = await getActiveSections();

  return (
    <>
      {sections.map((section) => {
        if (section.slug === "header") {
          return <Header key={section.id} section={section} />;
        }
        if (section.slug === "footer") {
          return <Footer key={section.id} section={section} />;
        }
        return <RawHtmlSection key={section.id} html={section.html_content} />;
      })}
    </>
  );
}

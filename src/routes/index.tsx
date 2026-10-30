import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
// import { Creatives } from "@/components/sections/Creatives";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Brands } from "@/components/sections/Brands";
import { Testimonials } from "@/components/sections/Testimonials";
import { Pricing } from "@/components/sections/Pricing";
import { AvailablePlans } from "@/components/sections/AvailablePlans";
import { FinalCta } from "@/components/sections/FinalCta";

const title = "Weu — Communicate. Collaborate. Create.";
const description =
  "WeDu is an all-in-one workflow platform that helps creative teams plan projects, share files and collaborate faster.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      {/* <Creatives /> */}
      <HowItWorks />
      <Brands />
      <Pricing />
      <AvailablePlans />
      <Testimonials />

      <FinalCta />
    </>
  );
}

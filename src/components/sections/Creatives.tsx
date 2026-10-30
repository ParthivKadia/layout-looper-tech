"use client";

import { useState } from "react";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading, Text } from "@/components/ui/Typography";
import { creatives } from "@/content/site";
import { AstrologerDemoModal } from "@/components/sections/AstrologerDemoModal";

type CreativesProps = {
  title?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  highlights?: {
    icon: string;
    label: string;
    description: string;
    highlight?: boolean;
  }[];
  cta?: string;
  className?: string;
};

export function Creatives({
  title = creatives.title,
  body = creatives.body,
  image = creatives.image,
  imageAlt = creatives.imageAlt,
  highlights = creatives.highlights,
  cta = creatives.cta,
  className,
}: CreativesProps) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <Section tone="white" padding="lg" className={className}>
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">

            {/* Illustration */}
            <div className="relative order-2 min-w-0 lg:order-1">
              <span
                aria-hidden="true"
                className="absolute -left-4 -top-4 h-40 w-40 rounded-full bg-brand-lavender sm:h-56 sm:w-56"
              />

              <span
                aria-hidden="true"
                className="absolute bottom-2 right-6 h-28 w-28 bg-brand-yellow-soft sm:h-36 sm:w-36"
              />

              <img
                src="/images/waves.svg"
                alt=""
                aria-hidden="true"
                className="absolute bottom-0 left-[18%] w-32 sm:w-44"
              />

              <img
                src={image}
                alt={imageAlt}
                className="relative mx-auto h-auto w-full max-w-lg"
              />
            </div>


            {/* Copy */}
            <div className="order-1 min-w-0 lg:order-2">
              <Heading size="h2">
                {title}
              </Heading>

              <Text size="small" className="mt-6 max-w-xl">
                {body}
              </Text>


              {/* Highlights */}
              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div key={item.label} className="min-w-0">

                    <div className="flex items-start gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm text-white">
                        ✦
                      </div>

                      <div>
                        <div
                          className={`text-base font-semibold ${
                            item.highlight
                              ? "text-brand-maroon"
                              : ""
                          }`}
                        >
                          {item.label}
                        </div>

                        <Text
                          size="small"
                          className="mt-2"
                        >
                          {item.description}
                        </Text>
                      </div>

                    </div>

                  </div>
                ))}
              </div>


              {/* Explore Demo */}
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="mt-10 inline-flex items-center justify-center rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
              >
                {cta || "Explore Free Demo"}
                <span className="ml-2">
                  →
                </span>
              </button>

            </div>

          </div>
        </Container>
      </Section>


      {/* Demo Modal */}
      <AstrologerDemoModal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
      />
    </>
  );
}

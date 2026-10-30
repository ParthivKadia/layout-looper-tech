import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading, Text } from "@/components/ui/Typography";
import { about } from "@/content/site";

type AboutProps = {
  title?: string;
  body?: string;
  /** Band background. */
  tone?: "yellow" | "pink" | "cream" | "surface" | "white";
  className?: string;
};

/** Yellow diagonal band: headline on the left, structured pain points on the right. */
export function Register({
  title = about.title,
  body = about.body,
  tone = "yellow",
  className,
}: AboutProps) {
  const content = body.split("\n").filter(Boolean);

  const intro = content[0];
  const points = content.slice(1, -1);
  const finalLine = content[content.length - 1];

  return (
    <Section tone={tone} padding="xl" slant="both" className={className}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* LEFT SIDE — KEEPING THIS EXACTLY AS IT IS */}
          <Heading size="h2" className="max-w-sm">
            {title}
          </Heading>

          {/* RIGHT SIDE */}
          <div className="max-w-xl">
            {/* Intro / Attention Text */}
            <Text
              size="small"
              className="mb-7 max-w-xl text-[1.08rem] leading-relaxed font-medium"
            >
              {intro}
            </Text>

            {/* Pain Points */}
            <div className="space-y-3">
              {points.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3"
                >
                  <span
                    className="mt-[2px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B2F2F] text-sm font-bold text-white"
                    aria-hidden="true"
                  >
                    ×
                  </span>

                  <Text
                    size="small"
                    className="leading-relaxed"
                  >
                    {point}
                  </Text>
                </div>
              ))}
            </div>

            {/* There's a simpler way */}
            <div className="mt-8">
              <div className="inline-block">
                <Text
                  size="small"
                  className="relative inline-block text-[1.15rem] font-semibold"
                >
                  {finalLine}

                  <span
                    className="absolute -bottom-2 left-0 h-[3px] w-full rounded-full bg-[#8B2F2F]"
                    aria-hidden="true"
                  />
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

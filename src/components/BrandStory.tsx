import { storyImage } from "../data/products"
import SectionHeading from "./SectionHeading"

export default function BrandStory() {
  return (
    <section
      id="story"
      className="mx-auto grid max-w-[1200px] scroll-mt-24 items-center gap-12 bg-sand px-6 py-16 sm:px-12 md:grid-cols-2 md:gap-16"
    >
      <img
        src={storyImage}
        alt="A handmade cream knit in progress with needles and yarn"
        className="aspect-[1.08] w-full rounded-xl object-cover"
      />
      <div>
        <SectionHeading
          eyebrow="MADE BY HAND. MEANT FOR HOME."
          heading="A little patience. A lot of heart."
        />
        <div className="mt-7 space-y-5 text-[15px] leading-[1.75]">
          <p>
            We believe the most meaningful things are made slowly. From the
            first loop of yarn to the final finishing touch, our woolen
            creations celebrate the quiet beauty of handmade craft.
          </p>
          <p>
            Thoughtful textures, considered colors, and careful finishing bring
            character to everyday spaces. Each piece is a small invitation to
            feel more at home.
          </p>
        </div>
      </div>
    </section>
  )
}

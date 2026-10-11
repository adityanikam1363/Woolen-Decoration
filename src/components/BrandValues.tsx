import { HandHeart, MessageCircle, Sparkles, Waves } from "lucide-react"
import SectionHeading from "./SectionHeading"

const values = [
  {
    icon: HandHeart,
    title: "Handmade quality",
    text: "Made with patience and a personal touch, never rushed.",
  },
  {
    icon: Waves,
    title: "Quietly unique",
    text: "Distinctive textures and colors that feel naturally yours.",
  },
  {
    icon: Sparkles,
    title: "Care in every detail",
    text: "From the first stitch to the final edge, finishing matters.",
  },
  {
    icon: MessageCircle,
    title: "A real conversation",
    text: "Friendly help choosing a piece or imagining a custom one.",
  },
]

export default function BrandValues() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 sm:px-12">
      <SectionHeading heading="The beauty is in the little things" />
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(({ icon: Icon, title, text }) => (
          <article key={title} className="border-t border-line pt-5">
            <Icon
              aria-hidden="true"
              className="mb-5 text-terracotta"
              size={22}
              strokeWidth={1.4}
            />
            <h3 className="font-display text-[23px]">{title}</h3>
            <p className="mt-3 text-[13px] leading-[1.65] text-brown/75">
              {text}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

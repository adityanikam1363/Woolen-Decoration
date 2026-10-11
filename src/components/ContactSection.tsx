import { MessageCircle, Phone } from "lucide-react"
import { getWhatsAppUrl } from "../config"
import SectionHeading from "./SectionHeading"

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="mx-auto max-w-[1200px] scroll-mt-24 px-6 py-20 text-center sm:px-12"
    >
      <SectionHeading
        align="center"
        eyebrow="LET’S MAKE SOMETHING PERSONAL"
        heading="Something caught your eye?"
      />
      <p className="mx-auto mt-6 max-w-[620px] text-[15px] leading-[1.7]">
        Enquire about a piece, explore a custom color, or simply say hello. We’d
        love to help you find your little comfort.
      </p>
      <p className="mx-auto mt-3 max-w-[620px] text-[12px] text-brown/60">
        Studio address and social profiles will be added before launch.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          className="button-primary inline-flex items-center gap-2"
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} />
          Enquire on WhatsApp
        </a>
        <a
          className="button-outline inline-flex items-center gap-2"
          href="tel:+919766651363"
        >
          <Phone size={16} />
          +91 97666 51363
        </a>
      </div>
    </section>
  )
}

import { Camera, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mx-auto mt-16 max-w-[1200px] bg-olive px-6 py-12 text-ivory sm:px-12">
      <div className="grid gap-10 border-b border-white/20 pb-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <a href="#home" className="font-display text-[28px]">
            Woolen Decorations
          </a>
          <p className="mt-3 text-sm text-ivory/75">
            Handcrafted warmth. Everyday beauty.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="grid gap-3 text-sm">
          <a href="#products">Products</a>
          <a href="#story">About Us</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="grid content-start gap-3 text-sm">
          <a
            href="mailto:nikama235@gmail.com"
            className="flex items-center gap-2"
          >
            <Mail size={15} /> nikama235@gmail.com
          </a>
          <a
            href="https://www.instagram.com/aditzz_24/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2"
          >
            <Camera size={15} /> @aditzz_24
          </a>
        </div>
      </div>
      <p className="pt-8 text-[11px] text-ivory/60">
        © {new Date().getFullYear()} Woolen Decorations · Handmade woolen products
        · Sample collection for design preview
      </p>
    </footer>
  )
}

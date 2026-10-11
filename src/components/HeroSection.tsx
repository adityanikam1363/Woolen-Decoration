import { useState } from "react"
import { fallbackHeroImage, heroImage } from "../data/products"

export default function HeroSection() {
  const [imageSrc, setImageSrc] = useState(heroImage)
  const [imageUnavailable, setImageUnavailable] = useState(false)

  return (
    <section
      id="home"
      className="mx-auto grid max-w-[1200px] scroll-mt-24 items-center gap-12 px-6 py-16 sm:px-12 md:grid-cols-[1.03fr_.97fr] lg:gap-16"
    >
      <div className="max-w-[570px]">
        <p className="eyebrow">SLOW CRAFT. SOFT LIVING.</p>
        <h1 className="mt-7 font-display text-[51px] leading-[.93] tracking-[-.035em] sm:text-[66px] lg:text-[72px]">
          Handcrafted
          <br />
          Warmth for
          <br />
          Every Corner
        </h1>
        <p className="mt-8 max-w-[560px] text-[16px] leading-[1.65]">
          Discover unique woolen creations made with care, creativity, and
          timeless craftsmanship.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-5">
          <a className="button-primary" href="#products">
            Explore Collection
          </a>
          <a className="button-link" href="#story">
            Discover Our Story
          </a>
        </div>
      </div>
      {!imageUnavailable && (
        <img
          src={imageSrc}
          alt="A calm cream living room with a soft sofa and woolen throw"
          onError={() => {
            if (imageSrc === heroImage) setImageSrc(fallbackHeroImage)
            else setImageUnavailable(true)
          }}
          className="aspect-[.94] h-full max-h-[560px] w-full rounded-t-[min(12vw,160px)] rounded-b-xl object-cover object-center"
        />
      )}
    </section>
  )
}

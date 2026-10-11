import { categories } from "../data/products"
import SectionHeading from "./SectionHeading"

export default function CategoryGrid() {
  return (
    <section
      id="categories"
      className="mx-auto max-w-[1200px] scroll-mt-24 px-6 py-16 sm:px-12"
    >
      <SectionHeading
        align="center"
        eyebrow="FIND YOUR LITTLE COMFORT"
        heading="A world of woolen wonders"
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <a
            key={category.name}
            href="#products"
            className="group rounded-xl bg-[#fffdfa] p-3 transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(61,52,45,.08)]"
          >
            <div className="overflow-hidden rounded-lg">
              <img
                src={category.image}
                alt=""
                className="aspect-[1.23] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <h3 className="px-1 pb-2 pt-4 font-display text-[25px] leading-tight">
              {category.name}
            </h3>
          </a>
        ))}
      </div>
    </section>
  )
}

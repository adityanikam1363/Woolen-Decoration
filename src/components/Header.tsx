import { LockKeyhole, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const links = [
  ["Home", "#home"],
  ["Products", "#products"],
  ["About Us", "#story"],
  ["Contact", "#contact"],
]

export default function Header({
  onSearch,
}: {
  onSearch: (query: string) => void
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  return (
    <header className="mx-auto max-w-[1200px] border-b border-line px-6 py-6 sm:px-12">
      <div className="flex items-center justify-between gap-5">
        <a
          className="font-display text-[22px] leading-none text-terracotta transition-opacity hover:opacity-70 sm:text-[27px]"
          href="#home"
        >
          Woolen Decorations
        </a>
        <div className="hidden items-center gap-7 md:flex">
          <nav aria-label="Main navigation" className="flex items-center gap-7">
            {links.map(([label, href], index) => (
              <a
                key={href}
                href={href}
                className={`nav-link ${index === 0 ? "text-terracotta" : ""}`}
              >
                {label}
              </a>
            ))}
          </nav>
          <button
            aria-expanded={searchOpen}
            aria-label="Search products"
            className="icon-button"
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Search size={20} strokeWidth={1.8} />
          </button>
          <a
            href="/admin/login"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-terracotta px-3 py-2 text-[11px] font-medium text-ivory transition-colors hover:bg-brown"
          >
            <LockKeyhole size={13} />
            Admin Login
          </a>
        </div>
      </div>
      <nav
        aria-label="Mobile navigation"
        className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-4 md:hidden"
      >
        {links.map(([label, href], index) => (
          <a
            key={href}
            href={href}
            className={`nav-link ${index === 0 ? "text-terracotta" : ""}`}
          >
            {label}
          </a>
        ))}
        <button
          aria-expanded={searchOpen}
          aria-label="Search products"
          className="icon-button"
          onClick={() => setSearchOpen((open) => !open)}
        >
          <Search size={18} strokeWidth={1.8} />
        </button>
        <a
          href="/admin/login"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-terracotta px-3 py-2 text-[11px] font-medium text-ivory transition-colors hover:bg-brown"
        >
          <LockKeyhole size={13} />
          Admin Login
        </a>
      </nav>
      {searchOpen && (
        <form
          className="mt-5 flex gap-2 border-t border-line pt-5"
          onSubmit={(event) => {
            event.preventDefault()
            const query = searchRef.current?.value.trim() ?? ""
            onSearch(query)
            if (query) document.querySelector("#products")?.scrollIntoView()
          }}
        >
          <label className="sr-only" htmlFor="site-search">
            Search the collection
          </label>
          <input
            ref={searchRef}
            id="site-search"
            className="min-w-0 flex-1 rounded-md border border-line bg-white/50 px-4 py-3 text-sm outline-none focus:border-olive"
            placeholder="Search the collection"
            type="search"
          />
          <button className="button-primary px-5" type="submit">
            Search
          </button>
        </form>
      )}
    </header>
  )
}

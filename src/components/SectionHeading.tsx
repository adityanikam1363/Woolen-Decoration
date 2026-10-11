interface Props {
  eyebrow?: string
  heading: string
  align?: "left" | "center"
}

export default function SectionHeading({
  eyebrow,
  heading,
  align = "left",
}: Props) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="section-title mt-5">{heading}</h2>
    </div>
  )
}

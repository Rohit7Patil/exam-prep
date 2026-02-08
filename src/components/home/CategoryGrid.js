import Link from "next/link"

export default function CategoryGrid() {
  const categories = [
    { name: "UPSC", description: "Civil Services Examination" },
    { name: "SSC", description: "Government Job Exams" },
    { name: "Banking", description: "IBPS, SBI, RBI Exams" },
    { name: "JEE", description: "Engineering Entrance" },
    { name: "NEET", description: "Medical Entrance" },
    { name: "GATE", description: "Engineering Aptitude Test" },
  ]

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Exam Categories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose your exam and start practicing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/questions?category=${c.name}`}
              className="border rounded-lg p-6 bg-card hover:border-primary transition"
            >
              <h3 className="text-xl font-semibold mb-2">{c.name}</h3>
              <p className="text-sm text-muted-foreground">
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

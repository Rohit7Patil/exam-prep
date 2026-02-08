export default function FeatureSection() {
  const features = [
    {
      title: "Smart Search",
      description: "Find questions by topic, subject, or difficulty.",
    },
    {
      title: "Discussion Forum",
      description: "Discuss problems and strategies with aspirants.",
    },
    {
      title: "Save & Review",
      description: "Bookmark important questions for revision.",
    },
    {
      title: "Previous Year Papers",
      description: "Understand exam trends with PYQs.",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why ExamPrep India?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to crack competitive exams — one platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 border rounded-lg text-center bg-card"
            >
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

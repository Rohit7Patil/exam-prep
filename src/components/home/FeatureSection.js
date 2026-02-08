export default function FeatureSection() {
  const features = [
    {
      title: "Tag-based Discussions",
      description:
        "Organize conversations using clean, structured tags instead of messy categories.",
    },
    {
      title: "Voting & Replies",
      description:
        "Upvote helpful answers, reply to discussions, and surface the best content.",
    },
    {
      title: "Nested Conversations",
      description:
        "Reply to replies like Reddit or Stack Overflow for deeper discussions.",
    },
    {
      title: "Smart Search",
      description: "Quickly find relevant threads using keywords and tags.",
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
            Built for Serious Aspirants
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
            ExamPrep India focuses on quality discussions and clarity — not
            noise.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border bg-card p-5 text-center"
            >
              <h3 className="mb-2 text-base font-semibold sm:text-lg">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

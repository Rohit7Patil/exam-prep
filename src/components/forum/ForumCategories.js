import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const categories = [
  {
    slug: "upsc",
    name: "UPSC",
    description: "Civil Services Examination",
  },
  {
    slug: "ssc",
    name: "SSC",
    description: "Staff Selection Commission Exams",
  },
  {
    slug: "banking",
    name: "Banking",
    description: "IBPS, SBI, RBI Exams",
  },
  {
    slug: "jee",
    name: "JEE",
    description: "Engineering Entrance Exams",
  },
  {
    slug: "neet",
    name: "NEET",
    description: "Medical Entrance Exams",
  },
  {
    slug: "gate",
    name: "GATE",
    description: "Graduate Aptitude Test in Engineering",
  },
]

export default function ForumCategories() {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Forum Categories</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/forum/${cat.slug}`}>
            <Card className="h-full hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{cat.name}</CardTitle>
                <CardDescription>{cat.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
